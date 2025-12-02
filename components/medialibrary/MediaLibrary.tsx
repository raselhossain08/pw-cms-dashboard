"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Grid2x2,
  List,
  ArrowUpDown,
  Image as ImageIcon,
  Video,
  File,
  HardDrive,
  Eye,
  Download,
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

type Folder = {
  id: string;
  name: string;
  count: number;
  color: "yellow" | "blue" | "green" | "purple" | "red" | "indigo";
};

type MediaType = "image" | "video" | "audio" | "pdf" | "doc";

type MediaItem = {
  id: string;
  type: MediaType;
  name: string;
  sizeLabel: string;
  badge: string;
  previewUrl?: string;
};

const initialFolders: Folder[] = [
  { id: "f1", name: "Course Images", count: 124, color: "yellow" },
  { id: "f2", name: "Lecture Videos", count: 87, color: "blue" },
  { id: "f3", name: "Documents", count: 56, color: "green" },
  { id: "f4", name: "Certificates", count: 42, color: "purple" },
  { id: "f5", name: "Marketing", count: 68, color: "red" },
  { id: "f6", name: "User Avatars", count: 145, color: "indigo" },
];

const initialMedia: MediaItem[] = [
  {
    id: "m1",
    type: "image",
    name: "course-thumbnail.jpg",
    sizeLabel: "2.4 MB",
    badge: "JPG",
    previewUrl:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "m2",
    type: "video",
    name: "lecture-intro.mp4",
    sizeLabel: "45.2 MB",
    badge: "MP4",
  },
  {
    id: "m3",
    type: "image",
    name: "student-avatar.png",
    sizeLabel: "1.2 MB",
    badge: "PNG",
    previewUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "m4",
    type: "pdf",
    name: "course-syllabus.pdf",
    sizeLabel: "3.7 MB",
    badge: "PDF",
  },
  {
    id: "m5",
    type: "image",
    name: "certificate-template.jpg",
    sizeLabel: "4.1 MB",
    badge: "JPG",
    previewUrl:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "m6",
    type: "audio",
    name: "lecture-audio.mp3",
    sizeLabel: "12.8 MB",
    badge: "MP3",
  },
];

