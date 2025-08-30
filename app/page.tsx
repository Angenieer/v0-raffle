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
import { Wallet, Copy, CheckCircle, Ticket, Plus, Settings, Trophy, Shield, Zap, Eye, Sparkles } from "lucide-react"
import { Connection } from "@solana/web3.js"

const createConfetti = () => {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]
  const confettiCount = 50

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div")
    confetti.style.position = "fixed"
    confetti.style.left = Math.random() * 100 + "vw"
    confetti.style.top = "-10px"
    confetti.style.width = "10px"
    confetti.style.height = "10px"
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.borderRadius = "50%"
    confetti.style.pointerEvents = "none"
    confetti.style.zIndex = "9999"
    confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`

    document.body.appendChild(confetti)

    setTimeout(() => {
      confetti.remove()
    }, 5000)
  }
}

const playSuccessSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

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
  participants: string[]
  winner: string | null
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
    isActive: true, // Ensuring raffle is active
    stakePercent: 10,
    feePercent: 5,
    totalRaised: 4.5,
    participants: [],
    winner: null,
  },
  {
    id: "2",
    title: "Rifa Tech UTN",
    ticketPrice: 0.05,
    ticketsIssued: 23,
    maxTickets: 50,
    organizer: "9kL...28A",
    isActive: true, // Ensuring raffle is active
    stakePercent: 15,
    feePercent: 5,
    totalRaised: 1.15,
    participants: [],
    winner: null,
  },
  {
    id: "3",
    title: "Rifa Blockchain FRC",
    ticketPrice: 0.2,
    ticketsIssued: 12,
    maxTickets: 30,
    organizer: "7mN...45B",
    isActive: true, // Ensuring raffle is active
    stakePercent: 12,
    feePercent: 5,
    totalRaised: 2.4,
    participants: [],
    winner: null,
  },
]

declare global {
  interface Window {
    solana?: PhantomProvider
  }
}

const connection = new Connection("https://api.mainnet-beta.solana.com") // Replace with your Solana RPC endpoint

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
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<"confirm" | "processing" | "success">("confirm")

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
      
      @keyframes pulse-success {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes slide-up {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .animate-pulse-success {
        animation: pulse-success 2s ease-in-out infinite;
      }
      
      .animate-slide-up {
        animation: slide-up 0.3s ease-out forwards;
      }
      
      .loading-dots::after {
        content: '';
        animation: loading-dots 1.5s infinite;
      }
      
      @keyframes loading-dots {
        0%, 20% { content: ''; }
        40% { content: '.'; }
        60% { content: '..'; }
        80%, 100% { content: '...'; }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

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

  const buyTicket = async (raffle: Raffle) => {
    console.log("[v0] Buy ticket clicked - isConnected:", isConnected)
    console.log("[v0] Raffle active:", raffle.isActive)
    console.log("[v0] Tickets available:", raffle.maxTickets - raffle.ticketsIssued)

    if (!isConnected || !wallet) {
      alert("Conecta tu wallet primero")
      return
    }

    setSelectedRaffle(raffle)
    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    if (!selectedRaffle) return

    setIsPurchasing(true)
    setPurchaseStep("processing")

    try {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Wallet confirmation
      setPurchaseStep("processing")
      await new Promise((resolve) => setTimeout(resolve, 1200)) // Transaction processing

      // Mock transaction
      const newTicket: NFTTicket = {
        id: `ticket-${Date.now()}`,
        raffleId: selectedRaffle.id,
        raffleTitle: selectedRaffle.title,
        ticketNumber: (selectedRaffle.ticketsIssued + 1).toString().padStart(4, "0"),
        purchaseDate: new Date().toLocaleDateString(),
        qrCode: `${selectedRaffle.id}-${Date.now()}`,
      }

      // Update raffle data
      const updatedRaffles = mockRaffles.map((raffle) =>
        raffle.id === selectedRaffle.id
          ? {
              ...raffle,
              ticketsIssued: raffle.ticketsIssued + 1,
              totalRaised: raffle.totalRaised + raffle.ticketPrice,
            }
          : raffle,
      )

      setUserTickets((prev) => [...prev, newTicket])

      setPurchaseStep("success")
      playSuccessSound()
      createConfetti()

      setTimeout(() => {
        setShowPurchaseModal(false)
        setShowSuccessModal(true)
        setPurchaseStep("confirm")
      }, 1500)
    } catch (error) {
      console.error("Purchase failed:", error)
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
        participants: [],
        winner: null,
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
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-green-600 bg-clip-text text-transparent mb-6 text-balance animate-slide-up">
                Rifa Transparente en Blockchain
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed animate-slide-up">
                Un proyecto de AVEIT que reemplaza la certificación de Lotería con un sistema descentralizado en Solana.
              </p>

              <Button
                onClick={goToDashboard}
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Probar Demo
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-slide-up">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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

              <Card
                className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
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

              <Card
                className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
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
            {mockRaffles.map((raffle, index) => (
              <Card
                key={raffle.id}
                className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{raffle.title}</CardTitle>
                    <Badge
                      variant={raffle.isActive ? "secondary" : "default"}
                      className={`${raffle.isActive ? "bg-green-100 text-green-800 animate-pulse-success" : "bg-accent/20"}`}
                    >
                      <Ticket className="w-3 h-3 mr-1" />
                      {raffle.isActive ? "Activa" : "Cerrada"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Organizado por {raffle.organizer}
                    {!raffle.isActive && raffle.winner && (
                      <div className="flex items-center mt-1 text-green-600 animate-pulse-success">
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
                      <span className="font-semibold text-primary">{raffle.ticketPrice} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Boletas vendidas:</span>
                      <span className="font-semibold">
                        {raffle.ticketsIssued} / {raffle.maxTickets}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(raffle.ticketsIssued / raffle.maxTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button
                    onClick={() => buyTicket(raffle)}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    disabled={!isConnected || raffle.ticketsIssued >= raffle.maxTickets || !raffle.isActive}
                  >
                    {!isConnected
                      ? "Conectar Wallet"
                      : !raffle.isActive
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

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {purchaseStep === "processing" && (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              {purchaseStep === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
              {purchaseStep === "confirm" && <Ticket className="w-5 h-5 text-primary" />}
              <span>
                {purchaseStep === "confirm" && "Confirmar Compra"}
                {purchaseStep === "processing" && "Procesando Transacción"}
                {purchaseStep === "success" && "¡Compra Exitosa!"}
              </span>
            </DialogTitle>
            <DialogDescription>
              {purchaseStep === "confirm" && "Estás a punto de comprar una boleta para la siguiente rifa:"}
              {purchaseStep === "processing" && "Confirmando transacción en la blockchain..."}
              {purchaseStep === "success" && "Tu boleta NFT ha sido generada exitosamente."}
            </DialogDescription>
          </DialogHeader>

          {selectedRaffle && purchaseStep === "confirm" && (
            <div className="space-y-4 animate-slide-up">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{selectedRaffle.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-semibold text-primary">{selectedRaffle.ticketPrice} SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Boletas disponibles:</span>
                      <span>{selectedRaffle.maxTickets - selectedRaffle.ticketsIssued}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-r from-accent/20 to-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Al confirmar, se debitarán <strong className="text-primary">{selectedRaffle.ticketPrice} SOL</strong>{" "}
                  de tu wallet y recibirás un NFT de boleta único.
                </p>
              </div>
            </div>
          )}

          {purchaseStep === "processing" && (
            <div className="text-center space-y-4 animate-slide-up">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground loading-dots">Procesando transacción</p>
            </div>
          )}

          {purchaseStep === "success" && (
            <div className="text-center space-y-4 animate-slide-up">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 animate-pulse-success" />
                <p className="font-semibold text-green-600">¡Boleta NFT Creada!</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {purchaseStep === "confirm" && (
              <>
                <Button variant="outline" onClick={() => setShowPurchaseModal(false)} disabled={isPurchasing}>
                  Cancelar
                </Button>
                <Button
                  onClick={confirmPurchase}
                  disabled={isPurchasing}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  {isPurchasing ? "Procesando..." : "Confirmar Compra"}
                </Button>
              </>
            )}
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
