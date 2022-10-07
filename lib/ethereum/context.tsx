import React, { createContext, ReactChild, useContext, useState } from 'react'

type EthereumProviderState = {
  walletAddress: string,
  authToken: string,
}

const EthereumContext = createContext<EthereumProviderState>({
  walletAddress: '',
  authToken: '',
})

interface Props {
  children: ReactChild
}

export const EthereumContextProvider = ({ children }: Props) => {
  const [walletAddress, setWalletAddress] = useState<string>('abc---')

  return (
    <EthereumContext.Provider value={{
      walletAddress: walletAddress,
      authToken: '',
    }}>
      {children}
    </EthereumContext.Provider>
  )
}

export function useEthereumContext() {
  return useContext(EthereumContext)
}
