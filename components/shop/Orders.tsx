"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  ArrowUpDown,
  EllipsisVertical,
  Download,
  Plus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OrderStatus = "processing" | "completed" | "pending" | "cancelled" | "shipped" | "refunded";

type Order = {
  id: string;
  type: string;
  customer: { name: string; avatar: string };
  date: string;
  total: string;
  status: OrderStatus;
  itemsLabel: string;
  itemsDetail?: string;
};

const initialOrders: Order[] = [
  {
    id: "#ORD-7842",
    type: "Online Course",
    customer: {
      name: "Sarah Johnson",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    },
    date: "Nov 12, 2025",
    total: "$299.00",
    status: "processing",
    itemsLabel: "1 item",
    itemsDetail: "Advanced Python",
  },
  {
    id: "#ORD-7841",
    type: "E-book",
    customer: {
      name: "Michael Chen",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    },
    date: "Nov 12, 2025",
    total: "$89.99",
    status: "completed",
    itemsLabel: "1 item",
    itemsDetail: "Advanced Python",
  },
  {
    id: "#ORD-7840",
    type: "Bundle",
    customer: {
      name: "Emma Wilson",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
    },
    date: "Nov 11, 2025",
    total: "$349.00",
    status: "shipped",
    itemsLabel: "2 items",
    itemsDetail: "Course + E-book",
  },
  {
    id: "#ORD-7839",
    type: "Merchandise",
    customer: {
      name: "David Brown",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    },
    date: "Nov 10, 2025",
    total: "$49.99",
    status: "pending",
    itemsLabel: "1 item",
    itemsDetail: "Personal Wings Hoodie",
  },
  {
    id: "#ORD-7838",
    type: "Subscription",
    customer: {
      name: "Lisa Anderson",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
    },
    date: "Nov 09, 2025",
    total: "$199.00",
    status: "cancelled",
    itemsLabel: "1 item",
  },
];

export default function Orders() {
  const [orders] = React.useState<Order[]>(initialOrders);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [sortBy, setSortBy] = React.useState("Sort by: Newest");

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("orders-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const statusBadge = (s: OrderStatus) =>
    s === "processing"
      ? "bg-blue-100 text-blue-700"
      : s === "completed"
      ? "bg-green-100 text-green-700"
      : s === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : s === "shipped"
      ? "bg-purple-100 text-purple-700"
      : s === "refunded"
      ? "bg-gray-100 text-gray-700"
      : "bg-red-100 text-red-700";

  const filtered = orders
    .filter((o) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.type.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Status" ||
        o.status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest")) return a.id < b.id ? 1 : -1;
      if (sortBy.includes("Oldest")) return a.id > b.id ? 1 : -1;
      if (sortBy.includes("Amount")) return parseFloat(b.total.replace(/[^0-9.]/g, "")) - parseFloat(a.total.replace(/[^0-9.]/g, ""));
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Orders</h2>
          <p className="text-gray-600">Manage customer orders, track shipments, and process returns</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create Order
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
        {["Products", "Categories", "Orders", "Discounts"].map((t) => (
          <button
            key={t}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Orders" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-secondary mt-1">{orders.length}</p>
              <p className="text-accent text-sm mt-1">+12 this week</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-secondary mt-1">{orders.filter((o) => o.status === "completed").length}</p>
              <p className="text-accent text-sm mt-1">On time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-secondary mt-1">{orders.filter((o) => o.status === "pending").length}</p>
              <p className="text-yellow-500 text-sm mt-1">Action needed</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-secondary mt-1">{orders.filter((o) => o.status === "cancelled").length}</p>
              <p className="text-red-500 text-sm mt-1">Review</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="orders-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Newest">Sort by: Newest</SelectItem>
                  <SelectItem value="Sort by: Oldest">Sort by: Oldest</SelectItem>
                  <SelectItem value="Sort by: Amount">Sort by: Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-gray-300">Bulk Actions</Button>
            <Button>Apply</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span>Order</span>
                  </div>
                </th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Items</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <div>
                        <div className="font-medium text-primary">{o.id}</div>
                        <div className="text-sm text-gray-500">{o.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={o.customer.avatar}
                        alt={o.customer.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                      <div>
                        <div className="font-medium text-secondary">{o.customer.name}</div>
                        <div className="text-sm text-gray-500">{o.itemsDetail || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">{o.date}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{o.total}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`status-badge px-3 py-1 rounded-full text-xs ${statusBadge(o.status)}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm text-secondary">{o.itemsLabel}</div>
                    {o.itemsDetail && <div className="text-sm text-gray-500">{o.itemsDetail}</div>}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="text-primary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-500">
                            <EllipsisVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Refund</DropdownMenuItem>
                          <DropdownMenuItem>Resend Receipt</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(5, filtered.length)}</span> of <span className="font-medium">{orders.length}</span> orders
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-gray-300">Previous</Button>
              <Button className="bg-primary">1</Button>
              <Button variant="outline" className="border-gray-300">2</Button>
              <Button variant="outline" className="border-gray-300">3</Button>
              <Button variant="outline" className="border-gray-300">Next</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">Order Status Distribution</h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">View Report</button>
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">Revenue Trends</h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">View Report</button>
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
