'use client';


import Image from 'next/image'

import '@styles/globals.css'
import '@styles/2023fest/pub.css'
import '@heroicons/react/24/outline'
import axios from 'axios'
import io from "socket.io-client";

let socket: any;

import React, { useEffect, useState, useRef } from 'react';
import { BellAlertIcon, ListBulletIcon, PuzzlePieceIcon, ReceiptPercentIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import moment from 'moment';
import { useRouter } from 'next/navigation';


export interface Order {
  id: number;
  table: string;
  phone: string;
  name: string;
  orderList: any[];
  totalPrice: number;
  state: number;
  user: string|null;
  createdAt: Date;
  fold: boolean;
}

export interface Menu {
  name: string;
  price: number;
  count: number;
  desc: any;
}

export interface Position {
  id: number;
  type: string;
  json: any;
}

const Page = () => {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [positionList, setPositionList] = useState<Position[]>([]);
  const [bellList, setBellList] = useState<boolean[]>([]);

  const listStateRef = useRef<any>([]);
  const itemStateRef = useRef<any[][]>([]);

  const loadOrderList = async()=>{
    await setOrderList([]);

    await axios.get(
      process.env.BACK_BASE_URL+'/order'
    ).then(async (response) => {
      for(let i = 0; i < response.data.length; i++) {
        let resJson = response.data[i];
        resJson['fold'] = false;
        resJson['orderList'] = JSON.parse(resJson['orderList']);
        await setOrderList(orderList => [resJson, ...orderList]);
      }
      await setOrderList(orderList => orderList.sort((a: Order, b: Order)=>{
        const seq = [99, 44, 33, 101, 22, 11, 0];
        if(seq[a.state] > seq[b.state]) {
          return 1;
        } else if(seq[a.state] < seq[b.state]) {
          return -1;
        } else {
          return 0;
        }
      }));
      console.log(orderList);
    }).catch((error) => {
      console.log(error.response)
    });
  }

  const loadMenuList = async()=>{
    await setMenuList([]);

    await axios.get(
      process.env.BACK_BASE_URL+'/menu'
    ).then(async (response) => {
      for(let i = 0; i < response.data.length; i++) {
        await setMenuList(menuList=>[...menuList, response.data[i]]);
      }
    }).catch((error) => {
      console.log(error.response)
    });
  }

  const loadPositionList = async()=>{
    
    await setPositionList([]);

    await axios.get(
      process.env.BACK_BASE_URL+'/position'
    ).then(async (response) => {
      for(let i = 0; i < response.data.length; i++) {
        let resJson = response.data[i];
        resJson['json'] = JSON.parse(resJson['json']);
        await setPositionList(positionList => [response.data[i], ...positionList]);
      }
    }).catch((error) => {
      console.log(error.response)
    });
  }
  

  const socketInitializer = async()=>{
    // Setup the Socket 
    // socket = await io('https://ssuvelop.r-e.kr/chat?username=' + username);
    socket = await io('https://ssuvelop.r-e.kr/socket/festpub');

    // Standard socket management
    socket.on('connect', () => {
      console.log('Connected to the server');
      console.log(socket);
    });

    socket.on('join', () => {
      console.log('Join');
      socket.emit('userAdd', {
        type: 'admin',
      })
    });

    socket.on('call', (table: any) => {
      console.log(table);
      bellPlay();
      bellList[table] = true;
      setBellList([...bellList]);
      // setBellList()
      // socket.emit('userAdd', {
      //   'type': 'admin',
      // })
    });

    socket.on('orderList', () => {
      loadOrderList();
    })

    socket.on('getUserName', () => {
      console.log('getUserName');
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
  }

  const loadApi = async()=>{
    await loadMenuList();
    await loadOrderList();
    await loadPositionList();
  }

  const [member, setMember] = useState<any>();

  const router = useRouter();

  const checkAuth = async()=>{
    const memberStorage = JSON.parse(sessionStorage.getItem("ssuvelopAuth")!!);
    await setMember(memberStorage);
    console.log(member);
    console.log(memberStorage);
    if(memberStorage == null || memberStorage.name != '관리자') {
      console.log('asd');
      router.push('error');
    }
  }

  useEffect(()=>{
    checkAuth();

    socketInitializer();

    loadApi();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(()=>{
    for(let i = 0; i < menuList.length; i++) {
      menuList[i].count = 0;
    }
    for(let i = 0; i < orderList.length; i++) {
      if(orderList[i].state == 5 || orderList[i].state == 6) continue;
      for(let j = 0; j < orderList[i].orderList.length; j++) {
        if(orderList[i].orderList[j][2] == 5 || orderList[i].orderList[j][2] == 6) continue;
        menuList[orderList[i].orderList[j][0]].count += orderList[i].orderList[j][1];
      }
    }
    setMenuList([...menuList]);
  }, [orderList]);

  const numToCurrency = (n: number) => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  
  const stateList = [
    {state: '결제확인중', color: '#003108'},
    {state: '결제확인', color: '#005f10'},
    {state: '조리중', color: '#1f0029'},
    {state: '조리완료', color: '#39004d'},
    {state: '서빙중', color: '#000291'},
    {state: '서빙완료', color: '#353535'},
    {state: '취소', color: '#6e0000'},
  ]

  const bellPlay = ()=>{
    const bellAudio = new Audio('/bell.mp3');
    bellAudio.muted = true;
    bellAudio.play();
    bellAudio.muted = false;
  }

  const updateOrderList = async(order: Order)=>{
    await axios.patch(
      process.env.BACK_BASE_URL+'/order/stateById/'+order.id,
      {
        orderList: JSON.stringify(order.orderList),
        state: order.state,
      }
    ).catch((error) => {
      console.log(error.response);
      alert(error.response.data.message);
    });

    await socket.emit('updateOrderState', order.table)
  }

  const updatePositionList = async()=> {
    for(let i = 0; i < positionList.length; i++) {
      await axios.patch(
        process.env.BACK_BASE_URL+'/position/'+positionList[i].id,
        {
          type: positionList[i].type,
          json: JSON.stringify(positionList[i].json),
        }
      ).then((response)=>{
      }).catch((error) => {
        console.log(error.response);
        alert(error.response.data.message);
      });
    }
    alert('저장되었습니다.');
  }

  const editOrderItemState = async(index: number, i: number, sindex: number)=>{
    orderList[index].orderList[i][2] = sindex;
    let sorted = [...orderList];
    sorted = sorted.sort((a: Order, b: Order)=>{
      const seq = [99, 44, 33, 101, 22, 11, 0];
      if(seq[a.state] < seq[b.state]) {
        return 1;
      } else if(seq[a.state] > seq[b.state]) {
        return -1;
      } else {
        return 0;
      }
    });
    setOrderList([...sorted]);
    updateOrderList(orderList[index]);
  }

  const editOrderListState = async(index: number, sindex: number)=>{
    orderList[index].state = sindex;
    let sorted = [...orderList];
    sorted = sorted.sort((a: Order, b: Order)=>{
      const seq = [99, 44, 33, 101, 22, 11, 0];
      if(seq[a.state] < seq[b.state]) {
        return 1;
      } else if(seq[a.state] > seq[b.state]) {
        return -1;
      } else {
        return 0;
      }
    });
    setOrderList([...sorted]);
    updateOrderList(orderList[index]);
  }

  const orderItemRect = (list: any, index: number)=>{
    return (
      <div>
        {
          list.orderList.map((item: any, i: number)=>{
            if(menuList.length < item[0] || menuList[item[0]]==null) return ''
            return (
              <div key={'oli-'+index+'-'+i}
                className='p-1 flex items-center justify-center'>
                <div className='text-2xl'>
                  {menuList[item[0]].name + ' X ' + item[1]}
                </div>
                <div ref={(el)=>{
                  itemStateRef.current[index] = itemStateRef.current[index] || [];
                  itemStateRef.current[index][i]=el
                  }} className='relative grow h-9 ordered-item-state'>
                  <div className='absolute text-xl rounded-full p-1 px-2'
                    style={{'backgroundColor': stateList[item[2]].color}}
                    onClick={()=>{
                      itemStateRef.current[index][i].classList.toggle('active')
                    }}>
                    {stateList[item[2]].state}
                  </div>
                  <div className='absolute flex'>
                    <div></div>
                    {
                      stateList.map((state, sindex)=>{
                        return (
                          <div key={'ols'+index+'-'+sindex} className={'w-6 h-6 m-1 rounded-full'}
                            style={{'backgroundColor': state.color}}
                            onClick={()=>{
                              itemStateRef.current[index][i].classList.toggle('active')
                              editOrderItemState(index, i, sindex)
                            }}/>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }

  const [selectedTable, setSelectedTable] = useState<string>('');

  const [positionActive, setPositionActive] = useState<boolean>(false);

  

  const orderListRect = orderList.map((element: Order, index)=>{
    if(selectedTable!='' && element.table!=selectedTable) {
      return '';
    }

    return (
      <div key={'ol'+index} className='border-b-4'>
        <div className='relative flex justify-between m-3'>
          <div className='flex items-center justify-start grow'>
            {selectedTable!=''?'':(
              <div className='flex font-extrabold mr-4 text-5xl h-24 w-24 rounded-3xl items-center justify-center bg-cyan-700'>
                {element.table}
              </div>
            )}
            <div className='flex flex-col grow'>
              <div className='text-4xl font-extrabold text-green-400 m-2'>
                {numToCurrency(element.totalPrice)}
              </div>
              <div ref={(el)=>(listStateRef.current[index]=el)} className='relative h-12 ordered-list-state'>
                <div className='absolute w-auto rounded-xl font-extrabold text-2xl text-center p-2'
                  style={{'backgroundColor': stateList[element.state].color}}
                  onClick={()=>{
                    listStateRef.current[index].classList.toggle('active')
                  }}>
                  {stateList[element.state].state}
                </div>
                <div className='absolute flex'>
                  <div></div>
                  {
                    stateList.map((state, sindex)=>{
                      return (
                        <div key={'ols'+index+'-'+sindex} className={'w-7 h-7 m-2 rounded-full'}
                          style={{'backgroundColor': state.color}}
                          onClick={()=>{
                            listStateRef.current[index].classList.toggle('active')
                            editOrderListState(index, sindex)
                          }}/>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='absolute right-0'>
            <div className={'relative w-12 h-12 m-2 ordered-menu-button '+(element.fold?'active':'')}
              onClick={()=>{
              orderList[index].fold = !orderList[index].fold;
              let sorted = [...orderList];
              sorted = sorted.sort((a: Order, b: Order)=>{
                const seq = [99, 44, 33, 101, 22, 11, 0];
                if(seq[a.state] < seq[b.state]) {
                  return 1;
                } else if(seq[a.state] > seq[b.state]) {
                  return -1;
                } else {
                  return 0;
                }
              });
              setOrderList([...sorted]);
            }}>
              <Image src="/up-arrow.png" fill={true} alt=''/>
            </div>
          </div>
        </div>
        <div className={'border-t-[1px] p-2 ordered-menu '+(element.fold?'active':'')}>
          {orderItemRect(element, index)}
          <br/>
          <div className='text-xl text-right'>
            주문: {moment(element.createdAt).format('HH:mm:ss')}
          </div>
        </div>
      </div>
    )
  })

  const getColorbyState = (table: string)=>{
    let state = 5;

    if(bellList[parseInt(table)]==true) {
      return 'gold';
    }

    for(let i = 0; i < orderList.length; i++) {
      if(orderList[i].table != table) continue;
      state = Math.min(state, orderList[i].state);
    }

    if(state >= 5) {
      return '#BBBBBB';
    }

    return '#0000EE';
  }

  const positionRect = positionList.map((element: any, index: number)=>{
    if(positionActive) {
      return (
        <div key={'pr'+index} className='absolute rounded-lg flex items-center justify-center font-extrabold'
          style={{
            'left': element.json.x,
            'top': element.json.y,
            'width': element.json.w,
            'height': element.json.h,
            'backgroundColor': element.type=='table'?getColorbyState(element.json.text):'',
            'border': element.type=='table'?'':'solid #0000EE 8px',
            'zIndex': element.json.active?100:element.type=='house'?0:10,
          }}
          onMouseDown={(e)=>{
            positionList[index].json.active = true;
            setPositionList([...positionList]);
          }}
          onMouseUp={(e)=>{
            positionList[index].json.active = false;
            setPositionList([...positionList]);
          }}
          onMouseMove={(e)=>{
            if(element.json.active) {
              positionList[index].json.x = e.clientX-positionList[index].json.w/2;
              positionList[index].json.y = e.clientY-positionList[index].json.h/2;
              setPositionList([...positionList]);
            }
          }}>
          {element.json.text}
        </div>
      )
    } else {
      return(
        <div className='absolute rounded-lg flex items-center justify-center font-extrabold'
          style={{
            'left': element.json.x,
            'top': element.json.y,
            'width': element.json.w,
            'height': element.json.h,
            'backgroundColor': element.type=='table'?getColorbyState(element.json.text):'',
            'border': element.type=='table'?'':'solid #0000EE 8px',
            'zIndex': element.json.active?100:element.type=='house'?0:10,
          }} onClick={()=>{
            if(element.type == 'table') {
              setSelectedTable(element.json.text);
            }
          }}>
          {(element.type=='table' && bellList[parseInt(element.json.text)]==true)?'🔔':element.json.text}
        </div>
      );
    }
  })

  return (
    <main className='w-screen h-screen relative text-white bg-gray-400'>
      <div className='flex h-full'>
        <div className='grow overflow-scroll'>
          <div className='relative w-full h-full'>
            <div className='absolute flex'>
              <div className='m-2 p-4 text-2xl font-extrabold rounded-2xl bg-gray-400 border-2'
                onClick={updatePositionList}>
                SAVE
              </div>
              <div className='m-2 p-4 text-2xl font-extrabold rounded-2xl bg-gray-400 border-2'
                onClick={()=>{
                  setPositionActive(!positionActive);
                }}>
                {positionActive?'ENABLE':'DISABLE'}
              </div>
            </div>
            {positionRect}
          </div>
        </div>
        <div className='relative h-full border-l-4'>
          <div className='w-[28rem] h-full border-r-2 overflow-scroll right-0 bg-blue-950'>
            {
              selectedTable!=''?(
                <div>
                  <div className='flex p-4 items-center border-b-4'>
                    <div className='text-4xl font-extrabold grow m-4'>
                      {selectedTable}번 테이블
                    </div>
                    <div className='relative w-12 h-12 m-2'
                      onClick={()=>{
                        setSelectedTable('');
                      }}>
                      <Image src="/close.png" fill={true} alt=''/>
                    </div>
                  </div>
                  <div className='flex m-2'>
                    <div className='rounded-xl p-2 m-2 text-3xl font-extrabold grow text-center'
                      style={{
                        'backgroundColor': bellList[parseInt(selectedTable)]==true?'gold':'gray',
                      }} onClick={()=>{
                        bellList[parseInt(selectedTable)] = false;
                        setBellList([...bellList]);
                      }}>
                      <p>직원 호출</p>
                    </div>
                    <div className='rounded-xl p-2 m-2 text-3xl font-extrabold grow text-center bg-red-300'>
                      <p>신규 테이블</p>
                    </div>
                  </div>
                </div>
              ):''
            }
            {orderListRect}
          </div>
        </div>
        <div className='relative h-full border-l-4'>
          <div>
            {
              menuList.map((element, index) => {
                return (
                  <div key={'mc-'+index}>
                    {element.name + ' ' + element.count}
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </main>
  );
}

export default Page;