import { createContext, useContext, ReactNode } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";

// Get RPC URL from environment variable, fallback to public endpoint
const sepoliaRpcUrl =
  import.meta.env.VITE_SEPOLIA_RPC_URL ||
  "https://ethereum-sepolia-rpc.publicnode.com";

const config = createConfig({
  chains: [sepolia],
  connectors: [injected(), metaMask()],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});

const queryClient = new QueryClient();

interface Web3ContextType {
  address: string | undefined;
  isConnected: boolean;
  chainId: number | undefined;
  isCorrectNetwork: boolean;
  connect: (connectorId?: string) => void;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  connectors: readonly any[];
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ContextInner>{children}</Web3ContextInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Web3ContextInner({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isCorrectNetwork = chainId === sepolia.id;

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error("Error switching network:", error);
      // If user rejects or error occurs, you might want to show a message
    }
  };

  const handleConnect = async (connectorId?: string) => {
    // First, check if we need to get the current chain
    // We'll connect first, then check and switch if needed
    const connector = connectorId
      ? connectors.find((c) => c.id === connectorId)
      : connectors[0];

    if (!connector) {
      console.error("No connector available");
      return;
    }

    try {
      // Connect to wallet
      connect({ connector });

      // Note: We can't check chainId before connecting, so we'll handle it after
      // The chainId will update via useChainId hook, and we'll show warning if wrong
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        // Only consider connected if on correct network
        isConnected: isConnected && isCorrectNetwork,
        chainId,
        isCorrectNetwork,
        connect: handleConnect,
        disconnect,
        switchNetwork: handleSwitchNetwork,
        connectors,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
}
