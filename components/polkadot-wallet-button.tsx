"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Wallet, ChevronDown, Copy, LogOut } from "lucide-react"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import { toast } from "sonner"

export function PolkadotWalletButton() {
  const {
    isConnecting,
    isConnected,
    selectedAccount,
    accounts,
    connectWallet,
    disconnectWallet,
    selectAccount,
    error,
  } = usePolkadotWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button onClick={connectWallet} disabled={isConnecting} className="bg-pink-600 hover:bg-pink-700 text-white">
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        {error && <p className="text-sm text-red-500 max-w-xs text-right">{error}</p>}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="font-mono text-sm">
            {selectedAccount ? formatAddress(selectedAccount.address) : "No Account"}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-medium">Connected Account</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </div>
          {selectedAccount && (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedAccount.meta.name || "Unnamed Account"}</span>
                <Button variant="ghost" size="sm" onClick={() => copyAddress(selectedAccount.address)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-1">{selectedAccount.address}</p>
            </div>
          )}
        </div>

        {accounts.length > 1 && (
          <>
            <div className="p-2">
              <span className="text-sm font-medium text-muted-foreground">Switch Account</span>
            </div>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.address}
                onClick={() => selectAccount(account)}
                className={`cursor-pointer ${selectedAccount?.address === account.address ? "bg-muted" : ""}`}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{account.meta.name || "Unnamed Account"}</span>
                  <span className="font-mono text-xs text-muted-foreground">{formatAddress(account.address)}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
