function Nav({ clickEvent }: any) {
  

  return (
    <nav className="relative">
      <div className="flex px-10 sm:px-20 text-2xl whitespace-nowrap
          space-x-10 sm:space-x-20">
        <h2 className="last:pr-24 cursor-pointer transition 
            duration-100 transform hover:scale-125 hover:text-white 
            active:text-red-500" onClick={
              clickEvent
            }>장르1</h2>
        <h2>장르2</h2>
        <h2>장르3</h2>
        <h2>장르4</h2>
        <h2>장르5</h2>
      </div>
    </nav>
  )
}

export default Nav