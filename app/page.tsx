"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Users, Trophy, Coins, Plus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Powered by Blockchain Technology
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 text-balance">
            Transparent & Fair
            <span className="text-primary block">Decentralized Raffles</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Create and participate in provably fair raffles on the blockchain. Every draw is transparent, secure, and
            verifiable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/demo">
                Try Live Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/create">
                <Plus className="mr-2 h-5 w-5" />
                Create Raffle
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose V0 Raffle?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on blockchain technology for maximum transparency and fairness
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Smart contracts ensure your funds are secure and winners are selected fairly
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automated winner selection and instant prize distribution via smart contracts
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Anyone can create raffles and participate in a decentralized ecosystem</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Transparent</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All transactions and draws are recorded on-chain and publicly verifiable
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-24 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Simple steps to create or join a raffle</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
            <p className="text-muted-foreground">
              Connect your Web3 wallet to start creating or participating in raffles
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
            <p className="text-muted-foreground">
              Create your own raffle or buy tickets for existing ones using cryptocurrency
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Win Prizes</h3>
            <p className="text-muted-foreground">
              Winners are selected automatically and prizes are distributed instantly
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <Coins className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users already enjoying fair and transparent raffles
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/raffles">
              Explore Raffles Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8 text-center text-muted-foreground">
          <p>&copy; 2024 V0 Raffle. Built with transparency and fairness in mind.</p>
        </div>
      </footer>
    </div>
  )
}
