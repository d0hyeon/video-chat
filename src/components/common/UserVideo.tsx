import React from 'react';
import styled from '@emotion/styled';
import { User } from '@src/types';
import Profile from './Profile';

interface Props {
  user?: User;
  peer?: RTCPeerConnection;
  children?: React.ReactNode;
}

const UserVideo = React.forwardRef<any, Props>(({
  user,
  peer,
  children
}, ref) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useImperativeHandle(ref, () => videoRef.current);
  React.useEffect(() => {
    const addTrackHandler = (event: MediaStreamTrackEvent) => {
      if(videoRef.current) {
        const mediaStream = (videoRef.current.srcObject as MediaStream | undefined) ?? new MediaStream();
        mediaStream.addTrack(event.track);
        videoRef.current.srcObject = mediaStream;
      }
    }
    if(peer) {
      peer.addEventListener('track', addTrackHandler);
      return () => {
        peer.removeEventListener('track', addTrackHandler);
      }
    }
  }, [peer, videoRef]);

  return (
    <Wrapper>
      <Video ref={videoRef} autoPlay />
      {user && (
        <UserWrapper>
          <Profile user={user} />
          <UserInfo>
            <p>
              <strong>{user.name}</strong>
            </p>
            {user.message && (
              <p>{user.message}</p>
            )}
          </UserInfo>
          {children && children}
        </UserWrapper>
      )}
    </Wrapper>
  )
})

UserVideo.displayName = 'UserVideo';
export default React.memo(UserVideo);

const Wrapper = styled.div`

`;

const UserWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  font-size: 14px;
  margin-left: 10px;
  align-items: center;
`;

const Video = styled.video`
  display: block;
  width: 100%;
`;