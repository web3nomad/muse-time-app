import { ethers } from 'ethers'
import { chainId } from '@/lib/ethereum/public'

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactChild,
} from 'react'

const VOID_SIGNER = new ethers.VoidSigner('0x0000000000000000000000000000000000000000')

type EthereumProviderState = {
  signer: ethers.Signer
  walletAddress: string|null
  authToken: string|null
  setSignerAndAuth: (signer: ethers.Signer, authToken: string) => void
  clearSignerAndAuth: () => void
  errorMessage: string|null
}

const EthereumContext = createContext<EthereumProviderState>({
  signer: VOID_SIGNER,
  walletAddress: null,
  authToken: null,
  setSignerAndAuth: () => {},
  clearSignerAndAuth: () => {},
  errorMessage: null,
})

interface Props {
  children: ReactChild
}

export const EthereumContextProvider = ({ children }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string|null>(null)
  const [signer, setSigner] = useState<ethers.Signer>(VOID_SIGNER)
  const [walletAddress, setWalletAddress] = useState<string|null>(null)
  const [authToken, setAuthToken] = useState<string|null>(null)

  const setSignerAndAuth = useCallback((signer: ethers.Signer, authToken: string) => {
    Promise.all([
      signer.getAddress(),
      signer.getChainId(),
    ]).then(([address, signerChainId]) => {
      if (+chainId !== +signerChainId) {
        setErrorMessage('Wrong chainId')
        return
      }
      /* after this, Web3Modal will take care of wrong networks.
      if network is changed in MetaMask, an error will be thrown by Web3Modal */
      const walletAddress = ethers.utils.getAddress(address)
      setSigner(signer)
      setWalletAddress(walletAddress)
      setAuthToken(authToken)
      setErrorMessage(null)
    })
  }, [setSigner, setWalletAddress, setAuthToken])

  const clearSignerAndAuth = useCallback(() => {
    setSigner(VOID_SIGNER)
    setWalletAddress(null)
    setAuthToken(null)
    setErrorMessage(null)
  }, [setWalletAddress, setAuthToken, setErrorMessage])

  const value = {
    signer,
    walletAddress,
    authToken,
    setSignerAndAuth,
    clearSignerAndAuth,
    errorMessage,
  }

  return (
    <EthereumContext.Provider value={value}>
      {children}
    </EthereumContext.Provider>
  )
}

export function useEthereumContext() {
  return useContext(EthereumContext)
}
