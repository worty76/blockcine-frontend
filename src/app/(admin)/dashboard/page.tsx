"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Film,
  Users,
  Settings,
  BarChart3,
  Activity,
  Ticket,
  Calendar,
  ChevronDown,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  Menu,
  X,
  Home,
  LogOut,
  BellRing,
  ArrowRight,
  Clock,
  PieChart,
  User,
} from "lucide-react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Mocked data for demonstration purposes
const mockFilms = [
  {
    id: "1",
    name: "Interstellar",
    status: "active",
    price: 25,
    seats: 120,
    sales: 87,
    img: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
  },
  {
    id: "2",
    name: "The Matrix",
    status: "active",
    price: 20,
    seats: 80,
    sales: 75,
    img: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  },
  {
    id: "3",
    name: "Inception",
    status: "active",
    price: 22,
    seats: 100,
    sales: 92,
    img: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  },
  {
    id: "4",
    name: "Dune",
    status: "inactive",
    price: 30,
    seats: 150,
    sales: 34,
    img: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
  {
    id: "5",
    name: "Blade Runner 2049",
    status: "active",
    price: 28,
    seats: 90,
    sales: 81,
    img: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
  },
];

const mockUsers = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    status: "active",
    lastActive: "2 mins ago",
    purchaseCount: 8,
  },
  {
    id: "2",
    name: "Sara Williams",
    email: "sara@example.com",
    status: "active",
    lastActive: "5 hours ago",
    purchaseCount: 12,
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@example.com",
    status: "inactive",
    lastActive: "2 days ago",
    purchaseCount: 3,
  },
  {
    id: "4",
    name: "Priya Sharma",
    email: "priya@example.com",
    status: "active",
    lastActive: "Just now",
    purchaseCount: 22,
  },
  {
    id: "5",
    name: "John Lee",
    email: "john@example.com",
    status: "active",
    lastActive: "1 hour ago",
    purchaseCount: 9,
  },
];

const recentActivities = [
  {
    id: "1",
    user: "Alex Johnson",
    action: "purchased",
    item: "Interstellar",
    time: "2 mins ago",
  },
  {
    id: "2",
    user: "Sara Williams",
    action: "registered",
    item: "",
    time: "5 hours ago",
  },
  {
    id: "3",
    user: "System",
    action: "added new film",
    item: "Dune",
    time: "12 hours ago",
  },
  {
    id: "4",
    user: "Priya Sharma",
    action: "refunded",
    item: "The Matrix",
    time: "1 day ago",
  },
];

// Dashboard Components
const DashboardHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
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
              <AvatarImage src="https://avatars.githubusercontent.com/u/124599?v=4" />
              <AvatarFallback className="bg-purple-700">AD</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">Admin</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuItem className="text-red-400 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => (
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
          className="w-full justify-start text-white bg-white/10 hover:bg-white/20"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Film className="mr-2 h-4 w-4" />
          Films
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Users className="mr-2 h-4 w-4" />
          Users
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Ticket className="mr-2 h-4 w-4" />
          Bookings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Activity className="mr-2 h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      <div className="mt-10 px-4 pt-6 border-t border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-white/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  </aside>
);

const OverviewTab = () => {
  const [chartData, setChartData] = useState<number[]>([
    40, 60, 75, 65, 80, 92, 85,
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Films"
          value="24"
          trend="+3"
          trendLabel="from last month"
          icon={<Film className="h-4 w-4" />}
          iconColor="text-purple-500"
          bgColor="bg-purple-500/10"
        />
        <StatsCard
          title="Active Users"
          value="1,257"
          trend="+12%"
          trendLabel="from last month"
          icon={<User className="h-4 w-4" />}
          iconColor="text-cyan-500"
          bgColor="bg-cyan-500/10"
        />
        <StatsCard
          title="Tickets Sold"
          value="845"
          trend="+23%"
          trendLabel="this week"
          icon={<Ticket className="h-4 w-4" />}
          iconColor="text-amber-500"
          bgColor="bg-amber-500/10"
        />
        <StatsCard
          title="Revenue (ETH)"
          value="14.75"
          trend="+8.2%"
          trendLabel="this month"
          icon={<DollarSign className="h-4 w-4" />}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
        />
      </div>

      {/* Charts and Sales Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-black/30 border-gray-800 backdrop-blur-md text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Daily sales revenue (ETH)
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-800">
                <DropdownMenuItem className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                  This Month
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                  This Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {/* Mock Chart - in real app, this would be a proper Chart component */}
            <div className="h-[260px] flex items-end justify-between gap-2 mt-4 mb-2">
              {chartData.map((value, i) => (
                <div key={i} className="relative h-full flex items-end flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-cyan-500 rounded-sm transition-all hover:opacity-80"
                    style={{ height: `${value}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-xl font-bold text-white">14.75 ETH</p>
              </div>
              <Button
                size="sm"
                className="text-xs bg-purple-600 hover:bg-purple-700"
              >
                View Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Films</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["Interstellar", "The Matrix", "Inception"].map((film, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-1 h-8 rounded-full bg-purple-500"
                    style={{ opacity: 1 - i * 0.25 }}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{film}</div>
                    <div className="text-xs text-gray-400">
                      {90 - i * 10}% occupancy
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      i === 0
                        ? "border-purple-500 text-purple-400"
                        : i === 1
                        ? "border-cyan-500 text-cyan-400"
                        : "border-gray-500 text-gray-400"
                    }`}
                  >
                    #{i + 1}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
            <CardHeader>
              <CardTitle className="text-base">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500"></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      {activity.item && (
                        <span className="text-cyan-400">{activity.item}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-white text-xs mt-2"
              >
                View All <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Films Overview */}
      <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Films</CardTitle>
            <CardDescription className="text-gray-400">
              Manage all your films from here
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search films..."
                className="pl-9 pr-4 py-2 text-sm bg-black/30 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white w-[180px] lg:w-[250px]"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Film</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Price</TableHead>
                <TableHead className="text-gray-400 text-right">
                  Seating
                </TableHead>
                <TableHead className="text-gray-400 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFilms.map((film) => (
                <TableRow
                  key={film.id}
                  className="border-gray-800 hover:bg-black/20"
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 overflow-hidden rounded">
                        <Image
                          src={film.img}
                          alt={film.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {film.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        film.status === "active"
                          ? "border-green-500 bg-green-500/10 text-green-400"
                          : "border-amber-500 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {film.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${film.price}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <div className="text-xs text-gray-400">
                        {film.sales}/{film.seats} seats
                      </div>
                      <Progress
                        value={(film.sales / film.seats) * 100}
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6 text-sm">
            <div className="text-gray-400">Showing 5 of 24 films</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 text-gray-400"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 bg-white/10 text-white"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 text-gray-400"
              >
                2
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 text-gray-400"
              >
                3
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 text-gray-400"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  trend,
  trendLabel,
  icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: string;
  trend: string;
  trendLabel: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}) => (
  <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-full ${bgColor}`}>
          <div className={`${iconColor}`}>{icon}</div>
        </div>
        <div className="flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-green-500" />
          <span className="text-xs font-medium text-green-500">{trend}</span>
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-sm font-medium text-gray-400">{title}</p>
      </div>
      <p className="text-xs text-gray-500 mt-3">{trendLabel}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
                      Dashboard Overview
                    </h1>
                    <p className="text-gray-400 mt-1">
                      Welcome back! Here's what's happening with your platform
                      today.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-0">
                      <Film className="mr-2 h-4 w-4" />
                      Add New Film
                    </Button>
                  </div>
                </div>

                {/* Main Content */}
                <OverviewTab />
              </div>
            </main>

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
