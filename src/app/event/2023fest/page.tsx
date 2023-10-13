"use client";

import Link from 'next/link'
import React, { useEffect, useState, useRef } from "react";

const Page = () => {
  return (
    <main>
      <div className='flex flex-col'>
        <Link href={'/event/2023fest/ssucada_project'}>
            ssu.cada Project
        </Link>
        <Link href={'/event/2023fest/order'}>
            메뉴 주문 페이지
        </Link>
      </div>
    </main>
  );
}

export default Page;