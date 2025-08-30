"use client"

import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import { RAFFLE_CONTRACT_ABI } from "@/lib/contract-abi"
import { parseEther, formatEther } from "viem"

// Contract address - this should be set after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS as `0x${string}`

export function useCreateRaffle() {
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_CONTRACT_ABI,
    functionName: "createRaffle",
  })

  const { data, write, isLoading, error } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const createRaffle = (
    title: string,
    description: string,
    ticketPrice: string,
    maxTickets: number,
    duration: number,
  ) => {
    if (write) {
      write({
        args: [title, description, parseEther(ticketPrice), BigInt(maxTickets), BigInt(duration)],
      })
    }
  }

  return {
    createRaffle,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    txHash: data?.hash,
  }
}

export function useGetRaffle(raffleId: number) {
  const { data, isLoading, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_CONTRACT_ABI,
    functionName: "getRaffle",
    args: [BigInt(raffleId)],
    enabled: raffleId > 0,
  })

  return {
    raffle: data
      ? {
          id: Number(data.id),
          creator: data.creator,
          title: data.title,
          description: data.description,
          ticketPrice: formatEther(data.ticketPrice),
          maxTickets: Number(data.maxTickets),
          ticketsSold: Number(data.ticketsSold),
          endTime: Number(data.endTime),
          winner: data.winner,
          isActive: data.isActive,
          isCompleted: data.isCompleted,
          prizeAmount: formatEther(data.prizeAmount),
        }
      : null,
    isLoading,
    error,
    refetch,
  }
}

export function useGetUserRaffles(userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_CONTRACT_ABI,
    functionName: "getUserRaffles",
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress,
  })

  return {
    raffleIds: data ? data.map((id) => Number(id)) : [],
    isLoading,
    error,
    refetch,
  }
}

export function useGetActiveRaffles() {
  const { data, isLoading, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_CONTRACT_ABI,
    functionName: "getActiveRaffles",
  })

  return {
    raffleIds: data ? data.map((id) => Number(id)) : [],
    isLoading,
    error,
    refetch,
  }
}

export function useCancelRaffle() {
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_CONTRACT_ABI,
    functionName: "cancelRaffle",
  })

  const { data, write, isLoading, error } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const cancelRaffle = (raffleId: number) => {
    if (write) {
      write({
        args: [BigInt(raffleId)],
      })
    }
  }

  return {
    cancelRaffle,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    txHash: data?.hash,
  }
}

export function useCompleteRaffle() {
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: RAFFLE_CONTRACT_ABI,
    functionName: "completeRaffle",
  })

  const { data, write, isLoading, error } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const completeRaffle = (raffleId: number) => {
    if (write) {
      write({
        args: [BigInt(raffleId)],
      })
    }
  }

  return {
    completeRaffle,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    txHash: data?.hash,
  }
}
