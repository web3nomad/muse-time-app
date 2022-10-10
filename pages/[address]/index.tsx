import clsx from 'clsx'
import type { GetServerSidePropsContext, GetServerSideProps, NextPage } from 'next'
import { useMemo, useCallback } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import MainLayout from '@/components/layouts/MainLayout'
import ProfileDetail from '@/components/profile/ProfileDetail'
import TopicsList from '@/components/topics/TopicsList'
import { useEthereumContext } from '@/lib/ethereum/context'
import { useTimeTrove } from '@/lib/ethereum/hooks'
import MintedTimeTokens from '@/components/topics/MintedTimeTokens'
import { ArrowPathIcon } from '@heroicons/react/20/solid'

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
    <main className="flex justify-center">
      <ArrowPathIcon className="h-8 w-8 animate-spin duration-1000" />
    </main>
  )

  const NotFound = () => (
    <main className="flex justify-center">
      <div className="my-6 text-2xl">Profile not found</div>
    </main>
  )

  const CallToCreateTimeTrove = () => (
    <main className="flex justify-center">
      <button
        className="rounded-lg px-6 py-2 my-6 text-white bg-orange-tangelo hover:bg-orange-tangelo/90 flex items-center justify-center"
        disabled={isCreating} onClick={() => createTimeTrove()}
      >
        <span>Create Time Trove</span>
        {isCreating && <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />}
      </button>
    </main>
  )

  const FullDetail = () => (
    <main className="overflow-hidden lg:pl-48">
      <ProfileDetail resourceOwner={addressSlug} arOwnerAddress={timeTrove.arOwnerAddress} />
      <TopicsList resourceOwner={addressSlug} arOwnerAddress={timeTrove.arOwnerAddress} />
      <MintedTimeTokens addressSlug={addressSlug} />
    </main>
  )

  return (
    <MainLayout>
      <Head>
        <title>{'MuseTime | ' + addressSlug}</title>
      </Head>
      {(() => {
        if (isFetching) {
          return <Loading />
        } else if (!timeTrove.arOwnerAddress && addressSlug !== walletAddress) {
          return <NotFound />
        } else if (!timeTrove.arOwnerAddress && addressSlug === walletAddress) {
          return <CallToCreateTimeTrove />
        } else {
          return <FullDetail />
        }
      })()}
    </MainLayout>
  )
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
