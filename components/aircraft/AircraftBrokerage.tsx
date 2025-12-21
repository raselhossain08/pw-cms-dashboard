"use client";

import * as React from "react";
import Image from "next/image";
import {
  Download,
  Plus,
  Plane,
  HandCoins,
  MessagesSquare,
  DollarSign,
  Search as SearchIcon,
  Calendar,
  MapPin,
  Gauge,
  Wrench,
  Edit,
  Trash2,
  Eye,
  Mail,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAircraft } from "@/hooks/useAircraft";
import { useToast } from "@/context/ToastContext";
import {
  AircraftType,
  AircraftStatus,
  Aircraft,
  CreateAircraftDto,
  AircraftFilters,
} from "@/services/aircraft.service";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AircraftBrokerage() {
  const { push: showToast } = useToast();
  const {
    aircraft,
    loading,
    statistics,
    pagination,
    createAircraft,
    updateAircraft,
    deleteAircraft,
    fetchAircraft,
    incrementViews,
    incrementInquiries,
    refresh,
  } = useAircraft();

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Aircraft For Sale");
  const [typeFilter, setTypeFilter] = React.useState<string>("All Types");
  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [search, setSearch] = React.useState("");
  const [selectedAircraft, setSelectedAircraft] =
    React.useState<Aircraft | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [minPrice, setMinPrice] = React.useState<string>("");
  const [maxPrice, setMaxPrice] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = React.useState<CreateAircraftDto>({
    title: "",
    modelYear: "",
    manufacturer: "",
    type: AircraftType.PISTON_SINGLE,
    status: AircraftStatus.AVAILABLE,
    price: 0,
    hours: "",
    location: "",
    engine: "",
    avionics: "",
    imageUrl: "",
    description: "",
    negotiable: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      modelYear: "",
      manufacturer: "",
      type: AircraftType.PISTON_SINGLE,
      status: AircraftStatus.AVAILABLE,
      price: 0,
      hours: "",
      location: "",
      engine: "",
      avionics: "",
      imageUrl: "",
      description: "",
      negotiable: true,
    });
  };

  // Apply filters via API
  React.useEffect(() => {
    const filters: AircraftFilters = {
      page: currentPage,
      limit: 12,
      sortBy,
      sortOrder,
    };

    if (typeFilter !== "All Types") {
      filters.type = typeFilter as AircraftType;
    }
    if (statusFilter !== "All Status") {
      filters.status = statusFilter as AircraftStatus;
    }
    if (search) {
      filters.search = search;
    }
    if (minPrice) {
      filters.minPrice = Number(minPrice);
    }
    if (maxPrice) {
      filters.maxPrice = Number(maxPrice);
    }

    fetchAircraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    typeFilter,
    statusFilter,
    currentPage,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
  ]);

  // Debounce search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      const filters: AircraftFilters = {
        page: 1,
        limit: 12,
        sortBy,
        sortOrder,
        search: search || undefined,
      };

      if (typeFilter !== "All Types") {
        filters.type = typeFilter as AircraftType;
      }
      if (statusFilter !== "All Status") {
        filters.status = statusFilter as AircraftStatus;
      }
      if (minPrice) {
        filters.minPrice = Number(minPrice);
      }
      if (maxPrice) {
        filters.maxPrice = Number(maxPrice);
      }

      setCurrentPage(1);
      fetchAircraft(filters);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const statusChip = (s: AircraftStatus) =>
    s === AircraftStatus.AVAILABLE
      ? "bg-green-100 text-green-700"
      : s === AircraftStatus.RESERVED
      ? "bg-yellow-100 text-yellow-700"
      : s === AircraftStatus.UNDER_CONTRACT
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  const handleCreate = async () => {
    if (
      !formData.title ||
      !formData.price ||
      !formData.hours ||
      !formData.location
    ) {
      showToast({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }
    setIsSubmitting(true);
    const result = await createAircraft(formData);
    setIsSubmitting(false);
    if (result) {
      setAddOpen(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!selectedAircraft) return;
    setIsSubmitting(true);
    const result = await updateAircraft(selectedAircraft._id, formData);
    setIsSubmitting(false);
    if (result) {
      setEditOpen(false);
      setSelectedAircraft(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedAircraft) return;
    setIsSubmitting(true);
    const success = await deleteAircraft(selectedAircraft._id);
    setIsSubmitting(false);
    if (success) {
      setDeleteOpen(false);
      setSelectedAircraft(null);
    }
  };

  const openEditDialog = (a: Aircraft) => {
    setSelectedAircraft(a);
    setFormData({
      title: a.title,
      modelYear: a.modelYear,
      manufacturer: a.manufacturer,
      type: a.type,
      status: a.status,
      price: a.price,
      hours: a.hours,
      location: a.location,
      engine: a.engine || "",
      avionics: a.avionics || "",
      imageUrl: a.imageUrl || "",
      description: a.description || "",
      negotiable: a.negotiable,
    });
    setEditOpen(true);
  };

  const openDeleteDialog = (a: Aircraft) => {
    setSelectedAircraft(a);
    setDeleteOpen(true);
  };

  const openViewDialog = (a: Aircraft) => {
    setSelectedAircraft(a);
    incrementViews(a._id);
    setViewOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const loadingToast = showToast({
        type: "loading",
        message: `Exporting data as ${format.toUpperCase()}...`,
      });

      if (format === "csv") {
        const headers = [
          "Title",
          "Manufacturer",
          "Model Year",
          "Type",
          "Status",
          "Price",
          "Hours",
          "Location",
          "Engine",
          "Avionics",
          "Views",
          "Inquiries",
          "Created At",
        ];
        const rows = aircraft.map((a) => [
          a.title,
          a.manufacturer,
          a.modelYear,
          a.type,
          a.status,
          a.price.toString(),
          a.hours,
          a.location,
          a.engine || "",
          a.avionics || "",
          a.views.toString(),
          a.inquiries.toString(),
          new Date(a.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `aircraft-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const jsonData = JSON.stringify(aircraft, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `aircraft-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      showToast({
        type: "success",
        message: `Data exported successfully as ${format.toUpperCase()}!`,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to export data",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    await refresh();
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Aircraft Brokerage
          </h2>
          <p className="text-gray-600">
            Manage aircraft listings, buying requests, and client inquiries.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-300"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="w-4 h-4 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileText className="w-4 h-4 mr-2" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Aircraft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Aircraft For Sale
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  statistics?.totalListings || 0
                )}
              </p>
              <p className="text-accent text-sm mt-1">
                {statistics?.statusBreakdown.available || 0} available
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plane className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reserved</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {statistics?.statusBreakdown.reserved || 0}
              </p>
              <p className="text-accent text-sm mt-1">Pending transactions</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <HandCoins className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Under Contract
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {statistics?.statusBreakdown.underContract || 0}
              </p>
              <p className="text-accent text-sm mt-1">In negotiation</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessagesSquare className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  formatPrice(statistics?.totalValue || 0)
                )}
              </p>
              <p className="text-accent text-sm mt-1">
                {statistics?.statusBreakdown.sold || 0} sold
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            "Aircraft For Sale",
            "Aircraft Wanted",
            "Inquiry Messages",
            "Aircraft Types",
            "Client Management",
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

      {/* Tab Content */}
      {activeTab === "Aircraft For Sale" && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-secondary">
              Aircraft For Sale
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="Piston Single">Piston Single</SelectItem>
                    <SelectItem value="Piston Multi">Piston Multi</SelectItem>
                    <SelectItem value="Turboprop">Turboprop</SelectItem>
                    <SelectItem value="Business Jet">Business Jet</SelectItem>
                    <SelectItem value="Helicopter">Helicopter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Under Contract">
                      Under Contract
                    </SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center mb-4 gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="pl-9"
                placeholder="Search by model, location, manufacturer..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Min Price"
                className="w-32"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Max Price"
                className="w-32"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("price")}
              className="border-gray-300"
            >
              {getSortIcon("price")}
              <span className="ml-2">Price</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("createdAt")}
              className="border-gray-300"
            >
              {getSortIcon("createdAt")}
              <span className="ml-2">Date</span>
            </Button>
            {(minPrice || maxPrice) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : aircraft.length === 0 ? (
            <div className="text-center py-20">
              <Plane className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Aircraft Found
              </h3>
              <p className="text-gray-500 mb-6">
                {search ||
                typeFilter !== "All Types" ||
                statusFilter !== "All Status"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first aircraft listing"}
              </p>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Aircraft
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {aircraft.map((a) => (
                  <div
                    key={a._id}
                    className="aircraft-card bg-card rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {a.imageUrl ? (
                        <Image
                          src={a.imageUrl}
                          alt={a.title}
                          width={800}
                          height={300}
                          className="w-full h-48 object-cover cursor-pointer"
                          unoptimized
                          onClick={() => openViewDialog(a)}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Plane className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${statusChip(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                          {a.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => openViewDialog(a)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(a)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => openDeleteDialog(a)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-secondary">
                            {a.title}
                          </h4>
                          <p className="text-sm text-gray-600">{a.modelYear}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-secondary">
                            {formatPrice(a.price)}
                          </p>
                          {a.negotiable && (
                            <p className="text-xs text-gray-500">Negotiable</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <Gauge className="w-4 h-4 text-primary" />
                          <span className="truncate">{a.hours}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="truncate">{a.location}</span>
                        </div>
                        {a.engine && (
                          <div className="flex items-center space-x-2">
                            <Wrench className="w-4 h-4 text-primary" />
                            <span className="truncate">{a.engine}</span>
                          </div>
                        )}
                        {a.avionics && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="truncate">{a.avionics}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {a.views} views
                        </span>
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {a.inquiries} inquiries
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() => openViewDialog(a)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-gray-300"
                          onClick={() => incrementInquiries(a._id)}
                        >
                          Contact Seller
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(currentPage * pagination.limit, pagination.total)}{" "}
                    of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      )
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={loading}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === pagination.totalPages || loading
                      }
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "Aircraft Wanted" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-secondary">
              Aircraft Wanted (Buying Requests)
            </h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Request
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plane className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary">
                    Piston Aircraft
                  </h4>
                  <p className="text-sm text-gray-600">
                    Single & Multi-engine piston aircraft
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Cessna 172", info: "12 listings available" },
                  { label: "Piper PA-28", info: "8 listings available" },
                  { label: "Cirrus SR22", info: "6 listings available" },
                  { label: "Beechcraft Bonanza", info: "4 listings available" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-secondary">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.info}</p>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plane className="text-purple-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-secondary">
                    Turbine Aircraft
                  </h4>
                  <p className="text-sm text-gray-600">
                    Turboprop & Business jets
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "King Air 350", info: "5 listings available" },
                  { label: "Pilatus PC-12", info: "3 listings available" },
                  { label: "Citation CJ3", info: "2 listings available" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-secondary">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Inquiry Messages" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-secondary">
              Inquiry Messages
            </h3>
            <Button variant="outline" className="border-gray-300">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="space-y-4">
            {aircraft
              .filter((a) => a.inquiries > 0)
              .slice(0, 10)
              .map((a) => (
                <div
                  key={a._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-secondary">
                          {a.title}
                        </h4>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {a.inquiries} inquiries
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {a.location} • {formatPrice(a.price)}
                      </p>
                      {a.contactEmail && (
                        <p className="text-sm text-gray-500">
                          Contact: {a.contactEmail}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(a)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            {aircraft.filter((a) => a.inquiries > 0).length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Inquiries Yet
                </h3>
                <p className="text-gray-500">
                  Inquiry messages will appear here when customers show interest
                  in your aircraft listings.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Aircraft Types" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-semibold text-secondary mb-6">
            Aircraft Types Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statistics?.byType.map((typeStat) => {
              const typeName =
                Object.values(AircraftType).find((t) => t === typeStat._id) ||
                typeStat._id;
              return (
                <div
                  key={typeStat._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-secondary">{typeName}</h4>
                    <Plane className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Listings:</span>
                      <span className="font-semibold">{typeStat.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg. Price:</span>
                      <span className="font-semibold">
                        {formatPrice(typeStat.avgPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!statistics?.byType || statistics.byType.length === 0) && (
              <div className="col-span-full text-center py-12">
                <Plane className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No aircraft type data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Client Management" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-secondary">
              Client Management
            </h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Client
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {
                      new Set(
                        aircraft
                          .filter((a) => a.contactEmail)
                          .map((a) => a.contactEmail)
                      ).size
                    }
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Inquiries</p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {aircraft.reduce((sum, a) => sum + a.inquiries, 0)}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {aircraft.reduce((sum, a) => sum + a.views, 0)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {aircraft.length > 0
                      ? Math.round(
                          (aircraft.filter((a) => a.inquiries > 0).length /
                            aircraft.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <MessagesSquare className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from(
              new Set(
                aircraft
                  .filter((a) => a.contactEmail)
                  .map((a) => a.contactEmail)
              )
            )
              .slice(0, 10)
              .map((email, idx) => {
                const clientAircraft = aircraft.filter(
                  (a) => a.contactEmail === email
                );
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary mb-1">
                          {email}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {clientAircraft.length} listing
                          {clientAircraft.length !== 1 ? "s" : ""} •{" "}
                          {clientAircraft.reduce(
                            (sum, a) => sum + a.inquiries,
                            0
                          )}{" "}
                          inquiries
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                );
              })}
            {aircraft.filter((a) => a.contactEmail).length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Clients Yet
                </h3>
                <p className="text-gray-500">
                  Client information will appear here when inquiries are made.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Aircraft Dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Aircraft Listing
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new aircraft listing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Cessna 172S"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Cessna"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.modelYear}
                  onChange={(e) =>
                    setFormData({ ...formData, modelYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., 2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., 389000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., 1,240 TTAF"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., KAPA – Denver, CO"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine
                </label>
                <input
                  type="text"
                  value={formData.engine}
                  onChange={(e) =>
                    setFormData({ ...formData, engine: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Lycoming IO-360"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avionics
                </label>
                <input
                  type="text"
                  value={formData.avionics}
                  onChange={(e) =>
                    setFormData({ ...formData, avionics: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Garmin G1000 NXi"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as AircraftType })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AircraftType.PISTON_SINGLE}>
                      Piston Single
                    </SelectItem>
                    <SelectItem value={AircraftType.PISTON_MULTI}>
                      Piston Multi
                    </SelectItem>
                    <SelectItem value={AircraftType.TURBOPROP}>
                      Turboprop
                    </SelectItem>
                    <SelectItem value={AircraftType.BUSINESS_JET}>
                      Business Jet
                    </SelectItem>
                    <SelectItem value={AircraftType.HELICOPTER}>
                      Helicopter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as AircraftStatus,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AircraftStatus.AVAILABLE}>
                      Available
                    </SelectItem>
                    <SelectItem value={AircraftStatus.RESERVED}>
                      Reserved
                    </SelectItem>
                    <SelectItem value={AircraftStatus.UNDER_CONTRACT}>
                      Under Contract
                    </SelectItem>
                    <SelectItem value={AircraftStatus.SOLD}>Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter detailed description..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="negotiable"
                checked={formData.negotiable}
                onChange={(e) =>
                  setFormData({ ...formData, negotiable: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor="negotiable"
                className="text-sm font-medium text-gray-700"
              >
                Price is negotiable
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Aircraft
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Aircraft Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit Aircraft Listing
            </DialogTitle>
            <DialogDescription>
              Update the aircraft listing details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.modelYear}
                  onChange={(e) =>
                    setFormData({ ...formData, modelYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine
                </label>
                <input
                  type="text"
                  value={formData.engine}
                  onChange={(e) =>
                    setFormData({ ...formData, engine: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avionics
                </label>
                <input
                  type="text"
                  value={formData.avionics}
                  onChange={(e) =>
                    setFormData({ ...formData, avionics: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as AircraftType })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AircraftType.PISTON_SINGLE}>
                      Piston Single
                    </SelectItem>
                    <SelectItem value={AircraftType.PISTON_MULTI}>
                      Piston Multi
                    </SelectItem>
                    <SelectItem value={AircraftType.TURBOPROP}>
                      Turboprop
                    </SelectItem>
                    <SelectItem value={AircraftType.BUSINESS_JET}>
                      Business Jet
                    </SelectItem>
                    <SelectItem value={AircraftType.HELICOPTER}>
                      Helicopter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as AircraftStatus,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AircraftStatus.AVAILABLE}>
                      Available
                    </SelectItem>
                    <SelectItem value={AircraftStatus.RESERVED}>
                      Reserved
                    </SelectItem>
                    <SelectItem value={AircraftStatus.UNDER_CONTRACT}>
                      Under Contract
                    </SelectItem>
                    <SelectItem value={AircraftStatus.SOLD}>Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-negotiable"
                checked={formData.negotiable}
                onChange={(e) =>
                  setFormData({ ...formData, negotiable: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor="edit-negotiable"
                className="text-sm font-medium text-gray-700"
              >
                Price is negotiable
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => {
                setEditOpen(false);
                setSelectedAircraft(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Aircraft
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Aircraft Listing
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this aircraft listing? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAircraft && (
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <p className="font-semibold text-secondary">
                {selectedAircraft.title}
              </p>
              <p className="text-sm text-gray-600">
                {selectedAircraft.modelYear}
              </p>
              <p className="text-sm text-gray-600">
                {formatPrice(selectedAircraft.price)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedAircraft(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Aircraft
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Aircraft Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAircraft && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  {selectedAircraft.title}
                </DialogTitle>
                <DialogDescription>
                  Detailed information about this aircraft listing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {selectedAircraft.imageUrl && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedAircraft.imageUrl}
                      alt={selectedAircraft.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-xl font-bold text-secondary">
                      {formatPrice(selectedAircraft.price)}
                    </p>
                    {selectedAircraft.negotiable && (
                      <p className="text-xs text-green-600">Negotiable</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block text-sm px-2 py-1 rounded-full font-medium ${statusChip(
                        selectedAircraft.status
                      )}`}
                    >
                      {selectedAircraft.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <p className="font-semibold text-secondary">
                      {selectedAircraft.type}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Model Year</p>
                    <p className="font-semibold text-secondary">
                      {selectedAircraft.modelYear}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Manufacturer</p>
                    <p className="font-semibold text-secondary">
                      {selectedAircraft.manufacturer}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Hours</p>
                    <p className="font-semibold text-secondary">
                      {selectedAircraft.hours}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-secondary">
                      {selectedAircraft.location}
                    </p>
                  </div>
                  {selectedAircraft.engine && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Engine</p>
                      <p className="font-semibold text-secondary">
                        {selectedAircraft.engine}
                      </p>
                    </div>
                  )}
                  {selectedAircraft.avionics && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Avionics</p>
                      <p className="font-semibold text-secondary">
                        {selectedAircraft.avionics}
                      </p>
                    </div>
                  )}
                </div>
                {selectedAircraft.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-800">
                      {selectedAircraft.description}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {selectedAircraft.views} views
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedAircraft.inquiries} inquiries
                  </span>
                  <span>
                    Listed on{" "}
                    {new Date(selectedAircraft.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => incrementInquiries(selectedAircraft._id)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
