import clsx from 'clsx'
import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { IProviderOptions } from "web3modal";
import Image from 'next/image'
import type { TransactionResponse } from '@ethersproject/abstract-provider'
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactChild,
} from 'react'
import { SignatureMessageData, AuthTokenPayload, EIP_712_AUTH } from '@/lib/auth'
import { chainId, publicProvider } from '@/lib/ethereum/public'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import TransitionDialog from '@/components/TransitionDialog'
import WalletETHImage from '@/assets/images/wallet-eth.svg'
import ClockImage from '@/assets/images/clock.svg'

type JsonRpcSigner = ethers.providers.JsonRpcSigner
type VoidSigner = ethers.VoidSigner

const VOID_SIGNER = new ethers.VoidSigner('0x0000000000000000000000000000000000000000')
const AuthStorage = {
  authStorageKey(address: string) {
    return `auth/musetime/${address}`
  },
  setToken(address: string, token: string) {
    localStorage.setItem(this.authStorageKey(address), token)
  },
  getToken(address: string): string|null {
    return localStorage.getItem(this.authStorageKey(address))
  },
  clearToken(address: string) {
    localStorage.removeItem(this.authStorageKey(address))
  },
  clearTokens() {
    try {
      const keys = Object.keys(localStorage).filter((key) => /^auth\/musetime\//.test(key))
      keys.forEach(key => localStorage.removeItem(key))
    } catch(err) {}
  }
}

const WEB3: {
  listenToWallet: (web3Connection: any, callback: (addresses: string[]) => void) => void
  getModal: () => Web3Modal
  providerOptions: IProviderOptions
  _web3Connection?: any
  _web3ConnectionCallback?: any
  _modal?: Web3Modal
} = {
  listenToWallet: function(web3Connection, callback) {
    if (this._web3Connection?.removeListener && this._web3ConnectionCallback) {
      this._web3Connection.removeListener('accountsChanged', this._web3ConnectionCallback)
    }
    this._web3Connection = web3Connection
    this._web3ConnectionCallback = callback
    this._web3Connection.on('accountsChanged', this._web3ConnectionCallback)
  },
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
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          [chainId]: [publicProvider.connection.url]
        },
      },
    },
  },
}

type EthereumProviderState = {
  signerErrorMessage: string|null
  signer: JsonRpcSigner|VoidSigner
  walletAddress: string|null
  authToken: string|null
  sendTransaction: (method: Promise<TransactionResponse>) => void
  login: () => void
  logout: () => void
}

const EthereumContext = createContext<EthereumProviderState>({
  signerErrorMessage: null,
  signer: VOID_SIGNER,
  walletAddress: null,
  authToken: null,
  sendTransaction: () => {},
  login: () => {},
  logout: () => {},
})

interface Props {
  children: ReactChild
}

