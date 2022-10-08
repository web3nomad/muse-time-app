import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
// import { useEffect, useState } from 'react'
import ConnectButton from '@/components/ConnectButton'
import { MuseTimeLogoIcon, MuseTimeTextIcon } from '@/components/icons'

import BMRLabImage from '@/assets/images/bmrlab-w.svg'
import HippyGhostsImage from '@/assets/images/hippyghosts-w.svg'
import MuseDAMImage from '@/assets/images/muse-dam.svg'
import MuseLinkImage from '@/assets/images/muse-link.svg'
import MuseTransferImage from '@/assets/images/muse-transfer.svg'


export default function SiteFooter({ className }: { className: string }) {
  return (
    <header className={clsx(
      "h-24 px-2 sm:px-8 w-full flex flex-col sm:flex-row items-center justify-evenly sm:justify-between",
      className,
    )}>
      <div className="font-din-pro text-sm text-center">MADE WITH GAS BY</div>
      <div className="flex items-center justify-center">
        <a className="block relative w-24 h-6 sm:w-36 sm:h-8" href="https://hippyghosts.io" target="_blank" rel="noreferrer">
          <Image src={HippyGhostsImage.src} layout="fill" alt="https://hippyghosts.io" />
        </a>
        <a className="block relative w-12 h-6 ml-2 sm:w-16 sm:h-8 sm:ml-4" href="https://bmr.art" target="_blank" rel="noreferrer">
          <Image src={BMRLabImage.src} layout="fill" alt="https://bmr.art" />
        </a>
        <a className="block relative w-6 h-6 ml-2 sm:w-8 sm:h-8 sm:ml-4" href="https://musetransfer.com" target="_blank" rel="noreferrer">
          <Image src={MuseTransferImage.src} layout="fill" alt="https://musetransfer.com" />
        </a>
        <a className="block relative w-6 h-6 ml-2 sm:w-8 sm:h-8 sm:ml-4" href="https://dam.musetransfer.com" target="_blank" rel="noreferrer">
          <Image src={MuseDAMImage.src} layout="fill" alt="https://dam.musetransfer.com" />
        </a>
        <a className="block relative w-6 h-6 ml-2 sm:w-8 sm:h-8 sm:ml-4" href="https://muselink.cc" target="_blank" rel="noreferrer">
          <Image src={MuseLinkImage.src} layout="fill" alt="https://muselink.cc" />
        </a>
      </div>
    </header>
  )
}
