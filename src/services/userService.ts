import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserReservation {
  _id: string;
  userId: string;
  filmId: {
    _id: string;
    name: string;
    img: string;
    releaseDate: string;
  };
  seatNumber: number;
  createdAt: string;
}

export interface UserDetails {
  user: User;
  reservations: UserReservation[];
}

const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user details by ID
  getUserDetails: async (userId: string): Promise<UserDetails> => {
    try {
      const response = await axios.get(`${API_URL}/auth/users/${userId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      throw error;
    }
  },

  // Update user
  updateUser: async (
    userId: string,
    userData: { name: string; email: string; isAdmin?: boolean }
  ): Promise<User> => {
    try {
      const response = await axios.put(
        `${API_URL}/auth/users/${userId}`,
        userData,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data.user;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/auth/users/${userId}`, {
        headers: getAuthHeader(),
      });
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },
};

export default userService;
