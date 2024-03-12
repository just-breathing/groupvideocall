

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

const getRoom = (socketId) => {
    for (const roomId in rooms) {
        if (rooms[roomId].find((roomUser) => roomUser[1] === socketId)) {
            return roomId; // Return the roomId if the socketId is found in a room
        }
    }
    return null; // Return null if the socketId is not found in any room
};






module.exports={rooms,removeUser,getRoom}