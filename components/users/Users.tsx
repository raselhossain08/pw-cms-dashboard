"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Eye,
  Edit,
  Trash,
  Users as UsersIcon,
  CheckCircle,
  Clock,
  Download,
  Plus,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UserStatus = "active" | "inactive" | "pending";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role:
    | "Administrator"
    | "Instructor"
    | "Student"
    | "Content Manager"
    | "Support Staff";
  status: UserStatus;
  courses: number;
  lastActive: string;
  avatarUrl?: string;
};

const initialUsers: UserItem[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    email: "alex.johnson@personalwings.com",
    role: "Administrator",
    status: "active",
    courses: 42,
    lastActive: "2 hours ago",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
  },
  {
    id: "u2",
    name: "Sarah Williams",
    email: "sarah.williams@personalwings.com",
    role: "Instructor",
    status: "active",
    courses: 12,
    lastActive: "Today",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
  },
  {
    id: "u3",
    name: "Michael Chen",
    email: "michael.chen@personalwings.com",
    role: "Student",
    status: "pending",
    courses: 7,
    lastActive: "3 days ago",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  },
  {
    id: "u4",
    name: "Priya Patel",
    email: "priya.patel@personalwings.com",
    role: "Content Manager",
    status: "inactive",
    courses: 18,
    lastActive: "1 week ago",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
  },
];

