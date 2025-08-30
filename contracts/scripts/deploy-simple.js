const hre = require("hardhat")

async function main() {
  console.log("🚀 Deploying SimplifiedRaffle contract...")

  const SimplifiedRaffle = await hre.ethers.getContractFactory("SimplifiedRaffle")
  const raffle = await SimplifiedRaffle.deploy()

  await raffle.deployed()

  console.log("✅ SimplifiedRaffle deployed to:", raffle.address)
  console.log("📋 Save this address for your frontend!")

  // Create a demo raffle for testing
  console.log("🎲 Creating demo raffle...")
  const tx = await raffle.createRaffle(
    "Demo Hackathon Raffle",
    hre.ethers.utils.parseEther("0.01"), // 0.01 ETH per ticket
    5, // Max 5 tickets
  )
  await tx.wait()

  console.log("🎉 Demo raffle created with ID: 1")
  console.log("💡 Ticket price: 0.01 ETH")
  console.log("🎫 Max tickets: 5")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
