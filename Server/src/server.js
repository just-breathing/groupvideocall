const express = require("express");
const cors  = require("cors");
const app =  express();
const {rooms,removeUser,getRoom} = require("./users")
app.use(cors());
app.use(express.json());
require('dotenv').config()

const http = require('http').createServer(app);
const io = require("socket.io")(http,{
    cors: {
    origin: "*",
    methods: ["GET", "POST"]
    }
    });


io.on("connection", (socket) => {

    socket.on("checkUser", (userInfo) => {
        const { user, roomId } = userInfo;
        const roomExists = rooms.hasOwnProperty(roomId);
    
        if (roomExists) {
            const userExists = rooms[roomId].some((roomUser) => roomUser[0] === user);
    
            if (!userExists) {
                const remUsers = rooms[roomId].filter((roomUser) => roomUser[1] !== user);
                rooms[roomId].push([user,socket.id]);
                socket.join(roomId);
                socket.emit("join", { data: remUsers, msg: `User ${user} joined room ${roomId}` });
    
                const userMap = Object.fromEntries(rooms[roomId]);
                socket.broadcast.emit("ulist", userMap);
            } else {
                socket.emit("UE", `User ${user} already exists in room ${roomId}. Choose another userName.`);
            }
        } else {
            rooms[roomId] = [[ user,socket.id]];
            socket.join(roomId);
            socket.emit("join", { data: [], msg: `New room ${roomId} created, and user ${user} joined` });

        }
    });
    

    socket.on("connectionReq",(data)=>{
        io.to(data.userId).emit("connectionReq",{from:socket.id,signal:data.signalData})
    });


    socket.on("connectAct",(data)=>{
        io.to(data.userId).emit("connectAct",{from:socket.id,signal:data.signalData})
    })

    // socket.emit("me",socket.id)
    // //runs when user joins a room
    // socket.on("jr",(det)=>{
    //     const {user,room}=det
    //     const User=userJoin(socket.id,user,room)
    //     socket.join(User.room);
    //     //welcome new user
    //     socket.emit("msg",formatMsg(botName,'welcome to chatcord!'));
    //     //send msg to every one in that group that a new user has joined
    //     socket.broadcast.to(User.room).emit('msg',formatMsg(botName,user+" has joined the chat"));

    //     io.to(User.room).emit('roomusers',getRoomUsers(User.room));
    // })
    //  socket.on("callUser",(data)=>{
    //      io.to(data.to).emit("getingCall",{signal:data.senderSignal,from:data.from,name:data.name})
    //  })
    //  socket.on("callAccepted",(data)=>{
    //      io.to(data.to).emit("callAccepted",{signal:data.signal})
    //  })
    //  socket.on("rejectcall",(data)=>{
    //     io.to(data.from).emit("reject",{id:data.id})
    //  })
    // //runs when a client sends msg to room
    // socket.on("chat-msg",(msg)=>{
    //     const user = getCurrentUser(socket.id)
    //     socket.broadcast.to(user.room).emit("chat-msg",msg);
    // })
    
// io.on("connection", socket => {
//     socket.emit("me", socket.id)

//     socket.on("joinroom", data => {
//         console.log(data)
//         socket.emit("getUsers", users);
//         const newUser = { id: data.id, name: data.name };
//         users.push(newUser);
//         socket.on("calluser", data => {
//             console.log("call user");
//             socket.broadcast.to(data.to).emit("gettingcall", { to: data.to, from: data.from, signal: data.signal, name: data.name })
//         })
//         socket.on("acceptingcall", data => {
//             console.log("caccepting call");
//             socket.broadcast.to(data.to).emit("ack", { from: data.from, signal: data.signal })
//         })
//     })

//     socket.on("disconnect", () => {
//         socket.broadcast.emit("userleft", { id: socket.id })
//     })
// })
    socket.on("destroyPeer",({room})=>{

        socket.broadcast.emit("destroyPeer",{Id:socket.id})
        removeUser(socket.id)
        socket.leave(room)
    })
  
    //runs when client disconnects
    socket.on("disconnect",()=>{
       // const User = leaveRoom(socket.id)
        //io.to(User.room).emit("msg",formatMsg(botName,User.user+" has left the chat"));
        //io.to(User.room).emit('roomusers',getRoomUsers(User.room));
        socket.broadcast.emit("destroyPeer",{Id:socket.id})
        const room=getRoom(socket.id)
        socket.leave(room)
        removeUser(socket.id)

    })
})


app.get("/",(req,res)=>{
    res.send("Ok Got /")
    console.log("ok got it");
})

const port = process.env.port||5600;
http.listen(port,()=>console.log(`listening on port ${port}`));