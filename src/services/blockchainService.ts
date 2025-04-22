"use client";

import { ethers } from "ethers";

const API_URL = "http://localhost:5000/api";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Updated ABI to match the contract we're interacting with
const TICKET_ABI = [
  // Read functions
  "function verifyTicket(string memory filmId, string memory userId, uint256 seatNumber) public view returns (bool)",
  "function getTicketDetails(uint256 ticketId) public view returns (address owner, string memory filmId, uint256 seatNumber, bool valid)",
  "function getTicketByFilmAndSeat(string memory filmId, uint256 seatNumber) public view returns (uint256)",
  "function isTicketValid(uint256 ticketId) public view returns (bool)",

  // Write functions
  "function mintTicket(string memory filmId, uint256 seatNumber, string memory metadataURI) public returns (uint256)",
  "function transferTicket(uint256 ticketId, address to) public",
  "function refundTicket(uint256 ticketId) public",

  // Events
  "event TicketMinted(address indexed owner, uint256 indexed ticketId, string filmId, uint256 seatNumber)",
  "event TicketTransferred(address indexed from, address indexed to, uint256 indexed ticketId)",
  "event TicketRefunded(address indexed owner, uint256 indexed ticketId)",
];

export class BlockchainService {
  private static provider: ethers.BrowserProvider | null = null;
  private static signer: ethers.Signer | null = null;
  private static contract: ethers.Contract | null = null;
  private static address: string = "";
  private static isConnected: boolean = false;

