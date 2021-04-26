import Loading from '@src/components/common/Loading';
import PasswordPopup from '@src/components/popup/PasswordPopup';
import { Room } from '@src/types';
import socket from '@src/utils/socket';
import React from 'react';
import { useParams } from 'react-router';

interface Props {
  onSuccess: (room: Room) => void;
  onFail?: () => void;
}

enum PasswordState {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  SUCCESS = 'success'
}

const RoomGate: React.FC<Props> = ({onSuccess}) => {
  const {room} = useParams<{room: string}>();
  const [roomInfo, setRoomInfo] = React.useState<Room>();
  const [passwordState, setPasswordState] = React.useState<PasswordState>(PasswordState.UNKNOWN);
  
  const successPwHandler = React.useCallback(() => {
    setPasswordState(PasswordState.SUCCESS);
  }, [setPasswordState]);

  const roomDetailHandler = React.useCallback((room: Room) => {
    setRoomInfo(room);
  }, [setRoomInfo]);


  React.useEffect(() => {
    socket.emit('getRoomDetail', room);
    socket.on('roomDetail', roomDetailHandler);

    return () => {
      socket.off('roomDetail', roomDetailHandler);
    }
  }, [room, setRoomInfo, roomDetailHandler]);

  React.useEffect(() => {
    if(roomInfo) {
      if(roomInfo.isPassword && roomInfo.users.length) {
        setPasswordState(PasswordState.PENDING);
      } else {
        setPasswordState(PasswordState.SUCCESS);
      }
    }
  }, [roomInfo, setPasswordState]);

  React.useEffect(() => {
    if(passwordState === PasswordState.SUCCESS && roomInfo) {
        onSuccess(roomInfo);
      } 
  }, [passwordState, roomInfo, roomDetailHandler]);

  return (
    <>
      {(roomInfo?.isPassword && passwordState === PasswordState.PENDING) && (
        <PasswordPopup roomId={room} onSuccess={successPwHandler} />
      )}
      <Loading/>
    </>
  )
}
RoomGate.displayName = 'RoomGate';
export default React.memo(RoomGate);