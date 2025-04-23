import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isAdmin: boolean;
  role?: string; // Added role property to match the check in navbar
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  setIsAuthenticated: (value: boolean) => void;
  updateUserAvatar: (avatarUrl: string) => void; // New function to update avatar
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Ensure user has role property based on isAdmin
        const updatedUser = {
          ...user,
          role: user.isAdmin ? "admin" : "user",
        };

        set({ user: updatedUser, token, isAuthenticated: true });
        Cookies.set(
          "auth-storage",
          encodeURIComponent(
            JSON.stringify({
              state: {
                isAdmin: user.isAdmin,
                isAuthenticated: true,
                avatar: user.avatar,
                token,
              },
            })
          ),
          { expires: 7 }
        );
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        Cookies.remove("auth-storage");
      },
      isAdmin: () => get().user?.isAdmin || false,
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),

      // New function to update avatar URL
      updateUserAvatar: (avatarUrl: string) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: avatarUrl };
          set({ user: updatedUser });

          // Update in cookies as well
          const token = get().token;
          if (token) {
            Cookies.set(
              "auth-storage",
              encodeURIComponent(
                JSON.stringify({
                  state: {
                    isAdmin: currentUser.isAdmin,
                    isAuthenticated: true,
                    avatar: avatarUrl,
                    token,
                  },
                })
              ),
              { expires: 7 }
            );
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        avatar: state.avatar,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin());
export const useUpdateAvatar = () =>
  useAuthStore((state) => state.updateUserAvatar);
