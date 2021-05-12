import { userSelector } from '@src/atoms/user';
import Loading from '@src/components/common/Loading';
import PasswordPopup from '@src/components/popup/PasswordPopup';
import { Room } from '@src/types';
import socket from '@src/utils/socket';
import React from 'react';
import { useParams } from 'react-router';
import { useRecoilValue } from 'recoil';

interface Props {
  onSuccess: (room: Room) => void;
  onFail?: (message: string) => void;
}

enum PasswordState {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  SUCCESS = 'success',
}

enum State {
  PENDING = 'pending', 
  SUCCESS = 'success',
  FAIL = 'fail'
}

const RoomGate: React.FC<Props> = ({onSuccess, onFail}) => {
  const user = useRecoilValue(userSelector);
  const {room} = useParams<{room: string}>();
  const [roomInfo, setRoomInfo] = React.useState<Room>();
  const [state, setState] = React.useState<State>(State.PENDING);
  const [passwordState, setPasswordState] = React.useState<PasswordState>(PasswordState.UNKNOWN);
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  
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
    if(roomInfo) {
      if(!user) {
        setErrorMessage('사용자 정보가 확인되지 않습니다.');
        setState(State.FAIL);
        return;
      }
      if(roomInfo.users.length >= roomInfo.size) {
        setErrorMessage('이미 사용자가 가득찬 방입니다.');
        setState(State.FAIL);
        return;
      }
      if(roomInfo.users.some(({id}) => id === user.id)) {
        setErrorMessage('이미 참여중인 방입니다. \n다른 브라우저 또는 탭을 확인해주세요.');
        setState(State.FAIL);
        return;
      }
      setState(State.SUCCESS);
    }
  }, [roomInfo, user, setState, setErrorMessage]);

  React.useEffect(() => {
    if(state === State.SUCCESS && passwordState === PasswordState.SUCCESS && roomInfo) {
      onSuccess(roomInfo);
    }
    if(state === State.FAIL && onFail) {
      onFail(errorMessage);
    }
  }, [state, passwordState, roomInfo, errorMessage, onSuccess, onFail]);

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