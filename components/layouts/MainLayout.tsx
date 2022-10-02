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
    <div className="bg-[#E0DDD6] min-h-screen overflow-hidden">
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="MuseTime 是一个时间x空间的交易工具，在这个高维的世界里，时间和空间可以自由转换" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SiteHeader />
      <div className="flex flex-col items-end justify-center w-[32rem] mt-16 mb-8 mx-auto">
        <div className="relative w-full h-32">
          <Image src={TimeIsMoney.src} layout="fill" alt="Time is money" />
        </div>
        <div className="relative w-1/3 h-6">
          <Image src={BenjaminFranklin.src} layout="fill" alt="Benjamin Franklin" />
        </div>
      </div>
      <div className={clsx(
        "relative mb-32 mx-auto",
        "px-12 py-8 lg:px-16 lg:py-12",
        "w-full lg:w-[1080px] min-h-[1080px]",
        "bg-white text-[#292929] border-black border-[7px] rounded-[40px]"
      )}>
        <main>{children}</main>
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
