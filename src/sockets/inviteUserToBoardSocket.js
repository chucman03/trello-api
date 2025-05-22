
// params socket lay tu thu vien socketio
export const inviteUserToBoardSocket = (socket) => {
    // lang nghe su kien client comit len ten la FE USER...
        socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
          // cach don gian nhat la emit lai cho moi thang client khac tru thang dang goi
          socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
        })
}