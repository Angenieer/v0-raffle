// Contract configuration
export const CONTRACT_CONFIG = {
  // This will be set after contract deployment
  address: process.env.NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS as `0x${string}`,

  // Supported networks
  supportedChainIds: [1, 5, 137, 10, 42161, 8453, 11155111], // mainnet, goerli, polygon, optimism, arbitrum, base, sepolia

  // Platform settings
  platformFeePercentage: 2.5, // 2.5%

  // Validation rules
  minTicketPrice: "0.001", // ETH
  maxTicketPrice: "10", // ETH
  minTickets: 1,
  maxTickets: 10000,
  minDuration: 60, // 1 minute
  maxDuration: 30 * 24 * 60 * 60, // 30 days
}

export const NETWORK_NAMES: Record<number, string> = {
  1: "Ethereum",
  5: "Goerli",
  137: "Polygon",
  10: "Optimism",
  42161: "Arbitrum",
  8453: "Base",
  11155111: "Sepolia",
}
