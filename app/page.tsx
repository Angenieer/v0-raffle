"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Copy, CheckCircle, Ticket, Plus, Settings, Trophy, Shield, Zap, Eye } from "lucide-react"

// Phantom wallet types
interface PhantomProvider {
  isPhantom: boolean
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: string, callback: (args: any) => void) => void
  publicKey: { toString: () => string } | null
  isConnected: boolean
}

// Mock raffle data structure
interface Raffle {
  id: string
  title: string
  ticketPrice: number // in SOL
  ticketsIssued: number
  maxTickets: number
  organizer: string
  isActive: boolean
  stakePercent: number
  feePercent: number
  totalRaised: number
  winner?: string
}

// NFT ticket interface
interface NFTTicket {
  id: string
  raffleId: string
  raffleTitle: string
  ticketNumber: number
  purchaseDate: string
  qrCode: string
}

// Mock raffle data - will be replaced with Solana contract data
const mockRaffles: Raffle[] = [
  {
    id: "1",
    title: "Rifa AVEIT 2025",
    ticketPrice: 0.1,
    ticketsIssued: 45,
    maxTickets: 100,
    organizer: "8sj...39F",
    isActive: true,
    stakePercent: 10,
    feePercent: 5,
    totalRaised: 4.5,
  },
  {
    id: "2",
    title: "Rifa Gaming Setup",
    ticketPrice: 0.05,
    ticketsIssued: 78,
    maxTickets: 150,
    organizer: "9kL...42A",
    isActive: true,
    stakePercent: 15,
    feePercent: 3,
    totalRaised: 3.9,
  },
  {
    id: "3",
    title: "Rifa Crypto Bundle",
    ticketPrice: 0.2,
    ticketsIssued: 23,
    maxTickets: 50,
    organizer: "7mN...18C",
    isActive: true,
    stakePercent: 8,
    feePercent: 7,
    totalRaised: 4.6,
  },
  {
    id: "4",
    title: "Rifa NFT Collection",
    ticketPrice: 0.15,
    ticketsIssued: 67,
    maxTickets: 80,
    organizer: "5pQ...91D",
    isActive: true,
    stakePercent: 12,
    feePercent: 4,
    totalRaised: 10.05,
  },
  {
    id: "5",
    title: "Rifa Tech Gadgets",
    ticketPrice: 0.08,
    ticketsIssued: 134,
    maxTickets: 200,
    organizer: "3rT...55E",
    isActive: true,
    stakePercent: 20,
    feePercent: 6,
    totalRaised: 10.72,
  },
]

declare global {
  interface Window {
    solana?: PhantomProvider
  }
}

