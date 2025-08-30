"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { usePolkadot } from "@/components/polkadot-provider"
import { useRaffleContract } from "@/hooks/use-raffle-contract"
import { ArrowLeft, Ticket, Shield, DollarSign } from "lucide-react"

export default function CreateRafflePage() {
  const router = useRouter()
  const { isConnected } = usePolkadot()
  const { createRaffle, isLoading } = useRaffleContract()

  const [formData, setFormData] = useState({
    maxTickets: 100,
    ticketPrice: "0.1",
    feePercent: 5,
    stakePercent: 15,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      return
    }

    const success = await createRaffle(
      formData.maxTickets,
      formData.ticketPrice,
      formData.feePercent,
      formData.stakePercent,
    )

    if (success) {
      router.push("/my-raffles")
    }
  }

  const totalRevenue = formData.maxTickets * Number.parseFloat(formData.ticketPrice)
  const feeAmount = (totalRevenue * formData.feePercent) / 100
  const stakeAmount = (totalRevenue * formData.stakePercent) / 100
  const organizerAmount = totalRevenue - feeAmount - stakeAmount

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Raffle</h1>
              <p className="text-muted-foreground">Set up your decentralized raffle on Polkadot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Raffle Configuration</CardTitle>
                <CardDescription>Configure the parameters for your raffle</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxTickets">Maximum Tickets</Label>
                    <Input
                      id="maxTickets"
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.maxTickets}
                      onChange={(e) => setFormData({ ...formData, maxTickets: Number.parseInt(e.target.value) || 1 })}
                    />
                    <p className="text-sm text-muted-foreground">Between 1 and 10,000 tickets</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price (DOT)</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">Minimum 0.001 DOT per ticket</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Platform Fee: {formData.feePercent}%</Label>
                      <Slider
                        value={[formData.feePercent]}
                        onValueChange={([value]) => setFormData({ ...formData, feePercent: value })}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">Platform fee (0-20%)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Stake Guarantee: {formData.stakePercent}%</Label>
                      <Slider
                        value={[formData.stakePercent]}
                        onValueChange={([value]) => setFormData({ ...formData, stakePercent: value })}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">Stake held as guarantee (0-50%)</p>
                    </div>
                  </div>

                  {formData.feePercent + formData.stakePercent > 70 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">Total fee + stake cannot exceed 70%</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isConnected || isLoading || formData.feePercent + formData.stakePercent > 70}
                  >
                    {!isConnected ? "Connect Wallet First" : isLoading ? "Creating..." : "Create Raffle"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Raffle Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Max Tickets</p>
                      <p className="text-2xl font-bold">{formData.maxTickets.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per Ticket</p>
                      <p className="text-2xl font-bold">{formData.ticketPrice} DOT</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Platform Fee</span>
                      <Badge variant="secondary">{formData.feePercent}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stake Guarantee</span>
                      <Badge variant="secondary">{formData.stakePercent}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Breakdown
                  </CardTitle>
                  <CardDescription>If all tickets are sold</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-semibold">{totalRevenue.toFixed(3)} DOT</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span className="text-sm">Platform Fee</span>
                      <span className="font-semibold">-{feeAmount.toFixed(3)} DOT</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span className="text-sm">Stake (held)</span>
                      <span className="font-semibold">-{stakeAmount.toFixed(3)} DOT</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Your Revenue</span>
                      <span className="font-bold">{organizerAmount.toFixed(3)} DOT</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Stake Guarantee</p>
                        <p className="text-xs text-blue-600">
                          The stake amount goes to the winner as prize, ensuring transparency
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
