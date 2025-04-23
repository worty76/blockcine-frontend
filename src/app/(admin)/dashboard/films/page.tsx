"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { Film as FilmType } from "@/services/filmService";
import filmService from "@/services/filmService";

// Layout Components
import DashboardHeader from "@/components/admin/DashboardHeader";
import Sidebar from "@/components/admin/Sidebar";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  Film,
  Search,
  Edit,
  Trash2,
  Plus,
  Calendar,
  X,
  ClipboardList,
  Clock,
  Tag,
  ChevronDown,
} from "lucide-react";

// Form handling
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Available genres list
const AVAILABLE_GENRES = [
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
];

const formSchema = z.object({
  name: z.string().min(1, "Film name is required"),
  price: z.coerce.number().min(0.1, "Price must be greater than 0"),
  seatQuantity: z.coerce.number().min(1, "Seat quantity must be at least 1"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  releaseDate: z.string().min(1, "Release date is required"),
  genres: z.array(z.string()).min(1, "At least one genre must be selected"),
});

export default function FilmsManagement() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [films, setFilms] = useState<FilmType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [genrePopoverOpen, setGenrePopoverOpen] = useState(false);

  // New states for edit/delete functionality
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentFilm, setCurrentFilm] = useState<FilmType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [filmToDelete, setFilmToDelete] = useState<string | null>(null);

  // New loading states for each operation
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      seatQuantity: 50,
      description: "",
      duration: 120,
      releaseDate: new Date().toISOString().split("T")[0],
      genres: [],
    },
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all films
  const fetchFilms = async () => {
    try {
      setLoading(true);
      const data = await filmService.getAllFilms();
      setFilms(data);
    } catch (error) {
      toast.error("Failed to fetch films");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load film data for editing
  const handleEditFilm = (film: FilmType) => {
    setCurrentFilm(film);
    setIsEditMode(true);

    // Set form values
    form.reset({
      name: film.name,
      price: film.price,
      seatQuantity: film.seatQuantity,
      description: film.description,
      duration: film.duration,
      releaseDate: new Date(film.releaseDate).toISOString().split("T")[0],
      genres: film.genres,
    });

    // Set image preview
    setImagePreview(film.img);
    setSelectedImage(null);

    // Open form dialog
    setIsFormOpen(true);
  };

  // Handle film deletion
  const handleDeleteFilm = (filmId: string) => {
    setFilmToDelete(filmId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm and process film deletion (with loading state)
  const confirmDelete = async () => {
    if (!filmToDelete) return;

    try {
      setDeleteLoading(true);
      await filmService.deleteFilm(filmToDelete);
      toast.success("Film deleted successfully!");
      setIsDeleteDialogOpen(false);
      fetchFilms(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete film");
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset form and state when dialog closes
  useEffect(() => {
    if (!isFormOpen) {
      if (isEditMode) {
        setIsEditMode(false);
        setCurrentFilm(null);
      }

      // Small delay to avoid UI flicker
      setTimeout(() => {
        form.reset({
          name: "",
          price: 0,
          seatQuantity: 50,
          description: "",
          duration: 120,
          releaseDate: new Date().toISOString().split("T")[0],
          genres: [],
        });
        setSelectedImage(null);
        setImagePreview(null);
      }, 200);
    }
  }, [isFormOpen, form]);

  // Handle form submission (now handles both add and update with loading states)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // For updates, we only need an image if one was selected
      if (!isEditMode && !selectedImage) {
        toast.error("Please select an image for the film");
        return;
      }

      const filmData = {
        ...values,
        img: selectedImage || undefined,
      };

      if (isEditMode && currentFilm) {
        // Update existing film with loading state
        setUpdateLoading(true);
        await filmService.updateFilm(currentFilm._id, filmData);
        toast.success("Film updated successfully!");
      } else {
        // Create new film with loading state
        setAddLoading(true);
        await filmService.createFilm(filmData);
        toast.success("Film added successfully!");
      }

      setIsFormOpen(false);
      fetchFilms();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update film" : "Failed to add film");
      console.error(error);
    } finally {
      // Reset loading states
      setAddLoading(false);
      setUpdateLoading(false);
    }
  };

  // Filter films based on search query
  const filteredFilms = films.filter((film) =>
    film.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchFilms();
    }
  }, [isAuthenticated, router]);

  // Add overlay when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-20 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218] text-white">
        <div className="flex h-screen">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <div className="flex-1 flex flex-col md:ml-64 relative">
            <DashboardHeader toggleSidebar={toggleSidebar} />

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Films Management
                    </h1>
                    <p className="text-gray-400 mt-1">
                      Add, update and manage all your films
                    </p>
                  </div>

                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-2 h-4 w-4" /> Add New Film
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {isEditMode ? "Edit Film" : "Add New Film"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {isEditMode
                            ? "Update the details of the existing film."
                            : "Fill in the details to add a new film to the platform."}
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6 mt-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Film Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter film name"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (ETH)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="seatQuantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Number of Seats</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="50"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="120"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="releaseDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Release Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      {...field}
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="genres"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Genres</FormLabel>
                                  <Popover
                                    open={genrePopoverOpen}
                                    onOpenChange={setGenrePopoverOpen}
                                  >
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={`w-full justify-between bg-gray-800 border-gray-700 text-left font-normal ${
                                            !field.value.length &&
                                            "text-gray-400"
                                          }`}
                                        >
                                          {field.value.length > 0
                                            ? field.value.length > 2
                                              ? `${field.value.length} genres selected`
                                              : field.value.join(", ")
                                            : "Select genres"}
                                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700 text-white">
                                      <ScrollArea className="h-60 p-2">
                                        <div className="space-y-2">
                                          {AVAILABLE_GENRES.map((genre) => (
                                            <div
                                              key={genre}
                                              className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md"
                                            >
                                              <Checkbox
                                                id={`genre-${genre}`}
                                                checked={field.value.includes(
                                                  genre
                                                )}
                                                onCheckedChange={(checked) => {
                                                  const newValue = checked
                                                    ? [...field.value, genre]
                                                    : field.value.filter(
                                                        (val) => val !== genre
                                                      );
                                                  field.onChange(newValue);
                                                }}
                                                className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                              />
                                              <label
                                                htmlFor={`genre-${genre}`}
                                                className="text-sm cursor-pointer select-none"
                                              >
                                                {genre}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                      <div className="border-t border-gray-700 p-2 flex justify-between">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            field.onChange([]);
                                          }}
                                          className="text-gray-400"
                                        >
                                          Clear
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setGenrePopoverOpen(false)
                                          }
                                          className="text-purple-400"
                                        >
                                          Apply
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter film description"
                                {...form.register("description")}
                                className="bg-gray-800 border-gray-700 text-white resize-none h-24"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>

                          <div className="space-y-2">
                            <FormLabel>Film Poster</FormLabel>
                            <div className="flex items-center gap-4">
                              <div className="w-32 h-44 border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center bg-gray-800 overflow-hidden">
                                {imagePreview ? (
                                  <div className="relative w-full h-full">
                                    <Image
                                      src={imagePreview}
                                      fill
                                      alt="Film poster preview"
                                      className="object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(
                                          isEditMode && currentFilm
                                            ? currentFilm.img
                                            : null
                                        );
                                      }}
                                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                                    >
                                      <X className="h-4 w-4 text-white" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center p-4">
                                    <Film className="h-8 w-8 mx-auto text-gray-400" />
                                    <p className="text-xs text-gray-400 mt-2">
                                      Upload poster
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                  {isEditMode
                                    ? "Only upload a new image if you want to change the current poster."
                                    : "Recommended size: 300x450px. Max size: 2MB."}
                                </p>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                                type="button"
                                disabled={addLoading || updateLoading}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              className="bg-purple-600 hover:bg-purple-700"
                              disabled={addLoading || updateLoading}
                            >
                              {(isEditMode ? updateLoading : addLoading) ? (
                                <div className="flex items-center">
                                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                  {isEditMode ? "Updating..." : "Adding..."}
                                </div>
                              ) : isEditMode ? (
                                "Update Film"
                              ) : (
                                "Add Film"
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Film Management Section */}
                <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>All Films</CardTitle>
                      <CardDescription className="text-gray-400">
                        {films.length} films in your collection
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search films..."
                          className="pl-9 pr-4 py-2 text-sm bg-black/30 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white w-[180px] lg:w-[250px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : films.length === 0 ? (
                      <div className="py-10 text-center">
                        <Film className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                        <h3 className="text-lg font-medium text-gray-300">
                          No films found
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-1">
                          Get started by adding your first film with the "Add
                          New Film" button above.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-gray-400">
                              Film
                            </TableHead>
                            <TableHead className="text-gray-400">
                              Details
                            </TableHead>
                            <TableHead className="text-gray-400">
                              Price
                            </TableHead>
                            <TableHead className="text-gray-400 text-right">
                              Bookings
                            </TableHead>
                            <TableHead className="text-gray-400 text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFilms.map((film) => {
                            const reservationsCount =
                              film.reservations?.length || 0;
                            const bookingPercentage =
                              film.seatQuantity > 0
                                ? (reservationsCount / film.seatQuantity) * 100
                                : 0;

                            return (
                              <TableRow
                                key={film._id}
                                className="border-gray-800 hover:bg-black/20"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-16 w-12 overflow-hidden rounded">
                                      <Image
                                        src={film.img}
                                        alt={film.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "/placeholder-movie.jpg";
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">
                                        {film.name}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(
                                          film.releaseDate
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-400 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {film.duration} mins
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center">
                                      <ClipboardList className="h-3 w-3 mr-1" />
                                      {film.seatQuantity} seats
                                    </div>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {film.genres
                                        .slice(0, 2)
                                        .map((genre, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="outline"
                                            className="text-xs border-purple-800 bg-purple-900/30 text-purple-300"
                                          >
                                            {genre}
                                          </Badge>
                                        ))}
                                      {film.genres.length > 2 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-gray-700 bg-gray-800 text-gray-400"
                                        >
                                          +{film.genres.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1 text-green-400" />
                                    <span className="text-green-400 font-medium">
                                      {film.price} ETH
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col gap-1 items-end">
                                    <div className="text-xs text-gray-400">
                                      {reservationsCount}/{film.seatQuantity}{" "}
                                      seats
                                    </div>
                                    <Progress
                                      value={bookingPercentage}
                                      className="h-1 w-20 bg-gray-800"
                                    >
                                      <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                                    </Progress>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-gray-400 hover:text-white"
                                      onClick={() => handleEditFilm(film)}
                                      disabled={updateLoading || deleteLoading}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-400 hover:text-red-300"
                                      onClick={() => handleDeleteFilm(film._id)}
                                      disabled={updateLoading || deleteLoading}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}

                    {filteredFilms.length > 0 &&
                      filteredFilms.length < films.length && (
                        <div className="mt-4 text-center text-sm text-gray-400">
                          Showing {filteredFilms.length} of {films.length} films
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </main>

            {/* Delete Confirmation Dialog with loading state */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                // Only allow closing if not currently deleting
                if (!deleteLoading) setIsDeleteDialogOpen(open);
              }}
            >
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Are you sure you want to delete this film? This action
                    cannot be undone. All reservations for this film will also
                    be deleted.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Deleting...
                      </div>
                    ) : (
                      "Delete Film"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <footer className="px-6 py-4 bg-black/40 border-t border-gray-800">
              <div className="text-center text-xs text-gray-500">
                Admin Panel v1.0 - © 2023 BookApp. All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
