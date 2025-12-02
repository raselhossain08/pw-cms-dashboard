"use client";

import * as React from "react";
import {
  Users2,
  UserPlus,
  ArrowUp,
  EllipsisVertical,
  Search as SearchIcon,
  Grid2x2,
  List,
  Star,
  Book,
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

type InstructorItem = {
  id: string;
  name: string;
  email: string;
  specialization: string;
  status: "active" | "pending" | "inactive" | "suspended";
  experience: "expert" | "advanced" | "intermediate";
  rating: number;
  coursesCount: number;
  studentsCount: number;
  joinedDate: string;
  location: string;
  progressPercent: number;
  avatarUrl: string;
};

const initialInstructors: InstructorItem[] = [
  {
    id: "i1",
    name: "Dr. James Wilson",
    email: "james.w@example.com",
    specialization: "Web Development Expert",
    status: "active",
    experience: "expert",
    rating: 4.9,
    coursesCount: 8,
    studentsCount: 1247,
    joinedDate: "Jan 12, 2022",
    location: "San Francisco, US",
    progressPercent: 85,
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
  },
  {
    id: "i2",
    name: "Dr. Maria Rodriguez",
    email: "maria.r@example.com",
    specialization: "Data Science Specialist",
    status: "active",
    experience: "advanced",
    rating: 4.8,
    coursesCount: 6,
    studentsCount: 892,
    joinedDate: "Mar 8, 2022",
    location: "Madrid, Spain",
    progressPercent: 75,
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
  },
  {
    id: "i3",
    name: "Prof. David Kim",
    email: "david.k@example.com",
    specialization: "UI/UX Design Lead",
    status: "pending",
    experience: "intermediate",
    rating: 4.6,
    coursesCount: 3,
    studentsCount: 428,
    joinedDate: "Jun 20, 2023",
    location: "Seoul, Korea",
    progressPercent: 60,
    avatarUrl:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
  },
];

export default function Instructors() {
  const [items] = React.useState<InstructorItem[]>(initialInstructors);
  const [search, setSearch] = React.useState("");
  const [specializationFilter, setSpecializationFilter] = React.useState(
    "All Specializations"
  );
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [experienceFilter, setExperienceFilter] = React.useState(
    "All Experience Levels"
  );
  const [sortBy, setSortBy] = React.useState("Rating");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        const el = document.getElementById(
          "instructor-search"
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
      const matchesSpec =
        specializationFilter === "All Specializations" ||
        it.specialization.includes(specializationFilter);
      const matchesStatus =
        statusFilter === "All Status" ||
        it.status === statusFilter.toLowerCase();
      const matchesExp =
        experienceFilter === "All Experience Levels" ||
        (experienceFilter.startsWith("Expert") && it.experience === "expert") ||
        (experienceFilter.startsWith("Advanced") &&
          it.experience === "advanced") ||
        (experienceFilter.startsWith("Intermediate") &&
          it.experience === "intermediate");
      return matchesSearch && matchesSpec && matchesStatus && matchesExp;
    })
    .sort((a, b) => {
      if (sortBy === "Rating") return b.rating - a.rating;
      if (sortBy === "Courses Count") return b.coursesCount - a.coursesCount;
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Instructors
          </h2>
          <p className="text-gray-600">
            Manage instructor accounts, courses, and performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <ArrowUp className="w-4 h-4 mr-2 rotate-180" /> Export Data
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Instructor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Instructors
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">47</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +8% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users2 className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Instructors
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">38</p>
              <p className="text-accent text-sm mt-1">80.9% active rate</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Users2 className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg. Rating</p>
              <p className="text-2xl font-bold text-secondary mt-1">4.7</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +0.2 from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Courses</p>
              <p className="text-2xl font-bold text-secondary mt-1">127</p>
              <p className="text-accent text-sm mt-1">
                <ArrowUp className="inline w-3 h-3" /> +15% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Book className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select
              value={specializationFilter}
              onValueChange={setSpecializationFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Specializations">
                  All Specializations
                </SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Digital Marketing">
                  Digital Marketing
                </SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
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
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={experienceFilter}
              onValueChange={setExperienceFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Experience Levels">
                  All Experience Levels
                </SelectItem>
                <SelectItem value="Expert (5+ years)">
                  Expert (5+ years)
                </SelectItem>
                <SelectItem value="Advanced (3-5 years)">
                  Advanced (3-5 years)
                </SelectItem>
                <SelectItem value="Intermediate (1-3 years)">
                  Intermediate (1-3 years)
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rating">Sort by: Rating</SelectItem>
                <SelectItem value="Newest">Sort by: Newest</SelectItem>
                <SelectItem value="Name">Sort by: Name</SelectItem>
                <SelectItem value="Courses Count">
                  Sort by: Courses Count
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="instructor-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructors... (Cmd+K)"
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
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <EllipsisVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Edit Instructor</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuItem>View Analytics</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{it.specialization}</span>
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
                {it.status === "inactive" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-gray-500">
                    Inactive
                  </span>
                )}
                {it.status === "suspended" && (
                  <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-red-600">
                    Suspended
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Joined:</span>
                <span className="font-medium">{it.joinedDate}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Student Rating</span>
                <span className="flex items-center">
                  <Star className="text-yellow-400 w-4 h-4 mr-1" />{" "}
                  {it.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Courses Taught</span>
                <span className="font-medium">{it.coursesCount} courses</span>
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
                {it.experience === "expert" && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Expert
                  </span>
                )}
                {it.experience === "advanced" && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                    Advanced
                  </span>
                )}
                {it.experience === "intermediate" && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                    Intermediate
                  </span>
                )}
                <span>{it.location}</span>
              </div>
              <div className="text-primary font-medium">
                {it.studentsCount} students
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Instructors Table */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">
            All Instructors
          </h3>
          <p className="text-gray-600 text-sm">
            Complete list of instructors with detailed information
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                          {it.name}
                        </div>
                        <div className="text-sm text-gray-500">{it.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {it.specialization}
                    </div>
                    <div className="text-sm text-gray-500">
                      {it.experience === "expert" && "Expert"}
                      {it.experience === "advanced" && "Advanced"}
                      {it.experience === "intermediate" && "Intermediate"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="text-sm text-gray-900">
                        {it.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.coursesCount} courses
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {it.studentsCount}
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
                    {it.status === "inactive" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
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
            Showing <span className="font-medium">1-10</span> of{" "}
            <span className="font-medium">47</span> instructors
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

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Instructor Performance Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">32%</div>
            <div className="text-sm text-gray-600">Top Performers</div>
            <div className="text-xs text-gray-500 mt-1">15 instructors</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">45%</div>
            <div className="text-sm text-gray-600">Strong Performers</div>
            <div className="text-xs text-gray-500 mt-1">21 instructors</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">18%</div>
            <div className="text-sm text-gray-600">Average Performers</div>
            <div className="text-xs text-gray-500 mt-1">8 instructors</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">5%</div>
            <div className="text-sm text-gray-600">Needs Support</div>
            <div className="text-xs text-gray-500 mt-1">3 instructors</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Instructor Specialization Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-primary mb-2">18</div>
            <div className="text-sm text-gray-600">Web Development</div>
            <div className="text-xs text-gray-500 mt-1">38% of instructors</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-blue-600 mb-2">12</div>
            <div className="text-sm text-gray-600">Data Science</div>
            <div className="text-xs text-gray-500 mt-1">26% of instructors</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-sm text-gray-600">UI/UX Design</div>
            <div className="text-xs text-gray-500 mt-1">17% of instructors</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-xl font-bold text-green-600 mb-2">9</div>
            <div className="text-sm text-gray-600">Other Fields</div>
            <div className="text-xs text-gray-500 mt-1">19% of instructors</div>
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
              <p className="font-medium text-secondary">Add Instructor</p>
              <p className="text-sm text-gray-600">New instructor</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <ArrowUp className="text-white w-5 h-5 rotate-90" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Send Announcement</p>
              <p className="text-sm text-gray-600">All instructors</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <ArrowUp className="text-white w-5 h-5 rotate-180" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Instructor reports</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="text-white w-5 h-5" />
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
            <DialogTitle>Add New Instructor</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="instructor@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select specialization</option>
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="design">UI/UX Design</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select level</option>
                  <option value="expert">Expert (5+ years)</option>
                  <option value="advanced">Advanced (3-5 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio/Introduction
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Brief introduction about the instructor's background and expertise"
              ></textarea>
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
                  Require profile completion
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Add Instructor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
