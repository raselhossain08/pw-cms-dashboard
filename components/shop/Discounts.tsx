"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  ArrowUpDown,
  EllipsisVertical,
  Percent,
  Plus,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type CouponStatus = "active" | "expired" | "scheduled" | "inactive";
type DiscountType = "percentage" | "fixed" | "free-shipping" | "bogo";

type Coupon = {
  id: string;
  code: string;
  status: CouponStatus;
  type: DiscountType;
  valueLabel: string;
  title?: string;
  description?: string;
  validRange?: string;
  usageCount?: number;
  totalSaved?: string;
};

const initialCoupons: Coupon[] = [
  {
    id: "cp1",
    code: "SUMMER25",
    status: "active",
    type: "percentage",
    valueLabel: "25% OFF",
    title: "Summer Sale",
    description: "Save on all courses during summer",
    validRange: "May 01 - Aug 31",
    usageCount: 247,
    totalSaved: "$3,247 saved",
  },
  {
    id: "cp2",
    code: "WELCOME50",
    status: "active",
    type: "fixed",
    valueLabel: "$50 OFF",
    title: "Welcome Offer",
    description: "Discount for new customers on first purchase",
    validRange: "Jan 01 - Dec 31",
    usageCount: 89,
    totalSaved: "$4,450 saved",
  },
  {
    id: "cp3",
    code: "FREESHIP",
    status: "scheduled",
    type: "free-shipping",
    valueLabel: "Free Shipping",
    title: "Holiday Shipping",
    description: "Free shipping for merchandise",
    validRange: "Starts Dec 01",
    usageCount: 42,
    totalSaved: "$840 saved",
  },
  {
    id: "cp4",
    code: "SPRING15",
    status: "expired",
    type: "percentage",
    valueLabel: "15% OFF",
    title: "Spring Sale",
    description: "Expired seasonal promotion",
    validRange: "Mar 01 - Apr 30",
    usageCount: 156,
    totalSaved: "$2,340 saved",
  },
];

