import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider } from "./contexts/Web3Context";
import { ContractProvider } from "./contexts/ContractContext";

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