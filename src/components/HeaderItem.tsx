import { usePathname, useRouter } from 'next/navigation';

import "@styles/header.css"

function HeaderItem({ Icon, title, url='', className }: any) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={className}
    onClick={() => router.push(url+(url=='/login'?('?prev='+pathname):''))}>
      <Icon/>
      <p>{title}</p>
    </div>
  )
}

export default HeaderItem