export default function Users() {
  const [users, setUsers] = React.useState<UserItem[]>(initialUsers);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("All Roles");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  // const [page, setPage] = React.useState(1);
  const [addUserOpen, setAddUserOpen] = React.useState(false);
  const [addRoleOpen, setAddRoleOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("All Users");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const [alertMsg, setAlertMsg] = React.useState<{
    type: "success" | "error";
    title: string;
    desc?: string;
  } | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "All Status" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const statusBadge = (s: UserStatus) =>
    s === "active"
      ? "bg-accent text-white"
      : s === "inactive"
      ? "bg-gray-500 text-white"
      : "bg-yellow-500 text-white";

  const roleBadge = (r: UserItem["role"]) =>
    r === "Administrator"
      ? "bg-red-500 text-white"
      : r === "Instructor"
      ? "bg-purple-500 text-white"
      : r === "Student"
      ? "bg-accent text-white"
      : r === "Content Manager"
      ? "bg-blue-500 text-white"
      : "bg-yellow-600 text-white";

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const adminManagerCount = users.filter((u) =>
    ["Administrator", "Content Manager", "Support Staff"].includes(u.role)
  ).length;

  React.useEffect(() => {
    if (!alertMsg) return;
    const t = setTimeout(() => setAlertMsg(null), 3000);
    return () => clearTimeout(t);
  }, [alertMsg]);

  const filteredAll = filtered;
  const filteredStudents = users
    .filter((u) => u.role === "Student")
    .filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "All Status" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  const filteredInstructors = users
    .filter((u) => u.role === "Instructor")
    .filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "All Status" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  const filteredAdminStaff = users
    .filter((u) =>
      ["Administrator", "Support Staff", "Content Manager"].includes(u.role)
    )
    .filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "All Status" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  const tableData =
    activeTab === "All Users"
      ? filteredAll
      : activeTab === "Students"
      ? filteredStudents
      : activeTab === "Instructors"
      ? filteredInstructors
      : activeTab === "Admin Staff"
      ? filteredAdminStaff
      : [];

  React.useEffect(() => {
    if (!alertMsg) return;
    const t = setTimeout(() => setAlertMsg(null), 3000);
    return () => clearTimeout(t);
  }, [alertMsg]);

  return (
    <main className="p-6">
      {alertMsg && (
        <div className="mb-4">
          <Alert
            className={
              alertMsg.type === "success"
                ? "border-green-200"
                : "border-red-200"
            }
          >
            <AlertTitle>{alertMsg.title}</AlertTitle>
            {alertMsg.desc && (
              <AlertDescription>{alertMsg.desc}</AlertDescription>
            )}
          </Alert>
        </div>
      )}
      {alertMsg && (
        <div className="mb-4">
          <Alert
            className={
              alertMsg.type === "success"
                ? "border-green-200"
                : "border-red-200"
            }
          >
            <AlertTitle>{alertMsg.title}</AlertTitle>
            {alertMsg.desc && (
              <AlertDescription>{alertMsg.desc}</AlertDescription>
            )}
          </Alert>
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Users Management
          </h2>
          <p className="text-gray-600">
            Manage all users, roles, and permissions across your platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" /> Export Users
          </Button>
          <Button onClick={() => setAddUserOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {totalUsers}
              </p>
              <p className="text-accent text-sm mt-1">+5 this week</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {activeCount}
              </p>
              <p className="text-accent text-sm mt-1">+3 today</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {pendingCount}
              </p>
              <p className="text-yellow-600 text-sm mt-1">Review needed</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Admins & Managers
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {adminManagerCount}
              </p>
              <p className="text-accent text-sm mt-1">Stable</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            "All Users",
            "Students",
            "Instructors",
            "Admin Staff",
            "Roles & Permissions",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-4 px-1 font-medium text-sm ${
                activeTab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      {activeTab !== "Roles & Permissions" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Role:</span>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Roles">All Roles</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Instructor">Instructor</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Content Manager">
                      Content Manager
                    </SelectItem>
                    <SelectItem value="Support Staff">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-4">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Search users..."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab !== "Roles & Permissions" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  <Checkbox />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Courses
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Last Active
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-4 px-4">
                    <Checkbox />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={u.avatarUrl} alt={u.name} />
                        <AvatarFallback>{u.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-secondary">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${roleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-white text-xs px-2 py-1 rounded-full ${statusBadge(
                        u.status
                      )}`}
                    >
                      {u.status === "active"
                        ? "Active"
                        : u.status === "inactive"
                        ? "Inactive"
                        : "Pending"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {u.courses} courses
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {u.lastActive}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setConfirmDeleteId(u.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab !== "Roles & Permissions" && (
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filtered.length} of {initialUsers.length} users
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {activeTab === "Roles & Permissions" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-secondary">
              Roles & Permissions
            </h3>
            <Button onClick={() => setAddRoleOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Role
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {["Administrator", "Instructor", "Content Manager", "Student"].map(
              (role) => {
                const count = users.filter((u) => u.role === role).length;
                const desc =
                  role === "Administrator"
                    ? "Full system access"
                    : role === "Instructor"
                    ? "Course management"
                    : role === "Content Manager"
                    ? "Content editing"
                    : "Learning access";
                return (
                  <div
                    key={role}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-secondary">{role}</h4>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                      <span
                        className={`text-white text-xs px-2 py-1 rounded-full ${roleBadge(
                          role as UserItem["role"]
                        )}`}
                      >
                        {count} users
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Users</span>
                        <span className="text-accent">
                          {role === "Administrator"
                            ? "Full Access"
                            : role === "Instructor"
                            ? "View Only"
                            : role === "Content Manager"
                            ? "No Access"
                            : "View Only"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Courses</span>
                        <span className="text-accent">
                          {role === "Administrator"
                            ? "Full Access"
                            : role === "Instructor"
                            ? "Manage Own"
                            : role === "Content Manager"
                            ? "Edit Content"
                            : "Enroll"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Settings</span>
                        <span className="text-gray-500">
                          {role === "Administrator"
                            ? "Full Access"
                            : "No Access"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="ghost" className="text-primary">
                        Edit
                      </Button>
                      <Button variant="ghost" className="text-red-500">
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Permission
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Administrator
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Instructor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Content Manager
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Student
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Manage Users",
                  "Manage Courses",
                  "Edit Content",
                  "Access Analytics",
                  "Manage Settings",
                ].map((perm) => (
                  <tr key={perm} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600">{perm}</td>
                    <td className="py-3 px-4 text-center">
                      <Check className="w-4 h-4 text-accent inline" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm === "Manage Users" || perm === "Manage Settings" ? (
                        <X className="w-4 h-4 text-gray-400 inline" />
                      ) : (
                        <Check className="w-4 h-4 text-accent inline" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm === "Edit Content" ? (
                        <Check className="w-4 h-4 text-accent inline" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 inline" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {perm === "Access Analytics" ||
                      perm === "Edit Content" ? (
                        <X className="w-4 h-4 text-gray-400 inline" />
                      ) : (
                        <Check className="w-4 h-4 text-accent inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Enter user details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="new-user-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="new-user-email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Select defaultValue="Student" onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Instructor">Instructor</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Content Manager">
                      Content Manager
                    </SelectItem>
                    <SelectItem value="Support Staff">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select defaultValue="active" onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => setAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const nameInput = document.getElementById(
                    "new-user-name"
                  ) as HTMLInputElement | null;
                  const emailInput = document.getElementById(
                    "new-user-email"
                  ) as HTMLInputElement | null;
                  const name = nameInput?.value?.trim() || "New User";
                  const email =
                    emailInput?.value?.trim() || "new.user@example.com";
                  const newItem: UserItem = {
                    id: `u${Date.now()}`,
                    name,
                    email,
                    role: "Student",
                    status: "pending",
                    courses: 0,
                    lastActive: "Just now",
                    avatarUrl: undefined,
                  };
                  setUsers((prev) => [newItem, ...prev]);
                  setAddUserOpen(false);
                  setAlertMsg({
                    type: "success",
                    title: "User invited",
                    desc: `${name} has been added to the list.`,
                  });
                }}
              >
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>Define role and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Role description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "User Management",
                "Course Management",
                "Content Editing",
                "Analytics",
                "Settings",
              ].map((g) => (
                <label
                  key={g}
                  className="flex items-center space-x-2 border border-gray-200 rounded-lg p-3"
                >
                  <Checkbox />
                  <span className="text-sm text-gray-700">{g}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => setAddRoleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setAddRoleOpen(false);
                  setAlertMsg({ type: "success", title: "Role saved" });
                }}
              >
                Save Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteId) {
                  setUsers((prev) =>
                    prev.filter((x) => x.id !== confirmDeleteId)
                  );
                  setAlertMsg({ type: "success", title: "User deleted" });
                }
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
