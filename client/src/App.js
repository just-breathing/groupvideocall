import './App.css';
import {  useEffect, useMemo, useRef, useState } from 'react';
import {User} from "./Components/User"
import {Mic,Cam,Exit} from "./Icons/Icons"
import Peer from "simple-peer"

import { io } from "socket.io-client"

const Vid = ({id,list,peer})=>{
  const vidRef = useRef();
  useEffect(()=>{
    peer.on("stream",(stream)=>{
      vidRef.current.srcObject= stream
    })
  },[])
  const val = useMemo(()=>{
    const item = Object.keys(list).find(key => list[key] === String(id)); 
    console.log(id,item)
  },[list])
  return (
    <div className='videowrap' style={{width:"300px",height:"200px"}} >
      <video playsInline autoPlay ref={vidRef}  width={300} height={200}  />
      <label  >{val}  </label>
  </div>  
  )
}

function App() {
  const socketRef = useRef();
  const userRef=useRef(null);
  const roomRef=useRef(null);
  
  const [userData, setUserData] = useState({
    user: null,
    room: null
  })
  const [controls,setControls]=useState({audio:true,video:true})
  const userStream=useRef(null);
  const peersRef = useRef([]);
const videoRef=useRef(null);
const [peers,setPeers]=useState([]);
const usersList=useRef([]);


function toggleMute() {
  const myTracks = userStream.current.getTracks();
const myAudio = myTracks.filter(track => track.kind === "audio")[0];
const val=!controls.audio===true
setControls({...controls,audio:val})
  myAudio.enabled = val;
  console.log(`Video ${myAudio.enabled ? 'unmuted' : 'muted'} track.kind`);
}
function toggleVideo() {
  const myTracks = userStream.current.getTracks();
const myvideo = myTracks.filter(track => track.kind === "video")[0];
const val=!controls.video===true

setControls({...controls,video:val})
myvideo.enabled = val;
  console.log(`Video track ${myvideo.enabled ? 'unmuted' : 'muted'} track.kind`);
}

const ReqConnections = (usersdata)=>{
  console.log("userData : ",usersdata)
  
  usersdata.forEach(user => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: userStream.current
		})

    const userPeer = {peerId:user[1],peer}
    setPeers((prev)=>[...prev,userPeer])
    peersRef.current.push(userPeer)
  

		peer.on("signal", (data) => {
			socketRef.current.emit("connectionReq", {
        signalData:data,
        userId:user[1],
			})
		})

   });

}

const acceptConnections = (data)=>{
	const peer = new Peer({
    initiator: false,
    trickle: false,
    stream: userStream.current
  })
  const userPeer = {peerId:data.from,peer}
  setPeers((prev)=>[...prev,userPeer])
  peersRef.current.push(userPeer)

  peer.on("signal", (signal) => {
    socketRef.current.emit("connectAct", {
      signalData:signal,
      userId:data.from,
    })
  })


  peer.signal(data.signal) 
}

  useEffect(()=>{
      socketRef.current=io("ws://localhost:5600");
    navigator.getUserMedia_ = (   navigator.getUserMedia
      || navigator.webkitGetUserMedia 
      || navigator.mozGetUserMedia 
      || navigator.msGetUserMedia);



if (navigator.getUserMedia_) {
  navigator.getUserMedia_(
    { audio: controls.audio, video: controls.video },
    (stream) => {
      userStream.current=stream
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = (e) => {
        videoRef.current.play();
      };
      toggleMute()
    },
    (err) => {
      if (err.name==="NotAllowedError")
      {
        console.error(`The following error occurred: ${err.name}`);
 
      }
    },
    
  );
} else {
  console.log("getUserMedia not supported");
}

socketRef.current.on("ulist",(data)=>{
  console.log("data : ",data)
  usersList.current=data
})

socketRef.current.on("connectionReq",(data)=>{
  console.log("got connection request")
  acceptConnections(data)
})

socketRef.current.on("UE",(msg)=>{
        window.alert(msg)
})
socketRef.current.on("connectAct", (data) => {
  console.log("check peer : ",peersRef.current,data.from)
  const peer = peersRef.current.find((peer)=>peer.peerId===data.from)
  console.log("peer item connecting : ",peer)
  peer.peer.signal(data.signal)
})

  },[])

const joinRoom = ()=>{
  socketRef.current.emit("checkUser",{user:userRef.current.value,roomId:roomRef.current.value})
socketRef.current.on("join",(res)=>{
    setUserData({user:userRef.current.value,room:roomRef.current.value});
    console.log(`message : ${res.msg}`);
    if( res.data.length>0)
    {
      ReqConnections(res.data)
    }
})

}

  return (
    <div className="app">
      <User  data={userData}  check={joinRoom} ur={userRef} rf={roomRef}/>
      {
        userData?
        <div>
          <div className='videogrp' >
              <div className='videowrap'style={{width:"300px",height:"200px"}} >
                  <video ref={videoRef} width={300} height={200}  />
                  <label>{userData.user?userData.user:""} {` (You)`} </label>
              </div>
              { peers.length>0?
               peers.map((el,id)=>{
                 return   <Vid id={el.peerId} list={usersList.current} peer={el.peer} key={id} />
                }):""
              }
          </div>
          <div className='Controls' >
            <div  className={`icon ${controls.audio?"":"disabled"}`} onClick={()=>toggleMute()} >
              <span className={`iconspan ${controls.audio?"":"disabled"}`}></span>
              <Mic />
              </div>
            <div className={`icon ${controls.video?"":"disabled"}` } onClick={()=>toggleVideo()} ><span className={`iconspan `}></span><Cam/></div>
            <div className='icon'><Exit/></div>
          </div>
        </div>
        :""  
      }
    </div>
  );
}






export default App;
