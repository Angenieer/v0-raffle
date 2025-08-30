"use client"

import { useState, useEffect, useCallback } from "react"
import type { ApiPromise } from "@polkadot/api"
import type { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types"
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp"
import { initPolkadotApi } from "@/lib/polkadot-config"

interface PolkadotWalletState {
  api: ApiPromise | null
  accounts: InjectedAccountWithMeta[]
  selectedAccount: InjectedAccountWithMeta | null
  extension: InjectedExtension | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

export function usePolkadotWallet() {
  const [state, setState] = useState<PolkadotWalletState>({
    api: null,
    accounts: [],
    selectedAccount: null,
    extension: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  })

  // Inicializar API de Polkadot
  useEffect(() => {
    const initApi = async () => {
      try {
        const api = await initPolkadotApi()
        setState((prev) => ({ ...prev, api }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Failed to connect to Polkadot network: ${error}`,
        }))
      }
    }

    initApi()
  }, [])

  // Conectar wallet
  const connectWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Habilitar extensiones
      const extensions = await web3Enable("Polkadot Raffle DApp")

      if (extensions.length === 0) {
        throw new Error("No Polkadot extension found. Please install Polkadot.js extension.")
      }

      // Obtener cuentas
      const accounts = await web3Accounts()

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in your Polkadot extension.")
      }

      // Seleccionar primera cuenta por defecto
      const selectedAccount = accounts[0]
      const extension = extensions[0]

      setState((prev) => ({
        ...prev,
        accounts,
        selectedAccount,
        extension,
        isConnected: true,
        isConnecting: false,
      }))

      // Guardar en localStorage
      localStorage.setItem("polkadot-selected-account", selectedAccount.address)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
        isConnecting: false,
      }))
    }
  }, [])

  // Desconectar wallet
  const disconnectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      accounts: [],
      selectedAccount: null,
      extension: null,
      isConnected: false,
      error: null,
    }))
    localStorage.removeItem("polkadot-selected-account")
  }, [])

  // Seleccionar cuenta
  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setState((prev) => ({ ...prev, selectedAccount: account }))
    localStorage.setItem("polkadot-selected-account", account.address)
  }, [])

  // Obtener signer para transacciones
  const getSigner = useCallback(async () => {
    if (!state.selectedAccount) {
      throw new Error("No account selected")
    }

    const injector = await web3FromAddress(state.selectedAccount.address)
    return injector.signer
  }, [state.selectedAccount])

  // Restaurar conexión al cargar
  useEffect(() => {
    const savedAddress = localStorage.getItem("polkadot-selected-account")
    if (savedAddress && !state.isConnected) {
      connectWallet()
    }
  }, [connectWallet, state.isConnected])

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    selectAccount,
    getSigner,
  }
}
