import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronDown, BellRing, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getInitials } from "@/utils/avatar";

interface DashboardHeaderProps {
  toggleSidebar: () => void;
}

export default function DashboardHeader({
  toggleSidebar,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/me/profile");
  };

  // Use the shared utility function for avatar URL
  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-gray-400"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400">
          Admin Console
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <BellRing className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-300"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                <AvatarFallback className="bg-purple-700">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{user?.name || "Admin"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
              onClick={handleProfileClick}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
