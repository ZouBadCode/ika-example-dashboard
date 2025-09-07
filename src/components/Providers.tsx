import { createContext, useContext, useState, useMemo, type PropsWithChildren, useEffect } from 'react';
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';
import { getFullnodeUrl } from '@mysten/sui/client';
import { setIkaNetwork } from '@/lib/ika';

// Networks we support (add variables if needed later)
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet'), variables: {} },
  testnet: { url: getFullnodeUrl('testnet'), variables: {} },
  devnet: { url: getFullnodeUrl('devnet'), variables: {} },
});

type SupportedNetwork = keyof typeof networkConfig;

interface NetworkCtx {
  network: SupportedNetwork;
  setNetwork: (n: SupportedNetwork) => void;
}

const NetworkContext = createContext<NetworkCtx | undefined>(undefined);

export function useSelectedNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useSelectedNetwork must be used within <Providers>');
  return ctx;
}

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const [network, setNetwork] = useState<SupportedNetwork>('testnet');

  // Key forces re-mount when network changes so provider picks up new defaultNetwork.
  const suiProviderKey = useMemo(() => `sui-${network}`, [network]);

  const value = useMemo(() => ({ network, setNetwork }), [network]);

  // Keep Ika SDK in sync when network changes.
  useEffect(() => {
    setIkaNetwork(network);
  }, [network]);

  return (
    <NetworkContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider key={suiProviderKey} networks={networkConfig} defaultNetwork={network}>
            <WalletProvider autoConnect>{children}</WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </NetworkContext.Provider>
  );
}
