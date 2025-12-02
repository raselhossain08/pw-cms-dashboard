"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  Bot,
  Users,
  Book,
  CreditCard,
  MessageSquare,
  Plus,
  Play,
  Megaphone,
  Plane,
  ShoppingCart,
  Download,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import AppLayout from "@/components/layout/AppLayout";

declare global {
  interface Window {
    Plotly?: { newPlot: (...args: unknown[]) => void };
  }
}

export default function Dashboard() {
  const { stats, charts } = useDashboard();

  useEffect(() => {
    if (!charts || !window.Plotly) return;

    const enrollmentsData = [
      {
        type: "scatter",
        mode: "lines",
        x: charts.enrollments.x,
        y: charts.enrollments.y,
        line: { color: "#6366F1", width: 3 },
        fill: "tozeroy",
        fillcolor: "rgba(99, 102, 241, 0.1)",
      },
    ];
    const enrollmentsLayout = {
      margin: { t: 20, r: 20, b: 40, l: 40 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot(
      "enrollments-chart",
      enrollmentsData,
      enrollmentsLayout,
      {
        responsive: true,
        displayModeBar: false,
      }
    );

    const revenueData = [
      {
        type: "bar",
        x: charts.revenue.x,
        y: charts.revenue.y,
        marker: { color: "#10B981" },
      },
    ];
    const revenueLayout = {
      margin: { t: 20, r: 20, b: 40, l: 60 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot("sales-chart", revenueData, revenueLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const aircraftData = [
      {
        type: "bar",
        x: charts.aircraftInquiries.x,
        y: charts.aircraftInquiries.y,
        marker: { color: "#3B82F6" },
      },
    ];
    const aircraftLayout = {
      margin: { t: 20, r: 20, b: 40, l: 60 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot("aircraft-chart", aircraftData, aircraftLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const aiPerfData = [
      {
        type: "scatter",
        mode: "lines+markers",
        x: charts.aiPerformance.x,
        y: charts.aiPerformance.y,
        line: { color: "#8B5CF6", width: 3 },
        marker: { size: 8 },
      },
    ];
    const aiPerfLayout = {
      margin: { t: 20, r: 20, b: 40, l: 40 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot("ai-performance-chart", aiPerfData, aiPerfLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const progressData = [
      {
        type: "pie",
        labels: charts.progress.labels,
        values: charts.progress.values,
        marker: { colors: ["#10B981", "#F59E0B", "#EF4444"] },
      },
    ];
    const progressLayout = {
      margin: { t: 20, r: 20, b: 20, l: 20 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: true,
      legend: { orientation: "h", y: -0.1 },
    };
    window.Plotly.newPlot("progress-chart", progressData, progressLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const trafficData = charts.traffic.series.map((s) => ({
      type: "bar",
      name: s.name,
      x: charts.traffic.categories,
      y: s.values,
    }));
    const trafficLayout = {
      margin: { t: 20, r: 20, b: 40, l: 60 },
      barmode: "group",
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: true,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
      legend: { orientation: "h" },
    } as const;
    window.Plotly.newPlot("traffic-chart", trafficData, trafficLayout, {
      responsive: true,
      displayModeBar: false,
    });
  }, [charts]);

  return (
    <AppLayout>
      <Script
        src="https://cdn.plot.ly/plotly-3.1.1.min.js"
        strategy="afterInteractive"
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600">
              Welcome back! Here&apos;s what&apos;s happening with Personal
              Wings today.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stats?.students.label}
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.students.value}
                </p>
                <p className="text-accent text-sm mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span>+{stats?.students.trendDelta}%</span>{" "}
                    <span>{stats?.students.trendLabel}</span>
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stats?.courses.label}
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.courses.value}
                </p>
                <p className="text-accent text-sm mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span>+{stats?.courses.trendDelta}%</span>{" "}
                    <span>{stats?.courses.trendLabel}</span>
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Book className="text-accent w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stats?.revenue.label}
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.revenue.value}
                </p>
                <p className="text-accent text-sm mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span>+{stats?.revenue.trendDelta}%</span>{" "}
                    <span>{stats?.revenue.trendLabel}</span>
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-yellow-600 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stats?.aiConversations.label}
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stats?.aiConversations.value}
                </p>
                <p className="text-accent text-sm mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span>+{stats?.aiConversations.trendDelta}%</span>{" "}
                    <span>{stats?.aiConversations.trendLabel}</span>
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot className="text-purple-600 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Shop Revenue
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  $42,150
                </p>
                <p className="text-accent text-sm mt-1">+18.6%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-green-600 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Aircraft for Sale
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">28</p>
                <p className="text-accent text-sm mt-1">+5.2%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plane className="text-blue-600 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Live Chats</p>
                <p className="text-2xl font-bold text-secondary mt-1">342</p>
                <p className="text-accent text-sm mt-1">+22.1%</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-indigo-600 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Enrollment Trends
            </h3>
            <div id="enrollments-chart" style={{ height: 300 }} />
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Total Sales Performance
            </h3>
            <div id="sales-chart" style={{ height: 300 }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Aircraft Inquiries
            </h3>
            <div id="aircraft-chart" style={{ height: 300 }} />
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              AI Agent Performance
            </h3>
            <div id="ai-performance-chart" style={{ height: 300 }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Student Progress Rate
            </h3>
            <div id="progress-chart" style={{ height: 300 }} />
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Traffic Analytics
            </h3>
            <div id="traffic-chart" style={{ height: 300 }} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <button className="flex flex-col items-center space-y-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Book className="text-white w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-secondary text-sm">
                  Add New Course
                </p>
                <p className="text-xs text-gray-600">Create learning content</p>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Play className="text-white w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-secondary text-sm">
                  Add Training Program
                </p>
                <p className="text-xs text-gray-600">Create certification</p>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-white w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-secondary text-sm">
                  Add Blog Post
                </p>
                <p className="text-xs text-gray-600">Publish content</p>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Plane className="text-white w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-secondary text-sm">
                  Add Aircraft Listing
                </p>
                <p className="text-xs text-gray-600">List for sale</p>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Megaphone className="text-white w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-secondary text-sm">
                  Add Product
                </p>
                <p className="text-xs text-gray-600">Shopify store</p>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Megaphone className="text-white w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-secondary text-sm">
                  Send Announcement
                </p>
                <p className="text-xs text-gray-600">Notify users</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Recent Activity
            </h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-secondary">
                    New Student Enrollment
                  </div>
                  <div className="text-sm text-gray-500">
                    Michael Chen enrolled in Private Pilot Course
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">2 hours ago</div>
                <div className="text-sm text-accent">+1 student</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plane className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-secondary">
                    Aircraft Inquiry
                  </div>
                  <div className="text-sm text-gray-500">
                    New inquiry for Cessna 172 Skyhawk
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">4 hours ago</div>
                <div className="text-sm text-accent">High priority</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-secondary">Shop Order</div>
                  <div className="text-sm text-gray-500">
                    New order for Pilot Headset Pro
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">6 hours ago</div>
                <div className="text-sm text-accent">$249.99</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
