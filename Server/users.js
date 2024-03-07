

const rooms = {};

const removeUser = (socketId) => {
    for (const roomId in rooms) {
        rooms[roomId] = rooms[roomId].filter((roomUser) => roomUser[1] !== socketId);
        // Optionally, you can check if the room is empty and remove it
        if (rooms[roomId].length === 0) {
            delete rooms[roomId];
        }
    }
};






module.exports={rooms,removeUser}