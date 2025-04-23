export type Film = {
  id: string;
  name: string;
  status: "active" | "inactive";
  price: number;
  seats: number;
  sales: number;
  img: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  lastActive: string;
  purchaseCount: number;
};

export interface Activity {
  id: string;
  user: string;
  action: string;
  item?: string;
  seatNumber?: number;
  time: string;
  date: Date;
}

export interface ChartDataPoint {
  value: number;
  day: string;
  rawValue?: string | number;
}

export interface RevenueDataPoint {
  day: string;
  value: number;
  reservations: number;
  date: string;
}

export interface TopFilm {
  _id: string;
  name: string;
  reservationCount: number;
  totalSeats: number;
  occupancyRate: string;
  img?: string;
}

export interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendLabel: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}
