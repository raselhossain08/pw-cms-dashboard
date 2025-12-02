"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
  EllipsisVertical,
  FileText,
  CalendarDays,
  Star,
  Tags,
  Eye,
  Edit,
  Trash,
  Plus,
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

type ContentStatus = "published" | "draft" | "scheduled" | "archived";

type ContentItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  status: ContentStatus;
  coverUrl?: string;
};

const initialContent: ContentItem[] = [
  {
    id: "c1",
    title: "Top 10 Tips for Learning JavaScript",
    excerpt: "Practical strategies to master JS faster with real projects",
    author: "Admin",
    date: "Apr 12, 2023",
    category: "Blog",
    tags: ["javascript", "learning"],
    featured: true,
    status: "published",
    coverUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "c2",
    title: "Course Update: Data Science Bootcamp Syllabus",
    excerpt: "New modules added for 2025 covering MLOps basics",
    author: "Curriculum Team",
    date: "May 02, 2023",
    category: "Announcement",
    tags: ["data-science", "update"],
    status: "draft",
  },
  {
    id: "c3",
    title: "How to Prepare for Technical Interviews",
    excerpt: "A step-by-step guide with common patterns and pitfalls",
    author: "Career Services",
    date: "Jun 10, 2023",
    category: "Guide",
    tags: ["interview", "career"],
    status: "scheduled",
  },
  {
    id: "c4",
    title: "Introducing the UI/UX Design Path",
    excerpt: "A curated set of courses for aspiring designers",
    author: "Program Team",
    date: "Mar 21, 2023",
    category: "Announcement",
    tags: ["uiux", "program"],
    featured: true,
    status: "published",
    coverUrl:
      "https://images.unsplash.com/photo-1524646432719-888f7a903eb1?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CMS() {
  const [content, setContent] = React.useState<ContentItem[]>(initialContent);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All Categories");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [sortBy, setSortBy] = React.useState("Sort by: Newest");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [view, setView] = React.useState<"grid" | "table">("grid");

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("cms-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = content
    .filter((it) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        it.title.toLowerCase().includes(q) ||
        it.excerpt.toLowerCase().includes(q) ||
        it.tags.some((t) => t.includes(q));
      const matchesCat = categoryFilter === "All Categories" || it.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || it.status === statusFilter.toLowerCase();
      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest")) return a.date < b.date ? 1 : -1;
      if (sortBy.includes("Oldest")) return a.date > b.date ? 1 : -1;
      if (sortBy.includes("Title")) return a.title.localeCompare(b.title);
      if (sortBy.includes("Featured")) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">CMS</h2>
          <p className="text-gray-600">Manage content pages, blog posts, and announcements</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Published</p>
              <p className="text-2xl font-bold text-secondary mt-1">{content.filter((c) => c.status === "published").length}</p>
              <p className="text-accent text-sm mt-1">+3 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Drafts</p>
              <p className="text-2xl font-bold text-secondary mt-1">{content.filter((c) => c.status === "draft").length}</p>
              <p className="text-accent text-sm mt-1">-1 from last week</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-secondary mt-1">{content.filter((c) => c.status === "scheduled").length}</p>
              <p className="text-accent text-sm mt-1">Next publish</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <CalendarDays className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Featured</p>
              <p className="text-2xl font-bold text-secondary mt-1">{content.filter((c) => c.featured).length}</p>
              <p className="text-accent text-sm mt-1">Highlighted</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="pl-10 w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  <SelectItem value="Blog">Blog</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Announcement">Announcement</SelectItem>
                  <SelectItem value="Page">Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-10 w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Newest">Sort by: Newest</SelectItem>
                  <SelectItem value="Sort by: Oldest">Sort by: Oldest</SelectItem>
                  <SelectItem value="Sort by: Title">Sort by: Title</SelectItem>
                  <SelectItem value="Sort by: Featured">Sort by: Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="cms-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filtered.map((it) => (
            <div key={it.id} className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary">{it.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span className="capitalize">{it.category}</span>
                      <span>•</span>
                      <span>{it.author}</span>
                      <span>•</span>
                      <span>{it.date}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600">
                      <EllipsisVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {it.coverUrl && (
                <img src={it.coverUrl} alt="Cover" className="w-full h-40 object-cover rounded-lg mb-4" />
              )}

              <p className="text-gray-600 text-sm mb-4">{it.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Tags className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{it.tags.join(", ")}</span>
                </div>
                <div>
                  {it.status === "published" && (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Published</span>
                  )}
                  {it.status === "draft" && (
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">Draft</span>
                  )}
                  {it.status === "scheduled" && (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">Scheduled</span>
                  )}
                  {it.status === "archived" && (
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">Archived</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {it.status === "published" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                      )}
                      {it.status === "draft" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>
                      )}
                      {it.status === "scheduled" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Scheduled</span>
                      )}
                      {it.status === "archived" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Archived</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="text-gray-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={view === "grid" ? "outline" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => setView("grid")}
          >
            Grid
          </Button>
          <Button
            variant={view === "table" ? "outline" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => setView("table")}
          >
            Table
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>Write and publish blog posts or pages</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              id="content-title"
              placeholder="Title"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              id="content-excerpt"
              placeholder="Short excerpt"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select defaultValue="Blog">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog">Blog</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Page">Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select defaultValue="Draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="border-gray-300" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const titleEl = document.getElementById("content-title") as HTMLInputElement | null;
                  const excerptEl = document.getElementById("content-excerpt") as HTMLTextAreaElement | null;
                  const title = titleEl?.value.trim() || "New Content";
                  const excerpt = excerptEl?.value.trim() || "";
                  const newItem: ContentItem = {
                    id: Math.random().toString(36).slice(2),
                    title,
                    excerpt: excerpt || "Draft content created",
                    author: "Admin",
                    date: new Date().toLocaleDateString(),
                    category: "Blog",
                    tags: ["new"],
                    status: "draft",
                  };
                  setContent([newItem, ...content]);
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

