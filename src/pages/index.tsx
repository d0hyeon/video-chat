import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { io } from "socket.io-client";
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Button, Header, Layout, Section, Ul } from '@src/components/styles/common';
import { H1, P } from '@src/components/styles/text';
import { Room } from '@src/types';
import RoomFormPopup from '@src/components/popup/RoomFormPopup';

const socket = io();

const Chatting = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [inputValue, setInputValue] = React.useState<string>('');
  const [roomList, setRoomList] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openForm, setOpenForm] = React.useState<boolean>(false);
  
  const toggleFormPopup = React.useCallback(() => {
    setOpenForm(prev => !prev);
  }, [setOpenForm]);

  React.useEffect(() => {
    setLoading(true);
    socket.emit('getRoomList');

    socket.on('roomList', (rooms: Room[]) => {
      setRoomList(rooms);
      setLoading(false);
    });

    socket.on('createdRoom', (room: Room) => {
      setRoomList(prev => ([
        ...prev,
        room
      ]))
    });

    socket.on('updatedRoom', (updateRoom: Room) => {
      setRoomList(prev => (
        prev.map(room => room.id === updateRoom.id 
          ? updateRoom 
          : room
        )
      ))
    });

    socket.on('deletedRoom', (roomId: string) => {
      setRoomList(prev => prev.filter(({id}) => id !== roomId));
    })
  }, [setRoomList, setLoading]);

  const roomItemComp = React.useCallback((room: Room) => {
    return (
      <RoomInfo>
        <strong>{room.title}</strong>
        <p>{room.description}</p>
        <small>[ {room.users.length} / {room.size} ]</small>
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
          ? <EmptyText>방이 없습니다.</EmptyText> 
          : loading
            ? 'loading...'
            : (
              <Ul>
                {roomList.map(room => (
                  <Li key={room.id}>
                    {room?.size > room?.users?.length ? (
                      <Link to={`/${room.id}`}>{roomItemComp(room)}</Link>
                    ) : roomItemComp(room)}
                  </Li>
                ))}
              </Ul>
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
          방 생성
        </Button>
        {/* <Input type={inputValue} onChange={inputChangeHandler} />
        <Button onClick={buttonClickHandler}>방 추가</Button> */}
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

const Li = styled.li`
  a {
    display: block;
  }
`

const RoomInfo = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;

  strong {
    margin-right: 10px;
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
