import clsx from 'clsx'
import Link from 'next/link'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useRecoilState } from 'recoil'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { useArOwner, EIP_712_AUTH } from '@/lib/auth'
import TransitionDialog from '@/components/TransitionDialog'

const WEB3: {
  getModal: Function,
  providerOptions: any,
  _modal: Web3Modal | null
} = {
  providerOptions: {},
  getModal: function() {
    if (!this._modal) {
      this._modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions: this.providerOptions,
      })
    }
    return this._modal
  },
  _modal: null,
}

export default function ConnectButton() {
  const [ownerKey, ownerAddress] = useArOwner()  // not usefull for the moment

  const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState)
  const [authToken, setAuthToken] = useRecoilState(authTokenState)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(() => {
    const web3Modal = WEB3.getModal()
    web3Modal.connect().then(async (instance: any) => {
      const provider = new ethers.providers.Web3Provider(instance)
      const signer = provider.getSigner()
      const address = ethers.utils.getAddress(await signer.getAddress())
      setWalletAddress(address)
    }).catch((err: any) => {
      console.log(err)
    })
  }, [setWalletAddress])

  const disconnect = useCallback(() => {
    const web3Modal = WEB3.getModal()
    web3Modal.clearCachedProvider()
    window.localStorage.removeItem('auth-token')
    setWalletAddress(null)
    setAuthToken(null)
  }, [setWalletAddress, setAuthToken])

  const signMessage = useCallback(() => {
    const dispatch = async () => {
      const web3Modal = WEB3.getModal()
      const instance = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(instance)
      const signer = provider.getSigner()
      const address = ethers.utils.getAddress(await signer.getAddress())
      const value = {
        intent: 'Verify ownership of the address',
        wallet: address,
        expire: new Date().valueOf() + 86400 * 1000 * 7  // 7 days
      }
      const signature = await signer._signTypedData(EIP_712_AUTH.domain, EIP_712_AUTH.types, value)
      // ethers.utils.verifyTypedData(IP_712_AUTH.domain, EIP_712_AUTH.types, value, signature)
      const authTokenData = { value, signature }
      const authToken = btoa(JSON.stringify(authTokenData))
      window.localStorage.setItem('auth-token', authToken)
      setAuthToken(authToken)
    }
    dispatch().catch(err => {
      console.log(err)
    })
  }, [setAuthToken])

  const connectStep = useMemo(() => {
    if (!connecting) {
      return 0
    } else if (!walletAddress && !authToken) {
      return 1
    } else if (walletAddress && !authToken) {
      return 2
    }
  }, [connecting, walletAddress, authToken])

  useEffect(function() {
    const web3Modal = WEB3.getModal()
    if (web3Modal.cachedProvider) {
      connect()
    }
    const authToken = window.localStorage.getItem('auth-token')
    if (authToken) {
      const payload = JSON.parse(atob(authToken))
      if (payload.value.expire > new Date().valueOf()) {
        setAuthToken(authToken)
      }
    }
  }, [setAuthToken, connect])

  if (walletAddress && authToken) {
    return (
      <>
        <Link href={`/${walletAddress}`}>
          <a className="inline-block text-xs sm:text-sm py-1 mx-4">
            {walletAddress.toLowerCase().replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')}
          </a>
        </Link>
        <button className={clsx(
          "border border-white hover:border-white/75 hover:text-white/75",
          "rounded text-xs sm:text-sm px-4 py-1 mx-2",
        )} onClick={() => disconnect()}>Logout</button>
      </>
    )
  } else {
    return (
      <>
        <button className={clsx(
          "border border-white hover:border-white/75 hover:text-white/75",
          "rounded-full text-xs sm:text-sm px-4 py-1 mx-4",
        )} onClick={() => setConnecting(true)}>Login</button>
        <TransitionDialog open={connecting} onClose={() => setConnecting(false)}>
          {connectStep === 1 && <div className="flex flex-col items-center">
            <div className="text-2xl font-medium">Step 1</div>
            <div className="text-center my-8 text-neutral-500">
              Connect your wallet
            </div>
            <button className={clsx(
              "rounded-md py-2 px-8 text-sm text-white",
              "bg-neutral-900 hover:bg-neutral-800",
            )} onClick={() => connect()}>Connect</button>
          </div>}
          {connectStep === 2 && <div className="flex flex-col items-center">
            <div className="text-2xl font-medium">Step 2</div>
            <div className="text-center my-8 text-neutral-500">
              Sign a message with your wallet {walletAddress}
            </div>
            <button className={clsx(
              "rounded-md py-2 px-8 text-sm text-white",
              "bg-neutral-900 hover:bg-neutral-800",
            )} onClick={() => signMessage()}>Sign Message</button>
          </div>}
        </TransitionDialog>
      </>
    )
  }

}
