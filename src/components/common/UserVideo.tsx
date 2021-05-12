import React from 'react';
import styled from '@emotion/styled';
import { ChatOption, User } from '@src/types';
import Profile from './Profile';
interface Props {
  user?: User;
  peer?: RTCPeerConnection;
  tracks?: MediaStreamTrack[];
  options?: ChatOption;
  children?: React.ReactNode;
}

export const DEFAULT_VIDEO_OPTIONS: ChatOption = {
  audio: true,
  video: true
}

const UserVideo = React.forwardRef<any, Props>(({
  user,
  peer,
  options: _options = DEFAULT_VIDEO_OPTIONS,
  tracks: _tracks,
  children
}, ref) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [tracks, setTracks] = React.useState<MediaStreamTrack[]>(_tracks ?? []);
  const [option, setOption] = React.useState<ChatOption>(DEFAULT_VIDEO_OPTIONS);
  const tracksRef = React.useRef<MediaStreamTrack[]>(tracks);

  React.useImperativeHandle(ref, () => videoRef.current, [videoRef]);
  React.useEffect(() => {
    const handleTrack = (event: MediaStreamTrackEvent) => {
      setTracks(prev => ([...prev, event.track]));
    }
    if(peer) {
      peer.addEventListener('track', handleTrack);
      return () => {
        peer.removeEventListener('track', handleTrack);
      }
    }
  }, [peer, videoRef, setTracks]);

  React.useEffect(() => {
    if(videoRef.current) {
      const mediaStream = new MediaStream();
      tracks.forEach(track => {
        console.log(track);
        mediaStream.addTrack(track);
      });
      videoRef.current.srcObject = mediaStream;
    }
    tracksRef.current = tracks;
  }, [tracks, videoRef, tracksRef]);

  React.useEffect(() => {
    setOption(_options);
  }, [_options]);

  React.useEffect(() => {
    tracksRef.current.map((track) => {
      if(
        (track.kind === 'audio' && track.enabled !== option.audio) ||
        (track.kind === 'video' && track.enabled !== option.video)
      ) {
        track.enabled = !track.enabled
      }
    })
  }, [option, tracksRef]);

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