import { ChartDataPoint } from "@/types/admin";
import { useState } from "react";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate the maximum value for proper scaling
  const maxValue = Math.max(...data.map((point) => Number(point.value)), 1);

  // Function to normalize values to percentages (0-100%)
  const normalizeValue = (value: number): number => {
    return Math.min(Math.max((value / maxValue) * 85, 5), 100);
  };

  return (
    <>
      <div className="h-[260px] flex items-end justify-between gap-2 mt-4 mb-2 relative">
        {data.map((point, index) => (
          <div
            key={index}
            className="relative h-full flex items-end flex-1"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-full bg-gradient-to-t from-purple-600 to-cyan-500 rounded-sm transition-all"
              style={{
                height: `${normalizeValue(point.value)}%`,
                opacity:
                  hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
              }}
            />

            {/* Value tooltip */}
            {hoveredIndex === index && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                {point.rawValue
                  ? point.rawValue
                  : (point.value / 20).toFixed(2)}{" "}
                ETH
              </div>
            )}
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