export default function SolanaWalletApp() {
  const [wallet, setWallet] = useState<PhantomProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userTickets, setUserTickets] = useState<NFTTicket[]>([])
  const [showTicketsModal, setShowTicketsModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateRaffleModal, setShowCreateRaffleModal] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [newRaffle, setNewRaffle] = useState({
    title: "",
    maxTickets: "",
    ticketPrice: "",
    stakePercent: "",
    feePercent: "",
  })
  const [isCreatingRaffle, setIsCreatingRaffle] = useState(false)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<{ raffle: Raffle; winner: string } | null>(null)
  const [showLandingPage, setShowLandingPage] = useState(true)

  useEffect(() => {
    // Check if Phantom wallet is available
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      setWallet(window.solana)

      // Check if already connected
      if (window.solana.isConnected && window.solana.publicKey) {
        setIsConnected(true)
        setPublicKey(window.solana.publicKey.toString())
      }

      // Listen for wallet events
      window.solana.on("connect", (publicKey: any) => {
        console.log("[v0] Wallet connected:", publicKey.toString())
        setIsConnected(true)
        setPublicKey(publicKey.toString())
      })

      window.solana.on("disconnect", () => {
        console.log("[v0] Wallet disconnected")
        setIsConnected(false)
        setPublicKey("")
      })
    }

    if (isConnected && publicKey) {
      // Mock admin check - replace with actual contract logic
      setIsAdmin(publicKey.startsWith("8sj") || publicKey.startsWith("9kL"))
    }
  }, [isConnected, publicKey])

  const connectWallet = async () => {
    if (!wallet) {
      window.open("https://phantom.app/", "_blank")
      return
    }

    try {
      setIsConnecting(true)
      const response = await wallet.connect()
      setIsConnected(true)
      setPublicKey(response.publicKey.toString())
    } catch (error) {
      console.error("[v0] Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    if (wallet) {
      try {
        await wallet.disconnect()
        setIsConnected(false)
        setPublicKey("")
      } catch (error) {
        console.error("[v0] Failed to disconnect wallet:", error)
      }
    }
  }

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const buyTicket = async (raffleId: string) => {
    if (!isConnected) {
      alert("Por favor conecta tu wallet primero")
      return
    }

    const raffle = mockRaffles.find((r) => r.id === raffleId)
    if (raffle) {
      setSelectedRaffle(raffle)
      setShowPurchaseModal(true)
    }
  }

  const confirmPurchase = async () => {
    if (!selectedRaffle) return

    setIsPurchasing(true)

    try {
      // Simulate Solana transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate ticket number and QR code
      const ticketNumber = Math.floor(Math.random() * 1000000)
      const qrData = `AVEIT-TICKET-${selectedRaffle.id}-${ticketNumber}`

      // Create new NFT ticket
      const newTicket: NFTTicket = {
        id: `ticket-${Date.now()}`,
        raffleId: selectedRaffle.id,
        raffleTitle: selectedRaffle.title,
        ticketNumber,
        purchaseDate: new Date().toLocaleDateString(),
        qrCode: qrData,
      }

      // Add to user tickets
      setUserTickets((prev) => [...prev, newTicket])

      // Update raffle tickets issued (mock)
      const raffleIndex = mockRaffles.findIndex((r) => r.id === selectedRaffle.id)
      if (raffleIndex !== -1) {
        mockRaffles[raffleIndex].ticketsIssued += 1
        mockRaffles[raffleIndex].totalRaised += selectedRaffle.ticketPrice
      }

      setShowPurchaseModal(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("[v0] Purchase failed:", error)
      alert("Error en la transacción. Intenta nuevamente.")
    } finally {
      setIsPurchasing(false)
    }
  }

  const generateQRCode = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`
  }

  const createRaffle = async () => {
    if (
      !newRaffle.title ||
      !newRaffle.maxTickets ||
      !newRaffle.ticketPrice ||
      !newRaffle.stakePercent ||
      !newRaffle.feePercent
    ) {
      alert("Por favor completa todos los campos")
      return
    }

    setIsCreatingRaffle(true)

    try {
      // Simulate contract interaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const raffleData: Raffle = {
        id: (mockRaffles.length + 1).toString(),
        title: newRaffle.title,
        ticketPrice: Number.parseFloat(newRaffle.ticketPrice),
        ticketsIssued: 0,
        maxTickets: Number.parseInt(newRaffle.maxTickets),
        organizer: formatAddress(publicKey),
        isActive: true,
        stakePercent: Number.parseInt(newRaffle.stakePercent),
        feePercent: Number.parseInt(newRaffle.feePercent),
        totalRaised: 0,
      }

      mockRaffles.push(raffleData)

      setNewRaffle({
        title: "",
        maxTickets: "",
        ticketPrice: "",
        stakePercent: "",
        feePercent: "",
      })

      setShowCreateRaffleModal(false)
      alert("¡Rifa creada exitosamente!")
    } catch (error) {
      console.error("[v0] Failed to create raffle:", error)
      alert("Error al crear la rifa. Intenta nuevamente.")
    } finally {
      setIsCreatingRaffle(false)
    }
  }

  const closeRaffle = async (raffleId: string) => {
    const raffle = mockRaffles.find((r) => r.id === raffleId)
    if (!raffle || raffle.ticketsIssued === 0) {
      alert("No se puede cerrar una rifa sin participantes")
      return
    }

    try {
      // Simulate random winner selection
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate random winner from ticket holders (mock)
      const winnerTicketNumber = Math.floor(Math.random() * raffle.ticketsIssued) + 1
      const mockWinnerAddress = `${Math.random().toString(36).substring(2, 5)}...${Math.random().toString(36).substring(2, 5)}`

      // Update raffle
      const raffleIndex = mockRaffles.findIndex((r) => r.id === raffleId)
      if (raffleIndex !== -1) {
        mockRaffles[raffleIndex].isActive = false
        mockRaffles[raffleIndex].winner = mockWinnerAddress
      }

      setSelectedWinner({ raffle, winner: mockWinnerAddress })
      setShowWinnerModal(true)
    } catch (error) {
      console.error("[v0] Failed to close raffle:", error)
      alert("Error al cerrar la rifa. Intenta nuevamente.")
    }
  }

  const goToDashboard = () => {
    setShowLandingPage(false)
  }

  const goToLandingPage = () => {
    setShowLandingPage(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={goToLandingPage}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-foreground">AVEIT</span>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isAdmin && isConnected && !showLandingPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminDashboard(true)}
                  className="bg-transparent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}

              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                  <Button variant="outline" size="sm" onClick={copyAddress} className="font-mono bg-transparent">
                    {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {formatAddress(publicKey)}
                  </Button>
                  <Button variant="outline" size="sm" onClick={disconnectWallet}>
                    Desconectar
                  </Button>
                </div>
              ) : (
                <Button onClick={connectWallet} disabled={isConnecting} className="bg-primary hover:bg-primary/90">
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? "Conectando..." : "Conectar Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLandingPage ? (
        /* Landing Page */
        <main className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Rifa Transparente en Blockchain
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
                Un proyecto de AVEIT que reemplaza la certificación de Lotería con un sistema descentralizado en Solana.
              </p>

              <Button
                onClick={goToDashboard}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-xl"
              >
                Probar Demo
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1: NFT Tickets */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Boletas tokenizadas como NFTs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Cada boleta es un NFT único en la blockchain de Solana, garantizando autenticidad y trazabilidad
                    completa de todas las participaciones.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2: Transparent Stake */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Stake como garantía transparente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Un porcentaje de cada venta se retiene como garantía, eliminando la necesidad de autoridades
                    centrales y asegurando transparencia total.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3: Auditable Draw */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Sorteo auditable en la blockchain</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    La selección del ganador utiliza algoritmos verificables en blockchain, permitiendo que cualquiera
                    pueda auditar el proceso de sorteo.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Additional Info Section */}
          <section className="py-16 bg-muted/30 -mx-4 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">¿Por qué blockchain?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                La tecnología blockchain elimina la necesidad de confiar en autoridades centrales. Cada transacción,
                cada boleta y cada sorteo queda registrado de forma inmutable y verificable por cualquier persona.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">Transparencia Total</h3>
                    <p className="text-muted-foreground text-sm">
                      Todos los procesos son públicos y verificables en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">Seguridad Garantizada</h3>
                    <p className="text-muted-foreground text-sm">
                      La blockchain de Solana protege todas las transacciones y datos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* Dashboard Content */
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Rifas</h1>
                <p className="text-muted-foreground">Explora y participa en las rifas disponibles</p>
              </div>
              <Button variant="outline" onClick={goToLandingPage} className="bg-transparent">
                ← Volver al inicio
              </Button>
            </div>
          </div>

          {/* Raffle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockRaffles.map((raffle) => (
              <Card key={raffle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{raffle.title}</CardTitle>
                    <Badge variant={raffle.isActive ? "secondary" : "default"} className="bg-accent/20">
                      <Ticket className="w-3 h-3 mr-1" />
                      {raffle.isActive ? "Activa" : "Cerrada"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Organizado por {raffle.organizer}
                    {!raffle.isActive && raffle.winner && (
                      <div className="flex items-center mt-1 text-green-600">
                        <Trophy className="w-3 h-3 mr-1" />
                        Ganador: {raffle.winner}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio por boleta:</span>
                      <span className="font-semibold">{raffle.ticketPrice} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Boletas vendidas:</span>
                      <span className="font-semibold">
                        {raffle.ticketsIssued} / {raffle.maxTickets}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(raffle.ticketsIssued / raffle.maxTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button
                    onClick={() => buyTicket(raffle.id)}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!isConnected || raffle.ticketsIssued >= raffle.maxTickets || !raffle.isActive}
                  >
                    {!raffle.isActive
                      ? "Cerrada"
                      : raffle.ticketsIssued >= raffle.maxTickets
                        ? "Agotado"
                        : "Comprar Boleta"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stake Guarantee Section */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span>Stake de Garantía</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  El stake funciona como garantía de transparencia, reemplazando el rol de Lotería.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  // Calculate total stake amount from all raffles
                  const totalRaised = mockRaffles.reduce((sum, raffle) => sum + raffle.totalRaised, 0)
                  const totalStakeAmount = mockRaffles.reduce(
                    (sum, raffle) => sum + (raffle.totalRaised * raffle.stakePercent) / 100,
                    0,
                  )
                  const stakeTarget = 50 // Mock target of 50 SOL for demonstration
                  const stakeProgress = Math.min((totalStakeAmount / stakeTarget) * 100, 100)

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-800">{totalStakeAmount.toFixed(2)} SOL</div>
                          <div className="text-sm text-green-600">Monto Retenido</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-800">{stakeProgress.toFixed(1)}%</div>
                          <div className="text-sm text-green-600">Progreso del Stake</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-800">{stakeTarget} SOL</div>
                          <div className="text-sm text-green-600">Objetivo</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Progreso del Stake:</span>
                          <span className="font-semibold text-green-800">
                            {totalStakeAmount.toFixed(2)} / {stakeTarget} SOL
                          </span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stakeProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white/50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 leading-relaxed">
                          <strong>¿Cómo funciona?</strong> Un porcentaje de cada venta se retiene como stake de
                          garantía. Este fondo asegura la transparencia del proceso y reemplaza la necesidad de una
                          autoridad central como Lotería Nacional. Los fondos se liberan automáticamente al finalizar
                          cada rifa.
                        </p>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Wallet Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wallet Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Estado de Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>
                  {isConnected && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dirección:</span>
                      <span className="font-mono text-sm">{formatAddress(publicKey)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Rifas descentralizadas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Pagos en SOL</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Selección aleatoria</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Rifas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    disabled={!isConnected}
                    onClick={() => setShowTicketsModal(true)}
                  >
                    Ver Mis Boletas ({userTickets.length})
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" disabled={!isConnected}>
                    Historial de Rifas
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent" disabled={!isConnected}>
                    Crear Rifa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      )}

      {/* Purchase Confirmation Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Compra</DialogTitle>
            <DialogDescription>Estás a punto de comprar una boleta para la siguiente rifa:</DialogDescription>
          </DialogHeader>

          {selectedRaffle && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{selectedRaffle.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-semibold">{selectedRaffle.ticketPrice} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Boletas disponibles:</span>
                      <span>{selectedRaffle.maxTickets - selectedRaffle.ticketsIssued}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-accent/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Al confirmar, se debitarán <strong>{selectedRaffle.ticketPrice} SOL</strong> de tu wallet y recibirás
                  un NFT de boleta único.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)} disabled={isPurchasing}>
              Cancelar
            </Button>
            <Button onClick={confirmPurchase} disabled={isPurchasing} className="bg-primary hover:bg-primary/90">
              {isPurchasing ? "Procesando..." : "Confirmar Compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>¡Compra Exitosa!</span>
            </DialogTitle>
            <DialogDescription>Tu boleta NFT ha sido generada exitosamente.</DialogDescription>
          </DialogHeader>

          <div className="text-center space-y-4">
            <div className="bg-accent/20 p-4 rounded-lg">
              <Ticket className="w-12 h-12 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Boleta NFT Creada</p>
              <p className="text-sm text-muted-foreground">Puedes ver tu boleta en "Mis Boletas"</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full bg-primary hover:bg-primary/90">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Tickets Modal */}
      <Dialog open={showTicketsModal} onOpenChange={setShowTicketsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Ticket className="w-5 h-5" />
              <span>Mis Boletas NFT</span>
            </DialogTitle>
            <DialogDescription>Todas tus boletas de rifas activas</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {userTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No tienes boletas aún</p>
                <p className="text-sm text-muted-foreground">Compra una boleta para participar en las rifas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTickets.map((ticket) => (
                  <Card key={ticket.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{ticket.raffleTitle}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          NFT
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-center">
                        <img
                          src={generateQRCode(ticket.qrCode) || "/placeholder.svg"}
                          alt={`QR Code for ticket ${ticket.ticketNumber}`}
                          className="w-24 h-24 border rounded"
                        />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Número:</span>
                          <span className="font-mono">#{ticket.ticketNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fecha:</span>
                          <span>{ticket.purchaseDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketsModal(false)} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Dashboard Modal */}
      <Dialog open={showAdminDashboard} onOpenChange={setShowAdminDashboard}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Panel de Administración</span>
            </DialogTitle>
            <DialogDescription>Gestiona tus rifas y crea nuevas</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create Raffle Button */}
            <div className="flex justify-end">
              <Button onClick={() => setShowCreateRaffleModal(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Rifa
              </Button>
            </div>

            {/* Active Raffles Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Rifas Activas</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 grid grid-cols-6 gap-4 text-sm font-medium">
                  <span>Título</span>
                  <span>Boletas</span>
                  <span>Precio</span>
                  <span>Recaudado</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {mockRaffles
                  .filter((r) => r.isActive)
                  .map((raffle) => (
                    <div key={raffle.id} className="px-4 py-3 grid grid-cols-6 gap-4 text-sm border-t">
                      <span className="font-medium">{raffle.title}</span>
                      <span>
                        {raffle.ticketsIssued}/{raffle.maxTickets}
                      </span>
                      <span>{raffle.ticketPrice} SOL</span>
                      <span className="font-semibold">{raffle.totalRaised.toFixed(2)} SOL</span>
                      <Badge variant="secondary" className="w-fit">
                        Activa
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => closeRaffle(raffle.id)}
                        disabled={raffle.ticketsIssued === 0}
                      >
                        Cerrar Rifa
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Closed Raffles */}
            {mockRaffles.some((r) => !r.isActive) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Rifas Cerradas</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 grid grid-cols-5 gap-4 text-sm font-medium">
                    <span>Título</span>
                    <span>Boletas Vendidas</span>
                    <span>Recaudado</span>
                    <span>Ganador</span>
                    <span>Estado</span>
                  </div>
                  {mockRaffles
                    .filter((r) => !r.isActive)
                    .map((raffle) => (
                      <div key={raffle.id} className="px-4 py-3 grid grid-cols-5 gap-4 text-sm border-t">
                        <span className="font-medium">{raffle.title}</span>
                        <span>{raffle.ticketsIssued}</span>
                        <span className="font-semibold">{raffle.totalRaised.toFixed(2)} SOL</span>
                        <span className="flex items-center">
                          <Trophy className="w-3 h-3 mr-1 text-yellow-500" />
                          {raffle.winner}
                        </span>
                        <Badge variant="outline">Cerrada</Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminDashboard(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Raffle Modal */}
      <Dialog open={showCreateRaffleModal} onOpenChange={setShowCreateRaffleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Rifa</DialogTitle>
            <DialogDescription>Define los parámetros de tu nueva rifa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Rifa</Label>
              <Input
                id="title"
                value={newRaffle.title}
                onChange={(e) => setNewRaffle({ ...newRaffle, title: e.target.value })}
                placeholder="Ej: Rifa AVEIT 2025"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxTickets">Cantidad de Boletas</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  value={newRaffle.maxTickets}
                  onChange={(e) => setNewRaffle({ ...newRaffle, maxTickets: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="ticketPrice">Precio (SOL)</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  step="0.01"
                  value={newRaffle.ticketPrice}
                  onChange={(e) => setNewRaffle({ ...newRaffle, ticketPrice: e.target.value })}
                  placeholder="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stakePercent">% Stake</Label>
                <Input
                  id="stakePercent"
                  type="number"
                  value={newRaffle.stakePercent}
                  onChange={(e) => setNewRaffle({ ...newRaffle, stakePercent: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="feePercent">% Fee Plataforma</Label>
                <Input
                  id="feePercent"
                  type="number"
                  value={newRaffle.feePercent}
                  onChange={(e) => setNewRaffle({ ...newRaffle, feePercent: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRaffleModal(false)} disabled={isCreatingRaffle}>
              Cancelar
            </Button>
            <Button onClick={createRaffle} disabled={isCreatingRaffle} className="bg-primary hover:bg-primary/90">
              {isCreatingRaffle ? "Creando..." : "Crear Rifa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Winner Announcement Modal */}
      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>¡Tenemos Ganador!</span>
            </DialogTitle>
            <DialogDescription>La rifa ha sido cerrada y se ha seleccionado un ganador</DialogDescription>
          </DialogHeader>

          {selectedWinner && (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-bold mb-2">{selectedWinner.raffle.title}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ganador:</p>
                  <p className="text-xl font-bold text-yellow-600">{selectedWinner.winner}</p>
                  <p className="text-sm text-muted-foreground">
                    Seleccionado aleatoriamente de {selectedWinner.raffle.ticketsIssued} participantes
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowWinnerModal(false)} className="w-full bg-primary hover:bg-primary/90">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
