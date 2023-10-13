"use client";

import React, { useEffect, useState, useRef } from "react";

function tmpInput() {
  return (
    <div className="h-[5rem] w-[5rem] bg-gray-800 m-2">
      a
    </div>
  )
}

const Page = () => {

  return (
    <main>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950">
        <div className="flex">
          {tmpInput()}
          {tmpInput()}
          {tmpInput()}
          {tmpInput()}
        </div>
        <div className="flex">
          {tmpInput()}
          {tmpInput()}
          {tmpInput()}
          {tmpInput()}
        </div>
      </div>
    </main>
  );
}

export default Page;