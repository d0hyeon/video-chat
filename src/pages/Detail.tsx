import React from 'react'
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Room } from '@src/types';
import Loading from '@src/components/common/Loading';
import PasswordPopup from '@src/components/popup/PasswordPopup';
import ChatRoom from './Room';
import { useRecoilValue } from 'recoil';
import { userSelector } from '@src/atoms/user';
const socket = io();

enum PasswordState {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  SUCCESS = 'success'
}

const Detail = () => {
  const user = useRecoilValue(userSelector);
  const {room} = useParams<{room: string}>();
  const [roomInfo, setRoomInfo] = React.useState<Room>();
  const [passwordState, setPasswordState] = React.useState<PasswordState>(PasswordState.UNKNOWN);
  const [tracks, setTracks] = React.useState<MediaStreamTrack[]>([]);

  const isContainInRoom = React.useMemo(() => roomInfo?.users.some(({id}) => id === user!.id) ?? true, [roomInfo]);
  
  const successPwHandler = React.useCallback(() => {
    setPasswordState(PasswordState.SUCCESS);
  }, [setPasswordState]);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((mediaStream) => {
        setTracks(mediaStream.getTracks());
      });
  }, [setTracks]);

  React.useEffect(() => {
    const roomDetailHandler = (room: Room) => {
      setRoomInfo(room);
    }
    socket.emit('getRoomDetail', room);
    socket.on('roomDetail', roomDetailHandler);

    return () => {
      socket.off('roomDetail', roomDetailHandler);
    }
  }, [room, setRoomInfo]);

  React.useEffect(() => {
    if(roomInfo && roomInfo.isPassword) {
      if(!isContainInRoom) {
        setPasswordState(PasswordState.PENDING);
        return;
      }
    }
    setPasswordState(PasswordState.SUCCESS);
  }, [roomInfo, isContainInRoom, setPasswordState]);


  return (
    passwordState === PasswordState.SUCCESS && 
    tracks.length && 
    roomInfo
  ) ? (
    <ChatRoom roomId={room} roomInfo={roomInfo} tracks={tracks} />
  ) : (
    <>
      {roomInfo?.isPassword && (
        <PasswordPopup roomId={room} open={passwordState === PasswordState.PENDING} onSuccess={successPwHandler} />
      )}
      <Loading />
    </>
  )
}

export default Detail;