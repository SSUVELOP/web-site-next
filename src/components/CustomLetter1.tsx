import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react'


import "@styles/customletter1.css"

function CustomLetter1({ letter, className, delay }: any) {
  const router = useRouter();

  const colorList = ['#ABDEE6', '#CBAACB', '#FFFFB5', '#FFCCB6', '#F3B0C3']

  const [color, setColor] = useState<number>(0)

  useEffect(() => {
    setColor(Math.floor(Math.random() * colorList.length))
  }, [])

  const letterClick = () => {
    let newColor = color;
    while(newColor == color) {
      newColor = Math.floor(Math.random() * colorList.length)
    }

    setColor(newColor);
  }

  return (
    <div className={className+' titleDiv'}>
      <h1 className='title' style={{
        animationDelay: delay+'ms',
        color: colorList[color]
      }} onClick={letterClick}>
        {letter}
      </h1>
    </div>
  )
}

export default CustomLetter1