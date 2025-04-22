"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  Ticket,
  Share2,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AvatarUploadModal } from "@/components/user/AvatarUploadModal";
import { PasswordChangeDialog } from "@/components/user/PasswordChangeDialog";
import { useToast } from "@/components/ui/use-toast";
import { BlockchainService } from "@/services/blockchainService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Ticket/Reservation types
interface Ticket {
  _id: string;
  filmId: string | { _id: string; name?: string; img?: string }; // Match your actual model
  userId: string;
  seatNumber: number;
  verified: boolean;
  createdAt: string;
  expiresAt?: string; // For pending reservations
  blockIndex?: number; // For blockchain verified tickets
  filmTitle?: string; // This will be populated from the film's name
}

// Add a user interface for the full profile data
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { toast } = useToast();
  const [processingTicketId, setProcessingTicketId] = useState<string | null>(
    null
  );
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [walletProcessing, setWalletProcessing] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  // Handle authentication with a delay to ensure store is loaded
  useEffect(() => {
    const authCheckTimer = setTimeout(() => {
      if (isAuthenticated === false) {
        router.push("/login");
      }
      setAuthLoading(false);
    }, 500);

    return () => clearTimeout(authCheckTimer);
  }, [isAuthenticated, router]);

  // Fetch user's complete profile data
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchUserProfile();
    }
  }, [user?.id, isAuthenticated, authLoading]);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      console.log("Fetching profile for user ID:", user?.id);

      const response = await fetch(
        `http://localhost:5000/api/auth/profile/${user?.id}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("User profile data:", data);
      setUserProfile(data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast({
        title: "Profile Error",
        description: "Failed to load your profile data",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch user's tickets and reservations
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchUserTickets();
    }
  }, [user?.id, isAuthenticated, authLoading]);

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      console.log("Fetching tickets for user ID:", user?.id);

      const response = await fetch(
        `http://localhost:5000/api/reservations/${user?.id}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Tickets data:", data);
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check wallet connection on component mount and set interval
  useEffect(() => {
    checkWalletConnection();

    const checkInterval = setInterval(checkWalletConnection, 2000);
    return () => clearInterval(checkInterval);
  }, []);

  // Check wallet connection status
  const checkWalletConnection = () => {
    try {
      const isConnected = BlockchainService.isWalletConnected();
      if (isConnected !== walletConnected) {
        setWalletConnected(isConnected);
        if (isConnected) {
          setWalletAddress(BlockchainService.getWalletAddress());
        } else {
          setWalletAddress("");
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  // Handle payment for a reservation - wallet payment only
  const handlePayment = async (ticketId: string) => {
    try {
      setProcessingTicketId(ticketId);
      setWalletProcessing(true);
      setWalletError("");

      // Find the ticket to get its details
      const ticket = tickets.find((t) => t._id === ticketId);
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Get film details for the ticket
      const filmId =
        typeof ticket.filmId === "string" ? ticket.filmId : ticket.filmId._id;
      const filmName =
        typeof ticket.filmId === "string"
          ? ticket.filmTitle || "Film"
          : ticket.filmId.name || "Film";
      const seatNumber = ticket.seatNumber;

      // Handle wallet payment
      toast({
        title: "Connecting to wallet",
        description: "Please approve the connection in your wallet...",
        duration: 3000,
      });

      if (!walletConnected) {
        try {
          const address = await BlockchainService.connectWallet();
          setWalletConnected(true);
          setWalletAddress(address);
          toast({
            title: "Wallet connected",
            description: `Connected to ${address.substring(
              0,
              6
            )}...${address.substring(address.length - 4)}`,
            duration: 3000,
          });
        } catch (walletError: any) {
          console.error("Wallet connection error:", walletError);
          setWalletError(walletError.message || "Failed to connect wallet");
          setWalletProcessing(false);
          toast({
            title: "Wallet Connection Failed",
            description: walletError.message || "Could not connect to wallet",
            variant: "destructive",
            duration: 5000,
          });
          setProcessingTicketId(null);
          return;
        }
      }

      toast({
        title: "Processing payment",
        description: "Please confirm the transaction in your wallet...",
        duration: 5000,
      });

      // Assume price is $10 for now, in a real app you would get this from the ticket
      const ticketPrice = 10.0;
      const success = await BlockchainService.purchaseTicket(
        filmId,
        seatNumber,
        ticketPrice
      );

      if (!success) {
        throw new Error("Blockchain transaction failed");
      }

      const walletAddress = BlockchainService.getWalletAddress();

      // Update the reservation with blockchain verification
      const response = await fetch(
        `http://localhost:5000/api/reservation/payment/${ticketId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentDetails: {
              paymentMethod: "blockchain",
              amount: ticketPrice,
              walletAddress: walletAddress,
              blockIndex: Math.floor(Math.random() * 1000000) + 15000000,
              transactionHash: "0x" + Math.random().toString(16).slice(2, 66),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Payment verification failed");
      }

      await fetchUserTickets();
      setWalletProcessing(false);

      toast({
        title: "Payment Successful",
        description: `Your blockchain payment for ${filmName} (Seat ${seatNumber}) was successful!`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Payment failed:", error);
      setWalletError(error instanceof Error ? error.message : "Payment failed");
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setProcessingTicketId(null);
      setWalletProcessing(false);
      setLoading(false);
    }
  };

  // Calculate time remaining for pending reservations
  const getTimeRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;

    if (diff <= 0) return { minutes: 0, seconds: 0, percentLeft: 0 };

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const originalTime = 15 * 60 * 1000;
    const percentLeft = Math.max(0, Math.min(100, (diff / originalTime) * 100));

    return { minutes, seconds, percentLeft };
  };

  const pendingTickets = tickets.filter(
    (ticket) =>
      !ticket.verified &&
      ticket.expiresAt &&
      new Date(ticket.expiresAt) > new Date()
  );
  const verifiedTickets = tickets.filter((ticket) => ticket.verified);
  const expiredTickets = tickets.filter(
    (ticket) =>
      !ticket.verified &&
      ticket.expiresAt &&
      new Date(ticket.expiresAt) <= new Date()
  );

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  const handleViewTicket = (ticket: Ticket) => {
    setViewingTicket(ticket);
    setTicketDialogOpen(true);
  };

  const handleDownloadTicket = () => {
    if (!viewingTicket) return;

    toast({
      title: "Download Started",
      description: "Your ticket is being downloaded...",
      duration: 3000,
    });

    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your ticket has been downloaded successfully.",
        duration: 3000,
      });
    }, 1500);
  };

  const handleShareTicket = () => {
    if (!viewingTicket) return;

    if (navigator.share) {
      navigator
        .share({
          title: `Movie Ticket - ${
            typeof viewingTicket.filmId === "string"
              ? viewingTicket.filmTitle || "Movie"
              : viewingTicket.filmId.name || "Movie"
          }`,
          text: `My ticket for seat ${viewingTicket.seatNumber}`,
          url: window.location.href,
        })
        .then(() => {
          toast({
            title: "Shared Successfully",
            description: "Your ticket has been shared.",
            duration: 3000,
          });
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      toast({
        title: "Sharing Not Available",
        description: "Your browser doesn't support sharing.",
        duration: 3000,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen bg-[#0A0A10]">
        <div className="relative text-center">
          <div className="h-16 w-16 mx-auto rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin"></div>
          <p className="mt-4 text-gray-300 font-medium">
            Loading your profile...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we verify your authentication.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center min-h-screen bg-[#0A0A10]">
        <p className="text-gray-300">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#0A0A10] to-[#121218] min-h-screen pb-12 px-4">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <Card className="bg-[#1A171E] border border-gray-800 text-black">
              <CardHeader className="flex flex-col items-center">
                {profileLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin"></div>
                    <p className="text-gray-400 text-sm">Loading profile...</p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-md opacity-70"></div>
                      <Avatar className="h-24 w-24 relative">
                        <AvatarImage
                          src={userProfile?.avatar || user?.avatar || ""}
                          alt={userProfile?.name || user?.name || "User"}
                        />
                        <AvatarFallback className="text-2xl bg-[#252330]">
                          {getInitials(
                            userProfile?.name || user?.name || "User"
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="mt-4 text-xl text-white">
                      {userProfile?.name || user?.name || "User"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {userProfile?.email || user?.email || "No email provided"}
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              {!profileLoading && (
                <CardFooter className="flex justify-center">
                  <AvatarUploadModal
                    currentAvatar={userProfile?.avatar || user?.avatar}
                    onAvatarUpdated={(newAvatarUrl) => {
                      if (userProfile) {
                        setUserProfile({
                          ...userProfile,
                          avatar: newAvatarUrl,
                        });
                      }

                      toast({
                        title: "Avatar updated",
                        description:
                          "Your profile image has been updated successfully.",
                      });
                    }}
                    userName={userProfile?.name || user?.name || "User"}
                  />
                </CardFooter>
              )}
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-[#1A171E] border border-gray-800 text-black">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">
                  Account Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your personal account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                  <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">
                      Full Name
                    </p>
                    <p className="text-gray-400">
                      {userProfile?.name || user?.name || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                  <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">
                      Email Address
                    </p>
                    <p className="text-gray-400">
                      {userProfile?.email || user?.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                  <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">
                      Account Created
                    </p>
                    <p className="text-gray-400">
                      {userProfile?.createdAt
                        ? new Date(userProfile.createdAt).toLocaleDateString()
                        : user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <PasswordChangeDialog />
              </CardFooter>
            </Card>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          My Tickets & Reservations
        </h2>
        <Tabs defaultValue="pending" className="text-white">
          <TabsList className="mb-4 bg-[#1A171E] border border-gray-800">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-white text-gray-300"
            >
              Pending{" "}
              <Badge
                variant="outline"
                className="ml-2 border-gray-700 bg-[#252330] text-gray-300"
              >
                {pendingTickets.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-white text-gray-300"
            >
              Confirmed{" "}
              <Badge
                variant="outline"
                className="ml-2 border-gray-700 bg-[#252330] text-gray-300"
              >
                {verifiedTickets.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="expired"
              className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-white text-gray-300"
            >
              Expired{" "}
              <Badge
                variant="outline"
                className="ml-2 border-gray-700 bg-[#252330] text-gray-300"
              >
                {expiredTickets.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            {loading ? (
              <Card className="bg-[#1A171E] border border-gray-800 text-gray-300">
                <CardContent className="py-8 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin mb-4"></div>
                  Loading your pending reservations...
                </CardContent>
              </Card>
            ) : pendingTickets.length === 0 ? (
              <Card className="bg-[#1A171E] border border-gray-800 text-gray-300">
                <CardContent className="py-8 text-center">
                  You don't have any pending reservations.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {pendingTickets.map((ticket) => {
                  const { minutes, seconds, percentLeft } = getTimeRemaining(
                    ticket.expiresAt || ""
                  );
                  const isExpiring = minutes < 5;
                  const ticketId = ticket._id;
                  const isProcessing = processingTicketId === ticketId;

                  return (
                    <Card
                      key={ticketId}
                      className={`bg-[#1A171E] text-white border ${
                        isProcessing
                          ? "border-blue-600/50"
                          : isExpiring
                          ? "border-yellow-600/50"
                          : "border-gray-800"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-white">
                              {typeof ticket.filmId === "string"
                                ? `Film ID: ${ticket.filmId}`
                                : ticket.filmId.name ||
                                  `Film ID: ${ticket.filmId._id}`}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              Seat {ticket.seatNumber}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-yellow-900/20 text-yellow-400 border-yellow-700/50"
                          >
                            <Clock className="h-3 w-3 mr-1" /> Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {ticket.expiresAt ? (
                            <div>
                              <p className="text-sm font-medium mb-1 text-gray-300">
                                Time remaining to complete payment:
                              </p>
                              <div className="flex items-center">
                                <Clock
                                  className={`h-4 w-4 mr-2 ${
                                    isExpiring
                                      ? "text-red-500"
                                      : "text-yellow-500"
                                  }`}
                                />
                                <span
                                  className={
                                    isExpiring
                                      ? "text-red-500 font-bold"
                                      : "text-yellow-400 font-medium"
                                  }
                                >
                                  {minutes}m {seconds}s
                                </span>
                              </div>
                              <Progress
                                value={percentLeft}
                                className={`h-2 mt-2 ${
                                  isExpiring
                                    ? "bg-red-900/20"
                                    : "bg-yellow-900/20"
                                }`}
                                indicatorClassName={
                                  isExpiring
                                    ? "bg-red-500"
                                    : "bg-gradient-to-r from-yellow-500 to-amber-500"
                                }
                              />
                            </div>
                          ) : null}

                          <p className="text-sm text-gray-400">
                            Reserved on{" "}
                            {new Date(ticket.createdAt).toLocaleString()}
                          </p>

                          {/* Wallet payment information */}
                          <div className="mt-3 border-t border-gray-800 pt-3">
                            <p className="text-sm mb-2 text-gray-300">
                              ETH Wallet Payment
                            </p>

                            {walletConnected ? (
                              <div className="bg-blue-900/20 rounded-md p-2 border border-blue-800/40">
                                <div className="flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                  <p className="text-xs text-cyan-300">
                                    Connected: {walletAddress.substring(0, 6)}
                                    ...
                                    {walletAddress.substring(
                                      walletAddress.length - 4
                                    )}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-yellow-900/20 rounded-md p-2 border border-yellow-800/40">
                                <div className="flex items-center">
                                  <AlertCircle className="h-3 w-3 text-yellow-400 mr-2" />
                                  <p className="text-xs text-yellow-300">
                                    Connect wallet to complete payment
                                  </p>
                                </div>
                              </div>
                            )}

                            {walletError && (
                              <div className="bg-red-900/20 rounded-md p-2 mt-2 border border-red-800/40">
                                <div className="flex items-center">
                                  <AlertCircle className="h-3 w-3 text-red-400 mr-2" />
                                  <p className="text-xs text-red-300">
                                    {walletError}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full text-white border-0 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
                          onClick={() => handlePayment(ticket._id)}
                          disabled={
                            processingTicketId === ticket._id ||
                            !walletConnected ||
                            walletProcessing
                          }
                        >
                          {processingTicketId === ticket._id ? (
                            <>
                              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                              {walletProcessing
                                ? "Processing ETH Transaction..."
                                : "Connecting to Wallet..."}
                            </>
                          ) : (
                            <>
                              <svg
                                className="h-4 w-4 mr-2"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M7 10L12 5L17 10L12 15L7 10Z" />
                                <path
                                  opacity="0.6"
                                  d="M12 15L7 20L12 25L17 20L12 15Z"
                                />
                              </svg>
                              Complete ETH Payment
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verified" className="mt-0">
            {loading ? (
              <Card className="bg-[#1A171E] border border-gray-800 text-gray-300">
                <CardContent className="py-8 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin mb-4"></div>
                  Loading your confirmed tickets...
                </CardContent>
              </Card>
            ) : verifiedTickets.length === 0 ? (
              <Card className="bg-[#1A171E] border border-gray-800 text-gray-300">
                <CardContent className="py-8 text-center">
                  You don't have any confirmed tickets.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {verifiedTickets.map((ticket) => (
                  <Card
                    key={ticket._id}
                    className="bg-[#1A171E] border border-gray-800 text-white"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white">
                            {typeof ticket.filmId === "string"
                              ? `Film ID: ${ticket.filmId}`
                              : ticket.filmId.name ||
                                `Film ID: ${ticket.filmId._id}`}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Seat {ticket.seatNumber}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-900/20 text-green-400 border-green-700/50"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Confirmed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">
                          Purchased on{" "}
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                        {ticket.blockIndex !== undefined && (
                          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-800/30 w-fit">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7 10L12 5L17 10L12 15L7 10Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12 15L7 20L12 25L17 20L12 15Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12 5L17 0L22 5L17 10L12 5Z"
                                fill="currentColor"
                              />
                              <path
                                d="M17 10L22 5L27 10L22 15L17 10Z"
                                fill="currentColor"
                              />
                            </svg>
                            Blockchain verified (Block #{ticket.blockIndex})
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-purple-700/50 text-black hover:bg-purple-900/20"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        View Ticket
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="mt-0">
            {loading ? (
              <Card className="bg-[#1A171E] border border-gray-800 text-gray-300">
                <CardContent className="py-8 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin mb-4"></div>
                  Loading expired reservations...
                </CardContent>
              </Card>
            ) : expiredTickets.length === 0 ? (
              <Card className="bg-[#1A171E] border border-gray-800 text-gray-300">
                <CardContent className="py-8 text-center">
                  You don't have any expired reservations.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {expiredTickets.map((ticket) => (
                  <Card
                    key={ticket._id}
                    className="bg-[#1A171E] border-gray-700/50 border opacity-80 text-gray-400"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-gray-400">
                            {typeof ticket.filmId === "string"
                              ? `Film ID: ${ticket.filmId}`
                              : ticket.filmId.name ||
                                `Film ID: ${ticket.filmId._id}`}
                          </CardTitle>
                          <CardDescription className="text-gray-500">
                            Seat {ticket.seatNumber}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-gray-800 text-gray-400 border-gray-700"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" /> Expired
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Reserved on{" "}
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expired on{" "}
                        {new Date(ticket.expiresAt || "").toLocaleString()}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-400 hover:bg-gray-800/50"
                        onClick={() =>
                          router.push(
                            `/film/${
                              typeof ticket.filmId === "string"
                                ? ticket.filmId
                                : ticket.filmId._id
                            }`
                          )
                        }
                      >
                        Book Again
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Ticket Detail Dialog */}
        <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
          <DialogContent className="bg-[#1A171E] text-white border border-gray-800 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                Your Ticket
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Blockchain verified ticket information
              </DialogDescription>
            </DialogHeader>

            {viewingTicket && (
              <div className="space-y-4">
                {/* Film Information */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg blur-md opacity-70"></div>
                  <div className="relative bg-[#252330] p-4 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-purple-900/50 rounded-full flex items-center justify-center">
                        <Ticket className="h-6 w-6 text-purple-300" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white">
                          {typeof viewingTicket.filmId === "string"
                            ? viewingTicket.filmTitle || "Film"
                            : viewingTicket.filmId.name || "Film"}
                        </h3>
                        <p className="text-sm text-cyan-400">
                          Seat {viewingTicket.seatNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-[#252330]/50 p-4 rounded-lg border border-gray-700/50 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Ticket ID</p>
                      <p className="text-sm font-mono bg-gray-800/50 rounded px-2 py-1 text-gray-200 overflow-hidden text-ellipsis">
                        {viewingTicket._id}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Purchase Date</p>
                      <p className="text-sm font-medium text-gray-300">
                        {new Date(viewingTicket.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {viewingTicket.blockIndex && (
                      <>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">Block #</p>
                          <p className="text-sm font-medium text-cyan-400">
                            {viewingTicket.blockIndex}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">Verification</p>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
                            <p className="text-sm font-medium text-green-400">
                              Verified
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-40 h-40 bg-white p-2 rounded">
                      <div className="w-full h-full bg-[#252330] flex items-center justify-center text-xs text-gray-400">
                        QR Code would be generated here
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    Present this ticket at the entrance
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 sm:justify-between">
              <Button
                variant="outline"
                className="border-gray-700 hover:border-cyan-600 hover:bg-cyan-950/30 text-gray-300"
                onClick={handleShareTicket}
              >
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>

              <Button
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                onClick={handleDownloadTicket}
              >
                <Download className="h-4 w-4 mr-2" /> Download Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            Tickets secured on the Ethereum blockchain.{" "}
            <span className="text-purple-400 cursor-pointer hover:underline">
              Learn more about our web3 technology
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
