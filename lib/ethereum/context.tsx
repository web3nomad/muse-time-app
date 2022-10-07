import { ethers } from 'ethers'
import type { TransactionResponse } from '@ethersproject/abstract-provider'
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactChild,
} from 'react'
import { chainId } from '@/lib/ethereum/public'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import TransitionDialog from '@/components/TransitionDialog'

const VOID_SIGNER = new ethers.VoidSigner('0x0000000000000000000000000000000000000000')

type EthereumProviderState = {
  signerErrorMessage: string|null
  signer: ethers.Signer
  walletAddress: string|null
  authToken: string|null
  setSignerAndAuth: (signer: ethers.Signer, authToken: string) => void
  clearSignerAndAuth: () => void
  sendTransaction: (method: Promise<TransactionResponse>) => void
}

const EthereumContext = createContext<EthereumProviderState>({
  signerErrorMessage: null,
  signer: VOID_SIGNER,
  walletAddress: null,
  authToken: null,
  setSignerAndAuth: () => {},
  clearSignerAndAuth: () => {},
  sendTransaction: () => {},
})

interface Props {
  children: ReactChild
}

const TxPending = ({ tx }: { tx: TransactionResponse }) => (
  <div className="flex items-center">
    <span>Your transaction is being processed:</span>
    <a
      href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer"
      className="font-din-alternate ml-2"
    >{tx.hash.replace(/0x(\w{4})\w+(\w{4})/, '0x$1...$2')}</a>
    <ArrowPathIcon className="h-4 w-4 animate-spin ml-2" />
  </div>
)

const TxError = ({ error }: { error: any }) => (
  <div className="break-all">{error.toString()}</div>
)

export const EthereumContextProvider = ({ children }: Props) => {
  const [signerErrorMessage, setSignerErrorMessage] = useState<string|null>(null)
  const [signer, setSigner] = useState<ethers.Signer>(VOID_SIGNER)
  const [walletAddress, setWalletAddress] = useState<string|null>(null)
  const [authToken, setAuthToken] = useState<string|null>(null)

  const [dialogOpen, setDialogOpen] = useState<{message:any,canClose:boolean}|null>(null)

  const sendTransaction = useCallback((method: Promise<TransactionResponse>) => {
    setDialogOpen({ message: 'Confirm tx in your wallet', canClose: false })
    method.then(async (tx: TransactionResponse) => {
      setDialogOpen({ message: <TxPending tx={tx} />, canClose: false })
      await tx.wait()
      setDialogOpen(null)
      window.location.reload()
    }).catch(error => {
      console.log(error)
      setDialogOpen({ message: <TxError error={error} />, canClose: true })
    })
  }, [setDialogOpen])

  const setSignerAndAuth = useCallback((signer: ethers.Signer, authToken: string) => {
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

  const value = {
    signerErrorMessage,
    signer,
    walletAddress,
    authToken,
    setSignerAndAuth,
    clearSignerAndAuth,
    sendTransaction,
  }

  return (
    <EthereumContext.Provider value={value}>
      {children}
      {!!dialogOpen && (
        <TransitionDialog
          open={!!dialogOpen}
          onClose={() => dialogOpen.canClose && setDialogOpen(null) }
        ><div className="my-12 flex items-center justify-center w-full">{dialogOpen.message}</div></TransitionDialog>
      )}
    </EthereumContext.Provider>
  )
}

export function useEthereumContext() {
  return useContext(EthereumContext)
}