export const EthereumContextProvider = ({ children }: Props) => {
  const [signerErrorMessage, setSignerErrorMessage] = useState<string|null>(null)
  const [web3Connection, setWeb3Connection] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string|null>(null)
  const [authToken, setAuthToken] = useState<string|null>(null)

  const [pendingTx, setPendingTx] = useState<TransactionResponse|null>(null)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)

  const signer: JsonRpcSigner|VoidSigner = useMemo(() => {
    if (web3Connection) {
      const provider = new ethers.providers.Web3Provider(web3Connection)
      return provider.getSigner()
    } else {
      return VOID_SIGNER
    }
  }, [web3Connection])

  const sendTransaction = useCallback(async (method: Promise<TransactionResponse>) => {
    try {
      const tx: TransactionResponse = await method
      setPendingTx(tx)
      await tx.wait()
      setPendingTx(null)
    } catch(error) {
      console.log(error)
    }
  }, [setPendingTx])

  const clearWeb3Auth = useCallback(() => {
    setWalletAddress(null)
    setAuthToken(null)
    setSignerErrorMessage(null)
  }, [setWalletAddress, setAuthToken, setSignerErrorMessage])

  const setWeb3Auth = useCallback((web3Connection: any, authToken: string) => {
    const provider = new ethers.providers.Web3Provider(web3Connection)
    const web3Signer = provider.getSigner()
    Promise.all([
      web3Signer.getAddress(),
      web3Signer.getChainId(),
    ]).then(([address, signerChainId]) => {
      if (+chainId !== +signerChainId) {
        setSignerErrorMessage('Wrong chainId')
        return
      }
      /* after this, Web3Modal will take care of wrong networks.
      if network is changed in MetaMask, an error will be thrown by Web3Modal */
      const walletAddress = ethers.utils.getAddress(address)
      setWalletAddress(walletAddress)
      setAuthToken(authToken)
      setSignerErrorMessage(null)
    })
  }, [setWalletAddress, setAuthToken, setSignerErrorMessage])

  /* connect begin */

  const disconnect = useCallback(() => {
    const web3Modal = WEB3.getModal()
    web3Modal.clearCachedProvider()
    setWeb3Connection(null)
    clearWeb3Auth()
    AuthStorage.clearTokens()
  }, [clearWeb3Auth])

  const connect = useCallback(async () => {
    const web3Modal = WEB3.getModal()
    try {
      const web3Connection = await web3Modal.connect()
      setWeb3Connection(web3Connection)
    } catch(err) {
      console.log(err)
    }
  }, [setWeb3Connection])

  const signMessage = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(web3Connection)
    const web3Signer = provider.getSigner()
    const address = ethers.utils.getAddress(await web3Signer.getAddress())
    const value: SignatureMessageData = {
      intent: 'Verify ownership of the address',
      wallet: address,
      expire: new Date().valueOf() + 86400 * 1000 * 7  // 7 days
    }
    const signature = await web3Signer._signTypedData(EIP_712_AUTH.domain, EIP_712_AUTH.types, value)
    // ethers.utils.verifyTypedData(IP_712_AUTH.domain, EIP_712_AUTH.types, value, signature)
    const authTokenPayload: AuthTokenPayload = { value, signature }
    const authToken = btoa(JSON.stringify(authTokenPayload))
    // save context
    AuthStorage.setToken(address, authToken)
    setWeb3Auth(web3Connection, authToken)
    setConnectDialogOpen(false)
  }, [web3Connection, setWeb3Auth, setConnectDialogOpen])

  var loadSignerAndAuthFromClient = useCallback(async () => {
    const web3Modal = WEB3.getModal()
    if (!web3Modal.cachedProvider) {
      return
    }
    let web3Connection: any
    let walletAddress: string
    let authToken: string|null
    try {
      web3Connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(web3Connection)
      const web3Signer: JsonRpcSigner = provider.getSigner()
      walletAddress = ethers.utils.getAddress(await web3Signer.getAddress())
      authToken = AuthStorage.getToken(walletAddress)
    } catch(err) {
      console.log(err)
      return
    }
    if (!authToken) {
      return
    }
    try {
      const payload: AuthTokenPayload = JSON.parse(atob(authToken))
      if (payload.value.expire <= new Date().valueOf()) {
        throw new Error('token expired')
      }
    } catch(err) {
      console.log(err)
      AuthStorage.clearToken(walletAddress)
      return
    }
    setWeb3Connection(web3Connection)
    setWeb3Auth(web3Connection, authToken)
  }, [setWeb3Auth])

  const login = useCallback(() => {
    setConnectDialogOpen(true)
    // connect()  // do not auto trigger wallet popup
  }, [setConnectDialogOpen])

  const logout = useCallback(() => {
    disconnect()
  }, [disconnect])

  useEffect(() => {
    loadSignerAndAuthFromClient()
  }, [loadSignerAndAuthFromClient])

  useEffect(() => {
    if (!web3Connection) {
      return
    }
    WEB3.listenToWallet(web3Connection, async ([ walletAddress ]: string[]) => {
      console.log(`Wallet changed to ${walletAddress}`)
      clearWeb3Auth()
      loadSignerAndAuthFromClient()
    })
  }, [web3Connection, clearWeb3Auth, loadSignerAndAuthFromClient])

  /* connect end */

  const value = {
    signerErrorMessage,
    signer,
    walletAddress,
    authToken,
    sendTransaction,
    login,
    logout,
  }

  return (
    <EthereumContext.Provider value={value}>
      {children}
      {pendingTx && (
        <div className={clsx(
          "fixed left-0 bottom-0 w-full p-4 font-din-pro",
          "flex items-center justify-center bg-blue-cadet"
        )}>
          <div className="relative w-8 h-8 mr-3">
            <Image src={ClockImage.src} layout="fill" alt="clock" />
          </div>
          <div>Your transaction is being processed:</div>
          <a
            href={`https://etherscan.io/tx/${pendingTx.hash}`} target="_blank" rel="noreferrer"
            className="font-din-alternate ml-2"
          >{pendingTx.hash.replace(/^0x(\w{4})\w+(\w{4})$/, '0x$1...$2')}</a>
          <ArrowPathIcon className="h-4 w-4 animate-spin ml-2" />
        </div>
      )}
      {!!connectDialogOpen && (
        <TransitionDialog open={!!connectDialogOpen} onClose={() => setConnectDialogOpen(false)}>
          {!web3Connection ? (
            <div className="">
              <div className="text-lg font-bold text-left">Step 1</div>
              <div className="relative w-16 h-16 mx-auto mt-8 mb-4">
                <Image src={WalletETHImage.src} layout="fill" alt="" />
              </div>
              <div className="text-center mb-10 font-din-pro">Connect your wallet</div>
              <div className="text-right">
                <button className={clsx(
                  "rounded-md py-2 px-8 text-sm text-white",
                  "bg-neutral-900 hover:bg-neutral-800",
                )} onClick={() => connect()}>Connect</button>
              </div>
            </div>
          ) : (
            <div className="">
              <div className="text-lg font-bold text-left">Step 2</div>
              <div className="relative w-16 h-16 mx-auto mt-8 mb-4">
                <Image src={WalletETHImage.src} layout="fill" alt="" />
              </div>
              <div className="text-center mb-10 font-din-pro">Sign a message with your wallet</div>
              <div className="text-right">
                <button className={clsx(
                  "rounded-md py-2 px-8 text-sm text-white",
                  "bg-neutral-900 hover:bg-neutral-800",
                )} onClick={() => signMessage()}>Sign Message</button>
              </div>
            </div>
          )}
        </TransitionDialog>
      )}
    </EthereumContext.Provider>
  )
}

export function useEthereumContext() {
  return useContext(EthereumContext)
}
