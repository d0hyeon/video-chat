import React from 'react';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";
import { Article, Header, Layout } from '@src/components/styles/common';
import { H1, P } from '@src/components/styles/text';
import { useRecoilValue } from 'recoil';
import { userSelector } from '@src/atoms/user';
import { Room, User } from '@src/types';
import UserVideo from '@src/components/common/UserVideo';

const socket = io();

enum MessageEnum {
  OFFER = 'offer',
  ANSWER = 'answer',
  CANDIDATE = 'candidate'
}

type MessagePayload<T, Payload> = {
  type: T;
} & Payload;

type MessageMeta = {
  userId: string;
}

type CandidatePayload = {candidate: string; label: number; id: string};
type DescriptionPayload = {sdp: string;};

type OfferMessage = MessagePayload<MessageEnum.OFFER, DescriptionPayload>;
type AnswerMessage = MessagePayload<MessageEnum.ANSWER, DescriptionPayload>;
type CandidateMessage = MessagePayload<MessageEnum.CANDIDATE, CandidatePayload>;

type UserPeerMap = {
  [key: string]: {
    peer: RTCPeerConnection,
    state: 'idle' | 'connect' | 'connected' | 'failed'
  };
}

const DEFAULT_ROOM = {
  id: '',
  title: '',
  users: [],
  size: 2,
  password: ''
}

