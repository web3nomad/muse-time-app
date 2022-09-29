import type { NextPage } from 'next'
import useSWR from 'swr'
import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRecoilValue } from 'recoil'
import { walletAddressState } from '@/lib/recoil/wallet'
import { updateArweaveData } from '@/lib/arweave'
import MainLayout from '@/components/layouts/MainLayout'

const Page: NextPage = () => {
  const walletAddress = useRecoilValue(walletAddressState)

  const fetcher = (...args) => fetch(...args).then(res => res.json())
  const { data, isValidating, error } = useSWR('/api/profile/123', fetcher)

  const upload = useCallback(() => {
    const payload = {
      'from': 'web3nomad.eth',
      'message': 'Hi, web3nomad'
    }
    updateArweaveData({
      id: walletAddress,
      type: 'profile',
      payload: payload,
    }).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }, [walletAddress])

  return (
    <MainLayout>
      <Head>
        <title>Profile</title>
      </Head>
      <div>
        {isValidating ? <span>isValidating</span> : <span>validated</span>}
      </div>
      <div className="py-4">
        <button className="border border-black p-1" onClick={() => upload()}>Click to upload</button>
      </div>
    </MainLayout>
  )
}

export default Page
