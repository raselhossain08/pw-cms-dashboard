"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
  EllipsisVertical,
  Store,
  Tag,
  ShoppingCart,
  BadgePercent,
  Star,
  Eye,
  Edit,
  Trash,
  Plus,
  Box,
  Loader2,
  LayoutGrid,
  List,
  RefreshCw,
  Download,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/lib/types/product";
import ProductForm from "./ProductForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";

type ProductStatus = "active" | "draft" | "out-of-stock" | "low-stock";

type ProductItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "Course" | "E-book" | "Merchandise" | "Bundle";
  status: ProductStatus;
  rating: number;
  sales?: number;
  imageUrl?: string;
};

type OrderStatus = "processing" | "completed" | "pending" | "cancelled";

type OrderItem = {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: OrderStatus;
};

// No initial mock data - will load from API

// Orders will be loaded from API when implemented

export default function Shop() {
  const { push } = useToast();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const debouncedSearch = useDebounce(search, 500);

  const {
    products: apiProducts,
    loading,
    error,
    stats,
    statsLoading,
    pagination,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateStatus,
    refreshProducts,
    fetchProducts,
    fetchStats,
    exportProducts,
  } = useProducts({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const [orders] = React.useState<OrderItem[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState("All Products");
  const [sortBy, setSortBy] = React.useState("Sort by: Newest");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = React.useState(false);
  const [deletingProduct, setDeletingProduct] = React.useState<string | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = React.useState<Set<string>>(
    new Set()
  );
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("table");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Handle product created callback
  const handleProductCreated = (newProduct: Product) => {
    refreshProducts();
    fetchStats();
    setCreateOpen(false);
  };

  // Handle product updated callback
  const handleProductUpdated = (updatedProduct: Product) => {
    refreshProducts();
    fetchStats();
    setEditOpen(false);
    setSelectedProduct(null);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    setActionLoading(true);
    const success = await bulkDeleteProducts(Array.from(selectedProducts));
    if (success) {
      setSelectedProducts(new Set());
      setBulkDeleteDialogOpen(false);
      fetchStats();
    }
    setActionLoading(false);
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedProducts.size === 0) return;
    setActionLoading(true);
    const success = await bulkUpdateStatus(
      Array.from(selectedProducts),
      status
    );
    if (success) {
      setSelectedProducts(new Set());
      setBulkStatusDialogOpen(false);
      fetchStats();
    }
    setActionLoading(false);
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportProducts({
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Toggle all products selection
  const toggleAllSelection = () => {
    if (selectedProducts.size === filtered.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filtered.map((p) => p.id)));
    }
  };

  // Update filters and reset page
  React.useEffect(() => {
    setPage(1);
    fetchProducts({
      page: 1,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
    });
  }, [debouncedSearch, statusFilter, typeFilter, limit]);

  // Handle view product
  const handleViewProduct = async (productId: string) => {
    try {
      const product = apiProducts.find((p) => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        setViewOpen(true);
      }
    } catch (error) {
      console.error("Failed to view product:", error);
    }
  };

  // Handle edit product
  const handleEditProduct = async (productId: string) => {
    try {
      const product = apiProducts.find((p) => p._id === productId);
      if (product) {
        setSelectedProduct(product);
        setEditOpen(true);
      }
    } catch (error) {
      console.error("Failed to load product for editing:", error);
    }
  };

  // Handle delete product with confirmation
  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    const success = await deleteProduct(deletingProduct);
    if (success) {
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    }
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "shop-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Helper function to map API product type to UI category
  const mapProductType = (
    type: string
  ): "Course" | "E-book" | "Merchandise" | "Bundle" => {
    if (type === "aircraft" || type === "simulator") return "Course";
    if (type === "equipment") return "Merchandise";
    if (type === "service") return "E-book";
    return "Course";
  };

  // Helper function to map API status to UI status
  const mapProductStatus = (status: string): ProductStatus => {
    if (status === "published") return "active";
    if (status === "draft") return "draft";
    if (status === "sold") return "out-of-stock";
    return "active";
  };

  // Convert API products to UI format
  const products: ProductItem[] = React.useMemo(() => {
    return apiProducts.map((p) => ({
      id: p._id,
      title: p.title,
      description: p.description,
      price: p.price,
      category: mapProductType(p.type),
      status: mapProductStatus(p.status),
      rating: p.rating || 5,
      sales: p.soldCount || 0,
      imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
    }));
  }, [apiProducts]);

  const filtered = React.useMemo(() => {
    return products
      .filter((p) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        const matchesCat =
          categoryFilter === "All Products" ||
          (categoryFilter === "Courses" && p.category === "Course") ||
          (categoryFilter === "E-books" && p.category === "E-book") ||
          (categoryFilter === "Merchandise" && p.category === "Merchandise");
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy.includes("Newest")) return a.id < b.id ? 1 : -1;
        if (sortBy.includes("Oldest")) return a.id > b.id ? 1 : -1;
        if (sortBy.includes("Price: High")) return b.price - a.price;
        if (sortBy.includes("Price: Low")) return a.price - b.price;
        if (sortBy.includes("Rating")) return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, search, categoryFilter, sortBy]);

  const statusBadge = (s: ProductStatus) =>
    s === "active"
      ? "bg-green-100 text-green-700"
      : s === "draft"
      ? "bg-gray-100 text-gray-700"
      : s === "out-of-stock"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  const orderBadge = (s: OrderStatus) =>
    s === "processing"
      ? "bg-blue-100 text-blue-700"
      : s === "completed"
      ? "bg-green-100 text-green-700"
      : s === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">Products</h2>
          <p className="text-gray-600">
            Manage your educational products, courses, and merchandise
          </p>
        </div>
        <div className="flex space-x-3">
          {selectedProducts.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setBulkStatusDialogOpen(true)}
                disabled={actionLoading}
              >
                <Tag className="w-4 h-4 mr-2" /> Update Status (
                {selectedProducts.size})
              </Button>
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={actionLoading}
              >
                <Trash className="w-4 h-4 mr-2" /> Delete (
                {selectedProducts.size})
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || actionLoading}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              refreshProducts();
              fetchStats();
            }}
            disabled={loading || actionLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Products
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  stats?.totalProducts || 0
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {stats?.publishedProducts || 0} published
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Store className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Published Products
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  stats?.publishedProducts || 0
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">Active listings</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `$${(stats?.totalRevenue || 0).toLocaleString()}`
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {stats?.totalSold || 0} sold
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Price</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `$${(stats?.averagePrice || 0).toLocaleString()}`
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">Per product</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-4">
          <div className="flex flex-wrap gap-2">
            {["All Products", "Courses", "E-books", "Merchandise"].map(
              (label) => (
                <Button
                  key={label}
                  variant={categoryFilter === label ? "default" : "secondary"}
                  className={
                    categoryFilter === label
                      ? ""
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                  onClick={() => setCategoryFilter(label)}
                >
                  {label}
                </Button>
              )
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="aircraft">Aircraft</SelectItem>
                        <SelectItem value="simulator">Simulator</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setFilterOpen(false);
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" /> Clear Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Newest">
                    Sort by: Newest
                  </SelectItem>
                  <SelectItem value="Sort by: Oldest">
                    Sort by: Oldest
                  </SelectItem>
                  <SelectItem value="Sort by: Price: High">
                    Sort by: Price: High
                  </SelectItem>
                  <SelectItem value="Sort by: Price: Low">
                    Sort by: Price: Low
                  </SelectItem>
                  <SelectItem value="Sort by: Rating">
                    Sort by: Rating
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant={viewMode === "grid" ? "default" : "secondary"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "secondary"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="shop-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products... (Cmd+K)"
              className="pl-9"
            />
          </div>
          {(statusFilter !== "all" || typeFilter !== "all" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setTypeFilter("all");
                setSearch("");
              }}
            >
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm border-b-2 border-gray-200">
                  <th className="py-4 px-4 font-semibold w-12">
                    <Checkbox
                      checked={
                        selectedProducts.size === filtered.length &&
                        filtered.length > 0
                      }
                      onCheckedChange={toggleAllSelection}
                    />
                  </th>
                  <th className="py-4 px-4 font-semibold">Image</th>
                  <th className="py-4 px-4 font-semibold">Product</th>
                  <th className="py-4 px-4 font-semibold">Category</th>
                  <th className="py-4 px-4 font-semibold">Price</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Rating</th>
                  <th className="py-4 px-4 font-semibold">Sales</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      <Box className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">
                        Try adjusting your filters or add a new product
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        selectedProducts.has(p.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedProducts.has(p.id)}
                          onCheckedChange={() => toggleProductSelection(p.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.title}
                            width={80}
                            height={60}
                            className="w-20 h-14 object-cover rounded"
                            unoptimized
                          />
                        ) : (
                          <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center">
                            <Box className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {p.description}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ${p.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(
                            p.status
                          )}`}
                        >
                          {p.status === "out-of-stock"
                            ? "Out of Stock"
                            : p.status === "low-stock"
                            ? "Low Stock"
                            : p.status.charAt(0).toUpperCase() +
                              p.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star
                            className="w-4 h-4 text-yellow-500"
                            fill="currentColor"
                          />
                          <span className="font-medium">{p.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {p.sales || 0}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <EllipsisVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewProduct(p.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(p.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteProduct(p.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
                products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-card rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="relative mb-4">
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    width={600}
                    height={160}
                    className="w-full h-40 object-cover rounded-lg"
                    unoptimized
                  />
                )}
                <span
                  className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs ${statusBadge(
                    p.status
                  )}`}
                >
                  {p.status === "out-of-stock"
                    ? "Out of Stock"
                    : p.status === "low-stock"
                    ? "Low Stock"
                    : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80"
                    >
                      <EllipsisVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProduct(p.id)}>
                      <Eye className="w-4 h-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProduct(p.id)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteProduct(p.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-secondary mb-1">{p.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-secondary">
                    ${p.price.toFixed(2)}
                  </span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < p.rating ? "text-yellow-500" : "text-gray-300"
                        }`}
                        fill={i < p.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="border-gray-300"
                  onClick={() => handleViewProduct(p.id)}
                >
                  Details
                </Button>
                <Button
                  className="bg-primary text-white"
                  onClick={() => handleEditProduct(p.id)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
          <div
            onClick={() => setCreateOpen(true)}
            className="bg-linear-to-br from-primary/5 to-accent/5 rounded-xl p-4 shadow-sm border border-dashed border-primary/30 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-primary text-xl" />
            </div>
            <h4 className="font-semibold text-secondary mb-2">
              Add New Product
            </h4>
            <p className="text-gray-600 text-sm">
              Create a new course, e-book, or merchandise
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Sales Performance
          </h3>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Top Selling Products
          </h3>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm border-b-2 border-gray-200">
                  <th className="py-4 px-4 font-semibold">Order ID</th>
                  <th className="py-4 px-4 font-semibold">Customer</th>
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-4 font-semibold">Amount</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm bg-white">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-blue-600">
                      {o.id}
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-medium">
                      {o.customer}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{o.date}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {o.amount}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${orderBadge(
                          o.status
                        )}`}
                      >
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-primary hover:text-primary/80 p-1 hover:bg-primary/10 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onProductCreated={handleProductCreated}
      />

      <ProductForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onProductCreated={handleProductUpdated}
        initialData={selectedProduct || undefined}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={loading || actionLoading}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="Delete Products"
        description={`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={actionLoading}
      />

      {/* Bulk Status Update Dialog - Using custom dialog */}
      {bulkStatusDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              Update Product Status
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Update status for {selectedProducts.size} product(s):
            </p>
            <Select
              onValueChange={async (value) => {
                await handleBulkStatusUpdate(value);
              }}
            >
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setBulkStatusDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product View Dialog */}
      {selectedProduct && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity ${
            viewOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setViewOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProduct.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedProduct.slug}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewOpen(false)}
                >
                  ✕
                </Button>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="mb-6">
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${selectedProduct.price.toLocaleString()}{" "}
                    {selectedProduct.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedProduct.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(
                      mapProductStatus(selectedProduct.status)
                    )}`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                    />
                    <span className="font-semibold">
                      {selectedProduct.rating || 0} (
                      {selectedProduct.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-900">{selectedProduct.description}</p>
              </div>

              {selectedProduct.manufacturer && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Manufacturer</p>
                  <p className="text-gray-900">
                    {selectedProduct.manufacturer}{" "}
                    {selectedProduct.productModel} ({selectedProduct.year})
                  </p>
                </div>
              )}

              {selectedProduct.features &&
                selectedProduct.features.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Features</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProduct.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-900">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setViewOpen(false);
                    handleEditProduct(selectedProduct._id);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Product
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewOpen(false);
                    handleDeleteProduct(selectedProduct._id);
                  }}
                  className="flex-1"
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
