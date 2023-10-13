'use client';


import Image from 'next/image'

import '@styles/globals.css'
import '@styles/2023fest/pub.css'
import '@heroicons/react/24/outline'
import axios from 'axios'
import io from "socket.io-client";


let socket: any;

import React, { useEffect, useState, useRef } from 'react';
import { BellAlertIcon, BellIcon, ClipboardDocumentIcon, ClipboardIcon, InformationCircleIcon, ListBulletIcon, PuzzlePieceIcon, ReceiptPercentIcon, StarIcon, UserCircleIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ko';

export interface MenuInfo {
  id: number;
  name: string;
  price: number;
  count: number;
  amount: number;
  desc: any;
}

export interface PriceJoke {
  title: string;
  price: string;
}

export interface Star {
  cx: number;
  cy: number;
  r: number;
}

export interface OrderedList {
  table: string;
  phone: string;
  name: string;
  orderList: JSON[];
  totalPrice: number;
  state: number;
  user: string|null;
  createdAt: Date;
  fold: boolean;
}

type PageProps = {
  params: {
    slug: string
  }
}

const Page = ({ params: { slug } }: PageProps) => {

  const router = useRouter();
  const pathname = usePathname();

  const [menuList, setMenuList] = useState<MenuInfo[]>([]);
  const [originMenuList, setOriginMenuList] = useState<any[]>([]);
  const [menuActive, setMenuActive] = useState<string>('');
  const drawerRef = useRef<any>();
  const kimchiRef = useRef<any>();
  const orderListRef = useRef<any>();
  const logoRef = useRef<any>();
  const skyRef = useRef<any>();
  const phoneRef = useRef<any>();
  const nameRef = useRef<any>();
  const orderedListRef = useRef<any>();
  const [table, setTable] = useState<string>(slug);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [payPrice, setPayPrice] = useState<number>(0);
  const [priceJoke, setPriceJoke] = useState<PriceJoke[]>([]);
  const [priceJokeIdx, setPriceJokeIdx] = useState<number>(0);
  const [submitEnable, setSubmitEnable] = useState<boolean>(false);
  const [orderedList, setOrderedList] = useState<OrderedList[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);

  const stateList = [
    {state: '결제확인중', color: '#003108'},
    {state: '결제확인', color: '#005f10'},
    {state: '조리중', color: '#1f0029'},
    {state: '조리완료', color: '#39004d'},
    {state: '서빙중', color: '#000291'},
    {state: '서빙완료', color: '#353535'},
    {state: '취소', color: '#6e0000'},
  ]

  const employeeCall = ()=>{
    bellBGRef.current.classList.toggle('active');
    bellRef.current.classList.remove('alarm');
  }

  const toggleMenu = ()=>{
    drawerRef.current.classList.toggle('active');
    orderedListRef.current.classList.remove('active');
    bellBGRef.current.classList.remove('active');
    setMenuActive(menuActive==''||menuActive=='deactive'?'active':'deactive')
  }

  const toggleOrderedList = ()=>{
    orderedListRef.current.classList.toggle('active');
  }

  const numToCurrency = (n: number) => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const getOriginMenuList = async()=>{
    let newOriginMenuList: any = [];
    await axios.get(
      process.env.BACK_BASE_URL+'/menu'
    ).then(async (response) => {
      newOriginMenuList = response.data;
    }).catch((error) => {
      console.log(error.response)
    });
    await setOriginMenuList(newOriginMenuList);
  }
  
  const getMenuList = async ()=>{
    let resMenuList: any = [];
    await axios.get(
      process.env.BACK_BASE_URL+'/menu'
    ).then(async (response) => {
      for(let i = 0; i < response.data.length; i++) {
        const resItem = response.data[i];
        resMenuList.push({
          id: resItem.id,
          name: resItem.name,
          price: resItem.price,
          count: 0,
          amount: 0,
          desc: {cooktime: resItem.cooktime, state: '결제 확인 중'}})
      }
    }).catch((error) => {
      console.log(error.response)
    });
    await setMenuList(resMenuList);
  }

  const getPriceJoke = async ()=>{
    {/* 루이13세 이문세 텃세 대한독립만세 다만세 원모타임세*/}
    await setPriceJoke([
      {title: '루이13세',price: '🤴'},
      {title: '이문세',price: '🎤'},
      {title: '텃세',price: '😎'},
      {title: '대한독립만세',price: '🇰🇷'},
      {title: '다만세',price: '🌏'},
      {title: '원모타임세',price: '🦜'},
    ]);
  }

  const [starList, setStarList] = useState<Star[]>([]);

  const setSky = starList.map((element, index)=>{
    return (
      <circle key={'star'+index} className='star'
        cx={element.cx}
        cy={element.cy}
        r={element.r}>
      </circle>
    )
  });

  const getStarList = async()=>{
    const maxSize = 1200
    const getRandomX = () => Math.random() * maxSize;
    const getRandomY = () => Math.random() * maxSize;
    const randomRadius = () =>  Math.random() * 0.7 + 0.6;
    const _size = maxSize/2;1
    let newStarList: Star[] = [];

    Array(_size).fill(1).map((_, i)=>{
      newStarList.push({
        'cx': getRandomX(),
        'cy': getRandomX(),
        'r': randomRadius()
      })
    })

    await setStarList(newStarList);
  }

  const getOrderedList = async()=>{
    let newOrderedList: any = [];

    await setOrderedList([]);

    await axios.post(
      process.env.BACK_BASE_URL+'/order/table',
      {
        table: table
      }
    ).then(async (response) => {
      newOrderedList = await response.data;
    }).catch((error) => {
      console.log(error.response);
    });

    for(let i = 0; i < await newOrderedList.length; i++) {
      await setOrderedList(orderedList => [{
        table: newOrderedList[i].table,
        phone: newOrderedList[i].phone,
        name: newOrderedList[i].name,
        orderList: JSON.parse(newOrderedList[i].orderList),
        totalPrice: newOrderedList[i].totalPrice,
        state: newOrderedList[i].state,
        user: newOrderedList[i].etcInfo,
        createdAt: newOrderedList[i].createdAt,
        fold: false,
      }, ...orderedList]);
    }
  }

  const doOrder = async(e: any)=>{
    e.preventDefault();

    let menuJson = [];
    for(let i = 0; i < menuList.length; i++) {
      if(menuList[i].count == 0) continue;
      menuJson.push([i, menuList[i].count, 0]);
    }

    await axios.post(
      process.env.BACK_BASE_URL+'/order', {
        'table': table,
        'phone': e.target.phone.value,
        'name': e.target.phone.value,
        'orderList': JSON.stringify(menuJson),
        'totalPrice': payPrice,
        'state': 0,
        'user': userInfo==null?null:userInfo.name,
      }
    ).then(async (response) => {
      for(let i = 0; i < response.data.length; i++) {
        const resItem = response.data[i];
      }
    }).catch((error) => {
      console.log(error.response)
    });

    for(let i = 0; i < menuList.length; i++) {
      await axios.patch(
        process.env.BACK_BASE_URL+'/menu/calcAmountById/'+menuList[i].id, {
          amount: -menuList[i].count
        }
      ).then(async (response) => {
        
      }).catch((error) => {
        console.log(error.response)
      });

      menuList[i].count = 0;
      setMenuList([...menuList]);
    }
    setTotalCount(0);
    setPayPrice(0);
    setSubmitEnable(false);
    e.target.phone.value = '';
    orderListRef.current.classList.remove('active');
    
    socket.emit('newOrder', table);

    alert('주문이 완료되었습니다.');

    await getOriginMenuList();
  }

  const socketInitializer = async()=>{


    // Setup the Socket 
    socket = await io('https://ssuvelop.r-e.kr/socket/festpub');
    // socket = await io('http://203.253.21.28:9000/socket/festpub');

    // Standard socket management
    socket.on('connect', () => {
      console.log('Connected to the server');
      console.log(socket);
    });

    socket.on('join', () => {
      console.log('Join');
      socket.emit('userAdd', {
        'type': 'client',
        'table': table,
      });
    });

    socket.on('orderList', () => {
      console.log('orderList');
      getOrderedList();
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

  const getApi = async()=>{
    await getOriginMenuList();
    await getMenuList();
    await getPriceJoke();
    await getStarList();
    await getOrderedList();
  }

  const getSession = async()=>{

    const member = sessionStorage.getItem("ssuvelopAuth");
    const tableKey = JSON.parse(sessionStorage.getItem("tableKey")!!);
    console.log(tableKey);
    console.log(table);

    if(table != tableKey.table) {
      router.push('error');
    }

    setUserInfo(JSON.parse(member!!));
    console.log(userInfo);
  }

  useEffect(()=>{
    getApi();
    getSession();

    socketInitializer();


    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(()=>{
    let total_price = 0;
    for(let i = 0; i < menuList.length; i++) {
      total_price += menuList[i].price * menuList[i].count;
    }
    setTotalPrice(total_price);
  }, [menuList]);

  const orderList = () => {
    return (
      <div className='p-2 rounded-lg receipt'>
        <div className='relative'>
          <p className='text-3xl text-center p-2'>주문목록</p>
          <div className='absolute right-0 top-0 p-2 text-3xl'onClick={
            ()=>{orderListRef.current.classList.toggle('active')}
            }>
            ❌
          </div>
        </div>
        <div className='p-2'>
          <div className='text-xl my-2'>
            <hr className='my-1 bg-black'/>
            <hr className='my-1 bg-black'/>
            <div className='flex'>
              <p className='w-40'>메뉴명</p>
              <p className='w-24'>단가</p>
              <p className='w-10'>수량</p>
              <p className='w-24 text-right'>금액</p>
            </div>
            <hr className='my-1 bg-black'/>
            <hr className='my-1 bg-black'/>
            {
              menuList.map((element, index) => {
                return element.count == 0?'':(
                  <div key={"order"+index} className='flex'>
                    <p className='w-40'>{element.name}</p>
                    <p className='w-24'>{numToCurrency(element.price)}</p>
                    <p className='w-10'>{element.count}</p>
                    <p className='w-24 text-right'>{numToCurrency(element.price * element.count)}</p>
                  </div>
                );
              })
            }
          </div>
          <hr className='my-1 bg-black'/>
          <div className='text-xl my-2'>
            {
            menuList.length > 1 && menuList[1].count > 1?(
              <div className='flex'>
                <p className='w-[14rem] text-center'>김치전 할인</p>
                <p className='w-[10.5rem] text-right'>{numToCurrency(-(menuList[1].count-1)*1000)}</p>
              </div>
            ):''
            }
            {
              userInfo!=null?(
                <div className='flex'>
                  <p className='w-[16rem] text-center'>슈벨롭 회원 할인(10%)</p>
                  <p className='w-[8.5rem] text-right'>{numToCurrency(-totalPrice * 0.1)}</p>
                </div>
              ):''
            }
            <div className='flex'>
              <p className='w-[14rem] text-center'>부 가 세</p>
              <p className='w-[10.5rem] text-right'>0</p>
            </div>
            {
              priceJoke.length > 0?(()=>{
                return (
                  <div className='flex'>
                    <p className='w-[14rem] text-center'>{priceJoke[priceJokeIdx].title}</p>
                    <p className='w-[10.5rem] text-right'>{priceJoke[priceJokeIdx].price}</p>
                  </div>
                )
              })():''
            }
          </div>
          <hr className='my-1 bg-black'/>
          <div className='text-3xl flex my-2'>
            <p className='w-[14rem] text-center font-semibold'>총 금 액</p>
            <p className='w-[10.5rem] text-right font-semibold'>
              {numToCurrency(payPrice)}
            </p>
          </div>
          <hr className='my-1 bg-black'/>
          <br/>
          <div className='text-[1.25rem] rounded-lg p-2 py-8 font-bold
            border-gray-400 border-2 border-solid text-center bdf'
            onClick={async ()=>{
              try {
                await navigator.clipboard.writeText('카카오뱅크 3333-24-7239335(권준형)'.toString());
                alert('클립보드에 복사되었습니다.');
              } catch(error) {
                alert('클립보드 복사에 실패하였습니다.\n'+error);
              }
            }}>
            <ClipboardDocumentIcon className='absolute right-0 top-0 w-8'/>
            카카오뱅크 3333-24-7239335(권준형)
          </div>
        </div>
        <form onSubmit={doOrder}>
          <div className='p-2 pt-6'>
            <input ref={nameRef} type='text' id='name' name='name' placeholder='입금자명을 입력해주세요' required
              className='border-solid border-2 border-gray-300 rounded-lg
              w-full p-2 text-center text-2xl bg-transparent bdf'/>
          </div>
          <div className='p-2 pb-6'>
            <input ref={phoneRef} type='text' id='phone' name='phone' placeholder='연락처를 입력해주세요' required
              className='border-solid border-2 border-gray-300 rounded-lg
              w-full p-2 text-center text-2xl bg-transparent bdf'
              onChange={(e)=>{
                let text = e.target.value;
                let regex = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
                if(regex.test(text)) {
                  setSubmitEnable(true);
                } else {
                  setSubmitEnable(false);
                }
              }}/>
          </div>
          <input type='submit' value={'입금완료'}
             className={'rounded-lg text-white text-center p-2 text-3xl font-extrabold ' + (submitEnable?'bg-blue-500':'bg-gray-800')}/>
        </form>
      </div>
    );
  }
  
  const menuItem = menuList.map((element, index) => {
    let cooktime = element.desc.cooktime;

    return (
      <div 
        key={index}
        className='relative w-full'>
        <div className='flex p-3'>
          <div className='menu-photo'
            style={{backgroundImage: 'url("/2023_menu/' + element.name + '.png")'}}>
          </div>
          <div className='flex grow p-3'>
            <div className='grow'>
              <div className='text-2xl font-bold'>
                {element.name}
              </div>
              <div className='text-2xl font-extrabold text-red-500 my-3'>
                {element.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원'}
              </div>
              <div className='text-lg'>
                평균 조리시간 : {cooktime/60?(Math.floor(cooktime/60)+'분'):''} {cooktime%60?(cooktime%60+'초'):''}
              </div>
            </div>
            <div className='flex flex-col items-end'>
              <div className='grow'>
                {
                  element.name == '김치전'? (
                    <div className='relative'>
                      <div className='text-2xl'
                        onClick={
                        ()=>{kimchiRef.current.classList.toggle('active')}
                        }>
                        <InformationCircleIcon className='w-8'/>
                      </div>
                      <div ref={kimchiRef} className='w-[20rem] bg-white p-2 -m-2
                        rounded-md border-solid border-gray-200 border-2 menu-alert top-0'>
                        <p className='font-bold text-black'>※2개 이상 시키면 1,000원 할인!</p>
                        <p className='text-black'>회원 할인과 중복 적용됩니다</p>
                        <div className='absolute right-0 top-0 p-2 text-black'
                          onClick={
                            ()=>{kimchiRef.current.classList.toggle('active')}
                          }>
                          ❌
                        </div>
                      </div>
                    </div>
                  ):''
                }
              </div>
              <div className={'flex border-solid border-2 rounded-lg '+(element.count>0?'border-blue-500 text-blue-50':'border-gray-500')}>
                <div onClick={()=>{
                  if(menuList[index].count > 0) {
                    menuList[index].count -= 1;
                    setMenuList([...menuList]);
                    setTotalCount(totalCount-1);
                  }
                }} className='text-2xl w-8 flex items-center justify-center'>
                  -
                </div>
                <div className='w-8 flex items-center justify-center'>
                  {element.count}
                </div>
                <div onClick={()=>{
                  menuList[index].count += 1;
                  setMenuList([...menuList]);
                  setTotalCount(totalCount+1);
                }} className='text-2xl w-8 flex items-center justify-center'>
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <hr />
        {
          originMenuList[index].amount==0?(
            <div className='absolute top-0 w-full h-full bg-[#b1b1b19c]
              text-8xl text-black font-extrabold
              flex items-center justify-center overflow-hidden'>
              <div className='border-8 border-black p-8 rotate-12'>
                매진
              </div>
            </div>
          ):''
        }
      </div>
    );
  });

  const orderedListRect = orderedList.map((list, i1)=>{
    return (
      <div key={'ol'+i1} className='border-b-2'>
        <div className='flex justify-between m-3'>
          <div className='flex flex-col'>
            <div className='text-4xl font-extrabold text-green-400 m-2'>
              {numToCurrency(list.totalPrice)}
            </div>
            <div className='rounded-xl p-2 font-extrabold text-2xl text-center'
              style={{'backgroundColor': stateList[list.state].color}}>
              {stateList[list.state].state}
            </div>
          </div>
          <div className={'relative w-12 h-12 m-2 ordered-menu-button '+(list.fold?'active':'')}
            onClick={()=>{
            console.log(i1);
            orderedList[i1].fold = !orderedList[i1].fold;
            setOrderedList([...orderedList]);
            console.log(orderedList[i1].fold);
          }}>
            <Image src="/up-arrow.png" fill={true} alt=''/>
          </div>
        </div>
        <div className={'border-t-[1px] p-2 ordered-menu '+(list.fold?'active':'')}>
          {
            orderedList[i1].orderList.map((item: any, i2)=>{
              return (
                <div key={'oli-'+i1+'-'+i2}
                  className='p-1 flex justify-between items-center'>
                  <div className='text-2xl'>
                    {menuList[item[0]].name + ' X ' + item[1]}
                  </div>
                  <div className='text-xl rounded-full p-1 px-2'
                    style={{'backgroundColor': stateList[item[2]].color}}>
                    {stateList[item[2]].state}
                  </div>
                </div>
              )
            })
          }
          <br/>
          <div className='text-xl text-right'>
            주문: {moment(list.createdAt).format('HH:mm:ss')}
          </div>
        </div>
      </div>
    )
  });

  const bellRef = useRef<any>();
  const bellBGRef = useRef<any>();

  const openPayRect = async()=>{
    await getOriginMenuList();
    let menuCheck: boolean = true;
    for(let i = 0; i < originMenuList.length; i++) {
      if(originMenuList[i].amount < menuList[i].count) {
        menuCheck = false;
        break;
      }
    }

    if(!menuCheck) {
      alert('주문 목록에 남은 수량보다 더 담은 상품이 있습니다.');
      return;
    }

    console.log(originMenuList);
    setPayPrice(totalPrice +
      (userInfo!=null?(-totalPrice * 0.1):0) +
      ((menuList.length > 1 && menuList[1].count>1)?(-(menuList[1].count-1)*1000):0));
    setPriceJokeIdx(Math.floor(Math.random() * priceJoke.length));
    if(totalCount > 0) {
      orderListRef.current.classList.toggle('active')
    }
  }

  return (
    <main className='max-w-[790px] h-screen relative text-white'>
      <header className='relative'>
        <div className='header shadow'>
          <div ref={logoRef} className='h-[4rem] w-[10rem] m-2 logo'>
          </div>
          <div className='m-2 w-[4rem] h-[4rem] flex items-center justify-end' onClick={toggleMenu}>
            <div className={'menu-icon ' + menuActive}>
              <div/>
              <div/>
              <div/>
            </div>
          </div>
        </div>
        <div ref={drawerRef} className='drawer'>
          <div className='bg' onClick={toggleMenu}/>
          <div className='fg'>
            <div className='flex items-center p-2' onClick={employeeCall}>
              <BellAlertIcon className='w-12'/>
              <p className='text-3xl m-3'>
                직원 호출
              </p>
            </div>
            <div className='flex items-center p-2' onClick={toggleOrderedList}>
              <ReceiptPercentIcon className='w-12'/>
              <p className='text-3xl m-3'>
                주문 내역
              </p>
            </div>
            <div className='flex items-center p-2'>
              <PuzzlePieceIcon className='w-12'/>
              <p className='text-3xl m-3'>
                미니 게임
              </p>
            </div>
            <div className='grow'/>
            <div className='flex items-center p-2' onClick={()=>{
              router.push('/login?prev='+pathname)
            }}>
              {
                userInfo==null?(
                  <UserIcon className='w-12'/>
                ):(
                  <StarIcon className='w-12'/>
                )
              }
              <p className='text-3xl m-3'>
                {
                  userInfo==null?(
                    '로그인'
                  ):(
                    userInfo.name
                  )
                }
              </p>
            </div>
            <hr />
            <div className='flex items-center p-2' onClick={()=>{
              router.push('/')
            }}>
              <div className='w-12 h-12 ml-2 ssuvelop' />
              <p className='text-3xl m-3'>
                SSU:VELOP
              </p>
            </div>
          </div>
          <div ref={orderedListRef} className='absolute ordered-list'>
            <div className='flex flex-col'>
              {orderedListRect}
            </div>
          </div>
        </div>
      </header>

      {/* Bell */}
      <div ref={bellBGRef} className='fixed w-screen h-screen bell-bg'>
        <div className='rounded-3xl bg-green-500' onClick={()=>{
          bellRef.current.classList.add('alarm');
          bellBGRef.current.classList.toggle('active')
          //socket
          socket.emit('call', table);
          console.log('asd')
        }}>
          <BellIcon ref={bellRef} className='m-4 w-32 h-32 bell'/>
        </div>
      </div>

      {/* Background */}
      <div className='fixed w-screen h-screen screen-bg'>
        <svg ref={skyRef} className='w-screen h-screen sky'>
          {setSky}
        </svg>
      </div>

      {/* Content */}
      <div className='py-20 flex flex-col w-screen'>
        {menuItem}
      </div>

      <div ref={orderListRef} className='fixed order-list'>
        {orderList()}
      </div>

      <nav className='relative'>
        <div className='nav shadow'>
          <div className='flex items-center h-full'>
            <ListBulletIcon className='w-16 m-2' onClick={()=>{
              toggleMenu();
              toggleOrderedList();
            }}/>
            <div className='grow text-center text-3xl flex items-center justify-center h-16 m-2 p-2 rounded-md bg-blue-800'
              onClick={()=>{
                openPayRect()
              }}>
              <p className='text-white font-extrabold'>주문하기</p>
              <p className='text-white text-2xl p-2'>({numToCurrency(totalPrice)} 원)</p>
            </div>
          </div>
        </div>
      </nav>
    </main>
  );
}

export default Page;