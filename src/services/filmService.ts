import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Film {
  _id: string;
  name: string;
  price: number;
  seatQuantity: number;
  img: string;
  description: string;
  duration: number;
  releaseDate: string;
  genres: string[];
  reservations?: Reservation[];
}

export interface Reservation {
  _id: string;
  userId: string;
  filmId: string;
  seatNumber: number;
}

export interface FilmFormData {
  name: string;
  price: number;
  seatQuantity: number;
  description: string;
  duration: number;
  releaseDate: string;
  genres: string[];
  img?: File;
}

const filmService = {
  // Get all films
  getAllFilms: async (): Promise<Film[]> => {
    try {
      const response = await axios.get(`${API_URL}/film`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching films:", error);
      throw error;
    }
  },

  // Get film by ID
  getFilmById: async (filmId: string): Promise<Film> => {
    try {
      const response = await axios.get(`${API_URL}/film/${filmId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching film ${filmId}:`, error);
      throw error;
    }
  },

  // Create new film
  createFilm: async (filmData: FilmFormData): Promise<any> => {
    try {
      const formData = new FormData();

      // Append text data
      formData.append("name", filmData.name);
      formData.append("price", filmData.price.toString());
      formData.append("seatQuantity", filmData.seatQuantity.toString());
      formData.append("description", filmData.description);
      formData.append("duration", filmData.duration.toString());
      formData.append("releaseDate", filmData.releaseDate);
      formData.append("genres", JSON.stringify(filmData.genres));

      // Append file if exists
      if (filmData.img) {
        formData.append("img", filmData.img);
      }

      const response = await axios.post(`${API_URL}/film`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeader(),
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating film:", error);
      throw error;
    }
  },

  // Update existing film
  updateFilm: async (filmId: string, filmData: FilmFormData): Promise<any> => {
    try {
      const formData = new FormData();

      // Append text data
      formData.append("name", filmData.name);
      formData.append("price", filmData.price.toString());
      formData.append("seatQuantity", filmData.seatQuantity.toString());
      formData.append("description", filmData.description);
      formData.append("duration", filmData.duration.toString());
      formData.append("releaseDate", filmData.releaseDate);
      formData.append("genres", JSON.stringify(filmData.genres));

      // Append file if exists
      if (filmData.img) {
        formData.append("img", filmData.img);
      }

      const response = await axios.put(`${API_URL}/film/${filmId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeader(),
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating film ${filmId}:`, error);
      throw error;
    }
  },

  // Delete film
  deleteFilm: async (filmId: string): Promise<any> => {
    try {
      const response = await axios.delete(`${API_URL}/film/${filmId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting film ${filmId}:`, error);
      throw error;
    }
  },

  // Get booked seats for a film
  getBookedSeats: async (filmId: string): Promise<number[]> => {
    try {
      const response = await axios.get(
        `${API_URL}/film/${filmId}/booked-seats`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data.bookedSeats;
    } catch (error) {
      console.error(`Error fetching booked seats for film ${filmId}:`, error);
      throw error;
    }
  },
};

export default filmService;
