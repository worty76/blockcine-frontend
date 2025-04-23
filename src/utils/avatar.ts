/**
 * Utility functions for handling user avatars
 */

// Default avatar URL from DiceBear API
export const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/initials/svg";

/**
 * Gets the avatar URL for a user, providing a personalized fallback if no avatar exists
 */
export const getAvatarUrl = (
  user: { name?: string; avatar?: string } | null
): string => {
  if (!user) return `${DEFAULT_AVATAR}?seed=User`;

  // Use user's avatar if it exists and is not empty
  if (user.avatar && user.avatar.trim() !== "") {
    return user.avatar;
  }

  // Otherwise generate a personalized avatar using the user's name
  return `${DEFAULT_AVATAR}?seed=${encodeURIComponent(user.name || "User")}`;
};

/**
 * Gets the initials from a user's name (first letter of each word)
 */
export const getInitials = (name?: string): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2); // Limit to 2 characters for better display
};
