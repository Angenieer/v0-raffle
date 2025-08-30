"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRaffleContract, type RaffleInfo } from "@/hooks/use-raffle-contract"
import { usePolkadot } from "@/components/polkadot-provider"
import Link from "next/link"
import { Loader2, Trophy, Users, Clock } from "lucide-react"

export default function RafflesPage() {
  const [raffles, setRaffles] = useState<(RaffleInfo & { id: number })[]>([])
  const [loading, setLoading] = useState(true)
  const { getAllRaffles } = useRaffleContract()
  const { selectedAccount } = usePolkadot()

  useEffect(() => {
    const loadRaffles = async () => {
      setLoading(true)
      const allRaffles = await getAllRaffles()
      // Filter only active raffles
      const activeRaffles = allRaffles.filter((raffle) => !raffle.isClosed)
      setRaffles(activeRaffles)
      setLoading(false)
    }

    loadRaffles()
  }, [getAllRaffles])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Active Raffles</h1>
        <p className="text-muted-foreground">Discover and participate in decentralized raffles on Polkadot</p>
      </div>

      {!selectedAccount && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">Connect your wallet to participate in raffles and buy tickets.</p>
          </CardContent>
        </Card>
      )}

      {raffles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Raffles</h3>
            <p className="text-muted-foreground mb-4">
              There are no active raffles at the moment. Check back later or create your own!
            </p>
            <Link href="/create">
              <Button>Create a Raffle</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {raffles.map((raffle) => {
            const progress = (raffle.ticketsSold / raffle.maxTickets) * 100
            const remainingTickets = raffle.maxTickets - raffle.ticketsSold

            return (
              <Card key={raffle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Raffle #{raffle.id}</CardTitle>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <CardDescription>
                    Organized by {raffle.organizer.slice(0, 8)}...{raffle.organizer.slice(-8)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {raffle.ticketsSold}/{raffle.maxTickets} tickets
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ticket Price</p>
                      <p className="font-semibold">{raffle.ticketPrice} DOT</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Prize</p>
                      <p className="font-semibold">{raffle.totalStake} DOT</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{remainingTickets} tickets remaining</span>
                  </div>

                  <Link href={`/raffle/${raffle.id}`}>
                    <Button className="w-full" disabled={remainingTickets === 0}>
                      {remainingTickets === 0 ? "Sold Out" : "View Details"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
