import clsx from 'clsx'
import Link from 'next/link'
// import useSWR from 'swr'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import type { EverpayTx } from '@/lib/arweave'
import ClockImage from '@/assets/images/clock.svg'

export default function PendingTx() {
  const { walletAddress, authToken } = useEthereumContext()
  const [pendingTx, setPendingTx] = useState<EverpayTx|null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!authToken || !walletAddress) {
      return
    }
    const url = `https://arseed.web3infra.dev/bundle/orders/${walletAddress}`
    fetch(url).then(async (res) => {
      const txs = await res.json()
      // const tx = txs[0]
      const tx = txs.find((tx: EverpayTx) => tx.paymentStatus === 'paid' && tx.onChainStatus !== 'success')
      setPendingTx(tx)
      setTimeout(() => setTick(tick + 1), 5000)
    }).catch((err) => {
      console.log(err)
      setTimeout(() => setTick(tick + 1), 5000)
    })
  }, [authToken, walletAddress, setPendingTx, tick, setTick])

  return (
    <div className={clsx(
      "fixed left-0 bottom-0 w-full",
      { "hidden": !pendingTx }
    )}>
      {pendingTx && (
        <div className="flex items-center justify-center font-din-pro p-4 bg-blue-cadet">
          <div className="relative w-8 h-8 mr-3">
            <Image src={ClockImage.src} layout="fill" alt="clock" />
          </div>
          <div>Your data is being synced to Arweave</div>
          <a
            href={`https://arseed.web3infra.dev/${pendingTx.itemId}`}
            target="_blank" rel="noreferrer"
            className="font-din-alternate ml-2"
          >{pendingTx.itemId.replace(/^(.{4}).+(.{4})$/, '$1...$2')}</a>
          <ArrowPathIcon className="h-5 w-5 animate-spin ml-2" />
        </div>
      )}
    </div>
  )
}
