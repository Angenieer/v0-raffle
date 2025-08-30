"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSimpleWallet } from "@/hooks/use-simple-wallet"
import { Coins, Trophy, Ticket } from "lucide-react"

export default function DemoPage() {
  const { account, isConnected, connect } = useSimpleWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [tickets, setTickets] = useState(0)

  // Mock raffle data for demo
  const mockRaffle = {
    id: 1,
    title: "Demo Hackathon Raffle",
    ticketPrice: "0.01",
    maxTickets: 5,
    ticketsSold: 2,
    prizePool: "0.02",
    isCompleted: false,
    winner: null,
  }

  const handleBuyTicket = async () => {
    if (!isConnected) {
      await connect()
      return
    }

    setIsLoading(true)
    // Simulate transaction
    setTimeout(() => {
      setTickets(tickets + 1)
      setIsLoading(false)
      alert("🎉 Ticket purchased successfully! (Demo mode)")
    }, 2000)
  }

  const handleCompleteRaffle = () => {
    alert("🏆 Winner selected: " + (account ? account.slice(0, 8) + "..." : "You") + "! (Demo mode)")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            🚀 MVP Demo for Hackathon
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Live Demo - Decentralized Raffle</h1>
          <p className="text-muted-foreground">
            This is a working demo showing the core functionality of our blockchain raffle system.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Raffle Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  {mockRaffle.title}
                </CardTitle>
                <Badge variant="outline">Active</Badge>
              </div>
              <CardDescription>Demonstrating transparent, blockchain-based raffle functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Ticket className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm text-muted-foreground">Ticket Price</div>
                  <div className="font-semibold">{mockRaffle.ticketPrice} ETH</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm text-muted-foreground">Prize Pool</div>
                  <div className="font-semibold">{mockRaffle.prizePool} ETH</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tickets Sold</span>
                  <span>
                    {mockRaffle.ticketsSold + tickets}/{mockRaffle.maxTickets}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((mockRaffle.ticketsSold + tickets) / mockRaffle.maxTickets) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleBuyTicket} disabled={isLoading} className="w-full" size="lg">
                  {!isConnected
                    ? "Connect Wallet & Buy Ticket"
                    : isLoading
                      ? "Processing..."
                      : `Buy Ticket (${mockRaffle.ticketPrice} ETH)`}
                </Button>

                {tickets > 0 && (
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-green-700 dark:text-green-300 font-medium">
                      🎫 You own {tickets} ticket{tickets > 1 ? "s" : ""}
                    </div>
                  </div>
                )}

                {mockRaffle.ticketsSold + tickets >= mockRaffle.maxTickets && (
                  <Button onClick={handleCompleteRaffle} variant="outline" className="w-full bg-transparent">
                    🎲 Complete Raffle & Select Winner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demo Info */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Hackathon MVP Features</CardTitle>
              <CardDescription>What this demo showcases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Wallet Connection</div>
                    <div className="text-sm text-muted-foreground">
                      Simple MetaMask integration without complex dependencies
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Smart Contract Ready</div>
                    <div className="text-sm text-muted-foreground">
                      Simplified contract for creating raffles and buying tickets
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Transparent UI</div>
                    <div className="text-sm text-muted-foreground">
                      Real-time updates and clear raffle progress visualization
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Demo Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Currently simulated - ready for testnet deployment
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">🚀 Next Steps</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Deploy smart contract to Sepolia testnet</li>
                  <li>• Connect real blockchain transactions</li>
                  <li>• Add multiple raffle support</li>
                  <li>• Implement automated winner selection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔧 Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Frontend</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js 14 with App Router</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Custom wallet integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Smart Contract</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Solidity ^0.8.19</li>
                  <li>• Simplified raffle logic</li>
                  <li>• Pseudo-random winner selection</li>
                  <li>• Automatic prize distribution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Blockchain</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ethereum compatible</li>
                  <li>• Testnet ready (Sepolia)</li>
                  <li>• Gas optimized transactions</li>
                  <li>• Transparent & verifiable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