const ChatDetail = () => {
  const user = useRecoilValue(userSelector);
  const { room: roomId } = useParams<{room: string}>();
  const [room, setRoom] = React.useState<Room>(DEFAULT_ROOM);
  const [loading, setLoading] = React.useState<boolean>(false)
  const [othersPeerMap, setOthersPeerMap] = React.useState<UserPeerMap>({});
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const userMediaTracks: React.MutableRefObject<MediaStreamTrack[]> = React.useRef([]);

  const createOffer = React.useCallback((userId: string) => {
    setOthersPeerMap(prev => {
      const {peer} = prev[userId];
      peer.createOffer({offerToReceiveVideo: true, iceRestart: true, voiceActivityDetection: true, offerToReceiveAudio: true})
        .then((description) => {
          peer.setLocalDescription(description)
            .then(() => {
              socket.emit('message', description, {roomId, userId: userId, sender: user!.id})
            })
            .catch(console.error);
        }).catch(console.error)

      return {
        ...prev,
        [userId]: {
          peer, 
          state: 'connect'
        }
      }
    })
  }, [roomId, user, setOthersPeerMap]);

  const createAnswer = React.useCallback((userId: string) => {
    const peerConnection = othersPeerMap[userId].peer;
    peerConnection.createAnswer()
      .then(description => {
        peerConnection.setLocalDescription(description)
          .then(() => socket.emit('message', description, {roomId, userId, sender: user!.id}))
      });
    
  }, [othersPeerMap, roomId, user]);

  const sendIceCandidate = React.useCallback((event: RTCPeerConnectionIceEvent) => {
    if(event.candidate) {
      socket.emit('message', {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      }, {roomId, sender: user!.id})
    }
  }, [roomId, user]);

  const acceptOffer = React.useCallback((description, meta) => {
    othersPeerMap[meta.sender].peer.setRemoteDescription(description)
      .then(() => {
        createAnswer(meta.sender);
      })
  }, [othersPeerMap, createAnswer]);

  const acceptAnswer = React.useCallback((description, meta) => {
    othersPeerMap[meta.sender].peer.setRemoteDescription(description);
  }, [othersPeerMap]);

  const acceptIceCandidate = React.useCallback((candidate, meta) => {
    const remoteCandidate = new RTCIceCandidate(candidate);
    const userId = meta.sender;
    setOthersPeerMap(prev => {
      const peerConnection = prev[userId].peer;
      peerConnection.addIceCandidate(remoteCandidate);
      console.log('test');
      return {
        ...prev,
        [userId]: {
          peer: peerConnection,
          state: 'connected'
        }
      }
    })
  }, [setOthersPeerMap]);


  React.useEffect(() => {
    const onMessageHandler = (message: CandidateMessage | OfferMessage | AnswerMessage, meta: MessageMeta) => {
      switch(message.type) {
        case 'offer': {
          acceptOffer({type: message.type, sdp: message.sdp}, meta)
          break;
        }
        case 'answer': {
          acceptAnswer({type: message.type, sdp: message.sdp}, meta);
          break;
        }
        case 'candidate': {
          acceptIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
          }, meta as MessageMeta);
          break;
        }
      }
    }
    socket.on('message', onMessageHandler);
    return () => {
      socket.off('message', onMessageHandler);
    }
  }, [acceptOffer, acceptAnswer, acceptIceCandidate]);

  React.useLayoutEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((mediaStream) => {
        videoRef.current!.srcObject = mediaStream;
        mediaStream.getTracks().forEach(track => {
          userMediaTracks.current.push(track);
        });
        // 비디오 엘리먼트에 loadedmetadata 이벤트 발생
      });
  }, [roomId, videoRef, userMediaTracks, user]);

  React.useEffect(() => {
    const handleRoomDetail = (room: Room) => {
      setRoom(room);
      setLoading(false);
      setOthersPeerMap(prev => ({
        ...prev,
        ...Object.fromEntries(
          room.users.map(({id}) => {
            const peer = new RTCPeerConnection();
            peer.onicecandidate = sendIceCandidate;
            userMediaTracks.current.forEach(track => peer.addTrack(track));
            
            return [
              id, 
              {
                peer,
                state: 'idle'
              }
            ]
          })
        )
      }))
    }
    const handleJoinUser = (user: User) => {
      const peer = new RTCPeerConnection();
      peer.onicecandidate = sendIceCandidate;
      userMediaTracks.current.forEach(track => peer.addTrack(track));

      setRoom(prev => ({
        ...prev,
        users: [
          ...prev.users,
          user
        ]
      }));
      setOthersPeerMap(prev => ({
        ...prev,
        [user.id]: {
          peer,
          state: 'idle'
        }
      }));
      setTimeout(() => {
        createOffer(user.id);
      })
    }

    setLoading(true);
    socket.emit('getRoomDetail', roomId);
    socket.on('roomDetail', handleRoomDetail);
    socket.on('joinUser', handleJoinUser);

    return () => {
      socket.off('roomDetail', handleRoomDetail);
      socket.off('joinUser', handleJoinUser);
    }
  }, [setRoom, setOthersPeerMap, setLoading, sendIceCandidate, createOffer, userMediaTracks, roomId]);

  React.useEffect(() => {
    socket.emit('joinRoom', roomId, user);
    return () => {
      socket.emit('leaveRoom', roomId, user);
    }
  }, [roomId, user]);

  const userIds = React.useMemo(() => Object.keys(othersPeerMap), [othersPeerMap]);

  return (
    <Layout>
      {!loading && (
        <>
          <Header>
            <H1>{room.title}</H1>
            {room.description && (
              <P>{room.description}</P>
            )}
          </Header>
        </>
      )}
      <FlexSection>
        <Article>
          <UserVideo user={user as User} ref={videoRef} />
        </Article>
        
        {userIds.map((userId) => {
          const user = room.users.filter(({id}) => id === userId)[0];
          
          return (
            <Article key={userId}>
              <UserVideo user={user} peer={othersPeerMap[userId].peer}>

              </UserVideo>
            </Article>
          )
        })}
      </FlexSection>
    </Layout>
  )
};

const FlexSection = styled.section`
  display: flex;
  align-items: center;
`;

const Dimd = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: calc(100% - 50px);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  align-items: center;
  text-align: center;
  font-size: 16px;
`;

ChatDetail.displayName = 'ChatDetail';
export default React.memo(ChatDetail);