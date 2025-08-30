"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRaffleContract, type RaffleInfo } from "@/hooks/use-raffle-contract"
import { usePolkadot } from "@/components/polkadot-provider"
import { Loader2, Trophy, Clock, Ticket, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RafflePage() {
  const params = useParams()
  const raffleId = Number.parseInt(params.id as string)
  const [raffle, setRaffle] = useState<RaffleInfo | null>(null)
  const [userTickets, setUserTickets] = useState(0)
  const [ticketsToBuy, setTicketsToBuy] = useState(1)
  const [loading, setLoading] = useState(true)
  const { getRaffleInfo, buyTicket, getUserTickets, claimPrize, isLoading } = useRaffleContract()
  const { selectedAccount } = usePolkadot()

  useEffect(() => {
    const loadRaffleData = async () => {
      setLoading(true)
      const raffleInfo = await getRaffleInfo(raffleId)
      setRaffle(raffleInfo)

      if (selectedAccount) {
        const tickets = await getUserTickets(raffleId)
        setUserTickets(tickets)
      }

      setLoading(false)
    }

    if (!isNaN(raffleId)) {
      loadRaffleData()
    }
  }, [raffleId, getRaffleInfo, getUserTickets, selectedAccount])

  const handleBuyTickets = async () => {
    if (!raffle || !selectedAccount) return

    const success = await buyTicket(raffleId, raffle.ticketPrice)
    if (success) {
      // Reload raffle data
      const updatedRaffle = await getRaffleInfo(raffleId)
      setRaffle(updatedRaffle)
      const updatedTickets = await getUserTickets(raffleId)
      setUserTickets(updatedTickets)
    }
  }

  const handleClaimPrize = async () => {
    const success = await claimPrize(raffleId)
    if (success) {
      const updatedRaffle = await getRaffleInfo(raffleId)
      setRaffle(updatedRaffle)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Raffle Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The raffle you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/raffles">
              <Button>Back to Raffles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100
  const remainingTickets = raffle.maxTickets - raffle.ticketsSold
  const isWinner = selectedAccount && raffle.winner === selectedAccount.address
  const canClaimPrize = isWinner && raffle.isClosed

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/raffles" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Raffles
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Raffle #{raffleId}</CardTitle>
                <Badge variant={raffle.isClosed ? "secondary" : "default"}>
                  {raffle.isClosed ? "Closed" : "Active"}
                </Badge>
              </div>
              <CardDescription>
                Organized by {raffle.organizer.slice(0, 12)}...{raffle.organizer.slice(-12)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tickets Sold</span>
                  <span>
                    {raffle.ticketsSold}/{raffle.maxTickets}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{raffle.ticketPrice}</p>
                  <p className="text-sm text-muted-foreground">DOT per ticket</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{raffle.totalStake}</p>
                  <p className="text-sm text-muted-foreground">Total Prize</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{remainingTickets}</p>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{raffle.feePercent}%</p>
                  <p className="text-sm text-muted-foreground">Platform Fee</p>
                </div>
              </div>

              {raffle.isClosed && raffle.winner && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Winner Announced!</h3>
                    </div>
                    <p className="text-green-700">
                      {raffle.winner.slice(0, 12)}...{raffle.winner.slice(-12)}
                    </p>
                    {isWinner && (
                      <p className="text-green-800 font-semibold mt-2">Congratulations! You won this raffle! 🎉</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedAccount && userTickets > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Your Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{userTickets}</p>
                  <p className="text-sm text-muted-foreground">
                    {((userTickets / raffle.ticketsSold) * 100).toFixed(1)}% chance to win
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {canClaimPrize && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Claim Your Prize!</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleClaimPrize}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    `Claim ${raffle.totalStake} DOT`
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {!raffle.isClosed && remainingTickets > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Buy Tickets</CardTitle>
                <CardDescription>Each ticket costs {raffle.ticketPrice} DOT</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedAccount ? (
                  <p className="text-sm text-muted-foreground">Connect your wallet to buy tickets</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tickets">Number of tickets</Label>
                      <Input
                        id="tickets"
                        type="number"
                        min="1"
                        max={remainingTickets}
                        value={ticketsToBuy}
                        onChange={(e) => setTicketsToBuy(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total cost: {(Number.parseFloat(raffle.ticketPrice) * ticketsToBuy).toFixed(4)} DOT
                    </div>
                    <Button onClick={handleBuyTickets} disabled={isLoading || ticketsToBuy < 1} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Buying...
                        </>
                      ) : (
                        `Buy ${ticketsToBuy} Ticket${ticketsToBuy > 1 ? "s" : ""}`
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {raffle.isClosed && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">This raffle has ended</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
