import React from 'react'
import { useHistory, useParams } from 'react-router-dom';
import { Room } from '@src/types';
import ChatRoom from './Room';
import RoomGate from './RoomGate';

type MutableRef<T> = {current: T | null};

const Detail = () => {
  const history = useHistory();
  const {room} = useParams<{room: string}>();
  const [roomData, setRoomData] = React.useState<Room>();
  const [tracks, setTracks] = React.useState<MediaStreamTrack[]>([]);
  const mediaStreamRef: MutableRef<MediaStream> = React.useRef(null);
  const [initStream, setInitStream] = React.useState<boolean>(false);
  
  const onSuccessGate = React.useCallback((room: Room) => setRoomData(room), [setRoomData]);
  const onFailGate = React.useCallback((message) => {
    alert(message);
    history.replace('/');
  }, [history, mediaStreamRef]);

  React.useEffect(() => {
    if(roomData) {
      navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then((mediaStream: MediaStream) => {
          mediaStreamRef.current = mediaStream;
          setTracks(mediaStream.getTracks());
          setInitStream(true);
        });

      return () => {
        if(mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [roomData, setTracks, setInitStream, mediaStreamRef]);
  
  return (
    (roomData && initStream) 
      ? <ChatRoom roomId={room} roomInfo={roomData} tracks={tracks} />  
      : <RoomGate onSuccess={onSuccessGate} onFail={onFailGate} />
  )
}

export default React.memo(Detail);