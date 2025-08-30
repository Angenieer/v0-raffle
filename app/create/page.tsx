"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { WalletGuard } from "@/components/wallet-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateRaffle } from "@/hooks/use-raffle-contract"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

export default function CreateRafflePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [ticketPrice, setTicketPrice] = useState("")
  const [maxTickets, setMaxTickets] = useState("")
  const [duration, setDuration] = useState("")
  const [durationUnit, setDurationUnit] = useState("hours")

  const { createRaffle, isLoading, isSuccess, error } = useCreateRaffle()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !ticketPrice || !maxTickets || !duration) {
      toast.error("Please fill in all fields")
      return
    }

    const durationInSeconds = getDurationInSeconds(Number.parseInt(duration), durationUnit)

    try {
      createRaffle(title, description, ticketPrice, Number.parseInt(maxTickets), durationInSeconds)
    } catch (err) {
      toast.error("Failed to create raffle")
    }
  }

  const getDurationInSeconds = (value: number, unit: string) => {
    switch (unit) {
      case "minutes":
        return value * 60
      case "hours":
        return value * 60 * 60
      case "days":
        return value * 60 * 60 * 24
      default:
        return value * 60 * 60
    }
  }

  if (isSuccess) {
    toast.success("Raffle created successfully!")
    router.push("/my-raffles")
  }

  if (error) {
    toast.error("Failed to create raffle")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <WalletGuard>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Create New Raffle</h1>
              <p className="text-muted-foreground">Set up your decentralized raffle with transparent and fair rules</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Raffle Details
                </CardTitle>
                <CardDescription>
                  Configure your raffle parameters. All settings are immutable once created.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Raffle Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a catchy title for your raffle"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what participants can win and any additional details"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice">Ticket Price (ETH)</Label>
                      <Input
                        id="ticketPrice"
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="0.01"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTickets">Maximum Tickets</Label>
                      <Input
                        id="maxTickets"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={maxTickets}
                        onChange={(e) => setMaxTickets(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        placeholder="24"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="durationUnit">Unit</Label>
                      <Select value={durationUnit} onValueChange={setDurationUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        Total Prize Pool:{" "}
                        {ticketPrice && maxTickets
                          ? (Number.parseFloat(ticketPrice) * Number.parseInt(maxTickets)).toFixed(3)
                          : "0"}{" "}
                        ETH
                      </p>
                      <p>
                        Platform Fee (2.5%):{" "}
                        {ticketPrice && maxTickets
                          ? (Number.parseFloat(ticketPrice) * Number.parseInt(maxTickets) * 0.025).toFixed(3)
                          : "0"}{" "}
                        ETH
                      </p>
                      <p>
                        Winner Prize:{" "}
                        {ticketPrice && maxTickets
                          ? (Number.parseFloat(ticketPrice) * Number.parseInt(maxTickets) * 0.975).toFixed(3)
                          : "0"}{" "}
                        ETH
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Raffle...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Raffle
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </WalletGuard>
    </div>
  )
}
