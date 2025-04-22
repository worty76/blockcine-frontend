"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Clock,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { BlockchainService } from "@/services/blockchainService";
import { useToast } from "@/components/ui/use-toast";

interface Film {
  _id: string;
  name: string;
  price: number;
  seatQuantity: number;
  img: string;
  description: string;
  duration: number; // Duration in minutes
  releaseDate: Date | string;
  author: string; // userId
  genres: string[];
  createdAt?: Date | string;
  rating?: number; // We'll keep this as it's calculated separately
  featured?: boolean;
}

interface TicketDetails {
  filmId: string;
  filmName: string;
  filmImg: string;
  seatNumber: number;
  price: number;
  verified: boolean;
  bookingTime: Date;
  userId: string;
}

export default function FilmDetail() {
  const params = useParams();
  const router = useRouter();
  const filmId = params?.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const { toast } = useToast();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"regular" | "wallet">(
    "regular"
  );
  const [walletProcessing, setWalletProcessing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(
    null
  );

  // Helper function to format minutes into hours and minutes
  const formatDuration = (minutes: number): string => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    const fetchFilmDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!filmId || filmId === "undefined") {
          throw new Error("Invalid film ID");
        }

        console.log("Fetching film with ID:", filmId);

        const response = await fetch(
          `http://localhost:5000/api/film/${encodeURIComponent(filmId)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to fetch film: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Fetched film data:", data);

        // Extract film data, handling both direct data and nested filmDetail
        const filmData = {
          _id: data._id || data.filmDetail?._id,
          name: data.name || data.filmDetail?.name,
          price: data.price || data.filmDetail?.price,
          seatQuantity: data.seatQuantity || data.filmDetail?.seatQuantity,
          img: data.img || data.filmDetail?.img,
          description:
            data.description ||
            data.filmDetail?.description ||
            "No description available for this film.",
          duration: data.duration || data.filmDetail?.duration,
          releaseDate: data.releaseDate || data.filmDetail?.releaseDate,
          author: data.author || data.filmDetail?.author,
          genres: data.genres || data.filmDetail?.genres || [],
          rating: 4.5, // Default rating if not provided
        };

        setFilm(filmData);

        if (data.reservations && Array.isArray(data.reservations)) {
          const bookedSeats = data.reservations.map(
            (reservation: any) => reservation.seatNumber
          );
          setBookedSeats(bookedSeats);
        } else {
          fetchBookedSeats(filmData._id);
        }
      } catch (error) {
        console.error("Error fetching film:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (filmId) {
      fetchFilmDetails();
    } else {
      setError("No film ID provided");
      setLoading(false);
    }
  }, [filmId]);

  useEffect(() => {
    checkWalletConnection();

    const checkInterval = setInterval(checkWalletConnection, 2000);
    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (!walletConnected && paymentMethod === "wallet") {
      setPaymentMethod("regular");
    }
  }, [walletConnected, paymentMethod]);

  useEffect(() => {
    if (paymentMethod === "wallet") {
      checkWalletConnection();
    }
  }, [paymentMethod]);

  const fetchBookedSeats = async (filmId: string) => {
    if (!filmId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/film/${encodeURIComponent(filmId)}/seats`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.bookedSeats && Array.isArray(data.bookedSeats)) {
          setBookedSeats(data.bookedSeats);
        }
      } else {
        console.warn("Failed to fetch booked seats:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching booked seats:", error);
    }
  };

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

  const handleSeatSelection = (seatNumber: number) => {
    if (bookedSeats.includes(seatNumber)) return;

    setSelectedSeat(selectedSeat === seatNumber ? null : seatNumber);
  };

  // Standard payment with 15-minute expiration
  const handleBooking = async () => {
    if (!selectedSeat || !film) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(`/film/${filmId}`));
      return;
    }

    try {
      setBookingInProgress(true);

      // Create reservation with 15-minute expiration time
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id, // Make sure to include userId from the auth store
          filmId: film._id,
          seatNumber: selectedSeat,
          blockchainVerified: false, // This ensures expiration time is set
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create reservation");
      }

      const data = await response.json();
      console.log("Reservation successful:", data);

      toast({
        title: "Reservation successful",
        description: "You have 15 minutes to complete your payment",
        duration: 5000,
      });

      setBookingSuccess(true);
      setBookedSeats([...bookedSeats, selectedSeat]);

      // Set ticket details
      setTicketDetails({
        filmId: film._id,
        filmName: film.name,
        filmImg: film.img,
        seatNumber: selectedSeat,
        price: film.price,
        verified: false,
        bookingTime: new Date(),
        userId: user?.id || "",
      });

      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Reservation failed:", error);
      toast({
        title: "Reservation Failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!selectedSeat || !film) return;

    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(`/film/${filmId}`));
      return;
    }

    try {
      setWalletError("");
      setWalletProcessing(true);
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
          return;
        }
      }

      toast({
        title: "Processing payment",
        description: "Please confirm the transaction in your wallet...",
        duration: 5000,
      });

      const success = await BlockchainService.purchaseTicket(
        film._id,
        selectedSeat,
        film.price
      );

      if (!success) {
        throw new Error("Blockchain transaction failed");
      }

      const walletAddress = BlockchainService.getWalletAddress();
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          filmId: film._id,
          seatNumber: selectedSeat,
          blockchainVerified: true, // Mark as blockchain verified to bypass expiration
          walletAddress: walletAddress,
          blockIndex: Math.floor(Math.random() * 1000000) + 15000000,
          transactionHash: "0x" + Math.random().toString(16).slice(2, 66),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record blockchain payment");
      }

      const data = await response.json();
      console.log("Blockchain payment successful:", data);

      setBookingSuccess(true);
      setBookedSeats([...bookedSeats, selectedSeat]);

      // Set ticket details
      setTicketDetails({
        filmId: film._id,
        filmName: film.name,
        filmImg: film.img,
        seatNumber: selectedSeat,
        price: film.price,
        verified: true, // Blockchain payments are verified immediately
        bookingTime: new Date(),
        userId: user?.id || "",
      });

      toast({
        title: "Payment Successful",
        description: "Your blockchain transaction was successful!",
        duration: 5000,
      });

      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedSeat(null);
      }, 3000);
    } catch (error: any) {
      console.error("Blockchain payment failed:", error);
      setWalletError(error.message || "Transaction failed");
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to complete blockchain payment",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setWalletProcessing(false);
    }
  };

  // Update the handleViewTicket function to navigate to the profile page
  const handleViewTicket = () => {
    router.push("/me/profile?tab=verified");
    setBookingSuccess(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/5">
              <Skeleton className="aspect-[2/3] w-full h-[500px] rounded-xl bg-gray-800/50" />
            </div>
            <div className="w-full md:w-3/5 space-y-6">
              <Skeleton className="h-10 w-3/4 bg-gray-800/50" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 bg-gray-800/50" />
                <Skeleton className="h-6 w-20 bg-gray-800/50" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-800/50" />
              <Skeleton className="h-4 w-full bg-gray-800/50" />
              <Skeleton className="h-4 w-3/4 bg-gray-800/50" />
              <div className="mt-8">
                <Skeleton className="h-8 w-32 bg-gray-800/50" />
                <div className="grid grid-cols-8 gap-2 mt-4">
                  {[...Array(16)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 bg-gray-800/50" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="container mx-auto p-8 mt-8 text-center">
        <Card className="max-w-md mx-auto bg-[#1A171E] border border-gray-800">
          <CardContent className="pt-6 pb-6">
            <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">
              {error || "Film not found"}
            </h2>
            <p className="text-gray-400 mb-6">
              We couldn't find the film you're looking for. It may have been
              removed or the ID is incorrect.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              Back to Movies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-8 text-white">
      {bookingSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-[#1A171E] rounded-xl p-8 max-w-md w-full text-center border border-green-500/30 shadow-lg shadow-green-500/20">
            <div className="h-16 w-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Booking Successful!
            </h2>
            <p className="text-gray-300 mb-6">
              Your reservation for seat {selectedSeat} has been confirmed.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                onClick={handleViewTicket}
              >
                <Ticket className="h-4 w-4 mr-2" />
                View My Tickets
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-700 text-black"
                onClick={() => setBookingSuccess(false)}
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/5 relative">
            <div className="sticky top-20">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-gray-800 shadow-lg">
                <Image
                  src={film.img}
                  alt={film.name}
                  fill
                  className="object-cover"
                />
                {film.featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2">
                    <Star className="fill-yellow-500 text-yellow-500 h-5 w-5" />
                    <span className="text-lg font-bold text-white">
                      {film.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 bg-[#1A171E] p-3 rounded-lg border border-gray-800">
                <div className="h-8 w-8 rounded-full bg-cyan-900/30 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-cyan-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 10L12 5L17 10L12 15L7 10Z" />
                    <path d="M12 15L7 20L12 25L17 20L12 15Z" opacity="0.5" />
                    <path d="M12 5L17 0L22 5L17 10L12 5Z" opacity="0.5" />
                    <path d="M17 10L22 5L27 10L22 15L17 10Z" opacity="0.3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-cyan-400 font-medium">
                    Blockchain Verified
                  </p>
                  <p className="text-xs text-gray-500">
                    Tickets secured on Ethereum
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/5">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{film.name}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              {film.genres &&
                film.genres.map((genre, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 bg-purple-900/20"
                  >
                    {genre}
                  </Badge>
                ))}
              <div className="flex items-center text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDuration(film.duration)}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(film.releaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-gray-300 mb-6">{film.description}</p>

            <div className="mb-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-cyan-400">
                  ${film.price}
                </span>
                <span className="text-gray-400">
                  {film.seatQuantity - bookedSeats.length} seats available
                </span>
              </div>
            </div>

            {/* Recommendation Section */}
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/20 rounded-lg border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                Critic's Choice
              </h3>
              <p className="text-gray-300 text-sm">
                This film is highly recommended for fans of{" "}
                {film.genres?.slice(0, 2).join(" and ")}. With its{" "}
                {film.duration > 120 ? "epic runtime" : "compact storytelling"}{" "}
                and stunning visuals, it delivers an unforgettable experience.
              </p>
              <div className="mt-3 flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 opacity-60" />
                <span className="ml-2 text-sm text-yellow-300 font-medium">
                  4.5/5
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Select a Seat</h3>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-800/50 border border-gray-700 rounded"></div>
                    <span className="text-gray-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span className="text-gray-400">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-700 rounded"></div>
                    <span className="text-gray-400">Booked</span>
                  </div>
                </div>
              </div>

              {/* Theater Screen */}
              <div className="mb-10 perspective">
                <div className="h-4 bg-gradient-to-r from-purple-600/20 via-cyan-500/40 to-purple-600/20 rounded-t-xl"></div>
                <div className="h-1.5 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-b-xl transform rotate-x-12 shadow-md shadow-cyan-500/25"></div>
                <p className="text-center text-xs text-gray-500 mt-2">SCREEN</p>
              </div>

              {/* Seating area with perspective */}
              <div className="w-full mb-8 pb-4 overflow-auto perspective-1000">
                <div className="transform-gpu rotateX-5 mx-auto">
                  {(() => {
                    // Configure theater layout
                    const seatsPerRow = 8; // Seats per row
                    const rows = Math.ceil(film.seatQuantity / seatsPerRow);
                    const rowLabels = "ABCDEFGHIJKLMNOPQR".split("");

                    return (
                      <div className="space-y-3">
                        {Array.from({ length: rows }).map((_, rowIndex) => {
                          const rowLabel = rowLabels[rowIndex];
                          const startSeat = rowIndex * seatsPerRow + 1;

                          // Calculate curved effect - middle rows have less indent
                          const curveFactor =
                            Math.abs(rowIndex - (rows - 1) / 2) / (rows / 2);
                          const rowIndent = Math.max(10, 20 * curveFactor);

                          return (
                            <div
                              key={rowLabel}
                              className="flex justify-center items-center gap-2"
                              style={{
                                paddingLeft: `${rowIndent}px`,
                                paddingRight: `${rowIndent}px`,
                                transform: `scale(${1 - rowIndex * 0.01})`, // Subtle scaling effect
                              }}
                            >
                              {/* Row label */}
                              <div className="w-6 text-xs text-gray-400 font-medium text-right">
                                {rowLabel}
                              </div>

                              {/* Seats */}
                              <div className="flex gap-2 justify-center">
                                {Array.from({
                                  length: Math.min(
                                    seatsPerRow,
                                    film.seatQuantity - rowIndex * seatsPerRow
                                  ),
                                }).map((_, seatIndex) => {
                                  const seatNumber = startSeat + seatIndex;
                                  const isSelected =
                                    selectedSeat === seatNumber;
                                  const isBooked =
                                    bookedSeats.includes(seatNumber);

                                  // Add aisle in the middle
                                  const isAisle =
                                    seatIndex === seatsPerRow / 2 - 1;

                                  return (
                                    <Fragment key={seatNumber}>
                                      <button
                                        onClick={() =>
                                          handleSeatSelection(seatNumber)
                                        }
                                        disabled={isBooked}
                                        title={`Row ${rowLabel} Seat ${
                                          seatIndex + 1
                                        }`}
                                        aria-label={`Row ${rowLabel} Seat ${
                                          seatIndex + 1
                                        }${isBooked ? " (Booked)" : ""}${
                                          isSelected ? " (Selected)" : ""
                                        }`}
                                        className={`h-9 w-9 rounded-t-lg text-xs flex items-center justify-center transition-all ${
                                          isSelected
                                            ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md shadow-purple-500/25"
                                            : isBooked
                                            ? "bg-gray-700/60 text-gray-500 cursor-not-allowed"
                                            : "bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-purple-500/50 hover:bg-gray-700/70 cursor-pointer"
                                        }`}
                                      >
                                        {seatIndex + 1}
                                      </button>
                                      {isAisle && <div className="w-4"></div>}
                                    </Fragment>
                                  );
                                })}
                              </div>

                              {/* Row label (right side) */}
                              <div className="w-6 text-xs text-gray-400 font-medium text-left">
                                {rowLabel}
                              </div>
                            </div>
                          );
                        })}

                        {/* Theater information */}
                        <div className="mt-8 text-center">
                          <div className="inline-block px-6 py-1.5 bg-gray-800/50 rounded-full text-sm text-gray-300">
                            <span className="font-medium">
                              {film.seatQuantity - bookedSeats.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {film.seatQuantity}
                            </span>{" "}
                            seats available
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="mb-6 flex flex-col space-y-2">
                <div className="text-sm font-medium text-white">
                  Payment Method
                </div>
                <div className="flex border border-gray-800 rounded-lg overflow-hidden">
                  <button
                    className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                      paymentMethod === "regular"
                        ? "bg-purple-700/70 text-white"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-800/70"
                    } transition-colors`}
                    onClick={() => setPaymentMethod("regular")}
                  >
                    Regular Payment
                  </button>
                  <button
                    disabled={!walletConnected}
                    className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                      paymentMethod === "wallet"
                        ? "bg-purple-700/70 text-white"
                        : !walletConnected
                        ? "bg-gray-800/20 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-800/70"
                    } transition-colors`}
                    onClick={() => {
                      if (walletConnected) setPaymentMethod("wallet");
                    }}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7 10L12 5L17 10L12 15L7 10Z" />
                        <path
                          opacity="0.6"
                          d="M12 15L7 20L12 25L17 20L12 15Z"
                        />
                      </svg>
                      ETH Wallet
                      {!walletConnected && (
                        <AlertCircle className="ml-1 h-3 w-3 text-gray-500" />
                      )}
                    </div>
                  </button>
                </div>

                {!walletConnected && (
                  <div className="text-xs text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      Connect your wallet in the navigation bar to enable ETH
                      payments
                    </span>
                  </div>
                )}
              </div>

              {paymentMethod === "regular" ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedSeat || bookingInProgress}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                        Creating reservation...
                      </>
                    ) : selectedSeat ? (
                      `Reserve Seat ${selectedSeat} for $${film?.price}`
                    ) : (
                      "Select a Seat"
                    )}
                  </Button>

                  <div className="p-3 bg-purple-900/10 rounded-md border border-purple-800/40">
                    <div className="flex gap-2 items-center">
                      <Clock className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-purple-300 font-medium">
                          Two-step booking process
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Your seat will be reserved for 15 minutes while you
                          complete payment in your profile.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {walletConnected ? (
                    <div className="bg-blue-900/20 rounded-md p-3 border border-blue-800/40">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <p className="text-xs text-cyan-300">
                          Connected: {walletAddress.substring(0, 6)}...
                          {walletAddress.substring(walletAddress.length - 4)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/20 rounded-md p-3 border border-yellow-800/40">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                        <p className="text-xs text-yellow-300">
                          Wallet not connected. Please connect your wallet to
                          use this payment method.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleWalletPayment}
                    disabled={
                      !selectedSeat || walletProcessing || !walletConnected
                    }
                    className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {walletProcessing ? (
                      <>
                        <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                        Processing ETH Transaction...
                      </>
                    ) : !walletConnected ? (
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
                        Connect Wallet To Pay
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
                        {selectedSeat
                          ? `Pay ${film?.price} ETH for Seat ${selectedSeat}`
                          : "Select a Seat"}
                      </>
                    )}
                  </Button>

                  {walletError && (
                    <div className="p-3 bg-red-900/20 rounded-md border border-red-800/40 text-sm text-red-300">
                      {walletError}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-900/20 rounded-md border border-blue-800/40">
                    <div className="flex gap-2 items-center">
                      <svg
                        className="h-5 w-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <p className="text-xs text-cyan-300">
                        {walletConnected
                          ? "Click 'Pay' to initiate the blockchain transaction. You'll need to confirm this in your wallet."
                          : "Paying with ETH requires a connected wallet. Please connect your wallet in the navigation bar first."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  You'll need to log in to complete your booking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
