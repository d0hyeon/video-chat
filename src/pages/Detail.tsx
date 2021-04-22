import React from 'react'
import { useParams } from 'react-router-dom';
import { Room } from '@src/types';
import ChatRoom from './Room';
import RoomGate from './RoomGate';

const Detail = () => {
  const {room} = useParams<{room: string}>();
  const [roomData, setRoomData] = React.useState<Room>();
  const [tracks, setTracks] = React.useState<MediaStreamTrack[]>([]);
  
  const onSuccessGate = React.useCallback((room: Room) => setRoomData(room), [setRoomData]);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((mediaStream) => {
        setTracks(mediaStream.getTracks());
      });

    return () => {
      setTracks(tracks => {
        tracks.forEach(track => track.stop());
        return [];
      })
    }
  }, [setTracks]);
  
  return (
    (roomData && tracks.length) 
      ? <ChatRoom roomId={room} roomInfo={roomData} tracks={tracks} />  
      : <RoomGate onSuccess={onSuccessGate} />
    
    
  )
}

export default React.memo(Detail);