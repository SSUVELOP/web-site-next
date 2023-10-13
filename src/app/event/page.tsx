"use client";

import Link from 'next/link'
import React, { useEffect, useState, useRef } from "react";

const Page = () => {
  return (
    <main>
      <div className='flex flex-col'>
        <Link href={'/event/2023fest'}>
          2023 대동제
        </Link>
      </div>
    </main>
  );
}

export default Page;