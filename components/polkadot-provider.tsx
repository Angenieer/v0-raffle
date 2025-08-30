"use client"

import { createContext, useContext, type ReactNode } from "react"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import type { ApiPromise } from "@polkadot/api"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

interface PolkadotContextType {
  api: ApiPromise | null
  selectedAccount: InjectedAccountWithMeta | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  getSigner: () => Promise<any>
}

const PolkadotContext = createContext<PolkadotContextType | undefined>(undefined)

export function PolkadotProvider({ children }: { children: ReactNode }) {
  const wallet = usePolkadotWallet()

  const contextValue: PolkadotContextType = {
    api: wallet.api,
    selectedAccount: wallet.selectedAccount,
    isConnected: wallet.isConnected,
    connectWallet: wallet.connectWallet,
    getSigner: wallet.getSigner,
  }

  return <PolkadotContext.Provider value={contextValue}>{children}</PolkadotContext.Provider>
}

export function usePolkadot() {
  const context = useContext(PolkadotContext)
  if (context === undefined) {
    throw new Error("usePolkadot must be used within a PolkadotProvider")
  }
  return context
}
