"use client"

import { Header } from "@/components/header"
import { WalletGuard } from "@/components/wallet-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAccount } from "wagmi"
import { useGetUserRaffles, useGetRaffle, useCancelRaffle, useCompleteRaffle } from "@/hooks/use-raffle-contract"
import { Loader2, Calendar, Users, Coins, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function RaffleCard({ raffleId }: { raffleId: number }) {
  const { raffle, isLoading } = useGetRaffle(raffleId)
  const { cancelRaffle, isLoading: isCancelling } = useCancelRaffle()
  const { completeRaffle, isLoading: isCompleting } = useCompleteRaffle()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!raffle) return null

  const isExpired = Date.now() / 1000 > raffle.endTime
  const canComplete = (isExpired || raffle.ticketsSold === raffle.maxTickets) && raffle.isActive && !raffle.isCompleted
  const canCancel = raffle.isActive && !raffle.isCompleted && raffle.ticketsSold === 0

  const getStatusBadge = () => {
    if (raffle.isCompleted && raffle.winner !== "0x0000000000000000000000000000000000000000") {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
    }
    if (raffle.isCompleted) {
      return <Badge variant="secondary">Cancelled</Badge>
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (raffle.isActive) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  const handleCancel = () => {
    cancelRaffle(raffle.id)
    toast.success("Raffle cancelled successfully")
  }

  const handleComplete = () => {
    completeRaffle(raffle.id)
    toast.success("Raffle completed successfully")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{raffle.title}</CardTitle>
            <CardDescription className="mt-1">{raffle.description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span>Price: {raffle.ticketPrice} ETH</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {raffle.ticketsSold}/{raffle.maxTickets} tickets
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Ends: {new Date(raffle.endTime * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span>Prize: {raffle.prizeAmount} ETH</span>
          </div>
        </div>

        {raffle.winner && raffle.winner !== "0x0000000000000000000000000000000000000000" && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">
                Winner: {raffle.winner.slice(0, 6)}...{raffle.winner.slice(-4)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {canCancel && (
            <Button variant="destructive" size="sm" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </>
              )}
            </Button>
          )}

          {canComplete && (
            <Button size="sm" onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </>
              )}
            </Button>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href={`/raffle/${raffle.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyRafflesPage() {
  const { address } = useAccount()
  const { raffleIds, isLoading, error } = useGetUserRaffles(address)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <WalletGuard>
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Raffles</h1>
            <p className="text-muted-foreground">Manage and monitor your created raffles</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-muted-foreground">Failed to load raffles</p>
                </div>
              </CardContent>
            </Card>
          ) : raffleIds.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No raffles created yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first raffle to get started</p>
                  <Button asChild>
                    <Link href="/create">Create Raffle</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {raffleIds.map((raffleId) => (
                <RaffleCard key={raffleId} raffleId={raffleId} />
              ))}
            </div>
          )}
        </div>
      </WalletGuard>
    </div>
  )
}
