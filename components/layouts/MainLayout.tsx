import React, { ReactNode } from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import Image from 'next/image'
import SiteHeader from './SiteHeader'
import PendingTx from '@/components/PendingTx'

import TimeIsMoney from '@/assets/images/time-is-money.svg'
import BenjaminFranklin from '@/assets/images/time-is-money-benjamin-franklin.svg'

type Props = {
  children?: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="bg-white-coffee min-h-screen overflow-hidden">
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="MuseTime is a time x space trading tool built on Arweave and Ethereum. In this high-dimensional world, time and space can be freely transformed." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SiteHeader className="bg-neutral-900 text-white" />
      <div className="flex flex-col items-end justify-center w-[18rem] sm:w-[32rem] my-8 mx-auto">
        <div className="relative w-full h-20 sm:h-32">
          <Image src={TimeIsMoney.src} layout="fill" alt="Time is money" />
        </div>
        <div className="relative w-1/3 h-4 sm:h-6">
          <Image src={BenjaminFranklin.src} layout="fill" alt="Benjamin Franklin" />
        </div>
      </div>
      <div className={clsx(
        "relative mb-32 mx-auto",
        "px-5 py-5 sm:px-8 sm:py-8 lg:px-20 lg:py-16",
        "w-full lg:w-[1000px] min-h-[1000px]",
        "bg-white text-neutral-900 border-black border-[0] lg:border-[7px] rounded-[40px]"
      )}>
        {children}
        <div className="absolute top-20 -left-3 w-3">
          <div className="w-full h-8 bg-black rounded-l-md"></div>
          <div className="w-full h-16 mt-8 bg-black rounded-l-md"></div>
          <div className="w-full h-16 mt-2 bg-black rounded-l-md"></div>
        </div>
        <div className="absolute top-32 -right-3 w-3">
          <div className="w-full h-16 bg-black rounded-r-md"></div>
        </div>
      </div>
      <PendingTx />
    </div>
  )
}
