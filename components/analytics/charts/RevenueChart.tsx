"use client";

import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, BarChart3 } from "lucide-react";

interface RevenueChartProps {
  data?: Array<{ label: string; value: number; date?: string }>;
  period?: "day" | "week" | "month" | "year";
  isLoading?: boolean;
  chartPeriod?: "monthly" | "quarterly" | "yearly";
}

export function RevenueChart({
  data = [],
  period = "month",
  isLoading = false,
  chartPeriod = "monthly",
}: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-4">
          <div className="h-6 bg-slate-200 rounded-md w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded-md w-2/3 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500">Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              No revenue data available
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Revenue data will appear here once transactions are processed
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Revenue Overview
        </h3>
        <p className="text-sm text-slate-500">
          Track your revenue performance over time
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "none",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              color: "white",
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              "Revenue",
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }}
            labelStyle={{
              fontWeight: "600",
              marginBottom: "8px",
              fontSize: "14px",
            }}
            cursor={{ stroke: "#6366f1", strokeWidth: 2, strokeOpacity: 0.5 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            dot={{
              fill: "#6366f1",
              strokeWidth: 3,
              stroke: "white",
              r: 5,
              style: {
                filter: "drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))",
              },
            }}
            activeDot={{
              r: 7,
              fill: "#6366f1",
              strokeWidth: 4,
              stroke: "white",
              style: {
                filter: "drop-shadow(0 4px 8px rgba(99, 102, 241, 0.4))",
              },
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
