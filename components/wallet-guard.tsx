"use client"

import type React from "react"

import { useAccount } from "wagmi"
import { WalletConnectButton } from "./wallet-connect-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface WalletGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function WalletGuard({ children, fallback }: WalletGuardProps) {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet to access this feature</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <WalletConnectButton />
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
