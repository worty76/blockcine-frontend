"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  RefreshCw,
  ThumbsUp,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";

interface Film {
  _id: string;
  name: string;
  price: number;
  seatQuantity: number;
  img: string;
  description: string;
  duration: number;
  releaseDate: Date;
  genres: string[];
  createdAt: Date;
}

interface Recommendation {
  _id: string;
  userId: string;
  movieId: Film;
  basedOnMovieId?: Film;
  matchedGenres: string[];
  recommendationScore: number;
  reasoning?: string;
  createdAt: Date;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use the auth store instead of direct localStorage access
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated || !token) {
      router.push("/auth/login?redirect=/recommendations");
      return;
    }

    fetchRecommendations();
  }, [isAuthenticated, token, router]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use token from auth store
      if (!token) {
        router.push("/auth/login?redirect=/recommendations");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/recommendations",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch recommendations");
      }

      setRecommendations(data.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Use token from auth store
      if (!token) {
        router.push("/auth/login?redirect=/recommendations");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/recommendations/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to refresh recommendations: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to refresh recommendations");
      }

      // After refreshing, fetch the new recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigateToFilm = (filmId: string) => {
    router.push(`/film/${filmId}`);
  };

  // Helper function to format minutes into hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[60vh] bg-[#0A0A10] text-center">
        <div className="relative w-full max-w-md px-6 py-10 backdrop-blur-lg bg-black/20 border border-gray-800 rounded-xl shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="h-16 w-16 mx-auto rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin"></div>
          <p className="mt-6 text-gray-300 font-medium text-lg">
            Finding your personalized recommendations...
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Our AI is analyzing your movie history to suggest films you'll love
          </p>
          <div className="mt-6 flex justify-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-150"></div>
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto min-h-[60vh] p-8 flex items-center justify-center bg-[#0A0A10]">
        <div className="max-w-md w-full backdrop-blur-md bg-black/30 border border-gray-800 rounded-xl p-8 shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="text-red-500 h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white text-center mb-2">
            Recommendation Error
          </h3>
          <p className="text-red-400 mb-6 text-center">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              Go Home
            </Button>
            <Button
              onClick={() => fetchRecommendations()}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-none"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-4"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400">
                Your AI Recommendations
              </h1>
              <p className="text-gray-400 mt-2">
                Films selected by our AI just for you, based on your viewing
                history
              </p>
            </div>
          </div>
          <Button
            onClick={handleRefreshRecommendations}
            disabled={refreshing}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-black/20 border border-gray-800 rounded-xl mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-400 text-center max-w-md">
              We don't have enough data about your movie preferences yet. Book
              tickets for more movies to get personalized recommendations.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
            >
              Browse Movies
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation._id}
                className="flex flex-col md:flex-row gap-6 bg-black/20 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Movie poster */}
                <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
                  <Image
                    src={recommendation.movieId.img}
                    alt={recommendation.movieId.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    Match: {recommendation.recommendationScore}%
                  </div>
                </div>

                {/* Movie details */}
                <div className="flex-grow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {recommendation.movieId.name}
                      </h2>

                      <div className="flex items-center gap-4 mt-2 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(recommendation.movieId.duration)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          ${recommendation.movieId.price}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {recommendation.movieId.seatQuantity} seats available
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {recommendation.movieId.genres.map((genre) => (
                          <span
                            key={genre}
                            className={`inline-block px-2.5 py-1 text-xs font-medium ${
                              recommendation.matchedGenres?.includes(genre)
                                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                                : "bg-gray-800 text-gray-400"
                            } border rounded-md`}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hidden md:flex items-start gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-purple-400" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI Recommended</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {recommendation.reasoning && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-4">
                      <p className="text-gray-300 text-sm italic">
                        <span className="text-purple-400 font-medium">
                          Why we recommend this:{" "}
                        </span>
                        {recommendation.reasoning}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    {recommendation.basedOnMovieId && (
                      <div className="text-xs text-gray-500">
                        Based on your interest in:{" "}
                        {recommendation.basedOnMovieId.name}
                      </div>
                    )}

                    <Button
                      onClick={() =>
                        handleNavigateToFilm(recommendation.movieId._id)
                      }
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Book This Movie
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            These recommendations are personalized based on your booking history
            and powered by artificial intelligence
          </p>
        </div>
      </div>
    </main>
  );
}
