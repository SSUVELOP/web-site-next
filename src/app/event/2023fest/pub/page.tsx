"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from "react";

const Page = () => {
  const router = useRouter();

  console.log(btoa(JSON.stringify(
    {
      'table': 0,
    }
  )));

  const checkKey = async ()=>{
    const urlParams = new URL(location.href).searchParams;
    const tablekey = await urlParams.get('key');
    let tableInfo;
    console.log(tablekey);
    console.log(atob(tablekey!!));
    tableInfo = JSON.parse(atob(tablekey!!));
    console.log(tableInfo);

    await sessionStorage.setItem("tableKey", JSON.stringify(tableInfo));
    router.push("event/2023fest/pub/"+tableInfo.table);
  }

  useEffect(()=>{
    checkKey();
  }, [])

  return (
    <main>
      <div className='flex flex-col'>

      </div>
    </main>
  );
}

export default Page;