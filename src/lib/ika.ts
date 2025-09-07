import { getNetworkConfig, IkaClient } from "@ika.xyz/sdk";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

// Supported networks aligned with Providers.tsx
// Ika SDK currently supports these networks. If UI selects an unsupported one (e.g. devnet)
// the caller should treat it as not available. We keep type narrow to satisfy SDK types.
export type IkaNetwork = "mainnet" | "testnet";

let currentNetwork: IkaNetwork = "testnet";
let ikaClient: IkaClient = createClient(currentNetwork);
let initialized = false;
let initializing: Promise<IkaClient> | null = null;

function createClient(network: IkaNetwork) {
  const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
  return new IkaClient({
    suiClient,
    config: getNetworkConfig(network),
  });
}

export function setIkaNetwork(network: "mainnet" | "testnet" | "devnet") {
  // Map unsupported network (devnet) to closest supported (testnet)
  const mapped: IkaNetwork = network === 'devnet' ? 'testnet' : network;
  if (mapped === currentNetwork) return;
  currentNetwork = mapped;
  ikaClient = createClient(mapped);
  initialized = false;
  initializing = null;
}

export function getIkaNetwork() {
  return currentNetwork;
}

export async function ensureIkaInitialized(): Promise<IkaClient> {
  if (initialized) return ikaClient;
  if (initializing) return initializing;
  initializing = (async () => {
    await ikaClient.initialize();
    initialized = true;
    const ready = ikaClient;
    initializing = null; // clean up
    return ready;
  })();
  return initializing;
}
