"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { BlockchainService } from "@/services/blockchainService";
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

// Network configuration from environment
const EXPECTED_CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID
  ? parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID)
  : 11155111; // Default to Sepolia if not specified
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia";

export function WalletConnect() {
  const [address, setAddress] = useState<string>("");
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (BlockchainService.isWalletConnected()) {
        setAddress(BlockchainService.getWalletAddress());
        await checkNetwork();
      }
    };

    checkConnection();

    // Listen for network changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        checkNetwork();
      });
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("chainChanged", checkNetwork);
      }
    };
  }, []);

  const checkNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainId, 16);

      setWrongNetwork(currentChainId !== EXPECTED_CHAIN_ID);

      if (currentChainId !== EXPECTED_CHAIN_ID) {
        console.warn(
          `Connected to wrong network. Expected: ${EXPECTED_CHAIN_ID} (${NETWORK_NAME}), Got: ${currentChainId}`
        );
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const switchNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      // Try to switch to the expected network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
      });

      // Update state after switching
      setWrongNetwork(false);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}`,
                chainName: NETWORK_NAME,
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              },
            ],
          });
          setWrongNetwork(false);
        } catch (addError) {
          console.error("Error adding the network to MetaMask:", addError);
          setError(`Could not add ${NETWORK_NAME} network to MetaMask.`);
        }
      } else {
        console.error("Error switching network:", switchError);
        setError(`Could not switch to ${NETWORK_NAME} network.`);
      }
    }
  };

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);

    try {
      const walletAddress = await BlockchainService.connectWallet();
      setAddress(walletAddress);
      await checkNetwork();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      console.error("Wallet connection error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    BlockchainService.disconnectWallet();
    setAddress("");
    setWrongNetwork(false);
  };

  const formatAddress = (addr: string): string => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {error && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {address ? (
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center ${
                    wrongNetwork
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  } px-3 py-1 rounded-md border`}
                >
                  {wrongNetwork ? (
                    <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-medium">{formatAddress(address)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {wrongNetwork
                    ? `Connected to wrong network. Please switch to ${NETWORK_NAME}.`
                    : `Connected: ${address}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {wrongNetwork && (
            <Button
              variant="outline"
              size="sm"
              onClick={switchNetwork}
              className="ml-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              Switch to {NETWORK_NAME}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="ml-2"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={connecting}
          className="flex items-center gap-2"
          variant="outline"
          size="sm"
        >
          <Wallet className="h-4 w-4" />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
}
