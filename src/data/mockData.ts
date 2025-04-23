import { Film, User, Activity } from "@/types/admin";

export const mockFilms: Film[] = [
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

export const mockUsers: User[] = [
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

export const recentActivities: Activity[] = [
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
