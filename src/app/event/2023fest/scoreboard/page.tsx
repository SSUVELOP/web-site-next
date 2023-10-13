"use client";

import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link'
import React, { useEffect, useState, useRef } from "react";

import './styles.css';

export interface Score {
  id: number;
  phone: string;
  name: string;
  break: number;
  shake: number;
  concentrate: number;
}

function useInterval(callback: any, delay: number) {
  const savedCallback = useRef<any>(); // 최근에 들어온 callback을 저장할 ref를 하나 만든다.

  useEffect(() => {
    savedCallback.current = callback; // callback이 바뀔 때마다 ref를 업데이트 해준다.
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current(); // tick이 실행되면 callback 함수를 실행시킨다.
    }
    if (delay !== null) { // 만약 delay가 null이 아니라면 
      let id = setInterval(tick, delay); // delay에 맞추어 interval을 새로 실행시킨다.
      return () => clearInterval(id); // unmount될 때 clearInterval을 해준다.
    }
  }, [delay]); // delay가 바뀔 때마다 새로 실행된다.
}

const Page = () => {
  const indexList: any[] = [0, 1, 2];
  const titleList: any[] = ['break', 'shake', 'concentrate'];
  const titleKOList: any[] = ['부숴라!', '흔들어라!', '집중해라!'];

  const scoreRef = useRef<any[]>([]);
  const selectedRef = useRef(0);

  const [scoreList, setScoreList] = useState<Score[]>([]);
  const [breakScoreList, setBreakScoreList] = useState<Score[]>([]);
  const [shakeScoreList, setShakeScoreList] = useState<Score[]>([]);
  const [concentrateScoreList, setConcentrateScoreList] = useState<Score[]>([]);

  const [selectedScore, setSelectedScore] = useState<number>(0);

  const updateScoreList = (_selected: number)=>{
    for(let i = 0; i < scoreRef.current.length; i++) {
      scoreRef.current[i].classList.remove('active');
      scoreRef.current[i].classList.remove('after');
      scoreRef.current[i].classList.remove('before');
    }
    scoreRef.current[(_selected+1)%scoreRef.current.length].classList.add('after');
    scoreRef.current[(_selected)].classList.add('active');
    scoreRef.current[(_selected+scoreRef.current.length-1)%scoreRef.current.length].classList.add('before');
  }

  const afterScoreList = async()=>{
    var _selected = (selectedScore+scoreRef.current.length+1)%scoreRef.current.length;
    getScoreList();
    updateScoreList(_selected);
    await setSelectedScore(_selected);
  }

  const beforeScoreList = async()=>{
    var _selected = (selectedScore+scoreRef.current.length-1)%scoreRef.current.length;
    getScoreList();
    updateScoreList(_selected);
    await setSelectedScore(_selected);
  }


  const _calculateScore = (second: number) => {
    if (second <= 15)
      return 15.0 - second;
    else
      return (second - 15.0) * 1;
  }

  const getScoreList = async()=>{
    
    let tmpList: Score[] = [];

    await setScoreList([]);

    await axios.get(
      process.env.BACK_BASE_URL+'/score'
    ).then(async (response) => {
      for(let i = 0; i < response.data.length; i++) {
        let resJson = response.data[i];
        tmpList.push(resJson);
      }
    }).catch((error) => {
      console.log(error.response)
    });
    
    var tmpBreakList = JSON.parse(JSON.stringify(tmpList.sort((a: Score, b: Score)=>{
      if(a.break < b.break) {
        return 1;
      } else if(a.break > b.break) {
        return -1;
      } else {
        return 0;
      }
    })));
    console.log(tmpBreakList);
    await setBreakScoreList(tmpBreakList);

    var tmpShakeList = JSON.parse(JSON.stringify(tmpList.sort((a: Score, b: Score)=>{
      if(a.shake < b.shake) {
        return 1;
      } else if(a.shake > b.shake) {
        return -1;
      } else {
        return 0;
      }
    })));
    console.log(tmpShakeList);
    await setShakeScoreList(tmpShakeList);
    
    var tmpConcentrateList = JSON.parse(JSON.stringify(tmpList.sort((a: Score, b: Score)=>{
      if(_calculateScore(a.concentrate) > _calculateScore(b.concentrate)) {
        return 1;
      } else if(_calculateScore(a.concentrate) < _calculateScore(b.concentrate)) {
        return -1;
      } else {
        return 0;
      }
    })));
    console.log(tmpConcentrateList);
    await setConcentrateScoreList(tmpConcentrateList);
    console.log(breakScoreList);
  }
  useInterval(afterScoreList, 5000);

  useEffect(()=>{
    getScoreList();
    console.log(scoreList);
    
    // clear out the interval using the id when unmounting the component
  }, []);

  return (
    <main className='h-screen flex justify-center p-[4rem]' style={{'backgroundImage': 'url("/background.png")'}}>
      <div className='flex flex-col w-screen items-center'>
        <div className='text-[8rem] text-white font-extrabold mb-8'>
          SCORE BOARD
        </div>
          <div className='absolute flex justify-between w-full h-full'>
            <div className='w-24 h-full z-20' onClick={beforeScoreList}></div>
            <div className='w-24 h-full z-20' onClick={afterScoreList}></div>
          </div>
        <div className='flex h-[64rem] justify-center'>
          <div ref={(el)=>(scoreRef.current[0]=el)} className='top-0 absolute h-full w-full score-list active'
            style={{'backgroundImage': 'url("/main.png")'}}>
          </div>
          <div ref={(el)=>(scoreRef.current[1]=el)} className='score-list after h-[80%] bg-red absolute w-[56rem] border-gray-400 border-solid border-[0.25rem] rounded-[5rem] p-[5rem] overflow-scroll'
                    style={{'backgroundColor': 'rgba(0, 0, 0, 0.1)'}}>
            <div className='flex justify-center items-center mb-24'>
              <div className='relative w-32 h-32'>
                <Image src="/break.png" fill={true} alt=''/>
              </div>
              <div className='text-8xl text-white'>{' 부숴라!'}</div>
            </div>
            <div className='flex flex-col justify-center items-center grow'>
              {
                breakScoreList.map((element, index) => {
                  return (
                    <div key={'break-'+index} className='flex justify-between w-full border-solid border-2 border-gray-200] m-[0.5rem] p-4 rounded-3xl'
                    style={{'backgroundColor': 'rgba(0, 0, 0, 0.3)'}}>
                      <div className='text-4xl font-bold'
                      style={{'color': index==0?'gold':index==1?'silver':index==2?'brown':'white'}}>{index+1}{index%10==0?'st':index%10==1?'nd':index%10==0?'rd':'th'}</div>
                      <div className='text-4xl font-lightbold text-white'>{element.name}</div>
                      <div className='text-4xl text-white'>{element.break}</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div ref={(el)=>(scoreRef.current[2]=el)} className='score-list h-[80%] bg-red absolute w-[56rem] border-gray-400 border-solid border-[0.25rem] rounded-[5rem] p-[5rem] overflow-scroll'
                    style={{'backgroundColor': 'rgba(0, 0, 0, 0.1)'}}>
            <div className='flex justify-center items-center mb-24'>
              <div className='relative w-32 h-32'>
                <Image src="/shake.png" fill={true} alt=''/>
              </div>
              <div className='text-8xl text-white'>{' 흔들어라!'}</div>
            </div>
            <div className='flex flex-col justify-center items-center grow'>
              {
                shakeScoreList.map((element, index) => {
                  return (
                    <div key={'break-'+index} className='flex justify-between w-full border-solid border-2 border-gray-200] m-[0.5rem] p-4 rounded-3xl'
                    style={{'backgroundColor': 'rgba(0, 0, 0, 0.3)'}}>
                      <div className='text-4xl font-bold'
                      style={{'color': index==0?'gold':index==1?'silver':index==2?'brown':'white'}}>{index+1}{index%10==0?'st':index%10==1?'nd':index%10==0?'rd':'th'}</div>
                      <div className='text-4xl font-lightbold text-white'>{element.name}</div>
                      <div className='text-4xl text-white'>{element.shake}</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div ref={(el)=>(scoreRef.current[3]=el)} className='score-list before h-[80%] bg-red absolute w-[56rem] border-gray-400 border-solid border-[0.25rem] rounded-[5rem] p-[5rem] overflow-scroll'
                    style={{'backgroundColor': 'rgba(0, 0, 0, 0.1)'}}>
            <div className='flex justify-center items-center mb-24'>
              <div className='relative w-32 h-32'>
                <Image src="/concentrate.png" fill={true} alt=''/>
              </div>
              <div className='text-8xl text-white'>{' 집중해라!'}</div>
            </div>
            <div className='flex flex-col justify-center items-center grow'>
              {
                concentrateScoreList.map((element, index) => {
                  return (
                    <div key={'break-'+index} className='flex justify-between w-full border-solid border-2 border-gray-200] m-[0.5rem] p-4 rounded-3xl'
                    style={{'backgroundColor': 'rgba(0, 0, 0, 0.3)'}}>
                      <div className='text-4xl font-bold'
                      style={{'color': index==0?'gold':index==1?'silver':index==2?'brown':'white'}}>{index+1}{index%10==0?'st':index%10==1?'nd':index%10==0?'rd':'th'}</div>
                      <div className='text-4xl font-lightbold text-white'>{element.name}</div>
                      <div className='text-4xl text-white'>{element.concentrate}</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Page;