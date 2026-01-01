"use client";

import {
  PlayCircle,
  Clock,
  TrendingUp,
  Target,
  Users,
  CheckCircle,
  FileText,
  CircleHelp,
  ListTodo,
  Eye,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  iconBg: string;
  delay?: string;
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient,
  iconBg,
  delay = "0s",
}: StatsCardProps) {
  return (
    <div
      className="stats-card hover-lift p-6 animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              {trend && (
                <span
                  className={`flex items-center ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`w-3 h-3 mr-1 ${
                      !trend.isPositive ? "rotate-180" : ""
                    }`}
                  />
                  {trend.value}%
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-14 h-14 ${gradient} rounded-xl flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface LessonStatsProps {
  stats: {
    total: number;
    videoCount: number;
    textCount: number;
    quizCount: number;
    assignmentCount: number;
    avgDuration: number;
    avgCompletion: number;
    totalViews?: number;
  };
  loading?: boolean;
}

export default function LessonStats({
  stats,
  loading = false,
}: LessonStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stats-card p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Lessons",
      value: stats.total,
      subtitle: "Active lessons",
      icon: <PlayCircle className="w-7 h-7 text-primary" />,
      gradient: "bg-gradient-to-br from-primary/20 to-primary/10",
      iconBg: "bg-primary/10",
      trend: { value: 12, isPositive: true },
      delay: "0.1s",
    },
    {
      title: "Video Lessons",
      value: stats.videoCount,
      subtitle: `${((stats.videoCount / stats.total) * 100 || 0).toFixed(
        0
      )}% of total`,
      icon: <PlayCircle className="w-7 h-7 text-red-600" />,
      gradient: "bg-gradient-to-br from-red-100 to-pink-100",
      iconBg: "bg-red-100",
      delay: "0.2s",
    },
    {
      title: "Avg. Duration",
      value: `${stats.avgDuration}m`,
      subtitle: "Per lesson",
      icon: <Clock className="w-7 h-7 text-yellow-600" />,
      gradient: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconBg: "bg-yellow-100",
      delay: "0.3s",
    },
    {
      title: "Completion",
      value: `${stats.avgCompletion}%`,
      subtitle: "Average rate",
      icon: <Target className="w-7 h-7 text-purple-600" />,
      gradient: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconBg: "bg-purple-100",
      trend: { value: 8, isPositive: true },
      delay: "0.4s",
    },
  ];

  // Additional stats row
  const additionalStats = [
    {
      title: "Text Lessons",
      value: stats.textCount,
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      gradient: "bg-gradient-to-br from-blue-100 to-cyan-100",
      delay: "0.5s",
    },
    {
      title: "Quizzes",
      value: stats.quizCount,
      icon: <CircleHelp className="w-6 h-6 text-purple-600" />,
      gradient: "bg-gradient-to-br from-purple-100 to-violet-100",
      delay: "0.6s",
    },
    {
      title: "Assignments",
      value: stats.assignmentCount,
      icon: <ListTodo className="w-6 h-6 text-orange-600" />,
      gradient: "bg-gradient-to-br from-orange-100 to-amber-100",
      delay: "0.7s",
    },
    {
      title: "Total Views",
      value: stats.totalViews || 0,
      icon: <Eye className="w-6 h-6 text-green-600" />,
      gradient: "bg-gradient-to-br from-green-100 to-emerald-100",
      delay: "0.8s",
    },
  ];

  return (
    <>
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {additionalStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: stat.delay }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${stat.gradient} rounded-lg flex items-center justify-center`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
