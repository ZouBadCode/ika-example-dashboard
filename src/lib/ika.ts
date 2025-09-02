import { getNetworkConfig, IkaClient } from "@ika.xyz/sdk";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: getFullnodeUrl("testnet") });
const ikaClient = new IkaClient({
  suiClient: client,
  config: getNetworkConfig("testnet"),
});

let initialized = false;

export async function ensureIkaInitialized() {
  if (!initialized) {
    await ikaClient.initialize();
    initialized = true;
  }
  return ikaClient;
}