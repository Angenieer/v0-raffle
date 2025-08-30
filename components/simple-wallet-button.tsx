"use client"

import { Button } from "@/components/ui/button"
import { useSimpleWallet } from "@/hooks/use-simple-wallet"
import { Wallet, LogOut } from "lucide-react"

export function SimpleWalletButton() {
  const { account, isConnecting, error, connect, disconnect, formatAddress, isConnected } = useSimpleWallet()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">{formatAddress(account!)}</div>
        <Button variant="outline" size="sm" onClick={disconnect} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={connect} disabled={isConnecting} className="gap-2">
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <p className="text-xs text-red-500 max-w-48 text-right">{error}</p>}
    </div>
  )
}
