import clsx from 'clsx'
import Link from 'next/link'
import useSWR from 'swr'
// import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { authTokenState } from '@/lib/recoil/wallet'
import ConnectButton from '@/components/ConnectButton'
import { ArrowPathIcon } from '@heroicons/react/20/solid'


export default function SiteHeader() {
  const authToken = useRecoilValue(authTokenState)

  // const fetcher = (...args) => fetch(...args).then(res => res.json())
  const fetcher = async (url: string) => {
    if (!authToken) {
      return new Promise((resolve) => { resolve(null) })
    }
    const headers = { 'Authorization': `Token ${authToken}` }
    try {
      const res = await fetch(url, { headers })
      return await res.json()
    } catch(err) {
      return null
    }
  }

  const { data: pendingTx } = useSWR('/api/arweave/pendingTx', fetcher, {
    refreshInterval: 5000
  })

  return (
    <header className={clsx("p-4 flex items-center justify-start bg-slate-300")}>
      <Link href='/'>
        <a className="text-lg font-bold">MuseTime</a>
      </Link>
      <div className="ml-auto"></div>
      {pendingTx && (
        <div className="flex items-center justify-center">
          <a
            href={`https://arseed.web3infra.dev/bundle/tx/${pendingTx.itemId}`}
            target="_blank"
            rel="noreferrer"
          > Pending Tx </a>
          <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />
        </div>
      )}
      <ConnectButton />
    </header>
  )
}
