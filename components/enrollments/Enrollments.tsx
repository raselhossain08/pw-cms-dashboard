"use client";

import * as React from "react";
import {
  UserPlus,
  Download,
  Search as SearchIcon,
  Grid2x2,
  List,
  ArrowUp,
  BarChart2,
  Users,
  CheckCircle,
  Clock,
  EllipsisVertical,
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

type EnrollmentItem = {
  id: string;
  studentName: string;
  studentEmail: string;
  course: string;
  courseDetail?: string;
  instructor: string;
  progressPercent: number;
  status: "active" | "pending" | "completed" | "dropped";
  enrolledDate: string;
  avatarUrl: string;
  modulesCount?: number;
};

const initialEnrollments: EnrollmentItem[] = [
  {
    id: "e1",
    studentName: "Sarah Johnson",
    studentEmail: "sarah.j@example.com",
    course: "Web Development",
    courseDetail: "Complete Bootcamp",
    instructor: "Dr. James Wilson",
    progressPercent: 85,
    status: "active",
    enrolledDate: "Jan 12, 2023",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    modulesCount: 8,
  },
  {
    id: "e2",
    studentName: "Michael Chen",
    studentEmail: "michael.c@example.com",
    course: "Data Science",
    courseDetail: "ML Specialization",
    instructor: "Dr. Maria Rodriguez",
    progressPercent: 72,
    status: "pending",
    enrolledDate: "Mar 8, 2023",
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
    modulesCount: 6,
  },
  {
    id: "e3",
    studentName: "Emily Davis",
    studentEmail: "emily.d@example.com",
    course: "UI/UX Design",
    courseDetail: "Interface Foundations",
    instructor: "Prof. David Kim",
    progressPercent: 45,
    status: "dropped",
    enrolledDate: "Jun 20, 2023",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=48&q=80",
    modulesCount: 4,
  },
];

export default function Enrollments() {
  const [items] = React.useState<EnrollmentItem[]>(initialEnrollments);
  const [search, setSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("All Courses");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [instructorFilter, setInstructorFilter] =
    React.useState("All Instructors");
  const [sortBy, setSortBy] = React.useState("Date (Newest)");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        const el = document.getElementById(
          "enrollment-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = items
    .filter((it) => {
      const q = search.toLowerCase();
      const matchesSearch =
        q === "" ||
        it.studentName.toLowerCase().includes(q) ||
        it.studentEmail.toLowerCase().includes(q) ||
        it.course.toLowerCase().includes(q);
      const matchesCourse =
        courseFilter === "All Courses" || it.course === courseFilter;
      const matchesStatus =
        statusFilter === "All Status" ||
        it.status === statusFilter.toLowerCase();
      const matchesInstructor =
        instructorFilter === "All Instructors" ||
        it.instructor === instructorFilter;
      return (
        matchesSearch && matchesCourse && matchesStatus && matchesInstructor
      );
    })
    .sort((a, b) => {
      if (sortBy.startsWith("Date (Newest)"))
        return a.enrolledDate < b.enrolledDate ? 1 : -1;
      if (sortBy.startsWith("Date (Oldest)"))
        return a.enrolledDate > b.enrolledDate ? 1 : -1;
      if (sortBy.startsWith("Progress"))
        return b.progressPercent - a.progressPercent;
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Enrollments
          </h2>
          <p className="text-gray-600">
            Manage student enrollments, track progress, and handle course
            registrations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> New Enrollment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">3,847</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +10% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Enrollments
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">2,384</p>
              <p className="text-accent text-sm mt-1">+7% active rate</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">64%</p>
              <p className="text-accent text-sm mt-1">Improving steadily</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart2 className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">48</p>
              <p className="text-accent text-sm mt-1">Action required</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            Enrollment Trends
          </h3>
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
            <BarChart2 className="w-10 h-10 mx-auto mb-2" />
            <p>Enrollment trends visualization would appear here</p>
            <p className="text-sm">
              Showing daily enrollment patterns and growth metrics
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Courses">All Courses</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Digital Marketing">
                  Digital Marketing
                </SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={instructorFilter}
              onValueChange={setInstructorFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Instructors">All Instructors</SelectItem>
                <SelectItem value="Dr. James Wilson">
                  Dr. James Wilson
                </SelectItem>
                <SelectItem value="Dr. Maria Rodriguez">
                  Dr. Maria Rodriguez
                </SelectItem>
                <SelectItem value="Prof. David Kim">Prof. David Kim</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Date (Newest)">
                  Sort by: Date (Newest)
                </SelectItem>
                <SelectItem value="Date (Oldest)">
                  Sort by: Date (Oldest)
                </SelectItem>
                <SelectItem value="Progress">Sort by: Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="enrollment-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search enrollments... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Course Enrollment Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-primary mb-2">1,247</div>
            <div className="text-sm text-gray-600">Web Development</div>
            <div className="text-xs text-gray-500 mt-1">32% of enrollments</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-blue-600 mb-2">892</div>
            <div className="text-sm text-gray-600">Data Science</div>
            <div className="text-xs text-gray-500 mt-1">23% of enrollments</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-purple-600 mb-2">956</div>
            <div className="text-sm text-gray-600">UI/UX Design</div>
            <div className="text-xs text-gray-500 mt-1">25% of enrollments</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-green-600 mb-2">752</div>
            <div className="text-sm text-gray-600">Digital Marketing</div>
            <div className="text-xs text-gray-500 mt-1">20% of enrollments</div>
          </div>
        </div>
      </div>

      {/* Grid Cards - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filtered.map((it) => (
          <div
            key={it.id}
            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={it.avatarUrl}
                  alt={it.studentName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-secondary">
                    {it.studentName}
                  </h3>
                  <p className="text-sm text-gray-500">{it.course} Course</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <EllipsisVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Enrollment</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                  <DropdownMenuItem>View Analytics</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{it.courseDetail}</span>
                {it.status === "active" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-green-600">
                    Active
                  </span>
                )}
                {it.status === "pending" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-yellow-500">
                    Pending
                  </span>
                )}
                {it.status === "completed" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-blue-600">
                    Completed
                  </span>
                )}
                {it.status === "dropped" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-red-600">
                    Dropped
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Enrolled:</span>
                <span className="font-medium">{it.enrolledDate}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span className="font-medium">{it.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${it.progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {it.instructor}
                </span>
                <span>{it.modulesCount} modules</span>
              </div>
              <div className="text-primary font-medium">{it.studentEmail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* All Enrollments Table - Always Visible */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">
            All Enrollments
          </h3>
          <p className="text-gray-600 text-sm">
            Complete list of enrollments with detailed information
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={it.avatarUrl}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {it.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {it.studentEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{it.course}</div>
                    <div className="text-sm text-gray-500">
                      {it.courseDetail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${it.progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {it.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.enrolledDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "active" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {it.status === "pending" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                    {it.status === "completed" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Completed
                      </span>
                    )}
                    {it.status === "dropped" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Dropped
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-3">
                      Approve
                    </button>
                    <button className="text-gray-600 hover:text-primary">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1-{filtered.length}</span> of{" "}
            <span className="font-medium">3,847</span> enrollments
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              Previous
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              2
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              3
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Enrollment Analytics Section */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Enrollment Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">68%</div>
            <div className="text-sm text-gray-600">Active Enrollments</div>
            <div className="text-xs text-gray-500 mt-1">2,954 students</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">24%</div>
            <div className="text-sm text-gray-600">Completed Courses</div>
            <div className="text-xs text-gray-500 mt-1">923 students</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">6%</div>
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-xs text-gray-500 mt-1">231 students</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">2%</div>
            <div className="text-sm text-gray-600">Dropped Out</div>
            <div className="text-xs text-gray-500 mt-1">77 students</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">New Enrollment</p>
              <p className="text-sm text-gray-600">Add student to course</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Bulk Enrollments</p>
              <p className="text-sm text-gray-600">Multiple students</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Enrollment reports</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <BarChart2 className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Enrollment insights</p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Enrollment</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCreateOpen(false);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select student</option>
                  <option value="1">Sarah Johnson</option>
                  <option value="2">Michael Chen</option>
                  <option value="3">Emily Davis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="design">UI/UX Design</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="james">Dr. James Wilson</option>
                  <option value="maria">Dr. Maria Rodriguez</option>
                  <option value="david">Prof. David Kim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modules Count
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Any additional notes about this enrollment"
              ></textarea>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Enrollment Settings
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Send welcome email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Grant immediate access
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require profile completion
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Enrollment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
