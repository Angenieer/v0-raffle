"use client"

import { useState, useCallback } from "react"
import { usePolkadot } from "@/components/polkadot-provider"
import { createContractInstance } from "@/lib/polkadot-config"
import { toast } from "sonner"

export interface RaffleInfo {
  organizer: string
  maxTickets: number
  ticketPrice: string
  feePercent: number
  stakePercent: number
  ticketsSold: number
  winner: string | null
  isClosed: boolean
  totalStake: string
}

export function useRaffleContract() {
  const { api, selectedAccount, getSigner } = usePolkadot()
  const [isLoading, setIsLoading] = useState(false)

  const createRaffle = useCallback(
    async (maxTickets: number, ticketPrice: string, feePercent: number, stakePercent: number) => {
      if (!api || !selectedAccount) {
        toast.error("Please connect your wallet first")
        return null
      }

      setIsLoading(true)
      try {
        const contract = await createContractInstance(api)
        if (!contract) {
          throw new Error("Contract not available")
        }

        const signer = await getSigner()

        // Convert DOT to planck (smallest unit)
        const ticketPriceInPlanck = api.createType("Balance", ticketPrice)

        const { gasRequired } = await contract.query.createRaffle(
          selectedAccount.address,
          { gasLimit: -1, storageDepositLimit: null },
          maxTickets,
          ticketPriceInPlanck,
          feePercent,
          stakePercent,
        )

        const tx = contract.tx.createRaffle(
          { gasLimit: gasRequired, storageDepositLimit: null },
          maxTickets,
          ticketPriceInPlanck,
          feePercent,
          stakePercent,
        )

        await tx.signAndSend(selectedAccount.address, { signer }, (result) => {
          if (result.status.isInBlock) {
            toast.success("Raffle created successfully!")
          } else if (result.status.isFinalized) {
            console.log("Transaction finalized")
          }
        })

        return true
      } catch (error) {
        console.error("Error creating raffle:", error)
        toast.error("Failed to create raffle")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [api, selectedAccount, getSigner],
  )

  const buyTicket = useCallback(
    async (raffleId: number, ticketPrice: string) => {
      if (!api || !selectedAccount) {
        toast.error("Please connect your wallet first")
        return false
      }

      setIsLoading(true)
      try {
        const contract = await createContractInstance(api)
        if (!contract) {
          throw new Error("Contract not available")
        }

        const signer = await getSigner()
        const ticketPriceInPlanck = api.createType("Balance", ticketPrice)

        const { gasRequired } = await contract.query.buyTicket(
          selectedAccount.address,
          { gasLimit: -1, storageDepositLimit: null, value: ticketPriceInPlanck },
          raffleId,
        )

        const tx = contract.tx.buyTicket(
          { gasLimit: gasRequired, storageDepositLimit: null, value: ticketPriceInPlanck },
          raffleId,
        )

        await tx.signAndSend(selectedAccount.address, { signer }, (result) => {
          if (result.status.isInBlock) {
            toast.success("Ticket purchased successfully!")
          }
        })

        return true
      } catch (error) {
        console.error("Error buying ticket:", error)
        toast.error("Failed to buy ticket")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [api, selectedAccount, getSigner],
  )

  const closeRaffle = useCallback(
    async (raffleId: number) => {
      if (!api || !selectedAccount) {
        toast.error("Please connect your wallet first")
        return false
      }

      setIsLoading(true)
      try {
        const contract = await createContractInstance(api)
        if (!contract) {
          throw new Error("Contract not available")
        }

        const signer = await getSigner()

        const { gasRequired } = await contract.query.closeRaffle(
          selectedAccount.address,
          { gasLimit: -1, storageDepositLimit: null },
          raffleId,
        )

        const tx = contract.tx.closeRaffle({ gasLimit: gasRequired, storageDepositLimit: null }, raffleId)

        await tx.signAndSend(selectedAccount.address, { signer }, (result) => {
          if (result.status.isInBlock) {
            toast.success("Raffle closed and winner selected!")
          }
        })

        return true
      } catch (error) {
        console.error("Error closing raffle:", error)
        toast.error("Failed to close raffle")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [api, selectedAccount, getSigner],
  )

  const getRaffleInfo = useCallback(
    async (raffleId: number): Promise<RaffleInfo | null> => {
      if (!api) return null

      try {
        const contract = await createContractInstance(api)
        if (!contract) return null

        const { result, output } = await contract.query.getRaffleInfo(
          selectedAccount?.address || "",
          { gasLimit: -1, storageDepositLimit: null },
          raffleId,
        )

        if (result.isOk && output) {
          return output.toHuman() as RaffleInfo
        }
        return null
      } catch (error) {
        console.error("Error getting raffle info:", error)
        return null
      }
    },
    [api, selectedAccount],
  )

  return {
    createRaffle,
    buyTicket,
    closeRaffle,
    getRaffleInfo,
    isLoading,
  }
}
