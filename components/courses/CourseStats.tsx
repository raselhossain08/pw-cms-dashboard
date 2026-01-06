"use client";

import * as React from "react";
import {
  Book,
  Users,
  Star,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseStatsProps {
  stats: {
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
    published: number;
    discountImpact?: {
      coursesWithDiscount: number;
      averageDiscount: number;
      totalDiscount: number;
    };
  };
}

export default function CourseStats({ stats }: CourseStatsProps) {
  return (
    <>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              <span>Total Courses</span>
              <Book className="w-5 h-5 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-bold">
                {stats.totalCourses}
              </p>
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>12%</span>
              </div>
            </div>
            <p className="text-xs opacity-80 mt-2">Active learning programs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              <span>Total Students</span>
              <Users className="w-5 h-5 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-bold">
                {stats.totalStudents.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>8%</span>
              </div>
            </div>
            <p className="text-xs opacity-80 mt-2">Enrolled learners</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              <span>Average Rating</span>
              <Star className="w-5 h-5 opacity-80 fill-white" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-bold">
                {stats.avgRating.toFixed(1)}
              </p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(stats.avgRating)
                        ? "fill-white text-white"
                        : "text-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs opacity-80 mt-2">Student satisfaction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              <span>Published</span>
              <CheckCircle className="w-5 h-5 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl sm:text-4xl font-bold">{stats.published}</p>
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>15%</span>
              </div>
            </div>
            <div className="mt-3">
              <Progress
                value={(stats.published / stats.totalCourses) * 100}
                className="h-2 bg-white/20"
              />
              <p className="text-xs opacity-80 mt-1">
                {((stats.published / stats.totalCourses) * 100).toFixed(1)}% of
                total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Impact Stats */}
      {stats.discountImpact && stats.discountImpact.coursesWithDiscount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>Courses with Discount</span>
                <Target className="w-5 h-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
                {stats.discountImpact.coursesWithDiscount}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {(
                    (stats.discountImpact.coursesWithDiscount /
                      stats.totalCourses) *
                    100
                  ).toFixed(1)}
                  % of total
                </span>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Active
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>Average Discount</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
                {stats.discountImpact.averageDiscount.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                Across {stats.discountImpact.coursesWithDiscount} discounted
                courses
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>Total Savings Offered</span>
                <Award className="w-5 h-5 text-red-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
                ${stats.discountImpact.totalDiscount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Potential revenue impact on sales
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

