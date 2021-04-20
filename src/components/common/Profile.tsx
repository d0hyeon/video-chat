import React from 'react';
import styled from '@emotion/styled';
import {User as UserType} from '@src/types/index';

interface Props {
  user: UserType;
  size?: number;
  onClick?: () => void;
}

const Profile: React.FC<Props> = ({
  user,
  size = 40,
  onClick
}) => {
  return (
    <>
      <UserFrame size={size} onClick={onClick && onClick}>
        <p>{user.name.substr(0, 1)}</p>
      </UserFrame>
    </>
  )
};

Profile.displayName = 'User';
export default React.memo(Profile);


const UserFrame = styled.div<{size: number}>`
  display: inline-flex;
  background-color: #fff;
  align-items: center;
  justify-content: center;
  border: 1px solid #666;
  border-radius: 50%;
  cursor: pointer;
  
  ${({size}) => `
    width: ${size}px;
    height: ${size}px;
    font-size: ${size * 0.6}px;
  `}

  p {
    font-weight: bold;
    font-size: inherit;
  }
`;