"use client";

import * as React from "react";
import {
  CreditCard,
  Download,
  FileText,
  Search as SearchIcon,
  Grid2x2,
  List,
  ArrowUp,
  TrendingUp,
  Wallet,
  Banknote,
  DollarSign,
  EllipsisVertical,
  Star,
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

type PaymentItem = {
  id: string;
  transactionId: string;
  studentName: string;
  studentEmail: string;
  course: string;
  amount: number;
  method: "Credit Card" | "PayPal" | "Bank Transfer" | "Stripe";
  date: string;
  status: "completed" | "pending" | "failed" | "refunded";
  avatarUrl: string;
};

type PayoutItem = {
  id: string;
  instructorName: string;
  courseArea: string;
  earnings: number;
  nextPayout: string;
  status: "scheduled" | "processing" | "paid";
  avatarUrl: string;
};

const initialPayments: PaymentItem[] = [
  {
    id: "p1",
    transactionId: "TXN-2023-0012",
    studentName: "Sarah Johnson",
    studentEmail: "sarah.j@example.com",
    course: "Web Development",
    amount: 129.0,
    method: "Credit Card",
    date: "Apr 12, 2023",
    status: "completed",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
  },
  {
    id: "p2",
    transactionId: "TXN-2023-0011",
    studentName: "Michael Chen",
    studentEmail: "michael.c@example.com",
    course: "Data Science",
    amount: 99.0,
    method: "PayPal",
    date: "Apr 10, 2023",
    status: "completed",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  },
  {
    id: "p3",
    transactionId: "TXN-2023-0010",
    studentName: "Emily Davis",
    studentEmail: "emily.d@example.com",
    course: "UI/UX Design",
    amount: 149.0,
    method: "Stripe",
    date: "Apr 8, 2023",
    status: "pending",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=48&q=80",
  },
];

const initialPayouts: PayoutItem[] = [
  {
    id: "po1",
    instructorName: "Dr. James Wilson",
    courseArea: "Web Development",
    earnings: 6842.0,
    nextPayout: "May 1, 2023",
    status: "scheduled",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
  },
  {
    id: "po2",
    instructorName: "Dr. Maria Rodriguez",
    courseArea: "Data Science",
    earnings: 4280.0,
    nextPayout: "May 3, 2023",
    status: "processing",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
  },
];

export default function Payments() {
  const [payments] = React.useState<PaymentItem[]>(initialPayments);
  const [payouts] = React.useState<PayoutItem[]>(initialPayouts);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [methodFilter, setMethodFilter] = React.useState("All Payment Methods");
  const [courseFilter, setCourseFilter] = React.useState("All Courses");
  const [sortBy, setSortBy] = React.useState("Date (Newest)");
  const [view, setView] = React.useState<"grid" | "list">("list");
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        const el = document.getElementById(
          "payment-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredPayments = payments
    .filter((it) => {
      const q = search.toLowerCase();
      const matchesSearch =
        q === "" ||
        it.studentName.toLowerCase().includes(q) ||
        it.studentEmail.toLowerCase().includes(q) ||
        it.transactionId.toLowerCase().includes(q) ||
        it.course.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Status" || it.status === statusFilter.toLowerCase();
      const matchesMethod =
        methodFilter === "All Payment Methods" || it.method === methodFilter;
      const matchesCourse = courseFilter === "All Courses" || it.course === courseFilter;
      return matchesSearch && matchesStatus && matchesMethod && matchesCourse;
    })
    .sort((a, b) => {
      if (sortBy.startsWith("Date (Newest)")) return a.date < b.date ? 1 : -1;
      if (sortBy.startsWith("Date (Oldest)")) return a.date > b.date ? 1 : -1;
      if (sortBy.startsWith("Amount (High")) return b.amount - a.amount;
      if (sortBy.startsWith("Amount (Low")) return a.amount - b.amount;
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Payments</h2>
          <p className="text-gray-600">Manage payment transactions, invoices, and revenue tracking</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" /> Export Reports
          </Button>
          <Button onClick={() => setInvoiceOpen(true)}>
            <FileText className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary mt-1">$84,329</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Successful Payments</p>
              <p className="text-2xl font-bold text-secondary mt-1">1,732</p>
              <p className="text-accent text-sm mt-1">+8% completion rate</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <CreditCard className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Refund Rate</p>
              <p className="text-2xl font-bold text-secondary mt-1">2.4%</p>
              <p className="text-accent text-sm mt-1">Stable month-over-month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Invoices</p>
              <p className="text-2xl font-bold text-secondary mt-1">27</p>
              <p className="text-accent text-sm mt-1">Action required</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">Revenue Overview</h3>
          <div className="flex space-x-2">
            <Select defaultValue="Last 30 days">
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                <SelectItem value="This year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-10 h-10 mx-auto mb-2" />
            <p>Revenue chart visualization would appear here</p>
            <p className="text-sm">Showing monthly revenue trends and projections</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Payment Methods">All Payment Methods</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Date (Newest)">Sort by: Date (Newest)</SelectItem>
                <SelectItem value="Date (Oldest)">Sort by: Date (Oldest)</SelectItem>
                <SelectItem value="Amount (High to Low)">Sort by: Amount (High to Low)</SelectItem>
                <SelectItem value="Amount (Low to High)">Sort by: Amount (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="payment-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payments... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant={view === "grid" ? "outline" : "ghost"}
              size="icon"
              className="text-gray-600"
              onClick={() => setView("grid")}
            >
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button
              variant={view === "list" ? "outline" : "ghost"}
              size="icon"
              className="text-gray-600"
              onClick={() => setView("list")}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">Payment Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CreditCard className="text-blue-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">Credit Card</h4>
            <p className="text-sm text-gray-600">1,024 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$68,420</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Wallet className="text-yellow-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">PayPal</h4>
            <p className="text-sm text-gray-600">342 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$12,940</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Banknote className="text-green-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">Bank Transfer</h4>
            <p className="text-sm text-gray-600">98 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$3,210</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
            <h4 className="font-medium text-secondary">Stripe</h4>
            <p className="text-sm text-gray-600">247 transactions</p>
            <p className="text-lg font-bold text-secondary mt-1">$9,759</p>
          </div>
        </div>
      </div>

      {view === "list" && (
        <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-secondary">Recent Transactions</h3>
            <p className="text-gray-600 text-sm">Latest payment transactions and invoices</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {it.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-8 w-8 rounded-full" src={it.avatarUrl} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{it.studentName}</div>
                          <div className="text-sm text-gray-500">{it.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{it.course}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${it.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {it.status === "completed" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                      )}
                      {it.status === "pending" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                      {it.status === "failed" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Failed</span>
                      )}
                      {it.status === "refunded" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Refunded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary hover:text-primary/80 mr-3">View</button>
                      <button className="text-gray-600 hover:text-primary">Invoice</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">Showing <span className="font-medium">1-{filteredPayments.length}</span> of <span className="font-medium">1,732</span> transactions</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-gray-300">Previous</Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm" className="border-gray-300">2</Button>
              <Button variant="outline" size="sm" className="border-gray-300">3</Button>
              <Button variant="outline" size="sm" className="border-gray-300">Next</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">Instructor Payouts</h3>
          <p className="text-gray-600 text-sm">Upcoming payouts and earnings by instructor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full" src={it.avatarUrl} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{it.instructorName}</div>
                        <div className="text-sm text-gray-500">{it.courseArea}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Multiple</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${it.earnings.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.nextPayout}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "scheduled" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>
                    )}
                    {it.status === "processing" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Processing</span>
                    )}
                    {it.status === "paid" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-3">Details</button>
                    <button className="text-gray-600 hover:text-primary">Process</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Create Invoice</p>
              <p className="text-sm text-gray-600">New billing</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Reports</p>
              <p className="text-sm text-gray-600">Financial data</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Process Payouts</p>
              <p className="text-sm text-gray-600">Instructor payments</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Revenue insights</p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInvoiceOpen(false);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter student name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="student@example.com" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="design">UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0.00" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Credit Card</option>
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                  <option>Stripe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} placeholder="Additional details"></textarea>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Invoice Options</label>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" defaultChecked />
                <label className="ml-2 block text-sm text-gray-700">Send invoice via email</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-700">Mark as paid automatically</label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setInvoiceOpen(false)}>Cancel</Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

