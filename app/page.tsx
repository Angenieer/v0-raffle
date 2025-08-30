export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-foreground">v0-raffle</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema de rifas descentralizado con smart contracts
          </p>
          <div className="space-y-4">
            <p className="text-muted-foreground">Estado actual: Proyecto base configurado</p>
            <p className="text-sm text-muted-foreground">Listo para construir el MVP del hackathon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
