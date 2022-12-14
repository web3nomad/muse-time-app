import clsx from 'clsx'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useEthereumContext } from '@/lib/ethereum/context'
import SiteHeader from '@/components/layouts/SiteHeader'
import SiteFooter from '@/components/layouts/SiteFooter'
import HeadMeta from '@/components/layouts/HeadMeta'
// import PendingTx from '@/components/PendingTx'
import ConnectButton from '@/components/ConnectButton'
import MainLayout from '@/components/layouts/MainLayout'
import { ArrowUpRightIcon } from '@heroicons/react/20/solid'

import TimeIsMoney from '@/assets/images/time-is-money.svg'
import BenjaminFranklin from '@/assets/images/time-is-money-benjamin-franklin.svg'
import HomeIllustration from '@/assets/images/home-illustration.svg'

const Home: NextPage = () => {
  const router = useRouter()
  const { walletAddress, authToken, login } = useEthereumContext()
  const [ connecting, setConnecting ] = useState(false)

  const connectOrGo = useCallback(() => {
    if (!walletAddress) {
      setConnecting(true)
      login()
    } else {
      router.push(`/${walletAddress}`)
    }
  }, [router, login, walletAddress, setConnecting])

  useEffect(() => {
    if (connecting && walletAddress) {
      setConnecting(false)
      router.push(`/${walletAddress}`)
    }
  }, [router, walletAddress, connecting, setConnecting])

  return (
    <div className="bg-white-coffee min-h-screen overflow-hidden flex flex-col items-center justify-between">
      <HeadMeta />
      <SiteHeader className="bg-transparent text-neutral-900" />
      <main className="py-12 lg:py-18 px-6 lg:px-12 w-full flex flex-wrap items-center justify-start">
        <div className="w-full md:w-1/2 px-6 lg:px-12">
          <div className="flex flex-col items-end justify-center w-full">
            <div className="relative w-full pt-[25%]">
              <Image src={TimeIsMoney.src} layout="fill" alt="Time is money" />
            </div>
            <div className="relative w-1/3 pt-[10%]">
              <Image src={BenjaminFranklin.src} layout="fill" alt="Benjamin Franklin" />
            </div>
          </div>
          <p className="my-8 font-din-pro">MuseTime is a time x space trading instrument, in which, time and space can be freely transformed in this high-dimensional world, with the transformation fully supported by a decentralized platform.</p>
          <button className={clsx(
              "bg-blue-cadet text-neutral-900",
              "rounded sm:text-sm px-16 py-3 mb-6 flex items-center justify-center",
            )} onClick={() => connectOrGo()}
          >MY TIME TROVE <ArrowUpRightIcon className="w-6 h-6 ml-1" /></button>
        </div>
        <div className="w-full md:w-1/2 px-6 lg:px-12">
          <div className="relative w-full pt-[100%]">
            <Image src={HomeIllustration.src} layout="fill" alt="Home Illustration" />
          </div>
        </div>
      </main>
      <SiteFooter className="bg-neutral-800 text-white" />
      {/*<PendingTx />*/}
    </div>
  )
}

export default Home
