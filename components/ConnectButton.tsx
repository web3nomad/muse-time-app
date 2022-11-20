import clsx from 'clsx'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useEthereumContext } from '@/lib/ethereum/context'
import { chainId } from '@/lib/ethereum/public'
import TransitionDialog from '@/components/TransitionDialog'

export default function ConnectButton() {
  const {
    walletAddress,
    authToken,
    signerErrorMessage,
    login,
    logout,
  } = useEthereumContext()

  const switchChain = useCallback(async () => {
    // TODO: improve this, for the moment we only handle switch chain for metamask
    try {
      await (global as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + (chainId).toString(16) }],
      })
      global.location.reload()
    } catch(err) {}
  }, [])

  if (signerErrorMessage) {
    if (signerErrorMessage === 'Wrong network') {
      return (
        <div className="text-red-400 font-bold cursor-pointer"
          onClick={() => switchChain()}>{signerErrorMessage}</div>
      )
    } else {
      return <div className="text-red-400 font-bold">{signerErrorMessage}</div>
    }
  } else if (walletAddress && authToken) {
    return (
      <>
        <Link href={`/${walletAddress}`}>
          <a className="inline-block text-xs sm:text-sm py-1 mx-4 font-din-alternate">
            {walletAddress.toLowerCase().replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')}
          </a>
        </Link>
        <button className={clsx(
          "border border-current hover:opacity-75 transition-opacity",
          "rounded text-xs sm:text-sm px-4 py-1 mx-2",
        )} onClick={() => logout()}>Logout</button>
      </>
    )
  } else {
    return (
      <button className={clsx(
        "border border-current hover:opacity-75 transition-opacity",
        "rounded text-xs sm:text-sm px-4 py-1 mx-4",
      )} onClick={() => login()}>Login</button>
    )
  }

}
