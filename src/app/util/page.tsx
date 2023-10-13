"use client";

import { SocketAddress } from "net";
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

import '@styles/font.css'

let socket: any;

class messageInfo {
  msgtype;
  msgcontent;
  date;
  constructor(msgtype: string, msgcontent: any, date: Date) {
    this.msgtype = msgtype;
    this.msgcontent = msgcontent;
    this.date = date;
  }
  // username;
  // message;
  // style;
  // date;
  // constructor(username: string, message: string, style: string, date: Date) {
  //     this.username = username;
  //     this.message = message;
  //     this.style = style;
  //     this.date = date;
  // }
}

const Page = () => {
  const [message, setMessage] = useState<string>("");
  const [userCount, setUserCount] = useState<number>(0);
  const [messageList, setMessageList] = useState<messageInfo[]>([]);
  const [username, setUsername] = useState<string>("");
  const [result, setResult] = useState("");

  const gameDiv: any = useRef(null);
  const chatDiv: any = useRef(null);

  useEffect(() => {
    socketInitializer();

    return () => {
      socket.disconnect();
    };
  }, []);

  async function socketInitializer() {

    const urlParams = new URL(location.href).searchParams;

    const username = await urlParams.get('username') ?? 'test';
    setUsername(username);
    console.log('username', username);

    // Setup the Socket 
    // socket = await io('https://ssuvelop.r-e.kr/chat?username=' + username);
    socket = await io('http://203.253.21.28:9000/socket/festpub?username=' + username);
    

    // Standard socket management
    socket.on('connect', () => {
      console.log('Connected to the server');
      console.log(socket);
    });

    socket.on('getUserName', () => {
      console.log('getUserName');
      socket.emit('message', new messageInfo("userMsg", {
        'username': username,
        'message': message,
      }, new Date()));
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    socket.on('connect-error', (error: any) => {
      console.log('Connection error:', error);
    });

    socket.on('reconnect', (attemptNumber: any) => {
      console.log('Reconnected to the server. Attempt:', attemptNumber);
    });

    socket.on('reconnect-error', (error: any) => {
      console.log('Reconnection error:', error);
    });

    socket.on('reconnect-failed', () => {
      console.log('Failed to reconnect to the server');
    });

    socket.on('message', (newMsg: any) => {
      console.log("Message", newMsg);
      setMessageList(prevMessages =>
        [...prevMessages, new messageInfo(newMsg.msgtype, newMsg.msgcontent, newMsg.date)]);
    });

    socket.on('client-join', (client: any) => {
      setUserCount(client['count']);
      setMessageList(prevMessages =>
        [...prevMessages, new messageInfo('roomMsg', {
          'username': client['username'],
          'state': 'join',
        }, client['date'])]);
    });

    socket.on('client-exit', (client: any) => {
      setUserCount(client['count']);
      setMessageList(prevMessages =>
        [...prevMessages, new messageInfo('roomMsg', {
          'username': client['username'],
          'state': 'exit',
        }, client['date'])]);
    });
  }


  function handleSubmit(e: any) {
    e.preventDefault();
    setMessage(message.trim());
    if(message.length == 0) {
      return;
    }

    const msgItem = (
      <div style={{ display: 'flex' }}>
        <p className="test">{username}:</p>
        <p className="userMsg">{message}</p>
      </div>
    );

    console.log(msgItem);
    socket.emit('message', new messageInfo("userMsg", {
      'username': username,
      'message': message,
    }, new Date()));

    setMessage("");
  }

  const listItems = messageList.map((message, index) => (
    <li key={index}>
      {
        message.msgtype == 'userMsg' ? (
          <div style={{ display: 'flex' }}>
            <p className="test">{message.msgcontent['username']}:</p>
            <p className="userMsg">{message.msgcontent['message']}</p>
          </div>
        ) : message.msgtype == 'roomMsg' ? (
          <div style={{ display: 'flex' }}>
            <p className="roomMsg">{message.msgcontent['username']}이 {
              message.msgcontent['state'] == 'join' ? ('입장') : ('퇴장')
            }하였습니다.</p>
          </div>
        ) : null
      }
    </li>
  ));


  return (
    <div className='flex items-center justify-center h-screen w-screen '>
      <div className='main-div relative h-full w-full m-20'>
        <div className='game-div'>

        </div>
        <div className='room-div'>

        </div>
        <div className='chat-div
          border-solid border-black border-[0.25rem] rounded-2xl
          absolute w-2/5 h-full right-0 flex flex-col'>
          <div className='flex items-center'>
            <div className='text-center p-4'>
              back
            </div>
            <div className='grow flex flex-col items-center p-2'>
              <div>
                room no.
              </div>
              <div>
                1/8
              </div>
            </div>
          </div>
          <div className="grow mx-2 overflow-auto">
            <ul id="messages">
              {listItems}
            </ul>
            {/* <input id="usernameinput"
              autoComplete={"off"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"/> */}
          </div>
          <div className="m-4">
            <form id="msgform" className="flex" onSubmit={handleSubmit}>
              <input id="msginput" className="flex-1"
                autoComplete={"off"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"/>
              <button type="submit" className="ml-4">전송</button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Page;

    //         <div className="h-screen p-4">
    //             <div className="justify-center h-full w-full w-max- bg-red-100">
    //                 <div
    //                     ref={gameDiv}>

    //                 </div>
    //                 <div className=" h-full p-2
    //                     border-black border-solid rounded-r-3xl border-2
    //                     flex flex-col
    //                     transition ease-in-out duration-300"
    //                     ref={chatDiv}>
    //                     <button onClick={() => {
    //                         console.log(chatDiv.current.innerText);
    //                         console.log(gameDiv.current.style.display);
    //                         console.log(chatDiv.current.className);

    //                         chatDiv.current.classList.toggle('flex-1');
    //                         chatDiv.current.classList.toggle('bg-green-100');
    //                         chatDiv.current.classList.toggle('translate-x-1/4');
    //                         chatDiv.current.classList.toggle('scale-x-50');
    //                         if(chatDiv.current.style.display == 'none') {
    //                             // gameDiv.current.style.setProperty('display', 'block');
    //                         } else {
    //                             // gameDiv.current.style.setProperty('display', 'none');
    //                         }
    //                         // chatDiv.current.style.setProperty('background-color', 'red');
    //                     }}>
    //                         hello
    //                     </button>
    //                     <div className="flex">
    //                         <p>
    //                             back
    //                         </p>
    //                         <p className="grow text-center">
    //                             room
    //                         </p>
    //                     </div>
    // {/* 
    //                         <input id="usernameinput"
    //                         autoComplete={"off"}
    //                         value={username}
    //                         onChange={(e) => setUsername(e.target.value)}
    //                         type="text"/> */}
    //                     <ul id="messages" className="grow">
    //                         <li id="usercount">현재 {userCount} 명이 서버에 접속해있습니다.</li>
    //                         {listItems}
    //                     </ul>
    //                     <form id="msgform" className="flex" onSubmit={handleSubmit}>
    //                         <input id="msginput" className="flex-1"
    //                         autoComplete={"off"}
    //                         value={message}
    //                         onChange={(e) => setMessage(e.target.value)}
    //                         type="text"/>
    //                         <button type="submit">전송</button>
    //                     </form>
    //                 </div>

    //             </div>
    //         </div>