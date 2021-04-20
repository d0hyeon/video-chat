import React from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { userSelector } from '@src/atoms/user';
import Profile from '../common/Profile';
import UserFormPopup from '../popup/UserFormPopup';
import { User } from '@src/types';
import { Link } from 'react-router-dom';

const Header = () => {
  const userState = useRecoilValue<User | null>(userSelector);
  const [openUserPopup, setOpenUserPopup] = React.useState(userState === null);
  const userStateRef = React.useRef<User | null>(userState);
  
  const profileCliclHandler = React.useCallback(() => {
    setOpenUserPopup(prev => !prev);
  }, [setOpenUserPopup]);

  const popupCloseHandler = React.useCallback(() => {
    setOpenUserPopup(false);
    setTimeout(() => {
      if(!userStateRef.current) {
        setOpenUserPopup(true);
      }
    })
  }, [setOpenUserPopup, userStateRef]);
  
  React.useEffect(() => {
    userStateRef.current = userState;
  }, [userState]);
  

  return (
    <>
      <UserFormPopup open={openUserPopup} onClose={popupCloseHandler}/>
      <StyledHeader>
        <Logo>
          <Link to="/">CHAT</Link>
        </Logo>
        {userState && (
          <Profile user={userState} size={35} onClick={profileCliclHandler}/>
        )}
      </StyledHeader>
    </>
  )
};

Header.displayName = 'Header';
export default React.memo(Header);

const StyledHeader = styled.header`
  display: flex;
  padding: 0 30px;
  height: 60px;
  align-items: center;
  justify-content:space-between;
  border-bottom: 1px solid #ddd;
`;

const Logo = styled.h1`
  font-size: 28px;
  font-weight: bold;
  font-family: 'IBM Plex Mono', monospace;
  font-family: 'Press Start 2P', cursive;
`;