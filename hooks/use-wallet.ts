"use client"

import { useAccount, useBalance, useNetwork } from "wagmi"
import { useConnectModal, useAccountModal, useChainModal } from "@rainbow-me/rainbowkit"

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const { chain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    balance,
    chain,
    openConnectModal,
    openAccountModal,
    openChainModal,
  }
}
