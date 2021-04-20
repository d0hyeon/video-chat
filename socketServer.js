const http = require('http');
const socketIO = require('socket.io');

const roomsMap = {};

const DEFAULT_ROOM = {
  title: '',
  description: '',
  size: 2,
  users: [],
  password: ''
}

module.exports = (app) => {
  const server = http.Server(app);
  const io = socketIO(server);

  io.on('connection', (socket) => {
    socket.on('message', (message, meta) => {
      const {roomId, ...rest} = meta;
      socket.broadcast.to(roomId).emit('message', message, rest);
    })
    socket.on('getRoomList', () => {
      socket.emit('roomList', Object.values(roomsMap));
    });

    socket.on('createRoom', (_room) => {
      const room = {
        ...DEFAULT_ROOM,
        ..._room
      }
      
      roomsMap[room.id] = room;
      io.sockets.emit('createdRoom', room);
    });

    socket.on('joinRoom', (roomId, user) => {
      if(!user || !roomsMap[roomId]) {
        return;
      }
      if(roomsMap[roomId].users.length < roomsMap[roomId].size) {
        socket.join(roomId);
        socket.emit('roomDetail', roomsMap[roomId]);
        socket.broadcast.to(roomId).emit('joinUser', user);
        roomsMap[roomId].users = [
          ...roomsMap[roomId].users,
          user
        ]
        io.sockets.emit('updatedRoom', roomsMap[roomId]);
      }
    });
    
    socket.on('ready', (user) => {
      socket.broadcast.emit('readyUser', user);
    })

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