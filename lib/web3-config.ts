import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { sepolia, mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "V0 Raffle DApp",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
})

export const SUPPORTED_CHAINS = [mainnet, polygon, optimism, arbitrum, base, sepolia]
