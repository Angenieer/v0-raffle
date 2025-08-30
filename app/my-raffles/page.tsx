"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePolkadot } from "@/components/polkadot-provider"
import { useRaffleContract } from "@/hooks/use-raffle-contract"
import { ArrowLeft, Ticket, Trophy, Users, DollarSign, Play, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface MyRaffle {
  id: number
  maxTickets: number
  ticketPrice: string
  ticketsSold: number
  isClosed: boolean
  winner: string | null
  totalStake: string
  createdAt: Date
}

export default function MyRafflesPage() {
  const router = useRouter()
  const { isConnected, selectedAccount } = usePolkadot()
  const { closeRaffle, isLoading } = useRaffleContract()
  const [myRaffles, setMyRaffles] = useState<MyRaffle[]>([])

  // Mock data for demonstration
  useEffect(() => {
    if (isConnected && selectedAccount) {
      // In a real app, fetch user's raffles from the contract
      setMyRaffles([
        {
          id: 1,
          maxTickets: 100,
          ticketPrice: "0.1",
          ticketsSold: 45,
          isClosed: false,
          winner: null,
          totalStake: "0.675",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          maxTickets: 50,
          ticketPrice: "0.2",
          ticketsSold: 50,
          isClosed: true,
          winner: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          totalStake: "1.5",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ])
    }
  }, [isConnected, selectedAccount])

  const handleCloseRaffle = async (raffleId: number) => {
    const success = await closeRaffle(raffleId)
    if (success) {
      // Refresh raffles list
      setMyRaffles((prev) => prev.map((raffle) => (raffle.id === raffleId ? { ...raffle, isClosed: true } : raffle)))
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">My Raffles</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to view your raffles</p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">My Raffles</h1>
                <p className="text-muted-foreground">Manage your created raffles</p>
              </div>
            </div>
            <Link href="/create">
              <Button>Create New Raffle</Button>
            </Link>
          </div>

          {myRaffles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No raffles yet</h3>
                <p className="text-muted-foreground mb-4">Create your first raffle to get started</p>
                <Link href="/create">
                  <Button>Create Raffle</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myRaffles.map((raffle) => (
                <Card key={raffle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Ticket className="w-5 h-5" />
                        Raffle #{raffle.id}
                      </CardTitle>
                      <Badge variant={raffle.isClosed ? "secondary" : "default"}>
                        {raffle.isClosed ? "Closed" : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>Created {raffle.createdAt.toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tickets Sold</p>
                          <p className="font-semibold">
                            {raffle.ticketsSold} / {raffle.maxTickets}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Ticket Price</p>
                          <p className="font-semibold">{raffle.ticketPrice} DOT</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{Math.round((raffle.ticketsSold / raffle.maxTickets) * 100)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(raffle.ticketsSold / raffle.maxTickets) * 100}%` }}
                        />
                      </div>
                    </div>

                    {raffle.isClosed && raffle.winner && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">Winner Selected</span>
                        </div>
                        <p className="text-sm text-green-600 font-mono mt-1">{formatAddress(raffle.winner)}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {!raffle.isClosed && raffle.ticketsSold > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleCloseRaffle(raffle.id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {isLoading ? "Closing..." : "Close & Draw"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
