"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  CheckCircle,
  GraduationCap,
  EllipsisVertical,
  ArrowUp,
  Search as SearchIcon,
  Eye,
  Pencil,
  Mail,
  ChartLine,
  Slash,
  Download,
  Upload,
  SlidersHorizontal,
  List,
  Grid2x2,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type StudentItem = {
  id: string;
  name: string;
  email: string;
  course: string;
  courseDetail?: string;
  status: "active" | "inactive" | "probation" | "suspended";
  progressPercent: number;
  scorePercent: number;
  enrolledText: string;
  joinedDate: string;
  rating: number;
  location: string;
  courseCount: number;
  avatarUrl: string;
};

const initialStudents: StudentItem[] = [
  {
    id: "s1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    course: "Web Development",
    courseDetail: "Complete Bootcamp",
    status: "active",
    progressPercent: 85,
    scorePercent: 92,
    enrolledText: "Enrolled: Mar 15, 2023",
    joinedDate: "Mar 15, 2023",
    rating: 4.8,
    location: "New York, US",
    courseCount: 3,
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
  },
  {
    id: "s2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    course: "Data Science",
    courseDetail: "ML Specialization",
    status: "active",
    progressPercent: 72,
    scorePercent: 88,
    enrolledText: "Enrolled: Feb 28, 2023",
    joinedDate: "Feb 28, 2023",
    rating: 4.6,
    location: "Toronto, CA",
    courseCount: 2,
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  },
  {
    id: "s3",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    course: "UI/UX Design",
    courseDetail: "Advanced Course",
    status: "probation",
    progressPercent: 45,
    scorePercent: 76,
    enrolledText: "Enrolled: Apr 5, 2023",
    joinedDate: "Apr 5, 2023",
    rating: 3.9,
    location: "London, UK",
    courseCount: 1,
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
  },
];

export default function Students() {
  const [items] = React.useState<StudentItem[]>(initialStudents);
  const [search, setSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("All Courses");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [countryFilter, setCountryFilter] = React.useState("All Countries");
  const [sortBy, setSortBy] = React.useState("Newest");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        const el = document.getElementById(
          "student-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = items
    .filter((it) => {
      const matchesSearch =
        search === "" ||
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.email.toLowerCase().includes(search.toLowerCase());
      const matchesCourse =
        courseFilter === "All Courses" || it.course === courseFilter;
      const matchesStatus =
        statusFilter === "All Status" ||
        it.status === statusFilter.toLowerCase();
      return matchesSearch && matchesCourse && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Progress") return b.progressPercent - a.progressPercent;
      if (sortBy === "Score") return b.scorePercent - a.scorePercent;
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Students</h2>
          <p className="text-gray-600">
            Manage student accounts, progress, and performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Students
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">2,847</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +12% from last month
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
                Active Students
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">2,154</p>
              <p className="text-accent text-sm mt-1">
                <span className="inline-block w-2 h-2 bg-accent rounded-full mr-1"></span>{" "}
                75.6% active rate
              </p>
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
                Avg. Completion
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">78%</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +8% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ChartLine className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Score</p>
              <p className="text-2xl font-bold text-secondary mt-1">84%</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +5% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="All Courses" />
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
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Probation">Probation</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Countries">All Countries</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="India">India</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue placeholder="Sort by: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newest">Sort by: Newest</SelectItem>
                <SelectItem value="Name">Sort by: Name</SelectItem>
                <SelectItem value="Progress">Sort by: Progress</SelectItem>
                <SelectItem value="Enrollment Date">
                  Sort by: Enrollment Date
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <input
                id="student-search"
                type="text"
                placeholder="Search students... (Cmd+K)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <Grid2x2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filtered.map((it) => (
          <div
            key={`card-${it.id}`}
            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={it.avatarUrl}
                  alt={it.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-secondary">{it.name}</h3>
                  <p className="text-sm text-gray-500">{it.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-gray-400 hover:text-primary rounded">
                    <EllipsisVertical className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" /> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pencil className="w-4 h-4 mr-2" /> Edit Student
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" /> Send Message
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ChartLine className="w-4 h-4 mr-2" /> View Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-700">
                    <Slash className="w-4 h-4 mr-2" /> Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{it.course} Course</span>
                {it.status === "probation" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-yellow-500">
                    Probation
                  </span>
                )}
                {it.status === "inactive" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-gray-500">
                    Inactive
                  </span>
                )}
                {it.status === "active" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-green-600">
                    Active
                  </span>
                )}
                {it.status === "suspended" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-red-600">
                    Suspended
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Joined: </span>
                <span className="font-medium">{it.joinedDate}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Course Progress</span>
                <span>{it.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    it.progressPercent >= 80
                      ? "bg-accent"
                      : it.progressPercent >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${it.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />{" "}
                  {it.rating}
                </span>
                <span>{it.location}</span>
              </div>
              <div className="text-primary font-medium">
                {it.courseCount} {it.courseCount === 1 ? "course" : "courses"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Students Table */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">All Students</h3>
          <p className="text-gray-600 text-sm">
            Complete list of enrolled students with detailed information
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
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((it) => (
                <tr
                  key={`row-${it.id}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={it.avatarUrl}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {it.name}
                        </div>
                        <div className="text-sm text-gray-500">{it.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{it.course}</div>
                    <div className="text-sm text-gray-500">
                      {it.courseDetail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            it.progressPercent >= 80
                              ? "bg-accent"
                              : it.progressPercent >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${it.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">
                        {it.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.scorePercent}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "active" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {it.status === "inactive" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    {it.status === "probation" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Probation
                      </span>
                    )}
                    {it.status === "suspended" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {it.joinedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-3">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-primary">
                      Message
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
            <span className="font-medium">2,847</span> students
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 inline" /> Previous
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Next <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Student Performance Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">24%</div>
            <div className="text-sm text-gray-600">Excellent Performance</div>
            <div className="text-xs text-gray-500 mt-1">564 students</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">45%</div>
            <div className="text-sm text-gray-600">Good Performance</div>
            <div className="text-xs text-gray-500 mt-1">1,281 students</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">21%</div>
            <div className="text-sm text-gray-600">Average Performance</div>
            <div className="text-xs text-gray-500 mt-1">598 students</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">10%</div>
            <div className="text-sm text-gray-600">Needs Improvement</div>
            <div className="text-xs text-gray-500 mt-1">284 students</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setCreateOpen(true)}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Add Student</p>
              <p className="text-sm text-gray-600">New enrollment</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Mail className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Send Broadcast</p>
              <p className="text-sm text-gray-600">Email all students</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Student reports</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <ChartLine className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">View Analytics</p>
              <p className="text-sm text-gray-600">Performance insights</p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a student account</DialogDescription>
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
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="student@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="in">India</option>
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
                  <option value="">Select course</option>
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
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="probation">Probation</option>
                  <option value="suspended">Suspended</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Any additional info"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Account Settings
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
                  Generate temporary password
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require password change on first login
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
              <Button type="submit">Add Student</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
