import clsx from 'clsx'
import Link from 'next/link'
// import useSWR from 'swr'
import { useState, useEffect, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { authTokenState, walletAddressState } from '@/lib/recoil/wallet'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import type { EverpayTx } from '@/lib/arweave'


export default function PendingTx() {
  const authToken = useRecoilValue(authTokenState)
  const walletAddress = useRecoilValue(walletAddressState)
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
