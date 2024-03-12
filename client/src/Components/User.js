import React from 'react';


export const User = ({data,check,ur,rf}) => {


   const  handleClick = ()=>{
    check()
   }
    return ( 
            (data.user===null)?
            (
            <div className='UserForm' >
            <div className='inpblock' >
                <label> Username  </label>
                <input type="text" ref={ur}/>
            </div>
            <div className='inpblock'>
                <label> Room ID  </label>
                <input type="text"  ref={rf} />
            </div>
                <button className='joinbtn' onClick={handleClick}> Join</button>
            </div>
            )
            :
            <div className='RoomLabel'>
                <label>Room ID : {data.room}</label>
            </div>

     );
}
 
