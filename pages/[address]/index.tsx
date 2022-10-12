import clsx from 'clsx'
import type { GetServerSidePropsContext, GetServerSideProps, NextPage } from 'next'
import { useMemo, useCallback } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { ethers } from 'ethers'
import MainLayout from '@/components/layouts/MainLayout'
import SimpleLayout from '@/components/layouts/SimpleLayout'
import ProfileDetail from '@/components/profile/ProfileDetail'
import TopicsList from '@/components/topics/TopicsList'
import { useEthereumContext } from '@/lib/ethereum/context'
import { useTimeTrove } from '@/lib/ethereum/hooks'
import MintedTimeTokens from '@/components/topics/MintedTimeTokens'
import { ArrowUpRightIcon, ArrowPathIcon } from '@heroicons/react/20/solid'

import Profile404CreateImage from '@/assets/images/profile-404-create.svg'
import Profile404Image from '@/assets/images/profile-404.svg'
import ClockImage from '@/assets/images/clock.svg'

type PageProps = {
  addressSlug: string
}

const Page: NextPage<PageProps> = ({ addressSlug }) => {
  const { walletAddress } = useEthereumContext()
  const {
    timeTrove,
    isFetching,
    createTimeTrove,
    isCreating,
  } = useTimeTrove(addressSlug)

  const Loading = () => (
    <SimpleLayout>
      <main className="flex-1 w-full flex flex-col items-center justify-center pt-2 pb-16">
        <div className="relative w-16 h-16 mb-4">
          <Image layout="fill" src={ClockImage.src} alt="" />
        </div>
        <div className="font-din-pro">Loading...</div>
      </main>
    </SimpleLayout>
  )

  const NotFound = () => (
    <SimpleLayout>
      <main className="flex-1 w-full flex flex-col items-center justify-center pt-2 pb-16">
        <div className="relative w-[20rem] h-[20rem] mb-4">
          <Image layout="fill" src={Profile404Image.src} alt="" />
        </div>
        <div className="text-3xl mb-4">Opps!</div>
        <div className="font-din-pro mb-6">Profile not found. Create your Time Trove.</div>
        {walletAddress && <Link href={`/${walletAddress}`}>
          <a className="underline font-din-alternate flex items-center justify-center pl-6">
            MY TIME TROVE <ArrowUpRightIcon className="w-6 h-6 ml-1" />
          </a>
        </Link>}
      </main>
    </SimpleLayout>
  )

  const CallToCreateTimeTrove = () => (
    <SimpleLayout>
      <main className="flex-1 w-full flex flex-col items-center justify-center pt-2 pb-16">
        <div className="relative w-[20rem] h-[16rem] mb-4">
          <Image layout="fill" src={Profile404CreateImage.src} alt="" />
        </div>
        <div className="text-3xl mb-4">Hi!</div>
        <div className="font-din-pro mb-6">Create your Time Trove now!</div>
        <button
          className="rounded px-6 py-2 text-white bg-orange-tangelo hover:bg-orange-tangelo/90 flex items-center justify-center"
          disabled={isCreating} onClick={() => createTimeTrove()}
        >
          <span>Create Time Trove</span>
          {isCreating && <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />}
        </button>
      </main>
    </SimpleLayout>
  )

  const FullDetail = () => (
    <MainLayout>
      <Head>
        <title>{'MuseTime | ' + addressSlug}</title>
      </Head>
      <main className="overflow-hidden lg:pl-48">
        <ProfileDetail resourceOwner={addressSlug} arOwnerAddress={timeTrove.arOwnerAddress} />
        <TopicsList resourceOwner={addressSlug} arOwnerAddress={timeTrove.arOwnerAddress} />
        <MintedTimeTokens addressSlug={addressSlug} />
      </main>
    </MainLayout>
  )

  if (isFetching) {
    return <Loading />
  } else if (!timeTrove.arOwnerAddress && addressSlug !== walletAddress) {
    return <NotFound />
  } else if (!timeTrove.arOwnerAddress && addressSlug === walletAddress) {
    return <CallToCreateTimeTrove />
  } else {
    return <FullDetail />
  }
}

// export const getServerSideProps = async function ({ query }: GetServerSidePropsContext) {
export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  let addressSlug = '0x0000000000000000000000000000000000000000'
  try {
    addressSlug = ethers.utils.getAddress(query.address as string)
  } catch(err) {}
  return {
    props: {
      addressSlug
    }
  }
}

export default Page
