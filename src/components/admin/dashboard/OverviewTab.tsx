import { useState } from "react";
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
import { mockFilms, recentActivities } from "@/data/mockData";

export default function OverviewTab() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([
    { value: 40, day: "Mon" },
    { value: 60, day: "Tue" },
    { value: 75, day: "Wed" },
    { value: 65, day: "Thu" },
    { value: 80, day: "Fri" },
    { value: 92, day: "Sat" },
    { value: 85, day: "Sun" },
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
        <RevenueOverviewCard chartData={chartData} />
        <div className="space-y-6">
          <TopPerformingFilmsCard />
          <RecentActivitiesCard activities={recentActivities} />
        </div>
      </div>

      {/* Films Overview */}
      <FilmsTableCard films={mockFilms} />
    </div>
  );
}

// Split these into their own files later if needed
function RevenueOverviewCard({ chartData }: { chartData: ChartDataPoint[] }) {
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
        <RevenueChart data={chartData} />
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
  );
}

function TopPerformingFilmsCard() {
  return (
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
  );
}

function RecentActivitiesCard({ activities }: { activities: any[] }) {
  return (
    <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle className="text-base">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, i) => (
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
  );
}

function FilmsTableCard({ films }: { films: any[] }) {
  return (
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
          <Button className="bg-purple-600 hover:bg-purple-700">Add New</Button>
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
                Seatings
              </TableHead>
              <TableHead className="text-gray-400 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {films.map((film) => (
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
          <div className="text-gray-400">
            Showing {films.length} of 24 films
          </div>
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
  );
}
