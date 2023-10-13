"use client";

import Link from 'next/link'
import React, { useEffect, useState, useRef } from "react";

import '@styles/globals.css'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Page = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [settingMode, setSettingMode] = useState<boolean>(false);
  
  useEffect(()=>{
    const referrer = document.referrer;
    console.log(referrer);

    const member = sessionStorage.getItem("ssuvelopAuth");
    setUserInfo(JSON.parse(member!!));
  }, []);

  const doLogin = async (event: any)=>{
    event.preventDefault();

    const urlParams = new URL(location.href).searchParams;
    const prevUrl = await urlParams.get('prev') ?? 'test';

    await axios.post(
      process.env.BACK_BASE_URL+'/user/check',
      {
        'stdID': event.target.id.value,
        'password': event.target.pw.value,
      }
    ).then((response) => {
      sessionStorage.setItem("ssuvelopAuth", JSON.stringify({
        "id": response.data.stdID,
        "name": response.data.name,
        "nickname": response.data.nickname,
      }));
      router.push(prevUrl);
    }).catch((error) => {
      console.log(error.response);
      alert(error.response.data.message);
    });
  }
  
  const doLogout = async()=>{
    const urlParams = new URL(location.href).searchParams;
    const prevUrl = await urlParams.get('prev') ?? 'test';

    sessionStorage.removeItem("ssuvelopAuth");
    router.push(prevUrl);
  }

  const doChange = async(event: any)=>{
    event.preventDefault();

    const urlParams = new URL(location.href).searchParams;
    const prevUrl = await urlParams.get('prev') ?? 'test';

    await axios.patch(
      process.env.BACK_BASE_URL+'/user/'+event.target.id.value,
      {
        'stdID': event.target.id.value,
        'password': event.target.pw.value,
        'name': event.target.name.value,
        'nickname': event.target.nickname.value,
      }
    ).then((response) => {
      sessionStorage.removeItem("ssuvelopAuth");
      alert('회원 정보가 변경되었습니다.\n다시 로그인해주세요.')
      // router.push(prevUrl);
      window.location.reload();
    }).catch((error) => {
      console.log(error.response);
      alert(error.response.data.message);
    });
  }

  const doSetting = async()=>{
    setSettingMode(!settingMode);
  }

  return (
    <main className='w-screen h-screen flex items-center justify-center text-black'>
      <div className='flex flex-col items-center justify-center border-2 p-16 rounded-3xl transition-all'>
        <div className='relative w-48 h-48 mb-16'>
          <Image src="/logo_black.png" fill={true} alt=''/>
        </div>
        {
          userInfo==null?(
            <form className='m-2'
              onSubmit={doLogin}>
              <div className='flex flex-col cursor-default my-2'>
                <p>학번</p>
                <input type='text' name='id' placeholder='' required className='border-2 w-48'/>
              </div>
              <div className='flex flex-col cursor-default my-2'>
                <p>비밀번호</p>
                <input type='text' name='pw' placeholder='' required className='border-2 w-48'/>
                <div className='text-xs p-2 text-right flex justify-end' >
                  <div className='cursor-default' onClick={()=>{
                    alert('회원가입은 운영진에게 문의부탁드립니다')
                  }}>
                    회원가입
                  </div>
                </div>
              </div>
              <br />
              <input type='submit' name='login' value='로그인'
                  className='cursor-pointer border-2 w-48 p-2 bg-blue-400 font-extrabold text-white rounded-2xl'/>
            </form>
          ):(
            settingMode?(
              <form className='m-2'
                onSubmit={doChange}>
                <div className='flex flex-col cursor-default my-2'>
                  <p>학번</p>
                  <input type='text' name='id' defaultValue={userInfo.id} required disabled className='border-2 w-48 p-1'/>
                </div>
                <div className='flex flex-col cursor-default my-2'>
                  <p>이름</p>
                  <input type='text' name='name' defaultValue={userInfo.name} required disabled className='border-2 w-48 p-1'/>
                </div>
                <div className='flex flex-col cursor-default my-2'>
                  <p>닉네임</p>
                  <input type='text' name='nickname' defaultValue={userInfo.nickname} className='border-2 w-48 p-1'/>
                </div>
                <div className='flex flex-col cursor-default my-2 mb-8'>
                  <p>비밀번호</p>
                  <input type='password' name='pw' defaultValue={userInfo.pw} required className='border-2 w-48 p-1'/>
                </div>
                <div className='flex justify-between'>
                  <input type='submit' name='login' value='확인'
                    className='cursor-pointer p-1 px-6 m-1 bg-blue-400 font-extrabold text-white rounded-xl'/>
                  <div className='text-center cursor-pointer p-1 m-1 px-6 bg-gray-200 font-extrabold text-gray-600 rounded-xl'
                    onClick={doSetting}>
                    취소
                  </div>
                </div>
              </form>
            ):(
              <div className='m-2'>
                <div className='text-center cursor-pointer border-2 py-2 w-48 bg-blue-400 font-extrabold text-white rounded-2xl'
                  onClick={doLogout}>
                  로그아웃
                </div>
                <br/>
                <div className='text-center cursor-pointer border-2 py-2 w-48 bg-blue-400 font-extrabold text-white rounded-2xl'
                  onClick={doSetting}>
                  회원정보 변경
                </div>
              </div>

            )
          )
        }
      </div>
    </main>
  );
}

export default Page;