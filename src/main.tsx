import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider } from "./contexts/Web3Context";
import { ContractProvider } from "./contexts/ContractContext";
import { rpcTracker } from "./utils/rpcTracker";

// Intercept all fetch calls to track RPC requests
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    // Handle both string URL and Request object
    let urlString: string | null = null;

    if (typeof args[0] === "string") {
      urlString = args[0];
    } else if (args[0] instanceof Request) {
      urlString = args[0].url;
    }

    // Check if it's an RPC call (only if we have a valid URL string)
    if (
      urlString &&
      (urlString.includes("infura.io") ||
        urlString.includes("publicnode.com") ||
        urlString.includes("alchemy.com") ||
        urlString.includes("sepolia") ||
        urlString.includes("ethereum"))
    ) {
      const startTime = Date.now();

      // Try to extract method from request body
      let method = "unknown";
      try {
        if (args[1]?.body && typeof args[1].body === "string") {
          const body = JSON.parse(args[1].body);
          method = body?.method || "unknown";
        }
      } catch (e) {
        // Not JSON or can't parse
        method = "rpc_call";
      }

      // Track the call
      rpcTracker.track(method, { url: urlString });

      // Track duration when response comes back
      return originalFetch.apply(this, args).then((response) => {
        const duration = Date.now() - startTime;
        // You could update the existing call with duration here if needed
        return response;
      });
    }

    // Not an RPC call, pass through normally
    return originalFetch.apply(this, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Web3Provider>
      <ContractProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ContractProvider>
    </Web3Provider>
  </StrictMode>
);
