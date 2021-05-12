import React from 'react';
import styled from '@emotion/styled';
import { Article, Button, Header, Layout } from '@src/components/styles/common';
import { H1, P } from '@src/components/styles/text';
import { useRecoilValue } from 'recoil';
import { userSelector } from '@src/atoms/user';
import { ChatOption, Room, User, UserWithInRoom } from '@src/types';
import UserVideo, { DEFAULT_VIDEO_OPTIONS } from '@src/components/common/UserVideo';
import Loading from '@src/components/common/Loading';
import socket from '@src/utils/socket';
import { useHistory } from 'react-router';

enum MessageTypeEnum {
  OFFER = 'offer',
  ANSWER = 'answer',
  CANDIDATE = 'candidate',
  UPDATE = 'update'
}

enum ErrorTypeEnum {
  JOIN = 'join'
}

type MessagePayload<T, Payload> = {
  type: T;
} & Payload;

type MessageMeta = {
  userId: string;
}

type CandidatePayload = {candidate: string; label: number; id: string};
type DescriptionPayload = {sdp: string;};
type UpdatePayload = {option: ChatOption};

type OfferMessage = MessagePayload<MessageTypeEnum.OFFER, DescriptionPayload>;
type AnswerMessage = MessagePayload<MessageTypeEnum.ANSWER, DescriptionPayload>;
type CandidateMessage = MessagePayload<MessageTypeEnum.CANDIDATE, CandidatePayload>;
type UpdateMessage = MessagePayload<MessageTypeEnum.UPDATE, UpdatePayload>;

type UserPeerMap = {
  [key: string]: {
    peer: RTCPeerConnection,
    state: 'idle' | 'connecting' | 'connected',
    option: ChatOption
  };
}

const OFFER_OPTIONS: RTCOfferOptions = {
  iceRestart: true,
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
  voiceActivityDetection: true
}

