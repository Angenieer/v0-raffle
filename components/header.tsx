"use client"

import Link from "next/link"
import { SimpleWalletButton } from "./simple-wallet-button"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Coins, Plus } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">V0 Raffle</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/raffles" className="text-sm font-medium hover:text-primary transition-colors">
              Browse Raffles
            </Link>
            <Link href="/my-raffles" className="text-sm font-medium hover:text-primary transition-colors">
              My Raffles
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild size="sm" className="hidden sm:flex">
            <Link href="/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Raffle
            </Link>
          </Button>

          <SimpleWalletButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
