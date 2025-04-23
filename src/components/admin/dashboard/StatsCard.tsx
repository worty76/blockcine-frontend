import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { StatsCardProps } from "@/types/admin";

export default function StatsCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  iconColor,
  bgColor,
  isLoading = false,
}: StatsCardProps & { isLoading?: boolean }) {
  return (
    <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-full ${bgColor}`}>
            <div className={`${iconColor}`}>{icon}</div>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-500">
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="mt-5">
          <h3 className="text-3xl font-bold text-white">
            {isLoading ? (
              <div className="h-8 bg-gray-700/30 rounded animate-pulse w-16"></div>
            ) : (
              value
            )}
          </h3>
          <p className="text-sm font-medium text-gray-400">{title}</p>
        </div>
        <p className="text-xs text-gray-500 mt-3">{trendLabel}</p>
      </CardContent>
    </Card>
  );
}
