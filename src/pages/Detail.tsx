import React from 'react'
import { useParams } from 'react-router-dom';
import { Room } from '@src/types';
import ChatRoom from './Room';
import RoomGate from './RoomGate';

type MutableRef<T> = {current: T | null};

const Detail = () => {
  const {room} = useParams<{room: string}>();
  const [roomData, setRoomData] = React.useState<Room>();
  const [tracks, setTracks] = React.useState<MediaStreamTrack[]>([]);
  const mediaStreamRef: MutableRef<MediaStream> = React.useRef(null);
  
  const onSuccessGate = React.useCallback((room: Room) => setRoomData(room), [setRoomData]);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((mediaStream: MediaStream) => {
        mediaStreamRef.current = mediaStream;
        setTracks(mediaStream.getTracks());
      });

    return () => {
      if(mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [setTracks, mediaStreamRef]);
  
  return (
    (roomData && tracks.length) 
      ? <ChatRoom roomId={room} roomInfo={roomData} tracks={tracks} />  
      : <RoomGate onSuccess={onSuccessGate} />
    
    
  )
}

export default React.memo(Detail);