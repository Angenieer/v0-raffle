import { ApiPromise, WsProvider } from "@polkadot/api"
import { ContractPromise } from "@polkadot/api-contract"

// Configuración de red
export const POLKADOT_CONFIG = {
  // Rococo testnet para desarrollo
  WS_PROVIDER: "wss://rococo-contracts-rpc.polkadot.io",
  // Dirección del contrato (se actualizará después del deploy)
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
}

// Inicializar API de Polkadot
export async function initPolkadotApi(): Promise<ApiPromise> {
  const wsProvider = new WsProvider(POLKADOT_CONFIG.WS_PROVIDER)
  const api = await ApiPromise.create({ provider: wsProvider })
  await api.isReady
  return api
}

// ABI del contrato (se generará automáticamente después de compilar)
export const CONTRACT_ABI = {
  // Se actualizará con el ABI real después de compilar el contrato
  source: {
    hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    language: "ink! 5.0.0",
    compiler: "rustc 1.75.0",
    build_info: {
      build_mode: "Release",
      cargo_contract_version: "4.0.0",
      rust_toolchain: "stable-x86_64-unknown-linux-gnu",
      wasm_opt_settings: {
        keep_debug_symbols: false,
        optimization_passes: "Z",
      },
    },
  },
  contract: {
    name: "raffle",
    version: "0.1.0",
    authors: ["Raffle Team"],
  },
  spec: {
    constructors: [],
    docs: [],
    environment: {
      accountId: {
        displayName: ["AccountId"],
        type: 0,
      },
      balance: {
        displayName: ["Balance"],
        type: 1,
      },
      blockNumber: {
        displayName: ["BlockNumber"],
        type: 2,
      },
      chainExtension: {
        displayName: ["ChainExtension"],
        type: 3,
      },
      hash: {
        displayName: ["Hash"],
        type: 4,
      },
      maxEventTopics: 4,
      timestamp: {
        displayName: ["Timestamp"],
        type: 5,
      },
    },
    events: [],
    lang_error: {
      displayName: ["ink", "LangError"],
      type: 6,
    },
    messages: [],
  },
}

// Crear instancia del contrato
export async function createContractInstance(api: ApiPromise): Promise<ContractPromise | null> {
  if (!POLKADOT_CONFIG.CONTRACT_ADDRESS) {
    console.warn("Contract address not configured")
    return null
  }

  return new ContractPromise(api, CONTRACT_ABI, POLKADOT_CONFIG.CONTRACT_ADDRESS)
}