const PEER_CONNECTION_CONFIG = {
  'iceServers': [
      {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

interface Props {
  roomId: string;
  roomInfo: Room;
  tracks: MediaStreamTrack[];
}

const ChatRoom: React.FC<Props> = ({roomId, roomInfo, tracks}) => {
  const user = useRecoilValue(userSelector);
  const history = useHistory();
  const [roomData, setRoomData] = React.useState<Room>(roomInfo);
  const [peerMap, setPeerMap] = React.useState<UserPeerMap>({});
  const [options, setOptions] = React.useState<ChatOption>(DEFAULT_VIDEO_OPTIONS);
  
  const createOffer = React.useCallback((userId: string) => {
    setPeerMap(prev => {
      const {peer} = prev[userId];
      peer.createOffer(OFFER_OPTIONS)
        .then((description) => {
          peer.setLocalDescription(description)
            .then(() => {
              socket.emit('message', description, {roomId, userId: userId, sender: user!.id})
            })
            .catch(console.error);
        })

      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          peer, 
          state: 'connecting',
        }
      }
    })
  }, [roomId, user, setPeerMap]);

  const createAnswer = React.useCallback((userId: string) => {
    const peerConnection = peerMap[userId].peer;
    peerConnection.createAnswer()
      .then(description => {
        peerConnection.setLocalDescription(description)
          .then(() => socket.emit('message', description, {roomId, userId, sender: user!.id}))
      });
    
  }, [peerMap, roomId, user]);

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
    peerMap[meta.sender].peer.setRemoteDescription(description)
      .then(() => {
        createAnswer(meta.sender);
      })
  }, [peerMap, createAnswer]);

  const acceptAnswer = React.useCallback((description, meta) => {
    peerMap[meta.sender].peer.setRemoteDescription(description);
  }, [peerMap]);

  const acceptIceCandidate = React.useCallback((candidate, meta) => {
    const remoteCandidate = new RTCIceCandidate(candidate);
    const userId = meta.sender;
    setPeerMap(prev => {
      const peerConnection = prev[userId].peer;
      peerConnection.addIceCandidate(remoteCandidate);

      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          peer: peerConnection,
          state: 'connected'
        }
      }
    })
  }, [setPeerMap]);

  const updateOption = React.useCallback(({payload}, meta) => {
    setPeerMap(prev => ({
      ...prev,
      [meta.sender]: {
        ...prev[meta.sender],
        payload
      }
    }));
  }, [setOptions, setPeerMap]);

  const sendUpdateOption = React.useCallback((option) => {
    socket.emit('message', {
      type: MessageTypeEnum.UPDATE,
      payload: option
    }, {roomId, sender: user!.id});
  }, [roomId, user]);

  const joinUserHandler = React.useCallback((user: UserWithInRoom) => {
    console.log('join!');
    const peer = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    peer.onicecandidate = sendIceCandidate;
    tracks.forEach(track => peer.addTrack(track));
    
    setRoomData(prev => ({
      ...prev,
      users: [
        ...prev.users,
        user
      ]
    }));
    setPeerMap(prev => ({
      ...prev,
      [user.id]: {
        peer,
        state: 'idle',
        option: DEFAULT_VIDEO_OPTIONS
      }
    }));
    createOffer(user.id);
  }, [setRoomData, setPeerMap, createOffer, sendIceCandidate, tracks]);

  const leaveUserHandler = React.useCallback((user: User) => {
    setPeerMap(prev => {
      const next = {...prev};
      next[user.id].peer.close();
      delete next[user.id];

      return next;
    });
  }, [setPeerMap]);

  const handleClickAudio = React.useCallback(() => {
    setOptions(prev => ({
      ...prev,
      audio: !prev.audio
    }))
  }, [setOptions]);

  const handleClickVideo = React.useCallback(() => {
    setOptions(prev => ({
      ...prev,
      video: !prev.video
    }))
  }, [setOptions]);

  React.useEffect(() => {
    setPeerMap(prev => ({
      ...prev,
      ...Object.fromEntries(
        roomInfo.users.filter(({id}) => id !== user!.id).map(({id, option}) => {
          const peer = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
          peer.onicecandidate = sendIceCandidate;
          tracks.forEach(track => peer.addTrack(track));
          
          return [
            id, 
            {
              peer,
              state: 'idle',
              option
            }
          ]
        })
      )
    }));

    return () => {
      setPeerMap(prev => {
        Object.values(prev).forEach(({peer}) => {
          peer.close();
        })
        return {};
      })
    }
  }, [roomInfo, tracks, user, setPeerMap, sendIceCandidate]);

  React.useEffect(() => {
    const onMessageHandler = (message: CandidateMessage | OfferMessage | AnswerMessage | UpdateMessage, meta: MessageMeta) => {
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
          }, meta);
          break;
        }
        case 'update': {
          updateOption(message, meta);
        }
      }
    }
    socket.on('message', onMessageHandler);
    return () => {
      socket.off('message', onMessageHandler);
    }
  }, [acceptOffer, acceptAnswer, updateOption, acceptIceCandidate]);

  React.useEffect(() => {
    socket.on('joinUser', joinUserHandler);
    socket.on('leaveUser', leaveUserHandler);

    return () => {
      socket.off('joinUser', joinUserHandler);
      socket.off('leaveUser', leaveUserHandler);
    }
  }, [joinUserHandler, leaveUserHandler]);

  const handleJoinError = React.useCallback((message) => {
    alert(message);
    history.replace('/');
  }, [history]);

  const handleSocketError = React.useCallback(({type, message}) => {
    switch(type as ErrorTypeEnum) {
      case ErrorTypeEnum.JOIN: handleJoinError(message); break;
    }
  }, [handleJoinError]);


  React.useEffect(() => {
    socket.on('error', handleSocketError);

    return () => {
      socket.off('error', handleSocketError);
    }
  }, [handleSocketError]);


  React.useEffect(() => {
    socket.emit('joinRoom', roomId, user);
    return () => {
      socket.emit('leaveRoom', roomId, user);
    }
  }, [user, roomId, roomInfo]);

  React.useEffect(() => {
    sendUpdateOption(options);
  }, [options, sendUpdateOption]);

  const userIds = React.useMemo(() => Object.keys(peerMap), [peerMap]);

  return (
    <Layout>
      <Header>
        <H1>{roomData.title}</H1>
        {roomData.description && (
          <P>{roomData.description}</P>
        )}
      </Header>
      <FlexSection>
        <Article>
          <UserVideo user={user as User} tracks={tracks} options={options} />
          <OptionWrapper>
            <Button onClick={handleClickAudio}>
              오디오 {options.audio ? 'On' : 'Off'}
            </Button>
            <Button onClick={handleClickVideo}>
              비디오 {options.video ? 'On' : 'Off'}
            </Button>
          </OptionWrapper>
        </Article>
        
        {userIds.map((userId) => {
          const user = roomData.users.filter(({id}) => id === userId)[0];
          const {peer, state, option} = peerMap[userId];
          
          return (
            <Article key={userId}>
              <UserVideo user={user} peer={peer} options={option}>
                {(state === 'connecting' || state === 'idle') && (
                  <Dimd>
                    <Loading />
                  </Dimd>
                )}
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
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  align-items: center;
  text-align: center;
  font-size: 16px;
`;

const OptionWrapper = styled.div`
  margin-top: 10px;
  text-align: center;
  button {
    margin: 0 5px;
  }
`;

ChatRoom.displayName = 'ChatRoom';
export default React.memo(ChatRoom);