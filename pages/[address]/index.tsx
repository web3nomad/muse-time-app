import clsx from 'clsx'
import type { GetServerSidePropsContext, GetServerSideProps, NextPage } from 'next'
import { useMemo, useCallback } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import MainLayout from '@/components/layouts/MainLayout'
import ProfileDetail from '@/components/profile/ProfileDetail'
import TopicsList from '@/components/topics/TopicsList'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { useTimeTrove } from '@/lib/ethereum/timeTrove'

type PageProps = {
  addressSlug: string
}

const Page: NextPage<PageProps> = ({ addressSlug }) => {
  const walletAddress = useRecoilValue(walletAddressState)
  const { timeTrove, createTimeTrove, isValidating } = useTimeTrove(addressSlug)
  // console.log('timeTrove', timeTrove)

  const handleCreateTimeTrove = useCallback(() => {
    createTimeTrove()
  }, [createTimeTrove])

  const Loading = () => (
    <main>loading</main>
  )

  const NotFound = () => (
    <main>404</main>
  )

  const CallToCreateTimeTrove = () => (
    <main>
      <button className={clsx(
        "border border-current",
        "rounded text-xs sm:text-sm px-4 py-1 mx-2",
      )} onClick={() => handleCreateTimeTrove()}>Create Time Trove</button>
    </main>
  )

  const FullDetail = () => (
    <main className="lg:pl-48">
      <ProfileDetail resourceOwner={addressSlug} arOwnerAddress={timeTrove.addressAR} />
      <TopicsList resourceOwner={addressSlug} arOwnerAddress={timeTrove.addressAR} />
    </main>
  )

  return (
    <MainLayout>
      <Head>
        <title>{'MuseTime | ' + addressSlug}</title>
      </Head>
      {(() => {
        if (isValidating) {
          return <Loading />
        } else if (!timeTrove.addressAR && addressSlug !== walletAddress) {
          return <NotFound />
        } else if (!timeTrove.addressAR && addressSlug === walletAddress) {
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
