"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  Search,
  X,
  Filter,
  ChevronDown,
  Check,
  Sliders,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface Film {
  _id: string;
  name: string;
  price: number;
  seatQuantity: number;
  img: string;
  description: string;
  duration: number; // Duration in minutes
  releaseDate: Date;
  author: string; // userId
  genres: string[];
  createdAt: Date;
  rating?: number; // We'll keep this as it might be calculated separately
  featured?: boolean; // We'll keep this for UI purposes
}

interface FilterOptions {
  genres: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  showOnlyAvailable: boolean;
}

export default function Home() {
  const router = useRouter();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    genres: [],
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    showOnlyAvailable: false,
  });

  useEffect(() => {
    // Fetch films
    const fetchFilms = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/api/film", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch films: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server");
        }

        // Enhance data with mock values for rating and featured status
        const enhancedData = data.map((film, index) => ({
          ...film,
          rating: (3 + (index % 3)) / 1, // Generates ratings between 3-5
          featured: index % 5 === 0, // Every 5th movie is featured
        }));

        setFilms(enhancedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching films:", error);

        // Retry logic (max 3 attempts)
        if (retryCount < 2) {
          console.log(`Retrying fetch... Attempt ${retryCount + 1}`);
          setTimeout(() => fetchFilms(retryCount + 1), 1000);
          return;
        }

        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  useEffect(() => {
    // After fetching films, extract price range only (not genres)
    if (films.length > 0) {
      // Use predefined genres instead of extracting them
      setAvailableGenres([
        "Action",
        "Fantasy",
        "Horror",
        "Thriller",
        "Drama",
        "Science Fiction",
        "Comedy",
        "Mystery",
        "Adventure",
        "Animated",
        "Crime",
        "Historical",
        "Film Noir",
        "Psychological Thriller",
        "Sports",
        "Comic Science Fiction",
        "Dark Comedy",
        "Dark Fantasy",
        "Disaster Film",
        "Documentary",
        "High Fantasy",
      ]);

      // Determine min and max price
      const prices = films.map((film) => film.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setPriceRange([minPrice, maxPrice]);
      setFilterOptions((prev) => ({
        ...prev,
        minPrice,
        maxPrice,
      }));
    }
  }, [films]);

  // Helper function to format minutes into hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleNavigateToFilm = (filmId: string) => {
    router.push(`/film/${filmId}`);
  };

  const toggleGenreFilter = (genre: string) => {
    setFilterOptions((prev) => {
      if (prev.genres.includes(genre)) {
        return {
          ...prev,
          genres: prev.genres.filter((g) => g !== genre),
        };
      } else {
        return {
          ...prev,
          genres: [...prev.genres, genre],
        };
      }
    });
  };

  const handlePriceChange = (values: number[]) => {
    setFilterOptions((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  const handleRatingChange = (values: number[]) => {
    setFilterOptions((prev) => ({
      ...prev,
      minRating: values[0],
    }));
  };

  const toggleAvailabilityFilter = () => {
    setFilterOptions((prev) => ({
      ...prev,
      showOnlyAvailable: !prev.showOnlyAvailable,
    }));
  };

  const resetFilters = () => {
    setFilterOptions({
      genres: [],
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: 0,
      showOnlyAvailable: false,
    });
  };

  // Apply all filters to the films
  const filteredFilms = films.filter((film) => {
    // Apply search filter
    const matchesSearch = film.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Apply genre filter
    if (
      filterOptions.genres.length > 0 &&
      !filterOptions.genres.some((genre) => film.genres?.includes(genre))
    ) {
      return false;
    }

    // Apply price filter
    if (
      film.price < filterOptions.minPrice ||
      film.price > filterOptions.maxPrice
    ) {
      return false;
    }

    // Apply rating filter
    if (film.rating && film.rating < filterOptions.minRating) {
      return false;
    }

    // Apply availability filter
    if (filterOptions.showOnlyAvailable && film.seatQuantity <= 0) {
      return false;
    }

    return true;
  });

  // Check if any filters are active
  const isFilterActive =
    filterOptions.genres.length > 0 ||
    filterOptions.minPrice > priceRange[0] ||
    filterOptions.maxPrice < priceRange[1] ||
    filterOptions.minRating > 0 ||
    filterOptions.showOnlyAvailable;

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[60vh] bg-[#0A0A10] text-center">
        <div className="relative w-full max-w-md px-6 py-10 backdrop-blur-lg bg-black/20 border border-gray-800 rounded-xl shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <div className="h-16 w-16 mx-auto rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin"></div>
          <p className="mt-6 text-gray-300 font-medium text-lg">
            Loading your movie experience...
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Please wait while we fetch the latest blockchain-verified movies
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white text-center mb-2">
            Connection Error
          </h3>
          <p className="text-red-400 mb-6 text-center">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white border-none"
          >
            Reconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218]">
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-12 pt-8">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl"></div>

          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400 relative z-10 inline-block">
            Now Showing
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl">
            Browse our latest available movies on the blockchain and secure your
            tickets with our decentralized booking system
          </p>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-8"></div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <div
                className={`flex items-center backdrop-blur-md bg-black/30 border ${
                  isSearchFocused ? "border-purple-500" : "border-gray-700"
                } rounded-lg px-3 py-2 transition-all duration-300 shadow-sm ${
                  isSearchFocused ? "shadow-purple-500/20" : ""
                }`}
              >
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Button */}
            <div className="flex gap-2">
              <Button
                variant={isFilterActive ? "secondary" : "outline"}
                className={`flex items-center gap-2 ${
                  isFilterActive
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                    : "border-gray-700"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Sliders className="h-4 w-4" />
                Filters
                {isFilterActive && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                    {(filterOptions.genres.length > 0 ? 1 : 0) +
                      (filterOptions.minPrice > priceRange[0] ||
                      filterOptions.maxPrice < priceRange[1]
                        ? 1
                        : 0) +
                      (filterOptions.minRating > 0 ? 1 : 0) +
                      (filterOptions.showOnlyAvailable ? 1 : 0)}
                  </span>
                )}
              </Button>

              {isFilterActive && (
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Search stats */}
          <div className="text-xs text-gray-400 mb-4">
            {searchTerm && (
              <span>
                Found {filteredFilms.length} movie
                {filteredFilms.length !== 1 ? "s" : ""} for{" "}
                <span className="text-purple-400">"{searchTerm}"</span>
              </span>
            )}
            {!searchTerm && filteredFilms.length > 0 && (
              <span>
                Showing {filteredFilms.length} movie
                {filteredFilms.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-black/30 border border-gray-800 rounded-xl p-5 mb-6 backdrop-blur-md animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Updated grid layout - genres get 2 columns on md screens */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Genre Filter - now spans 2 columns */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-200 mb-3">
                    Genres
                  </h4>
                  {/* Use flex layout for genres to display them in rows */}
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {availableGenres.map((genre) => (
                      <div
                        key={genre}
                        className={`flex items-center px-3 py-1.5 rounded-md border ${
                          filterOptions.genres.includes(genre)
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "border-gray-700 bg-black/20 text-gray-400 hover:text-gray-200"
                        } cursor-pointer transition-colors`}
                        onClick={() => toggleGenreFilter(genre)}
                      >
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={filterOptions.genres.includes(genre)}
                          onCheckedChange={() => toggleGenreFilter(genre)}
                          className="border-gray-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 mr-2"
                        />
                        <label
                          htmlFor={`genre-${genre}`}
                          className="text-sm cursor-pointer"
                        >
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter - now in column 3 */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-medium text-gray-200 mb-3">
                    Price Range (${filterOptions.minPrice} - $
                    {filterOptions.maxPrice})
                  </h4>
                  <div className="px-2 py-4">
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      value={[filterOptions.minPrice, filterOptions.maxPrice]}
                      min={priceRange[0]}
                      max={priceRange[1]}
                      step={1}
                      minStepsBetweenThumbs={1}
                      onValueChange={handlePriceChange}
                      className="my-4"
                    />
                  </div>
                </div>

                {/* Rating Filter & Availability - now in column 4 */}
                <div className="space-y-6 md:col-span-1">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200 mb-3">
                      Minimum Rating: {filterOptions.minRating.toFixed(1)}
                    </h4>
                    <div className="px-2 py-2 flex items-center gap-2">
                      <Slider
                        defaultValue={[0]}
                        value={[filterOptions.minRating]}
                        min={0}
                        max={5}
                        step={0.5}
                        onValueChange={handleRatingChange}
                      />
                      <Star
                        className={`h-4 w-4 ${
                          filterOptions.minRating > 0
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Checkbox
                        id="availability"
                        checked={filterOptions.showOnlyAvailable}
                        onCheckedChange={toggleAvailabilityFilter}
                        className="border-gray-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <label
                        htmlFor="availability"
                        className="ml-2 text-sm text-gray-300 cursor-pointer"
                      >
                        Show only available seats
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active filters */}
              {isFilterActive && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.genres.map((genre) => (
                      <div
                        key={`filter-${genre}`}
                        className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs rounded-full px-3 py-1 flex items-center gap-1"
                      >
                        {genre}
                        <button onClick={() => toggleGenreFilter(genre)}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {(filterOptions.minPrice > priceRange[0] ||
                      filterOptions.maxPrice < priceRange[1]) && (
                      <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs rounded-full px-3 py-1 flex items-center gap-1">
                        ${filterOptions.minPrice} - ${filterOptions.maxPrice}
                        <button
                          onClick={() =>
                            handlePriceChange([priceRange[0], priceRange[1]])
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {filterOptions.minRating > 0 && (
                      <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs rounded-full px-3 py-1 flex items-center gap-1">
                        {filterOptions.minRating}+{" "}
                        <Star className="h-3 w-3 fill-yellow-500" />
                        <button onClick={() => handleRatingChange([0])}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {filterOptions.showOnlyAvailable && (
                      <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs rounded-full px-3 py-1 flex items-center gap-1">
                        Available seats
                        <button onClick={toggleAvailabilityFilter}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* No results message */}
        {filteredFilms.length === 0 && (
          <div className="flex flex-col items-center justify-center p-10 bg-black/20 border border-gray-800 rounded-xl mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/10 mb-4">
              <Search className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No movies found
            </h3>
            {searchTerm ? (
              <p className="text-gray-400 text-center">
                We couldn't find any movies matching "{searchTerm}"
              </p>
            ) : (
              <p className="text-gray-400 text-center">
                We couldn't find any movies with the selected filters
              </p>
            )}
            <div className="flex gap-3 mt-4">
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Clear search
                </Button>
              )}
              {isFilterActive && (
                <Button
                  onClick={resetFilters}
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Reset filters
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFilms.map((film) => (
            <div key={film._id} className="group relative">
              <div
                className="relative overflow-hidden bg-[#12121A] border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-900/20 cursor-pointer"
                onClick={() => handleNavigateToFilm(film._id)}
              >
                {/* Hexagon pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDg0IDQ4Ij48cGF0aCBkPSJNMCwwIGgyNCB2NDggaC0yNHoiIGZpbGw9IiNmZmZmZmYxMCIvPjwvc3ZnPg==')]"></div>

                <div className="relative">
                  {/* Film Image */}
                  <div className="relative h-[320px]">
                    <Image
                      src={film.img}
                      alt={film.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-transparent to-transparent"></div>

                    {film.featured && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-medium text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          <span>Featured</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rating and Duration overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
                    {film.rating && (
                      <div className="flex items-center px-2 py-1 backdrop-blur-md bg-black/30 rounded-md">
                        <Star className="fill-yellow-500 text-yellow-500 h-4 w-4 mr-1" />
                        <span className="text-sm font-medium text-white">
                          {film.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {film.duration && (
                      <div className="flex items-center px-2 py-1 backdrop-blur-md bg-black/30 rounded-md">
                        <Clock className="h-4 w-4 mr-1 text-gray-300" />
                        <span className="text-sm text-gray-300">
                          {formatDuration(film.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {film.genres && film.genres.length > 0 && (
                    <div className="mb-3">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 rounded-md">
                        {film.genres[0]}
                      </span>
                      {film.genres.length > 1 && (
                        <span className="ml-2 text-xs text-gray-500">
                          +{film.genres.length - 1} more
                        </span>
                      )}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {film.name}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    <span className="text-cyan-400 font-medium">
                      ${film.price}
                    </span>{" "}
                    · {film.seatQuantity} seats available
                  </p>

                  {/* Replace the <a> tag with a button that uses router.push */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 cursor-pointer shadow hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card click from also triggering
                      handleNavigateToFilm(film._id);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <rect
                        x="2"
                        y="7"
                        width="20"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                      <polyline points="16 2 12 6 8 2"></polyline>
                    </svg>
                    Book with ETH
                  </Button>
                </div>

                {/* Digital circuit lines decoration */}
                <svg
                  className="absolute bottom-0 left-0 w-full h-12 opacity-10"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 20"
                >
                  <path
                    d="M0,10 L20,10 C30,10 30,0 40,0 L100,0"
                    stroke="url(#grad)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M0,20 L30,20 C40,20 40,10 50,10 L100,10"
                    stroke="url(#grad)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            Tickets secured on the Ethereum blockchain.{" "}
            <span className="text-purple-400">
              Learn more about our web3 technology
            </span>
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
              <span className="text-xs text-gray-400">Network: Ethereum</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
              <span className="text-xs text-gray-400">
                Smart Contract: Active
              </span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
              <span className="text-xs text-gray-400">Gas: Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
