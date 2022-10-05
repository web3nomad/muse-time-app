import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
// import SiteHeader from '@/components/layouts/SiteHeader'
// import PendingTx from '@/components/PendingTx'
import MainLayout from '@/components/layouts/MainLayout'

import MuseTime from '@/assets/images/musetime-b.svg'
import Logo from '@/assets/images/logo-b.svg'
import TimeIsMoney from '@/assets/images/time-is-money.svg'
import BenjaminFranklin from '@/assets/images/time-is-money-benjamin-franklin.svg'
import HomeIllustration from '@/assets/images/home-illustration.svg'

const Home: NextPage = () => {
  return (
    <div className="bg-white-coffee min-h-screen overflow-hidden">
      <Head>
        <title>MuseTime</title>
        <meta name="description" content="MuseTime is a time x space trading tool built on Arweave and Ethereum. In this high-dimensional world, time and space can be freely transformed." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/*<SiteHeader />*/}
      <main className="min-h-screen py-12 md:py-24 flex flex-col items-center justify-start">
        <div className="flex items-center justify-center">
          <span className="relative w-10 h-6 sm:w-16 sm:h-10 md:w-24 md:h-14">
            <Image src={Logo.src} layout="fill" alt="MuseTime Logo" />
          </span>
          <span className="relative w-24 h-6 sm:w-40 sm:h-10 md:w-56 md:h-14 ml-2">
            <Image src={MuseTime.src} layout="fill" alt="MuseTime" />
          </span>
        </div>
        <div className="flex flex-col items-end justify-center w-[18rem] sm:w-[32rem] md:w-[48rem] my-4">
          <div className="relative w-full h-[5rem] sm:h-[8rem] md:h-[12rem]">
            <Image src={TimeIsMoney.src} layout="fill" alt="Time is money" />
          </div>
          <div className="relative w-1/3 h-[1.25rem] sm:h-[2rem] md:h-[3rem]">
            <Image src={BenjaminFranklin.src} layout="fill" alt="Benjamin Franklin" />
          </div>
        </div>
        <div className="relative w-[16rem] h-[12rem] sm:w-[20rem] sm:h-[16rem] md:w-[26rem] md:h-[20rem]">
          <Image src={HomeIllustration.src} layout="fill" alt="Home Illustration" />
        </div>
      </main>
      {/*<PendingTx />*/}
    </div>
  )
}

export default Home
