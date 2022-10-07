import { ethers } from 'ethers'

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactChild,
} from 'react'

type EthereumProviderState = {
  signer: ethers.Signer|null,
  walletAddress: string|null,
  authToken: string|null,
  setSignerAndAuth: () => void,
  clearSignerAndAuth: () => void,
}

const EthereumContext = createContext<EthereumProviderState>({
  walletAddress: null,
  authToken: null,
  setSignerAndAuth: () => {},
  clearSignerAndAuth: () => {},
})

interface Props {
  children: ReactChild
}

export const EthereumContextProvider = ({ children }: Props) => {
  const [walletAddress, setWalletAddress] = useState<string|null>(null)
  const [authToken, setAuthToken] = useState<string|null>(null)

  const setSignerAndAuth = useCallback((signer: ethers.Signer, authToken: string) => {
    signer.getAddress().then((address) => {
      const walletAddress = ethers.utils.getAddress(address)
      setWalletAddress(walletAddress)
      setAuthToken(authToken)
    })
  }, [setWalletAddress, setAuthToken])

  const clearSignerAndAuth = useCallback(() => {
    setWalletAddress(null)
    setAuthToken(null)
  }, [setWalletAddress, setAuthToken])

  const value = {
    walletAddress,
    authToken,
    setSignerAndAuth,
    clearSignerAndAuth,
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
