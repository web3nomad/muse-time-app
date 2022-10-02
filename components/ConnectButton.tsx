import clsx from 'clsx'
import Link from 'next/link'
import { useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { useRecoilState } from 'recoil'
import { walletAddressState, authTokenState } from '@/lib/recoil/wallet'
import { EIP_712_AUTH } from '@/lib/auth'

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

const RoundedButton = ({ onClick=()=>{}, text }: { onClick?: Function, text: string }) => {
  return (
    <button className={clsx(
      "border border-white hover:border-white/75 hover:text-white/75",
      "rounded-full text-xs sm:text-sm px-4 py-1 mx-4",
    )} onClick={() => onClick()}>{ text }</button>
  )
}

export default function ConnectButton() {
  const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState)
  const [authToken, setAuthToken] = useRecoilState(authTokenState)

  const connect = useCallback(function() {
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

  const disconnect = useCallback(function() {
    const web3Modal = WEB3.getModal()
    web3Modal.clearCachedProvider()
    window.localStorage.removeItem('auth-token')
    setWalletAddress(null)
    setAuthToken(null)
  }, [setWalletAddress, setAuthToken])

  async function signMessage() {
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

  useEffect(function() {
    const web3Modal = WEB3.getModal()
    if (web3Modal.cachedProvider) {
      connect()
    }
    // 之前有 bug, 现在看起来不需要 setTimeout
    // setTimeout(() => {
      const authToken = window.localStorage.getItem('auth-token')
      if (authToken) {
        const payload = JSON.parse(atob(authToken))
        if (payload.value.expire > new Date().valueOf()) {
          setAuthToken(authToken)
        }
      }
    // }, 0);
  }, [setAuthToken, connect])

  if (typeof window === 'undefined') {
    return <RoundedButton text="Connect Wallet" />
  } else if (walletAddress) {
    return (
      <>
        <Link href={`/${walletAddress}`}>
          <a className="inline-block text-xs sm:text-sm py-1 mx-4">
            {walletAddress.toLowerCase().replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')}
          </a>
        </Link>
        {!authToken && <RoundedButton onClick={signMessage} text="Verify" />}
        <RoundedButton onClick={disconnect} text="Disconnect" />
      </>
    )
  } else {
    return <RoundedButton onClick={connect} text="Connect Wallet" />
  }

}
