import React from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import Modal from '../common/Modal';
import { PopupBody, PopupDescription, PopupHeader, PopupTitle, RadiusButton } from '../styles/common';
import { userSelector } from '@src/atoms/user';
import { User } from '@src/types';
import Form, { FormItem } from '../form/base';
import { nanoid } from 'nanoid';
import { ThemeColor } from '@src/constant/theme';

interface Props {
  open?: boolean;
  onClose?: () => void;
}

const ANIMATION_DURATION = 500;

const UserFormPopup: React.FC<Props> = ({open, onClose}) => {
  const [userState, setUserState] = useRecoilState<User | null>(userSelector);
  const [openUserPopup, setOpenUserPopup] = React.useState(open);

  const userPopupClose = React.useCallback(() => {
    setOpenUserPopup(false);
  }, [setOpenUserPopup]);

  const userFormSubmitHandler = React.useCallback((formData) => {
    const userData = {
      id: nanoid(),
      ...formData,
    }
    setUserState(userData);
    setOpenUserPopup(false);
  }, [setUserState, setOpenUserPopup]);

  React.useEffect(() => {
    setOpenUserPopup(open);
  }, [setOpenUserPopup, open]);

  return (
    <Modal 
      verticalAlign="center" 
      open={openUserPopup} 
      closeCallback={userPopupClose}
      onClose={onClose}
      animationDuration={ANIMATION_DURATION}
    >
      <PopupBody>
        <PopupHeader>
          <PopupTitle>사용자 정보</PopupTitle>
          <PopupDescription>사용자 정보를 입력해주세요.</PopupDescription>
        </PopupHeader>
        <Form onSubmit={userFormSubmitHandler}>
          <>
            <FormItem name="name" title="이름" defaultValue={userState?.name} required />
            <FormItem name="message" title="상태메세지" defaultValue={userState?.message} />
            <ButtonGroup>
              <RadiusButton type="button" onClick={userPopupClose}>
                취소
              </RadiusButton>
              <RadiusButton type="submit" color={ThemeColor.ACTIVE}>
                확인
              </RadiusButton>
            </ButtonGroup>
          </>
        </Form>
      </PopupBody>
    </Modal>
  )
};

export const ButtonGroup = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

UserFormPopup.displayName = 'UserFormPopup';
export default React.memo(UserFormPopup);