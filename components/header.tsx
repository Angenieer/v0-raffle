"use client"

import Link from "next/link"
import { PolkadotWalletButton } from "@/components/polkadot-wallet-button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl">Polkadot Raffle</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/raffles"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Raffles
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Create Raffle
            </Link>
            <Link
              href="/my-raffles"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Raffles
            </Link>
            <Link
              href="/results"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Results
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <PolkadotWalletButton />
        </div>
      </div>
    </header>
  )
}
