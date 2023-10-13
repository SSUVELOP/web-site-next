import {
  HomeIcon,
  PlayIcon,
  UserIcon,
  CubeIcon,
  InformationCircleIcon,
  XMarkIcon,
  Bars3Icon
} from "@heroicons/react/24/outline"

import HeaderItem from "@components/HeaderItem"

import "@styles/header.css"
import { useRef, useState } from "react"

function Header({onClick}: any) {
  const menuButton = useRef<any>();

  const [menuActive, setMenuActive] = useState<string>('');

  const drawerRef = useRef<any>();
  const toggleMenu = ()=>{
    drawerRef.current.classList.toggle('active');
    setMenuActive(menuActive==''||menuActive=='deactive'?'active':'deactive')
  }

  return (
    <header>
      <div className="header">
        <p className="header-title">SSU:VELOP</p>
        <div className="header-window">
          <HeaderItem title='HOME' Icon={HomeIcon} className='menu-item' />
          <HeaderItem title='ABOUT' Icon={InformationCircleIcon} className='menu-item' />
          <HeaderItem title='UTIL' Icon={PlayIcon} url='/tetris' className='menu-item'/>
          <HeaderItem title='ACCOUNT' Icon={UserIcon} url='/login' className='menu-item' />
        </div>
        <div className="header-phone">
          <div ref={menuButton} className={"menu-icon " + menuActive} onClick={toggleMenu}>
            <a></a>
            <a></a>
            <a></a>
          </div>
        </div>
      </div>
      
      <div ref={drawerRef} className='drawer'>
        <div className='bg' onClick={toggleMenu}>
        </div>
        <div className='fg'>
          <div>
            Profile
          </div>
          <div>
            About
          </div>
          <div>
            Util
          </div>
          <div>

          </div>
        </div>
      </div>
    </header>
  )
}

export default Header