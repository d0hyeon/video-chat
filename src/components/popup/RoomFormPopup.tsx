import React from 'react';
import { useHistory } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { io } from "socket.io-client";
import Form, { FormItem } from '../form/base';
import { PopupBody, PopupHeader, PopupTitle, RadiusButton } from '../styles/common';
import { ButtonGroup } from './UserFormPopup';
import { Room } from '@src/types';
import Modal, {ModalProps} from '../common/Modal';
import { useRecoilValue } from 'recoil';
import { userSelector } from '@src/atoms/user';

const socket = io();

interface Props extends Pick<ModalProps, 'open' | 'closeCallback'> {}

const RoomFormPopup: React.FC<Props> = ({open, closeCallback}) => {
  const history = useHistory();
  const id = React.useMemo(() => nanoid(), []);
  const user = useRecoilValue(userSelector);

  const formSubmitHandler = React.useCallback((formData) => {
    const size = 2;
    const password = '';

    socket.emit('createRoom', {
      id,
      size,
      password,
      ...formData,
    }, user);
  }, [id, user]);

  React.useEffect(() => {
    const createdHandler = (room: Room) => {
      if(id === room.id) {
        history.push(`/${room.id}`);
      }
    }
    socket.on('createdRoom', createdHandler);

    return () => {
      socket.off('createdRoom', createdHandler);
    }
  }, [history, id]);

  return (
    <Modal
      verticalAlign="center" 
      open={open} 
      closeCallback={closeCallback}
    >
      <PopupBody>
        <PopupHeader>
          <PopupTitle>채팅 방 생성</PopupTitle>
        </PopupHeader>
        <Form onSubmit={formSubmitHandler}>
          <FormItem name="title" title="제목" required />
          <FormItem name="description" title="설명" />
          
          <ButtonGroup>
            <RadiusButton type="button">
              취소
            </RadiusButton>
            <RadiusButton type="submit">확인</RadiusButton>
          </ButtonGroup>
        </Form>
      </PopupBody>
    </Modal>
  )
};

RoomFormPopup.displayName = 'RoomFormPopup';
export default React.memo(RoomFormPopup);
