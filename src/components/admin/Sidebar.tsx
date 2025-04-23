import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Film,
  Users,
  Settings,
  BarChart3,
  Activity,
  Ticket,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 bg-black/60 backdrop-blur-lg border-r border-gray-800 w-64 transition-transform duration-300 ease-in-out z-30`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white">BookApp Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-gray-400"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="py-6">
        <nav className="space-y-2 px-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/dashboard")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/dashboard/films")}
          >
            <Film className="mr-2 h-4 w-4" />
            Films
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/dashboard/users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
        </nav>
      </div>
    </aside>
  );
}
