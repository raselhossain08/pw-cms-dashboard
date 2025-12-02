"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  ArrowUpDown,
  EllipsisVertical,
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

type CategoryStatus = "active" | "inactive";

type CategoryItem = {
  id: string;
  name: string;
  description: string;
  productCount: number;
  subcategoryCount: number;
  status: CategoryStatus;
  coverUrl?: string;
};

const initialCategories: CategoryItem[] = [
  {
    id: "cat1",
    name: "Programming",
    description: "Languages, frameworks, and software engineering",
    productCount: 32,
    subcategoryCount: 5,
    status: "active",
    coverUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat2",
    name: "Data Science",
    description: "Data analysis, visualization, and machine learning",
    productCount: 18,
    subcategoryCount: 3,
    status: "active",
    coverUrl:
      "https://images.unsplash.com/photo-1515524738708-327f6b0037a7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat3",
    name: "Business",
    description: "Entrepreneurship, management, and marketing",
    productCount: 14,
    subcategoryCount: 4,
    status: "active",
    coverUrl:
      "https://images.unsplash.com/photo-1556767576-cfba6f8abf8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat4",
    name: "Design",
    description: "UI/UX, graphic design, and creative tools",
    productCount: 9,
    subcategoryCount: 2,
    status: "active",
    coverUrl:
      "https://images.unsplash.com/photo-1524646432719-888f7a903eb1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat5",
    name: "Photography",
    description: "Cameras, composition, editing, and workflows",
    productCount: 6,
    subcategoryCount: 2,
    status: "inactive",
    coverUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Categories() {
  const [categories, setCategories] = React.useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("Sort by: Name");
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("category-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = categories
    .filter((c) => {
      const q = search.trim().toLowerCase();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy.includes("Name")) return a.name.localeCompare(b.name);
      if (sortBy.includes("Products")) return b.productCount - a.productCount;
      if (sortBy.includes("Subcategories")) return b.subcategoryCount - a.subcategoryCount;
      return 0;
    });

  const statusBadge = (s: CategoryStatus) =>
    s === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700";

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Categories</h2>
          <p className="text-gray-600">Organize your products with categories and subcategories</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
        {["Products", "Categories", "Orders", "Discounts"].map((t) => (
          <button
            key={t}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Categories" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              <p className="text-gray-600 text-sm font-medium">Total Categories</p>
              <p className="text-2xl font-bold text-secondary mt-1">{categories.length}</p>
              <p className="text-accent text-sm mt-1">+3 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Tags className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Categories</p>
              <p className="text-2xl font-bold text-secondary mt-1">{categories.filter((c) => c.status === "active").length}</p>
              <p className="text-accent text-sm mt-1">Healthy</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Tags className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Inactive</p>
              <p className="text-2xl font-bold text-secondary mt-1">{categories.filter((c) => c.status === "inactive").length}</p>
              <p className="text-gray-500 text-sm mt-1">Review pending</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Tags className="text-gray-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">With Subcategories</p>
              <p className="text-2xl font-bold text-secondary mt-1">{categories.filter((c) => c.subcategoryCount > 0).length}</p>
              <p className="text-accent text-sm mt-1">Organized</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tags className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Name">Sort by: Name</SelectItem>
                  <SelectItem value="Sort by: Products">Sort by: Products</SelectItem>
                  <SelectItem value="Sort by: Subcategories">Sort by: Subcategories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="category-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filtered.map((c) => (
          <div key={c.id} className="bg-card rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="relative mb-4">
              {c.coverUrl && (
                <Image
                  src={c.coverUrl}
                  alt={c.name}
                  width={600}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg"
                  unoptimized
                />
              )}
              <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs ${statusBadge(c.status)}`}>
                {c.status === "active" ? "Active" : "Inactive"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="absolute top-2 right-2 bg-white/80">
                    <EllipsisVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-secondary mb-1">{c.name}</h4>
              <p className="text-gray-600 text-sm mb-2">{c.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{c.productCount} products</span>
                <span className="text-gray-500">{c.subcategoryCount} subcategories</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="flex-1">Edit</Button>
              <Button variant="outline" className="border-gray-300">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Products by Category</h3>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Category Performance</h3>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>Enter category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                id="category-name"
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="category-desc"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Category description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <Select defaultValue="none">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select defaultValue="active">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-sm">Drag and drop cover image here or click to upload</p>
              <Button variant="outline" className="mt-2 border-gray-300">Select File</Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-gray-300" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const nameEl = document.getElementById("category-name") as HTMLInputElement | null;
                  const descEl = document.getElementById("category-desc") as HTMLTextAreaElement | null;
                  const name = nameEl?.value.trim() || "New Category";
                  const desc = descEl?.value.trim() || "Draft category created";
                  const newItem: CategoryItem = {
                    id: Math.random().toString(36).slice(2),
                    name,
                    description: desc,
                    productCount: 0,
                    subcategoryCount: 0,
                    status: "active",
                  };
                  setCategories([newItem, ...categories]);
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

