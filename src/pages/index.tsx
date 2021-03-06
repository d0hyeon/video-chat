import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { Link } from 'react-router-dom';
import { Button, Header, Layout, Section } from '@src/components/styles/common';
import { H1, P } from '@src/components/styles/text';
import { Room } from '@src/types';
import RoomFormPopup from '@src/components/popup/RoomFormPopup';
import Loading from '@src/components/common/Loading';
import socket from '@src/utils/socket';
// import IconSrc from '@src/static/images/lock.png';

const Chatting = () => {
  const [roomList, setRoomList] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openForm, setOpenForm] = React.useState<boolean>(false);
  
  const toggleFormPopup = React.useCallback(() => {
    setOpenForm(prev => !prev);
  }, [setOpenForm]);

  React.useEffect(() => {
    setLoading(true);
    socket.emit('getRoomList');

    const roomListHandler = (rooms: Room[]) => {
      setRoomList(rooms);
      setLoading(false);
    }

    const createdRoomHandler = (room: Room) => {
      setRoomList(prev => ([
        ...prev,
        room
      ]))
    }

    const updatedRoomHandler = (updateRoom: Room) => {
      setRoomList(prev => (
        prev.map(room => room.id === updateRoom.id 
          ? updateRoom 
          : room
        )
      ))
    }

    const deletedRoomHandler = (roomId: string) => {
      setRoomList(prev => prev.filter(({id}) => id !== roomId));
    }

    socket.on('roomList', roomListHandler);
    socket.on('createdRoom', createdRoomHandler);
    socket.on('updatedRoom', updatedRoomHandler);
    socket.on('deletedRoom', deletedRoomHandler);

    return () => {
      socket.off('roomList', roomListHandler);
      socket.off('createdRoom', createdRoomHandler);
      socket.off('updatedRoom', updatedRoomHandler);
      socket.off('deletedRoom', deletedRoomHandler);
    }
  }, [setRoomList, setLoading]);

  const roomItemComp = React.useCallback((room: Room) => {
    return (
      <RoomInfo>
        <RoomInfoBody>
          <p>
            <strong>{room.title}</strong>
            {room.isPassword && (
              <RoomIcons>
                <i>
                  {/* <img src={IconSrc} alt="lock" /> */}
                </i>
              </RoomIcons>
            )}
          </p>
          <p>{room.description}</p>
        </RoomInfoBody>
        {room.users[0] && (
          <RoomInfoNav>
            <p>
              {room.users[0].name} {room.users.length > 1 && `??? ${room.users.length -1}???`}
            </p>
            <p>
              [ {room.users.length} / {room.size} ]
            </p>
          </RoomInfoNav>
        )}
      </RoomInfo>
    )
  }, []);

  return (
    <Layout>
      <RoomFormPopup open={openForm} closeCallback={toggleFormPopup} />
      <Header>
        <H1>Chat List</H1>
      </Header>
      <Section>
        {(!roomList.length && !loading) 
          ? <EmptyText>?????? ????????????.</EmptyText> 
          : loading
            ? <Loading />
            : (
              <GridList>
                {roomList.map(room => (
                  <div key={room.id}>
                    {room?.size > room?.users?.length ? (
                      <Link to={`/${room.id}`}>{roomItemComp(room)}</Link>
                    ) : roomItemComp(room)}
                  </div>
                ))}
              </GridList>
            )
        }
      </Section>
      <Section
        css={css`
          display: flex;
          justify-content: flex-end;
        `}
      >
        <Button width={150} height={50} onClick={toggleFormPopup}>
          ??? ??????
        </Button>
        {/* <Input type={inputValue} onChange={inputChangeHandler} />
        <Button onClick={buttonClickHandler}>??? ??????</Button> */}
      </Section>
    </Layout>
  )
};

const EmptyText = styled(P)`
  padding: 50px 0;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-style: solid;
  border-color: #ddd;
  border-width: 1px 0;
  text-align: center;
`;

const GridList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;

  a {
    display: block;
    width: 100%;
  }
`;

const RoomInfoBody = styled.div`
  padding: 20px 25px;
  text-align: left;

  p {
    position: relative;
    & ~ p {
      margin-top: 10px;
    }
  }
`;

const RoomIcons = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;

  i {
    margin: 0 5px;
  }

  img {
    max-width: 10px;
  }
`;

const RoomInfoNav = styled.div`
  display: flex;
  padding: 10px 20px;
  border-top: 1px solid #ddd;
  align-items: center;
  justify-content: space-between;

  p ~ p {
    text-align: right;
  }
`;

const RoomInfo = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid #ddd;
  

  strong {
    color: #333;
    font-size: 16px;
    font-weight: bold;
  }
  p {
    font-size: 14px;
    color: #666;
  }
  small {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    font-weight: bold;
  }
`;

Chatting.displayName = 'Chatting';
export default Chatting;
