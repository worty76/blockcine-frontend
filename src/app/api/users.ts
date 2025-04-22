import apiClient from "./config";

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<{ user: User; token: string }> => {
  try {
    return await apiClient.post("/users/login", credentials);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (
  userData: RegisterRequest
): Promise<{ user: User; token: string }> => {
  try {
    return await apiClient.post("/users/register", userData);
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<User> => {
  try {
    return await apiClient.get("/users/profile");
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