export default function Discounts() {
  const [coupons, setCoupons] = React.useState<Coupon[]>(initialCoupons);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All Coupons");
  const [typeFilter, setTypeFilter] = React.useState("All Discount Types");
  const [sortBy, setSortBy] = React.useState("Sort by: Newest");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("discounts-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = coupons
    .filter((c) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Coupons" ||
        (statusFilter === "Active" && c.status === "active") ||
        (statusFilter === "Scheduled" && c.status === "scheduled") ||
        (statusFilter === "Expired" && c.status === "expired") ||
        (statusFilter === "Auto-Apply" && c.type === "bogo");
      const matchesType =
        typeFilter === "All Discount Types" ||
        (typeFilter === "Percentage" && c.type === "percentage") ||
        (typeFilter === "Fixed Amount" && c.type === "fixed") ||
        (typeFilter === "Free Shipping" && c.type === "free-shipping") ||
        (typeFilter === "BOGO" && c.type === "bogo");
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest")) return a.id < b.id ? 1 : -1;
      if (sortBy.includes("Most Used")) return (b.usageCount || 0) - (a.usageCount || 0);
      if (sortBy.includes("Expiry")) return (b.validRange || "").localeCompare(a.validRange || "");
      if (sortBy.includes("Discount Value")) return (b.valueLabel || "").localeCompare(a.valueLabel || "");
      return 0;
    });

  const statusChip = (s: CouponStatus) =>
    s === "active"
      ? "bg-green-100 text-green-700"
      : s === "scheduled"
      ? "bg-blue-100 text-blue-700"
      : s === "expired"
      ? "bg-gray-100 text-gray-700"
      : "bg-red-100 text-red-700";

  const typeChip = (t: DiscountType) =>
    t === "percentage"
      ? "bg-primary text-white"
      : t === "fixed"
      ? "bg-purple-600 text-white"
      : t === "free-shipping"
      ? "bg-yellow-500 text-white"
      : "bg-accent text-white";

  const cardBorder = (s: CouponStatus) =>
    s === "active" ? "border-l-4 border-green-500" : s === "expired" ? "border-l-4 border-gray-500" : s === "scheduled" ? "border-l-4 border-blue-500" : "border-l-4 border-red-500";

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Discounts & Coupons</h2>
          <p className="text-gray-600">Create and manage discount codes to boost your sales</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Coupon
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
        {["Products", "Categories", "Orders", "Discounts"].map((t) => (
          <button
            key={t}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Discounts" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              <p className="text-gray-600 text-sm font-medium">Active Coupons</p>
              <p className="text-2xl font-bold text-secondary mt-1">{coupons.filter((c) => c.status === "active").length}</p>
              <p className="text-accent text-sm mt-1">+5 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Percent className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-secondary mt-1">{coupons.filter((c) => c.status === "scheduled").length}</p>
              <p className="text-blue-500 text-sm mt-1">Upcoming</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Expired</p>
              <p className="text-2xl font-bold text-secondary mt-1">{coupons.filter((c) => c.status === "expired").length}</p>
              <p className="text-gray-500 text-sm mt-1">Ended</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Inactive</p>
              <p className="text-2xl font-bold text-secondary mt-1">{coupons.filter((c) => c.status === "inactive").length}</p>
              <p className="text-red-500 text-sm mt-1">Review</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {["All Coupons", "Active", "Scheduled", "Expired", "Auto-Apply"].map((label) => (
              <Button
                key={label}
                variant={statusFilter === label ? "default" : "secondary"}
                className={statusFilter === label ? "" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                onClick={() => setStatusFilter(label)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Discount Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Discount Types">All Discount Types</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                  <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                  <SelectItem value="Free Shipping">Free Shipping</SelectItem>
                  <SelectItem value="BOGO">BOGO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-56">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Newest">Sort by: Newest</SelectItem>
                  <SelectItem value="Sort by: Most Used">Sort by: Most Used</SelectItem>
                  <SelectItem value="Sort by: Expiry Date">Sort by: Expiry Date</SelectItem>
                  <SelectItem value="Sort by: Discount Value">Sort by: Discount Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="discounts-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filtered.map((c) => (
          <div key={c.id} className={`bg-card rounded-xl p-6 shadow-sm border border-gray-100 ${cardBorder(c.status)}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs ${statusChip(c.status)}`}>{c.status === "scheduled" ? "Scheduled" : c.status === "expired" ? "Expired" : c.status === "inactive" ? "Inactive" : "Active"}</span>
                <span className={`px-3 py-1 rounded-full text-xs ml-2 ${typeChip(c.type)}`}>{c.valueLabel}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <EllipsisVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Analytics</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-2xl text-secondary mb-2">{c.code}</h4>
              <p className="text-gray-600 text-sm mb-2">{c.title}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{c.validRange}</span>
                <span className="text-gray-500">{c.usageCount} uses</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-accent font-medium">
                <span>{c.totalSaved}</span>
              </div>
              <Button variant="outline" className="border-gray-300">
                <Copy className="w-4 h-4 mr-2" /> Copy Code
              </Button>
            </div>
          </div>
        ))}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 shadow-sm border border-dashed border-primary/30 flex flex-col items-center justify-center text-center cursor-pointer">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-primary text-xl" />
          </div>
          <h4 className="font-semibold text-secondary mb-2">Create New Coupon</h4>
          <p className="text-gray-600 text-sm">Design custom discount codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">Coupon Performance</h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">View Details</button>
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">Discount Types Distribution</h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">View Details</button>
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary">Recent Redemptions</h3>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">Coupon</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Discount</th>
                <th className="pb-3 font-medium">Order Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-100">
                <td className="py-3 font-medium text-primary">SUMMER25</td>
                <td className="py-3">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                      alt="Customer"
                      width={24}
                      height={24}
                      className="rounded-full"
                      unoptimized
                    />
                    <span>Sarah Johnson</span>
                  </div>
                </td>
                <td className="py-3 font-medium">#ORD-7842</td>
                <td className="py-3">Today, 10:24 AM</td>
                <td className="py-3 text-accent font-medium">-$49.99</td>
                <td className="py-3">$299.00</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 font-medium text-primary">WELCOME50</td>
                <td className="py-3">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"
                      alt="Customer"
                      width={24}
                      height={24}
                      className="rounded-full"
                      unoptimized
                    />
                    <span>Michael Chen</span>
                  </div>
                </td>
                <td className="py-3 font-medium">#ORD-7841</td>
                <td className="py-3">Today, 09:12 AM</td>
                <td className="py-3 text-accent font-medium">-$50.00</td>
                <td className="py-3">$89.99</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>Design custom discount codes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  id="coupon-code"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="SUMMER25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <Select defaultValue="percentage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free-shipping">Free Shipping</SelectItem>
                    <SelectItem value="bogo">BOGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  id="coupon-value"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., 25% or $50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select defaultValue="active">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="coupon-desc"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-gray-300" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const codeEl = document.getElementById("coupon-code") as HTMLInputElement | null;
                  const valueEl = document.getElementById("coupon-value") as HTMLInputElement | null;
                  const descEl = document.getElementById("coupon-desc") as HTMLTextAreaElement | null;
                  const code = codeEl?.value.trim() || "NEWCODE";
                  const valueLabel = valueEl?.value.trim() || "10% OFF";
                  const newItem: Coupon = {
                    id: Math.random().toString(36).slice(2),
                    code,
                    status: "active",
                    type: valueLabel.includes("$") ? "fixed" : valueLabel.includes("%") ? "percentage" : "percentage",
                    valueLabel,
                    title: "New custom coupon",
                    description: descEl?.value.trim() || "",
                    validRange: "",
                    usageCount: 0,
                    totalSaved: "$0 saved",
                  };
                  setCoupons([newItem, ...coupons]);
                  setCreateOpen(false);
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

