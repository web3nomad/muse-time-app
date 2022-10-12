import clsx from 'clsx'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import Image from 'next/image'
import type { TransactionResponse } from '@ethersproject/abstract-provider'
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactChild,
} from 'react'
import { SignatureMessageData, AuthTokenPayload, EIP_712_AUTH } from '@/lib/auth'
import { chainId } from '@/lib/ethereum/public'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import TransitionDialog from '@/components/TransitionDialog'
import WalletETHImage from '@/assets/images/wallet-eth.svg'
import ClockImage from '@/assets/images/clock.svg'

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
}

const WEB3: {
  getModal: () => Web3Modal,
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

type EthereumProviderState = {
  signerErrorMessage: string|null
  signer: ethers.providers.JsonRpcSigner|ethers.VoidSigner
  walletAddress: string|null
  authToken: string|null
  setSignerAndAuth: (signer: ethers.providers.JsonRpcSigner, authToken: string) => void
  clearSignerAndAuth: () => void
  sendTransaction: (method: Promise<TransactionResponse>) => void
  login: () => void
  logout: () => void
}

const EthereumContext = createContext<EthereumProviderState>({
  signerErrorMessage: null,
  signer: VOID_SIGNER,
  walletAddress: null,
  authToken: null,
  setSignerAndAuth: () => {},
  clearSignerAndAuth: () => {},
  sendTransaction: () => {},
  login: () => {},
  logout: () => {},
})

interface Props {
  children: ReactChild
}

// const TxPending = ({ tx }: { tx: TransactionResponse }) => (
//   <div className="flex items-center">
//     <span>Your transaction is being processed:</span>
//     <a
//       href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer"
//       className="font-din-alternate ml-2"
//     >{tx.hash.replace(/^0x(\w{4})\w+(\w{4})$/, '0x$1...$2')}</a>
//     <ArrowPathIcon className="h-4 w-4 animate-spin ml-2" />
//   </div>
// )

// const TxError = ({ error }: { error: any }) => (
//   <div className="break-all">{error.toString()}</div>
// )

export const EthereumContextProvider = ({ children }: Props) => {
  const [signerErrorMessage, setSignerErrorMessage] = useState<string|null>(null)
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner|ethers.VoidSigner>(VOID_SIGNER)
  const [walletAddress, setWalletAddress] = useState<string|null>(null)
  const [authToken, setAuthToken] = useState<string|null>(null)

  // const [dialogOpen, setDialogOpen] = useState<{message:any,canClose:boolean}|null>(null)
  const [pendingTx, setPendingTx] = useState<TransactionResponse|null>(null)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)

  const sendTransaction = useCallback(async (method: Promise<TransactionResponse>) => {
    // setDialogOpen({ message: 'Confirm tx in your wallet', canClose: false })
    try {
      const tx: TransactionResponse = await method
      // setDialogOpen({ message: <TxPending tx={tx} />, canClose: false })
      setPendingTx(tx)
      await tx.wait()
      setPendingTx(null)
      // setDialogOpen(null)
    } catch(error) {
      console.log(error)
      // setDialogOpen({ message: <TxError error={error} />, canClose: true })
    }
  }, [setPendingTx])

  const setSignerAndAuth = useCallback((signer: ethers.providers.JsonRpcSigner, authToken: string) => {
    Promise.all([
      signer.getAddress(),
      signer.getChainId(),
    ]).then(([address, signerChainId]) => {
      if (+chainId !== +signerChainId) {
        setSignerErrorMessage('Wrong chainId')
        return
      }
      /* after this, Web3Modal will take care of wrong networks.
      if network is changed in MetaMask, an error will be thrown by Web3Modal */
      const walletAddress = ethers.utils.getAddress(address)
      setSigner(signer)
      setWalletAddress(walletAddress)
      setAuthToken(authToken)
      setSignerErrorMessage(null)
    })
  }, [setSigner, setWalletAddress, setAuthToken])

  const clearSignerAndAuth = useCallback(() => {
    setSigner(VOID_SIGNER)
    setWalletAddress(null)
    setAuthToken(null)
    setSignerErrorMessage(null)
  }, [setWalletAddress, setAuthToken, setSignerErrorMessage])

  /* connect begin */

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
    if (signer === VOID_SIGNER) {
      throw new Error('signer should not be null')
    }
    const dispatch = async (signer: ethers.providers.JsonRpcSigner) => {
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
      AuthStorage.setToken(address, authToken)
      setSignerAndAuth(signer, authToken)
      setConnectDialogOpen(false)
    }
    dispatch(signer as ethers.providers.JsonRpcSigner).catch(err => {
      console.log(err)
    })
  }, [signer, setSignerAndAuth])

  const loadSignerAndAuthFromClient = useCallback(async () => {
    const web3Modal = WEB3.getModal()
    if (!web3Modal.cachedProvider) {
      return
    }
    let walletAddress: string
    let signer: ethers.providers.JsonRpcSigner
    try {
      const instance = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(instance)
      signer = provider.getSigner()
      walletAddress = ethers.utils.getAddress(await signer.getAddress())
    } catch(err) {
      return
    }
    try {
      const authToken: string|null = AuthStorage.getToken(walletAddress)
      const payload: AuthTokenPayload = JSON.parse(atob(authToken??''))
      if (payload.value.expire <= new Date().valueOf()) {
        AuthStorage.clearToken(walletAddress)
      }
      setSignerAndAuth(signer, authToken!)
    } catch(err) {
      return
    }
  }, [setSignerAndAuth])

  const login = useCallback(() => {
    setConnectDialogOpen(true)
    connect()  // auto trigger wallet popup
  }, [setConnectDialogOpen, connect])

  const logout = useCallback(() => {
    disconnect()
  }, [disconnect])

  useEffect(() => {
    loadSignerAndAuthFromClient()
  }, [loadSignerAndAuthFromClient])

  /* connect end */

  const value = {
    signerErrorMessage,
    signer,
    walletAddress,
    authToken,
    setSignerAndAuth,
    clearSignerAndAuth,
    sendTransaction,
    login,
    logout,
  }

  return (
    <EthereumContext.Provider value={value}>
      {children}
      {/*!!dialogOpen && (
        <TransitionDialog open={!!dialogOpen} onClose={() => dialogOpen.canClose && setDialogOpen(null) }>
          <div className="my-12 flex items-center justify-center w-full">{dialogOpen.message}</div>
        </TransitionDialog>
      )*/}
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
          {signer === VOID_SIGNER ? (
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
