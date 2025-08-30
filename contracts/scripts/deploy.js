const hre = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy RaffleContract
  const RaffleContract = await hre.ethers.getContractFactory("RaffleContract")
  const raffleContract = await RaffleContract.deploy(deployer.address) // Use deployer as fee recipient

  await raffleContract.deployed()

  console.log("RaffleContract deployed to:", raffleContract.address)

  // Save deployment info
  const fs = require("fs")
  const deploymentInfo = {
    contractAddress: raffleContract.address,
    deployerAddress: deployer.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
  }

  fs.writeFileSync("../lib/contract-deployment.json", JSON.stringify(deploymentInfo, null, 2))

  console.log("Deployment info saved to lib/contract-deployment.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
