import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
// import { useEffect, useState } from 'react'
import ConnectButton from '@/components/ConnectButton'
import { MuseTimeLogoIcon, MuseTimeTextIcon } from '@/components/icons'


export default function SiteHeader({ className }: { className: string }) {
  return (
    <header className={clsx(
      "h-16 px-2 sm:px-8",
      "flex items-center justify-start bg-neutral-900 text-white",
      className,
    )}>
      <Link href='/'>
        <a className="block flex items-center justify-start">
          <MuseTimeLogoIcon className="w-8 h-4 sm:w-16 sm:h-7" />
          <MuseTimeTextIcon className="w-20 h-4 sm:w-32 sm:h-7 ml-1" />
        </a>
      </Link>
      <div className="ml-auto"></div>
      <ConnectButton />
    </header>
  )
}
