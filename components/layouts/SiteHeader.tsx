import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
// import { useEffect, useState } from 'react'
import ConnectButton from '@/components/ConnectButton'

import MuseTime from '@/assets/images/musetime-w.svg'
import Logo from '@/assets/images/logo-w.svg'


export default function SiteHeader() {
  return (
    <header className={clsx(
      "h-16 px-2 sm:px-8",
      "flex items-center justify-start bg-neutral-900 text-white"
    )}>
      <Link href='/'>
        <a className="block flex items-center justify-start">
          <span className="relative w-8 h-4 sm:w-16 sm:h-7">
            <Image src={Logo.src} layout="fill" alt="MuseTime Logo" />
          </span>
          <span className="relative w-20 h-4 sm:w-32 sm:h-7 ml-2">
            <Image src={MuseTime.src} layout="fill" alt="MuseTime" />
          </span>
        </a>
      </Link>
      <div className="ml-auto"></div>
      <ConnectButton />
    </header>
  )
}
