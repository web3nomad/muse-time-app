import type { GetServerSidePropsContext, NextPage } from 'next'
import useSWR from 'swr'
import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRecoilValue } from 'recoil'
import { PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import MainLayout from '@/components/layouts/MainLayout'
import TransitionDialog from '@/components/TransitionDialog'

const Page: NextPage<{topicSlug: string}> = ({ topicSlug }) => {
  return (
    <MainLayout>
      <h1>Topic {topicSlug}</h1>
    </MainLayout>
  )
}

export const getServerSideProps = async function ({ query }: GetServerSidePropsContext) {
  const topicSlug = (query.topic ?? '') as string
  return {
    props: {
      topicSlug
    }
  }
}

export default Page
