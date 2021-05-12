const http = require('http');
const socketIO = require('socket.io');

const roomsMap = {};
const roomPasswordMap = {};

const DEFAULT_ROOM = {
  title: '',
  description: '',
  size: 2,
  users: [],
  isPassword: false,
}

const DEFAULT_USER_OPTION_WITHIN_ROOM = {
  video: true,
  audio: true
}

module.exports = (app) => {
  const server = http.Server(app);
  const io = socketIO(server);

  io.on('connection', (socket) => {
    socket.on('message', (message, meta) => {
      const {roomId, ...rest} = meta;
      if(message.type === 'update' && roomsMap[meta.roomId]) {
        roomsMap[meta.roomId].users.map((user) => {
          if(user.id === meta.sender) {
            return {...user, option: message.payload}
          }
          return user;
        })
      }
      socket.broadcast.to(roomId).emit('message', message, rest);
    })
    socket.on('getRoomList', () => {
      socket.emit('roomList', Object.values(roomsMap).filter(({users}) => !!users.length));
    });

    socket.on('getRoomDetail', (roomId) => {
      if(roomsMap[roomId]) {
        socket.emit('roomDetail', roomsMap[roomId]);
      }
    })

    socket.on('createRoom', (_room) => {
      const room = {
        ...DEFAULT_ROOM,
        ..._room,
        users: []
      }
      roomsMap[room.id] = room;

      if(_room.password) {
        roomPasswordMap[_room.id] = _room.password;
        room.isPassword = true;
      }
      io.sockets.emit('createdRoom', room);
    });

    socket.on('checkPassword', (roomId, password) => {
      if(roomPasswordMap[roomId] && roomPasswordMap[roomId] === password) {
        socket.emit('responsePassword', true, roomId);
        return
      }
      socket.emit('responsePassword', false);
    })

    socket.on('joinRoom', (roomId, user) => {
      if(!user || !roomsMap[roomId]) {
        return;
      }
      if(roomsMap[roomId].users.length < roomsMap[roomId].size) {
        socket.join(roomId);
        socket.emit('roomDetail', roomsMap[roomId]);
        socket.to(roomId).broadcast.emit('joinUser', user);

        if(roomsMap[roomId].users.every(({id}) => id !== user.id)) {
          roomsMap[roomId].users = [
            ...roomsMap[roomId].users,
            {...user, option: DEFAULT_USER_OPTION_WITHIN_ROOM}
          ];
          io.sockets.emit('updatedRoom', roomsMap[roomId]);
        } else {
          socket.emit('error', {
            type: 'join',
            message: '이미 참여중인 방입니다. \n다른 브라우저나 탭을 확인해주세요.'
          })  
        }
      } else {
        socket.emit('error', {
          type: 'join',
          message: '이미 사용자가 가득 찬 방입니다.'
        })
      }
    });

    socket.on('leaveRoom', (roomId, user) => {
      if(!roomsMap[roomId]) {
        return;
      }
      if(!roomsMap[roomId].users.find(({id}) => user.id === id)) {
        return;
      }
      socket.broadcast.to(roomId).emit('leaveUser', user);
      socket.leave(roomId);
      roomsMap[roomId].users = roomsMap[roomId].users.filter(_user => _user.id !== user.id);

      if(!!roomsMap[roomId].users.length) {
        socket.emit('updatedRoom', roomsMap[roomId]);
      } else {
        delete roomsMap[roomId];
        socket.emit('deletedRoom', roomId);
      }
    })
  });
  
  server.listen(4000, () => {
    console.log('[socket] listen server');
  })
}