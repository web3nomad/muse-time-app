import clsx from 'clsx'
import Link from 'next/link'
import useSWR from 'swr'
import { useRecoilValue } from 'recoil'
import { authTokenState } from '@/lib/recoil/wallet'
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
    refreshInterval: 5000,
  })

  return (
    <div className={clsx(
      "fixed left-0 bottom-0 w-full",
      { "hidden": !pendingTx }
    )}>
      {pendingTx && (
        <div className="flex items-center justify-center p-4 bg-amber-300">
          <a
            href={`https://arseed.web3infra.dev/bundle/tx/${pendingTx.itemId}`}
            target="_blank"
            rel="noreferrer"
          > Pending Tx </a>
          <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />
        </div>
      )}
    </div>
  )
}
