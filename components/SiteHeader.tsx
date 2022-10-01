import clsx from 'clsx'
import Link from 'next/link'
// import { useEffect, useState } from 'react'
import ConnectButton from '@/components/ConnectButton'


export default function SiteHeader() {
  return (
    <header className={clsx("p-4 flex items-center justify-start bg-slate-300")}>
      <Link href='/'>
        <a className="text-lg font-bold">MuseTime</a>
      </Link>
      <div className="ml-auto"></div>
      <ConnectButton />
    </header>
  )
}