  /**
   * Connect to user's Ethereum wallet
   */
  static async connectWallet(): Promise<string> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to use this feature."
        );
      }

      // Request access to the user's Ethereum accounts
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await this.provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your MetaMask.");
      }

      this.address = accounts[0];
      this.signer = await this.provider.getSigner();

      console.log("Connected to wallet address:", this.address);
      console.log("Contract address:", CONTRACT_ADDRESS);

      // Connect to the contract
      if (CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TICKET_ABI,
          this.signer
        );
        console.log("Contract connection established");
      } else {
        console.error("Contract address is not defined");
        throw new Error(
          "Contract address is not configured. Please check your environment variables."
        );
      }

      this.isConnected = true;
      return this.address;
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Check if wallet is connected
   */
  static isWalletConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get connected wallet address
   */
  static getWalletAddress(): string {
    return this.address;
  }

  /**
   * Verify a ticket on the blockchain
   */
  static async verifyTicket(
    filmId: string,
    userId: string,
    seatNumber: number
  ): Promise<boolean> {
    try {
      console.log(
        `Verifying ticket - Film: ${filmId}, User: ${userId}, Seat: ${seatNumber}`
      );

      // Fallback to API verification first as it's more reliable
      console.log("Using API for verification");
      try {
        const response = await fetch(
          `${API_URL}/reservations/verify/${filmId}/${userId}/${seatNumber}`,
          { method: "GET" }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("API verification response:", data);
          return data.verified === true;
        }
        console.warn(
          "API verification failed, attempting direct blockchain verification"
        );
      } catch (apiError) {
        console.error("API verification error:", apiError);
      }

      // Try direct contract verification if connected
      if (this.contract && this.signer) {
        try {
          console.log("Using direct blockchain verification");

          // First try direct verification method
          try {
            const isVerified = await this.contract.verifyTicket(
              filmId,
              userId,
              seatNumber
            );
            console.log(`Direct verification result: ${isVerified}`);
            return isVerified;
          } catch (directError) {
            console.warn(
              "Direct verification failed, trying alternative method:",
              directError
            );
          }

          // Try alternative verification approach
          try {
            // Find the ticket ID for this film and seat
            const ticketId = await this.contract.getTicketByFilmAndSeat(
              filmId,
              seatNumber
            );
            console.log(`Found ticket ID: ${ticketId.toString()}`);

            if (ticketId && !ticketId.isZero()) {
              // Check if the ticket is valid
              const isValid = await this.contract.isTicketValid(ticketId);
              console.log(`Ticket validity: ${isValid}`);
              return isValid;
            }
          } catch (altError) {
            console.warn("Alternative verification failed:", altError);
          }
        } catch (error) {
          console.error("Blockchain verification failed:", error);
        }
      } else {
        console.warn(
          "Contract or signer not available for direct blockchain verification"
        );
      }

      // Return false if all verification methods fail
      return false;
    } catch (error) {
      console.error("Error in verification process:", error);
      return false;
    }
  }

  /**
   * Check verification status for multiple tickets
   */
  static async checkBatchVerificationStatus(
    filmId: string,
    userId: string,
    seatNumbers: number[]
  ): Promise<Record<number, boolean>> {
    console.log(`Checking verification for ${seatNumbers.length} seats`);
    const verificationMap: Record<number, boolean> = {};

    // Create promises for all verification requests
    const promises = seatNumbers.map(async (seatNumber) => {
      try {
        console.log(`Verifying seat #${seatNumber}`);
        const verified = await this.verifyTicket(filmId, userId, seatNumber);
        console.log(`Seat #${seatNumber} verification result: ${verified}`);
        verificationMap[seatNumber] = verified;
      } catch (error) {
        console.error(`Error verifying seat #${seatNumber}:`, error);
        verificationMap[seatNumber] = false;
      }
    });

    // Wait for all verification requests to complete
    await Promise.all(promises);
    console.log("Verification results:", verificationMap);
    return verificationMap;
  }

  /**
   * Purchase a ticket directly through the blockchain
   */
  static async purchaseTicket(
    filmId: string,
    seatNumber: number,
    price: number
  ): Promise<boolean> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error("Wallet not connected");
      }

      console.log(
        `Purchasing ticket - Film: ${filmId}, Seat: ${seatNumber}, Price: ${price}`
      );

      // Create metadata URI
      const metadata = {
        filmId,
        seatNumber,
        price,
        timestamp: Date.now(),
      };

      const metadataURI = `data:application/json;base64,${btoa(
        JSON.stringify(metadata)
      )}`;
      console.log("Metadata URI created");

      // Get network to adjust gas settings accordingly
      const network = await this.provider?.getNetwork();
      const chainId = network ? Number(network.chainId) : 1;
      console.log(`Connected to network with chain ID: ${chainId}`);

      try {
        // Estimate gas for the transaction
        const gasEstimate = await this.contract.mintTicket.estimateGas(
          filmId,
          seatNumber,
          metadataURI
        );
        console.log("Estimated gas:", gasEstimate.toString());

        // In ethers v6, gasEstimate is no longer a BigNumber object with mul/div methods
        // We need to use standard arithmetic and convert to a bigint
        const increasedGasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2)); // Add 20% to gas estimate
        console.log("Increased gas limit:", increasedGasLimit.toString());

        // Call the contract to purchase the ticket with the adjusted gas limit
        console.log("Sending transaction to blockchain...");
        const tx = await this.contract.mintTicket(
          filmId,
          seatNumber,
          metadataURI,
          {
            gasLimit: increasedGasLimit,
          }
        );

        console.log("Transaction sent, waiting for confirmation:", tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        return true;
      } catch (gasError: any) {
        // Handle specific errors based on network
        console.error(
          "Gas estimation or transaction execution error:",
          gasError
        );

        // Try with fixed gas limit for networks like Sepolia that might have issues with gas estimation
        if (chainId === 11155111) {
          // Sepolia chain ID
          console.log("Sepolia network detected, using fixed gas limit");
          const tx = await this.contract.mintTicket(
            filmId,
            seatNumber,
            metadataURI,
            {
              gasLimit: 500000, // Fixed gas limit for Sepolia
            }
          );

          console.log(
            "Transaction sent with fixed gas limit, waiting for confirmation:",
            tx.hash
          );
          const receipt = await tx.wait();
          console.log("Transaction confirmed in block:", receipt.blockNumber);

          return true;
        }

        throw gasError;
      }
    } catch (error: any) {
      console.error("Error purchasing ticket:", error);
      // Provide more detailed error information
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
      if (error.reason) {
        console.error(`Error reason: ${error.reason}`);
      }
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  static disconnectWallet(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.address = "";
    this.isConnected = false;
    console.log("Wallet disconnected");
  }
}

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
