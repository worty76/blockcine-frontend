import { ChartDataPoint } from "@/types/admin";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <>
      <div className="h-[260px] flex items-end justify-between gap-2 mt-4 mb-2">
        {data.map((point, index) => (
          <div key={index} className="relative h-full flex items-end flex-1">
            <div
              className="w-full bg-gradient-to-t from-purple-600 to-cyan-500 rounded-sm transition-all hover:opacity-80"
              style={{ height: `${point.value}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {data.map((point, index) => (
          <div key={index}>{point.day}</div>
        ))}
      </div>
    </>
  );
}
