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

export type Activity = {
  id: string;
  user: string;
  action: string;
  item: string;
  time: string;
};

export type ChartDataPoint = {
  value: number;
  day: string;
};

export type StatsCardProps = {
  title: string;
  value: string;
  trend: string;
  trendLabel: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
};
