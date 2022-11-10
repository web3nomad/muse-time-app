import clsx from 'clsx'
import type { GetServerSideProps, NextPage } from 'next'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { ethers } from 'ethers'

import { useTimeToken, useTimeTrove } from '@/lib/ethereum/hooks'
import { publicProvider } from '@/lib/ethereum/public'

import type { TopicData, ProfileData } from '@/lib/arweave'
import { ResourceTypes, getArweaveData } from '@/lib/arweave'

import MainLayout from '@/components/layouts/MainLayout'
import SimpleLayout from '@/components/layouts/SimpleLayout'
import { formatEthersValue } from '@/components/topics/TopicItem'
import MintedTimeTokens from '@/components/topics/MintedTimeTokens'

import { CoffeeIcon, CalendarIcon, TwitterIcon } from '@/components/icons'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import ClockImage from '@/assets/images/clock.svg'

type PageProps = {
  addressSlug: string
  topicOwner: string
  topicId: string
}

const Page: NextPage<PageProps> = ({ addressSlug, topicOwner, topicId }) => {
  const { timeTrove } = useTimeTrove(topicOwner)
  const { mintTimeToken, isMinting, timeTokenMintedLogs } = useTimeToken(topicOwner, topicId)
  const [topic, setTopic] = useState<TopicData|null>(null)
  const [profile, setProfile] = useState<ProfileData|null>(null)

  const fetchProfile = useCallback(() => {
    if (!timeTrove?.arOwnerAddress) {
      setProfile(null)
      return
    }
    getArweaveData({
      arOwnerAddress: timeTrove.arOwnerAddress,
      resourceId: '',
      resourceType: ResourceTypes.PROFILE,
      resourceOwner: topicOwner
    }).then(data => {
      setProfile(data)
    })
  }, [setProfile, topicOwner, timeTrove])

  const fetchTopic = useCallback(() => {
    if (!timeTrove?.arOwnerAddress) {
      setTopic(null)
      return
    }
    getArweaveData({
      arOwnerAddress: timeTrove.arOwnerAddress,
      resourceId: '',
      resourceType: ResourceTypes.TOPICS,
      resourceOwner: topicOwner
    }).then((topics: TopicData[]) => {
      const topic = topics.find(({ id }) => id === topicId)
      setTopic(topic ?? null)
    })
  }, [setTopic, topicOwner, topicId, timeTrove])

  useEffect(() => {
    fetchTopic()
    fetchProfile()
  }, [fetchTopic, fetchProfile])


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

  const Avatar = ({ profile }: { profile: ProfileData }) => {
    return (
      <div className={clsx(
        "lg:absolute lg:top-0 lg:-left-48 lg:w-32 mb-12",
        "flex lg:flex-col justify-start items-center",
      )}>
        <div
          className="w-32 h-32 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
          style={profile.avatar ? {backgroundImage:`url(${profile.avatar})`} : {}}
        ></div>
        <div className="ml-6 lg:ml-0 flex flex-col justify-start items-start lg:items-center">
          <div className="font-din-alternate mt-2">{profile.name}</div>
          <div className="text-xs text-neutral-400 font-din-alternate">
            {topicOwner.toLowerCase().replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')}
          </div>
          <div className="flex items-center text-sm my-2 font-din-alternate">
            <TwitterIcon className="w-4 h-4" />
            {profile['com.twitter'] && <a
              href={`https://twitter.com/${profile['com.twitter']}`}
              target="_blank" rel="noreferrer" className="ml-1"
            >{profile['com.twitter']}</a>}
          </div>
          <button
            className="my-2 py-2 px-8 text-sm w-full rounded text-white bg-orange-tangelo hover:bg-orange-tangelo/90 flex items-center justify-center"
            disabled={isMinting} onClick={() => mintTimeToken()}
          >
            <span>Mint Now</span>
            {isMinting && <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />}
          </button>
        </div>
      </div>
    )
  }

  const TopicDetail = ({ profile, topic } : { profile: ProfileData, topic: TopicData }) => (
    <main className="overflow-hidden lg:pl-48">
      <section className="relative">
        <Avatar profile={profile} />
        <div className="relative mb-2">
          {/*<div
            className="lg:hidden w-32 h-32 my-4 bg-neutral-100 bg-no-repeat bg-center bg-contain rounded-full"
            style={profile.avatar ? {backgroundImage: `url(${profile.avatar})`} : {}}
          ></div>*/}
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
        </div>
      </section>
      <section className="relative my-16">
        <h3 className="text-3xl font-bold my-4">About Me</h3>
        <div className="font-din-pro">{profile.description}</div>
      </section>
      {/* MintedTimeTokens */}
      <MintedTimeTokens timeTokenMintedLogs={timeTokenMintedLogs} />
    </main>
  )

  if (topic && profile) {
    return (
      <MainLayout>
        <Head>
          <title>{'Topic | ' + topic.name}</title>
        </Head>
        <TopicDetail profile={profile} topic={topic} />
      </MainLayout>
    )
  } else {
    return <Loading />
  }

}

export const getServerSideProps: GetServerSideProps = async function ({ query }) {
  const addressSlug = query.address as string
  let topicOwner = '0x0000000000000000000000000000000000000000'
  try {
    if (/\.eth$/.test(addressSlug)) {
      topicOwner = ethers.utils.getAddress(await publicProvider.resolveName(addressSlug) as string)
    } else {
      topicOwner = ethers.utils.getAddress(addressSlug)
    }
  } catch(err) {}
  const topicId = query.topic as string
  return {
    props: {
      addressSlug,
      topicOwner,
      topicId,
    }
  }
}

export default Page
