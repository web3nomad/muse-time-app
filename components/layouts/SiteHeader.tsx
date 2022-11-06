import clsx from 'clsx'
import { ethers } from 'ethers'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useEthereumContext } from '@/lib/ethereum/context'
import { controllerContract } from '@/lib/ethereum/public'
import { useTimeTrove } from '@/lib/ethereum/hooks'
import ConnectButton from '@/components/ConnectButton'
import { MuseTimeLogoIcon, MuseTimeTextIcon } from '@/components/icons'

const Balance = ({ topicOwner }: { topicOwner: string }) => {
  const { sendTransaction, signer } = useEthereumContext()
  const { timeTrove, isFetching } = useTimeTrove(topicOwner)
  const balance = useMemo(() => {
    return ethers.utils.formatEther(timeTrove?.balance || 0)
  }, [timeTrove])

  const withdraw = useCallback(async () => {
    const method = controllerContract.connect(signer).withdrawFromTimeTrove()
    await sendTransaction(method)
  }, [sendTransaction, signer])

  return (
    <div className="hidden sm:block font-din-alternate text-sm cursor-pointer" onClick={() => withdraw()}>
      <span>Trove Balance: </span>
      <span>{balance} ETH</span>
    </div>
  )
}

export default function SiteHeader({ className }: { className: string }) {
  const { walletAddress } = useEthereumContext()
  return (
    <header className={clsx(
      "h-16 px-2 sm:px-8 w-full flex items-center justify-start",
      className,
    )}>
      <Link href='/'>
        <a className="block flex items-center justify-start">
          <MuseTimeLogoIcon className="w-8 h-4 sm:w-16 sm:h-7" />
          <MuseTimeTextIcon className="w-20 h-4 sm:w-32 sm:h-7 ml-1" />
        </a>
      </Link>
      <div className="ml-auto"></div>
      {walletAddress && <Balance topicOwner={walletAddress} />}
      <ConnectButton />
    </header>
  )
}
