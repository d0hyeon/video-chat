import React from 'react';
import Modal, { ModalProps } from '../common/Modal';
import { PopupBody, PopupHeader, PopupTitle, RadiusButton } from '../styles/common';
import { useHistory } from 'react-router-dom';
import Form, { FormItem } from '../form/base';
import { io } from 'socket.io-client';
import { ButtonGroup } from './UserFormPopup';
import { ThemeColor } from '@src/constant/theme';

interface Props extends Pick<ModalProps, 'open'> {
  roomId: string;
  onSuccess: () => void;
}

const socket = io();

const PasswordPopup: React.FC<Props> = ({open, onSuccess, roomId}) => {
  const history = useHistory();

  React.useEffect(() => {
    const responsePwdHander = (result: boolean) => {
      if(result) {
        onSuccess();
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }

    socket.on('responsePassword', responsePwdHander);

    return () => {
      socket.off('responsePassword', responsePwdHander);
    }
  }, [roomId, onSuccess]);

  const formSubmitHandler = React.useCallback((formData) => {
    socket.emit('checkPassword', roomId, formData.password);
  }, [roomId]);

  const closeHandler = React.useCallback(() => {
    history.replace('/');
  }, [history]);

  return (
    <Modal
      verticalAlign="center" 
      open={open} 
      closeCallback={closeHandler}
      >
      <PopupBody>
        <PopupHeader>
          <PopupTitle>비밀번호 입력</PopupTitle>
        </PopupHeader>
        <div>
          <Form onSubmit={formSubmitHandler}>
            <FormItem name="password" title="비밀번호" />
            <ButtonGroup>
              <RadiusButton type="button" onClick={closeHandler}>취소</RadiusButton>
              <RadiusButton type="submit" theme={ThemeColor.ACTIVE}>확인</RadiusButton>
            </ButtonGroup>
          </Form>
        </div>
      </PopupBody>
    </Modal>
  )
};

PasswordPopup.displayName = 'PasswordPopup';
export default React.memo(PasswordPopup);