import clsx from 'clsx'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { authTokenState } from '@/lib/recoil/wallet'
import ConnectButton from '@/components/ConnectButton'
import { ArrowPathIcon } from '@heroicons/react/20/solid'


export default function SiteHeader() {
  const [pendingTx, setPendingTx] = useState<any|null>(null)
  const [tick, setTick] = useState(0)
  const authToken = useRecoilValue(authTokenState)

  useEffect(() => {
    if (authToken) {
      fetch('/api/arweave/pendingTx', {
        headers: { 'Authorization': `Token ${authToken}` }
      }).then(async (res) => {
        const data = await res.json()
        setPendingTx(data.tx)
      }).catch((err) => console.log(err))
    }
    setTimeout(() => setTick(tick + 1), 3000)
  }, [authToken, tick])

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
          > Pending Tx </a>
          <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />
        </div>
      )}
      <ConnectButton />
    </header>
  )
}
