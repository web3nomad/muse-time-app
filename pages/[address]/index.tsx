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
    <main>loading</main>
  )

  const NotFound = () => (
    <main>404</main>
  )

  const CallToCreateTimeTrove = () => (
    <main>
      <button
        className="border border-current rounded text-xs sm:text-sm px-4 py-1 mx-2 flex items-center justify-center"
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
  const addressSlug = ethers.utils.getAddress(query.address as string)
  return {
    props: {
      addressSlug
    }
  }
}

export default Page
