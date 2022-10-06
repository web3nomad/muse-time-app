import clsx from 'clsx'
import type { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import { useRecoilValue } from 'recoil'
import type { TopicData, ProfileData } from '@/lib/arweave'
import { useTimeTrove } from '@/lib/ethereum/hooks'
import { ArweaveResourceType, getArweaveData } from '@/lib/arweave'
import { CoffeeIcon, CalendarIcon, TwitterIcon } from '@/components/icons'
import MainLayout from '@/components/layouts/MainLayout'
import { formatEthersValue } from '@/components/topics/TopicItem'

type PageProps = {
  topicSlug: string,
  addressSlug: string,
}

const Page: NextPage<PageProps> = ({ topicSlug, addressSlug }) => {
  const { timeTrove } = useTimeTrove(addressSlug)  // topicOwner === addressSlug
  const [topic, setTopic] = useState<TopicData|null>(null)
  const [profile, setProfile] = useState<ProfileData|null>(null)

  const handleMint = useCallback(() => {

  }, [])

  const fetchProfile = useCallback(() => {
    if (!timeTrove.arOwnerAddress) {
      setProfile(null)
      return
    }
    getArweaveData({
      arOwnerAddress: timeTrove.arOwnerAddress,
      resourceId: '',
      resourceType: ArweaveResourceType.PROFILE,
      resourceOwner: addressSlug
    }).then(data => {
      setProfile(data)
    })
  }, [setProfile, addressSlug, timeTrove])

  const fetchTopic = useCallback(() => {
    if (!timeTrove.arOwnerAddress) {
      setTopic(null)
      return
    }
    getArweaveData({
      arOwnerAddress: timeTrove.arOwnerAddress,
      resourceId: '',
      resourceType: ArweaveResourceType.TOPICS,
      resourceOwner: addressSlug
    }).then((topicsList: TopicData[]) => {
      const topicItem = topicsList.find(({ id }) => id === topicSlug)
      setTopic(topicItem ?? null)
    })
  }, [setTopic, addressSlug, topicSlug, timeTrove])

  useEffect(() => {
    fetchTopic()
    fetchProfile()
  }, [fetchTopic, fetchProfile])

  const Avatar = ({ profile }: { profile: ProfileData }) => {
    return (
      <div className="absolute top-0 -left-48 w-32 hidden lg:flex flex-col items-center justify-start">
        <div
          className="w-32 h-32 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
          style={profile.avatar ? {backgroundImage:`url(${profile.avatar})`} : {}}
        ></div>
        <div className="text-center font-din-alternate mt-2">{profile.name}</div>
        <div className="text-xs text-neutral-400 font-din-alternate">
          {addressSlug.toLowerCase().replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')}
        </div>
        <div className="flex items-center text-sm my-2 font-din-alternate">
          <TwitterIcon className="w-4 h-4 mr-1" />
          <a href={`https://twitter.com/${profile['com.twitter']}`} target="_blank" rel="noreferrer">{profile['com.twitter'] || '-'}</a>
        </div>
        <div className="w-full my-2">
          <button className={clsx(
            "p-2 text-sm w-full rounded",
            "text-white bg-orange-tangelo hover:bg-orange-tangelo/90"
          )} onClick={() => handleMint()}>Mint Now</button>
        </div>
      </div>
    )
  }

  const TopicDetail = ({ profile, topic } : { profile: ProfileData, topic: TopicData }) => (
    <main className="lg:pl-48">
      <div className="relative">
        <Avatar profile={profile} />
        <section className="relative mb-2">
          <div
            className="lg:hidden w-32 h-32 my-4 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
            style={profile.avatar ? {backgroundImage: `url(${profile.avatar})`} : {}}
          ></div>
          <div className="text-5xl font-bold mb-6">{topic.name}</div>
          {/*<div className="text-xs sm:text-sm text-neutral-400 my-2">{resourceOwner}</div>*/}
          <div className="flex items-center justify-start my-3 font-din-alternate">
            <div className="text-2xl text-brown-grullo">{formatEthersValue(topic.value)}</div>
            <div className="ml-1 text-sm text-neutral-400">(approx. {topic.duration || '-'})</div>
            <div className="ml-auto"></div>
            <div className="px-3 py-1 rounded-full bg-blue-cadet text-neutral-900 text-xs">
              {topic.method || '-'}
            </div>
            <div className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-900 text-xs ml-1">
              {topic.category || '-'}
            </div>
          </div>
          <div className="flex items-center justify-start my-3 font-din-alternate">
            <div className="px-2 py-1 rounded-md border border-current text-sm flex items-center">
              <CoffeeIcon className="w-4 h-4 mr-1" />
              <span>{0} Minted</span>
            </div>
            <div className="px-2 py-1 rounded-md border border-current text-sm flex items-center ml-3">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{0} Pending</span>
            </div>
          </div>
          <div className="mt-16 font-din-pro">{topic.description}</div>
        </section>
        <section className="relative my-16">
          <h3 className="text-3xl font-bold my-4">About Me</h3>
          <div className="font-din-pro">{profile.description}</div>
        </section>
      </div>
    </main>
  )

  return (
    <MainLayout>
      <Head>
        <title>{'Topic | ' + topicSlug}</title>
      </Head>
      {(topic && profile) ? (
        <TopicDetail profile={profile} topic={topic} />
      ) : <div>loading topic ...</div>}
      {/*<>
        <div>{topic.name}</div>
        <div>{topic.description}</div>
        <div>{topic.category}</div>
        <div>{topic.value}</div>
        <div>{topic.duration}</div>
      </>*/}
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  const topicSlug = query.topic as string
  const addressSlug = ethers.utils.getAddress(query.address as string)
  return {
    props: {
      topicSlug,
      addressSlug,
    }
  }
}

export default Page
