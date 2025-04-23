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
  Search,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  ArrowRight,
  User,
  Ticket,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import StatsCard from "./StatsCard";
import RevenueChart from "./charts/RevenueChart";
import { ChartDataPoint } from "@/types/admin";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function OverviewTab() {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for statistics
  const [overviewStats, setOverviewStats] = useState({
    filmsCount: "0",
    usersCount: "0",
    reservationsCount: "0",
    totalRevenue: "0",
  });

  const [growthStats, setGrowthStats] = useState({
    filmsGrowth: "+0%",
    usersGrowth: "+0%",
    reservationsGrowth: "+0%",
  });

  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
  const [topFilms, setTopFilms] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Fetch all stats data
  useEffect(() => {
    const fetchAllStats = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const [overviewRes, revenueRes, topFilmsRes, activitiesRes] =
          await Promise.all([
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/statistics/overview`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistics/revenue`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/statistics/top-films`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/statistics/activities`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

        // Set overview stats
        setOverviewStats(overviewRes.data.stats);
        setGrowthStats(overviewRes.data.growth);

        // Format revenue data for chart - don't multiply by arbitrary factor
        const formattedRevenueData = revenueRes.data.map((item: any) => ({
          value: parseFloat(item.value) * 20, // Scale for better visualization
          day: item.day,
          rawValue: item.value,
        }));
        setRevenueData(formattedRevenueData);

        // Set top films
        setTopFilms(topFilmsRes.data);

        // Set activities
        setActivities(activitiesRes.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load dashboard data. Please try again later.");
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllStats();
  }, [token]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Films"
          value={overviewStats.filmsCount}
          trend={growthStats.filmsGrowth}
          trendLabel="from last month"
          icon={<Film className="h-4 w-4" />}
          iconColor="text-purple-500"
          bgColor="bg-purple-500/10"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Users"
          value={overviewStats.usersCount}
          trend={growthStats.usersGrowth}
          trendLabel="from last month"
          icon={<User className="h-4 w-4" />}
          iconColor="text-cyan-500"
          bgColor="bg-cyan-500/10"
          isLoading={isLoading}
        />
        <StatsCard
          title="Tickets Sold"
          value={overviewStats.reservationsCount}
          trend={growthStats.reservationsGrowth}
          trendLabel="this week"
          icon={<Ticket className="h-4 w-4" />}
          iconColor="text-amber-500"
          bgColor="bg-amber-500/10"
          isLoading={isLoading}
        />
        <StatsCard
          title="Revenue (ETH)"
          value={overviewStats.totalRevenue}
          trend="+8.2%" // This could be calculated from revenue data
          trendLabel="this month"
          icon={<DollarSign className="h-4 w-4" />}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Sales Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueOverviewCard
          chartData={revenueData}
          totalRevenue={overviewStats.totalRevenue}
          isLoading={isLoading}
        />
        <div className="space-y-6">
          <TopPerformingFilmsCard topFilms={topFilms} isLoading={isLoading} />
          <RecentActivitiesCard activities={activities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

// Split these into their own files later if needed
function RevenueOverviewCard({
  chartData,
  totalRevenue,
  isLoading,
}: {
  chartData: ChartDataPoint[];
  totalRevenue: string;
  isLoading: boolean;
}) {
  return (
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
          <DropdownMenuContent className="bg-gray-900 border-gray-800 z-50">
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
        {isLoading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="px-2">
            {" "}
            {/* Add padding to ensure tooltips don't get cut off */}
            <RevenueChart data={chartData} />
          </div>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-gray-500">
            No revenue data available
          </div>
        )}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
          <div>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? "Loading..." : `${totalRevenue} ETH`}
            </p>
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
  );
}

function TopPerformingFilmsCard({
  topFilms,
  isLoading,
}: {
  topFilms: any[];
  isLoading: boolean;
}) {
  return (
    <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle className="text-base">Top Performing Films</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : topFilms.length > 0 ? (
          topFilms.slice(0, 3).map((film, i) => (
            <div key={film._id} className="flex items-center gap-2">
              <div
                className="w-1 h-8 rounded-full bg-purple-500"
                style={{ opacity: 1 - i * 0.25 }}
              ></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {film.name}
                </div>
                <div className="text-xs text-gray-400">
                  {film.occupancyRate} occupancy
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
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No film data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivitiesCard({
  activities,
  isLoading,
}: {
  activities: any[];
  isLoading: boolean;
}) {
  return (
    <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle className="text-base">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : activities.length > 0 ? (
          activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-2">
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
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No recent activities
          </div>
        )}
        {activities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-400 hover:text-white text-xs mt-2"
          >
            View All <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
