import React from 'react';
import styled from '@emotion/styled';
import LoadingSrc from '@src/static/images/loading.gif';

interface Props {
  size?: number;
}


const Loading: React.FC<Props> = ({size = 60}) => {
  return (
    <Img src={LoadingSrc} size={size} alt="loading" />
  )
};

Loading.displayName = 'Loading';
export default React.memo(Loading);

const Img = styled.img<Props>`
  display: block;
  width: ${({size}) => `${size}px`};
  margin: 0 auto;
`;