export default function MediaLibrary() {
  const [folders, setFolders] = React.useState<Folder[]>(initialFolders);
  const [media, setMedia] = React.useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("Newest first");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [folderOpen, setFolderOpen] = React.useState(false);
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("media-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filteredMedia = media
    .filter((m) => {
      const q = search.trim().toLowerCase();
      return !q || m.name.toLowerCase().includes(q) || m.badge.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest")) return a.id < b.id ? 1 : -1;
      if (sortBy.includes("Oldest")) return a.id > b.id ? 1 : -1;
      if (sortBy.includes("Name A-Z")) return a.name.localeCompare(b.name);
      if (sortBy.includes("Name Z-A")) return b.name.localeCompare(a.name);
      if (sortBy.includes("Largest")) return parseFloat(b.sizeLabel) - parseFloat(a.sizeLabel);
      if (sortBy.includes("Smallest")) return parseFloat(a.sizeLabel) - parseFloat(b.sizeLabel);
      return 0;
    });

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Media Library</h2>
          <p className="text-gray-600">Manage images, videos, documents and other assets</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Upload Files
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Files</p>
              <p className="text-2xl font-bold text-secondary mt-1">{media.length}</p>
              <p className="text-accent text-sm mt-1">+24% from last month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <File className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Images</p>
              <p className="text-2xl font-bold text-secondary mt-1">{media.filter((m) => m.type === "image").length}</p>
              <p className="text-accent text-sm mt-1">+18% from last month</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <ImageIcon className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Videos</p>
              <p className="text-2xl font-bold text-secondary mt-1">{media.filter((m) => m.type === "video").length}</p>
              <p className="text-accent text-sm mt-1">+32% from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Video className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Storage Used</p>
              <p className="text-2xl font-bold text-secondary mt-1">4.2 GB</p>
              <p className="text-gray-600 text-sm mt-1">42% of 10 GB</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HardDrive className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">Folders</h3>
          <Button variant="ghost" className="text-primary" onClick={() => setFolderOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Folder
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {folders.map((f) => (
            <button
              key={f.id}
              className={`rounded-lg p-4 border ${selectedFolder === f.id ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
              onClick={() => setSelectedFolder(f.id)}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    f.color === "yellow"
                      ? "bg-yellow-100"
                      : f.color === "blue"
                      ? "bg-blue-100"
                      : f.color === "green"
                      ? "bg-green-100"
                      : f.color === "purple"
                      ? "bg-purple-100"
                      : f.color === "red"
                      ? "bg-red-100"
                      : "bg-indigo-100"
                  }`}
                >
                  <File className="w-5 h-5 text-gray-600" />
                </div>
                <p className="font-medium text-secondary text-sm text-center">{f.name}</p>
                <p className="text-xs text-gray-500 mt-1">{f.count} files</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">All Media Files</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  className={view === "grid" ? "bg-primary text-white" : "text-gray-600"}
                  onClick={() => setView("grid")}
                >
                  <Grid2x2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  className={view === "list" ? "bg-primary text-white" : "text-gray-600"}
                  onClick={() => setView("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Newest first">Newest first</SelectItem>
                  <SelectItem value="Oldest first">Oldest first</SelectItem>
                  <SelectItem value="Name A-Z">Name A-Z</SelectItem>
                  <SelectItem value="Name Z-A">Name Z-A</SelectItem>
                  <SelectItem value="Largest size">Largest size</SelectItem>
                  <SelectItem value="Smallest size">Smallest size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="media-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {view === "grid" ? (
          <div id="media-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredMedia.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg overflow-hidden border cursor-pointer ${selectedItems[m.id] ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button")) return;
                  toggleSelect(m.id);
                }}
              >
                <div className="relative">
                  {m.type === "image" && m.previewUrl ? (
                    <img src={m.previewUrl} alt={m.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                      {m.type === "video" ? (
                        <Video className="text-blue-500 w-8 h-8" />
                      ) : m.type === "audio" ? (
                        <File className="text-purple-500 w-8 h-8" />
                      ) : m.type === "pdf" ? (
                        <File className="text-red-500 w-8 h-8" />
                      ) : (
                        <File className="text-gray-500 w-8 h-8" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">{m.badge}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{m.name}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{m.sizeLabel}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="media-list" className="space-y-2">
            {filteredMedia.map((m) => (
              <div
                key={m.id}
                className={`flex items-center rounded-lg border p-2 cursor-pointer ${selectedItems[m.id] ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("button")) return;
                  toggleSelect(m.id);
                }}
              >
                <div className="relative w-20 h-20 flex-shrink-0">
                  {m.type === "image" && m.previewUrl ? (
                    <img src={m.previewUrl} alt={m.name} className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                      {m.type === "video" ? (
                        <Video className="text-blue-500 w-6 h-6" />
                      ) : m.type === "audio" ? (
                        <File className="text-purple-500 w-6 h-6" />
                      ) : m.type === "pdf" ? (
                        <File className="text-red-500 w-6 h-6" />
                      ) : (
                        <File className="text-gray-500 w-6 h-6" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 px-3">
                  <p className="text-sm font-medium text-secondary truncate">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.badge} • {m.sizeLabel}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Showing {Math.min(filteredMedia.length, 6)} of {media.length} files</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="border-gray-300">
              ‹
            </Button>
            <Button size="icon" className="bg-primary text-white">1</Button>
            <Button variant="outline" size="icon" className="border-gray-300">2</Button>
            <Button variant="outline" size="icon" className="border-gray-300">3</Button>
            <Button variant="outline" size="icon" className="border-gray-300">…</Button>
            <Button variant="outline" size="icon" className="border-gray-300">24</Button>
            <Button variant="outline" size="icon" className="border-gray-300">
              ›
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>Drag and drop files or browse to upload</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <p className="text-gray-600 mb-2">Drag and drop files here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button>Browse Files</Button>
            <p className="text-xs text-gray-500 mt-4">Supports: JPG, PNG, GIF, MP4, PDF, DOC (Max: 50MB)</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" className="border-gray-300" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Organize files into folders</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
              <input
                type="text"
                id="folder-name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Folder</label>
              <Select defaultValue="Root Directory">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Root Directory">Root Directory</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="border-gray-300" onClick={() => setFolderOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const nameEl = document.getElementById("folder-name") as HTMLInputElement | null;
                  const name = nameEl?.value.trim() || "New Folder";
                  const newF: Folder = {
                    id: Math.random().toString(36).slice(2),
                    name,
                    count: 0,
                    color: "blue",
                  };
                  setFolders([newF, ...folders]);
                  setFolderOpen(false);
                }}
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

