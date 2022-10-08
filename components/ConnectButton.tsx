import clsx from 'clsx'
import Link from 'next/link'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useEthereumContext } from '@/lib/ethereum/context'
import { SignatureMessageData, AuthTokenPayload, EIP_712_AUTH } from '@/lib/auth'
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
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner|null>(null)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const {
    walletAddress,
    authToken,
    setSignerAndAuth,
    clearSignerAndAuth,
    signerErrorMessage,
  } = useEthereumContext()

  const connect = useCallback(() => {
    const web3Modal = WEB3.getModal()
    web3Modal.connect().then(async (instance: any) => {
      const provider = new ethers.providers.Web3Provider(instance)
      setSigner(provider.getSigner())
    }).catch((err: any) => {
      console.log(err)
    })
  }, [setSigner])

  const disconnect = useCallback(() => {
    const web3Modal = WEB3.getModal()
    web3Modal.clearCachedProvider()
    window.localStorage.removeItem('auth-token')
    clearSignerAndAuth()
  }, [clearSignerAndAuth])

  const signMessage = useCallback(() => {
    if (!signer) {
      throw new Error('signer should not be null')
    }
    const dispatch = async () => {
      const address = ethers.utils.getAddress(await signer.getAddress())
      const value: SignatureMessageData = {
        intent: 'Verify ownership of the address',
        wallet: address,
        expire: new Date().valueOf() + 86400 * 1000 * 7  // 7 days
      }
      const signature = await signer._signTypedData(EIP_712_AUTH.domain, EIP_712_AUTH.types, value)
      // ethers.utils.verifyTypedData(IP_712_AUTH.domain, EIP_712_AUTH.types, value, signature)
      const authTokenPayload: AuthTokenPayload = { value, signature }
      const authToken = btoa(JSON.stringify(authTokenPayload))
      // save context
      window.localStorage.setItem('auth-token', authToken)
      setSignerAndAuth(signer, authToken)
      setConnectDialogOpen(false)
    }
    dispatch().catch(err => {
      console.log(err)
    })
  }, [signer, setSignerAndAuth])

  const loadSignerAndAuthFromClient = useCallback(() => {
    // load auth and signer
    let authToken: string|null = null
    let payload: AuthTokenPayload|null = null
    try {
      authToken = window.localStorage.getItem('auth-token') ?? null
      payload = JSON.parse(atob(authToken as string))
      if (payload!.value.expire <= new Date().valueOf()) {
        throw new Error('token expired')
      }
    } catch(err) {
      authToken = null
      window.localStorage.removeItem('auth-token')
    }
    const web3Modal = WEB3.getModal()
    if (authToken && payload && web3Modal.cachedProvider) {
      web3Modal.connect().then(async (instance: any) => {
        const provider = new ethers.providers.Web3Provider(instance)
        const signer = provider.getSigner()
        const walletAddress = ethers.utils.getAddress(await signer.getAddress())
        if (payload!.value.wallet === walletAddress) {
          setSignerAndAuth(signer, authToken!)
        }
      }).catch((err: any) => {
        console.log(err)
      })
    }
  }, [setSignerAndAuth])

  useEffect(() => {
    loadSignerAndAuthFromClient()
  }, [loadSignerAndAuthFromClient])

  if (signerErrorMessage) {
    return <div className="text-amber-400 font-bold">{signerErrorMessage}</div>
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
        )} onClick={() => disconnect()}>Logout</button>
      </>
    )
  } else {
    return (
      <>
        <button className={clsx(
          "border border-current hover:opacity-75 transition-opacity",
          "rounded text-xs sm:text-sm px-4 py-1 mx-4",
        )} onClick={() => setConnectDialogOpen(true)}>Login</button>
        <TransitionDialog open={connectDialogOpen} onClose={() => setConnectDialogOpen(false)}>
          {!signer ? (
            <div className="flex flex-col items-center">
              <div className="text-2xl font-medium">Step 1</div>
              <div className="text-center my-8 text-neutral-500">
                Connect your wallet
              </div>
              <button className={clsx(
                "rounded-md py-2 px-8 text-sm text-white",
                "bg-neutral-900 hover:bg-neutral-800",
              )} onClick={() => connect()}>Connect</button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-2xl font-medium">Step 2</div>
              <div className="text-center my-8 text-neutral-500">
                Sign a message with your wallet
              </div>
              <button className={clsx(
                "rounded-md py-2 px-8 text-sm text-white",
                "bg-neutral-900 hover:bg-neutral-800",
              )} onClick={() => signMessage()}>Sign Message</button>
            </div>
          )}
        </TransitionDialog>
      </>
    )
  }

}
