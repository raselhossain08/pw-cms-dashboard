"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  ArrowUpDown,
  EllipsisVertical,
  Percent,
  Plus,
  Copy,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Check,
  X,
  AlertCircle,
  Calendar,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCoupons } from "@/hooks/useCoupons";
import {
  Coupon,
  CouponType,
  CreateCouponDto,
  UpdateCouponDto,
} from "@/services/coupons.service";
import { format } from "date-fns";

type StatusFilter = "all" | "active" | "inactive" | "expired" | "scheduled";
type TypeFilter = "all" | CouponType;

export default function Discounts() {
  const {
    coupons,
    loading,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    duplicateCoupon,
  } = useCoupons();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [sortBy, setSortBy] = React.useState<string>("newest");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedCoupon, setSelectedCoupon] = React.useState<Coupon | null>(
    null
  );

  const [formData, setFormData] = React.useState<CreateCouponDto>({
    code: "",
    type: CouponType.PERCENTAGE,
    value: 0,
    maxUses: 0,
    minPurchaseAmount: 0,
    isActive: true,
  });

  const [actionLoading, setActionLoading] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "discounts-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const getStatus = (coupon: Coupon): StatusFilter => {
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
      return "expired";
    if (
      coupon.expiresAt &&
      new Date(coupon.expiresAt) > new Date() &&
      !coupon.isActive
    )
      return "scheduled";
    return coupon.isActive ? "active" : "inactive";
  };

  const filtered = React.useMemo(() => {
    return coupons
      .filter((c) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || c.code.toLowerCase().includes(q);

        const status = getStatus(c);
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const matchesType = typeFilter === "all" || c.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "newest")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sortBy === "most-used") return b.usedCount - a.usedCount;
        if (sortBy === "expiry") {
          if (!a.expiresAt) return 1;
          if (!b.expiresAt) return -1;
          return (
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
          );
        }
        if (sortBy === "value") return b.value - a.value;
        return 0;
      });
  }, [coupons, search, statusFilter, typeFilter, sortBy]);

  const stats = React.useMemo(() => {
    return {
      active: coupons.filter((c) => getStatus(c) === "active").length,
      scheduled: coupons.filter((c) => getStatus(c) === "scheduled").length,
      expired: coupons.filter((c) => getStatus(c) === "expired").length,
      inactive: coupons.filter((c) => getStatus(c) === "inactive").length,
    };
  }, [coupons]);

  const resetForm = () => {
    setFormData({
      code: "",
      type: CouponType.PERCENTAGE,
      value: 0,
      maxUses: 0,
      minPurchaseAmount: 0,
      isActive: true,
    });
  };

  const handleCreate = async () => {
    if (!formData.code || formData.value <= 0) return;
    setActionLoading(true);
    const result = await createCoupon(formData);
    setActionLoading(false);
    if (result) {
      setCreateOpen(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!selectedCoupon || !formData.code || formData.value <= 0) return;
    setActionLoading(true);
    const result = await updateCoupon(selectedCoupon._id, formData);
    setActionLoading(false);
    if (result) {
      setEditOpen(false);
      setSelectedCoupon(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    setActionLoading(true);
    const result = await deleteCoupon(selectedCoupon._id);
    setActionLoading(false);
    if (result) {
      setDeleteOpen(false);
      setSelectedCoupon(null);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    await toggleCouponStatus(coupon._id);
  };

  const handleDuplicate = async (coupon: Coupon) => {
    await duplicateCoupon(coupon._id);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      expiresAt: coupon.expiresAt,
      maxUses: coupon.maxUses,
      minPurchaseAmount: coupon.minPurchaseAmount,
      isActive: coupon.isActive,
    });
    setEditOpen(true);
  };

  const openDeleteDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDeleteOpen(true);
  };

  const statusChip = (status: StatusFilter) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      scheduled: "bg-blue-100 text-blue-700",
      expired: "bg-gray-100 text-gray-700",
      inactive: "bg-red-100 text-red-700",
      all: "bg-gray-100 text-gray-700",
    };
    return styles[status];
  };

  const typeChip = (type: CouponType) => {
    return type === CouponType.PERCENTAGE
      ? "bg-primary text-white"
      : "bg-purple-600 text-white";
  };

  const cardBorder = (status: StatusFilter) => {
    const borders = {
      active: "border-l-4 border-green-500",
      scheduled: "border-l-4 border-blue-500",
      expired: "border-l-4 border-gray-500",
      inactive: "border-l-4 border-red-500",
      all: "",
    };
    return borders[status];
  };

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Discounts & Coupons
          </h2>
          <p className="text-gray-600">
            Create and manage discount codes to boost your sales
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => {
              resetForm();
              setCreateOpen(true);
            }}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Coupon
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
        {["Products", "Categories", "Orders", "Discounts"].map((t) => (
          <button
            key={t}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              t === "Discounts"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              <p className="text-gray-600 text-sm font-medium">
                Active Coupons
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.active}
              </p>
              <p className="text-accent text-sm mt-1">+5 this month</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Percent className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.scheduled}
              </p>
              <p className="text-blue-500 text-sm mt-1">Upcoming</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Expired</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.expired}
              </p>
              <p className="text-gray-500 text-sm mt-1">Ended</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Inactive</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {stats.inactive}
              </p>
              <p className="text-red-500 text-sm mt-1">Review</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {(
              [
                "all",
                "active",
                "scheduled",
                "expired",
                "inactive",
              ] as StatusFilter[]
            ).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "secondary"}
                className={
                  statusFilter === s
                    ? ""
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
                onClick={() => setStatusFilter(s)}
                size="sm"
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
                {s !== "all" && `(${stats[s as keyof typeof stats] || 0})`}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as TypeFilter)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Discount Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={CouponType.PERCENTAGE}>
                    Percentage
                  </SelectItem>
                  <SelectItem value={CouponType.FIXED}>Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                <SelectTrigger className="pl-10 w-56">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="most-used">Sort by: Most Used</SelectItem>
                  <SelectItem value="expiry">Sort by: Expiry Date</SelectItem>
                  <SelectItem value="value">Sort by: Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="discounts-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {loading && !coupons.length ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filtered.map((c) => {
              const status = getStatus(c);
              return (
                <div
                  key={c._id}
                  className={`bg-card rounded-xl p-6 shadow-sm border border-gray-100 ${cardBorder(
                    status
                  )}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusChip(
                          status
                        )}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${typeChip(
                          c.type
                        )}`}
                      >
                        {c.type === CouponType.PERCENTAGE
                          ? `${c.value}%`
                          : `$${c.value}`}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 h-8 w-8"
                        >
                          <EllipsisVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(c)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(c)}>
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(c)}>
                          {c.isActive ? (
                            <>
                              <ToggleLeft className="w-4 h-4 mr-2" /> Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4 mr-2" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(c)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-bold text-2xl text-secondary mb-2">
                      {c.code}
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {c.expiresAt
                          ? `Expires: ${format(
                              new Date(c.expiresAt),
                              "MMM dd, yyyy"
                            )}`
                          : "No expiry"}
                      </span>
                      <span className="text-gray-500">{c.usedCount} uses</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Min. Purchase: ${c.minPurchaseAmount} • Max Uses:{" "}
                      {c.maxUses || "Unlimited"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-accent font-medium">
                      <span>
                        {c.type === CouponType.PERCENTAGE
                          ? `${c.value}% OFF`
                          : `$${c.value} OFF`}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      onClick={() => handleCopyCode(c.code)}
                    >
                      {copiedCode === c.code ? (
                        <>
                          <Check className="w-4 h-4 mr-2" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            <div
              className="bg-linear-to-br from-primary/5 to-accent/5 rounded-xl p-6 shadow-sm border border-dashed border-primary/30 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                resetForm();
                setCreateOpen(true);
              }}
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-primary w-8 h-8" />
              </div>
              <h4 className="font-semibold text-secondary mb-2">
                Create New Coupon
              </h4>
              <p className="text-gray-600 text-sm">
                Design custom discount codes
              </p>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={createOpen || editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditOpen(false);
            setSelectedCoupon(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editOpen ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editOpen
                ? "Update coupon details"
                : "Design custom discount codes"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-code">Coupon Code *</Label>
                <Input
                  id="coupon-code"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER25"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="coupon-type">Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as CouponType })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CouponType.PERCENTAGE}>
                      Percentage
                    </SelectItem>
                    <SelectItem value={CouponType.FIXED}>
                      Fixed Amount
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-value">Value *</Label>
                <Input
                  id="coupon-value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={
                    formData.type === CouponType.PERCENTAGE ? "25" : "50"
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="coupon-expires">Expires At</Label>
                <Input
                  id="coupon-expires"
                  type="datetime-local"
                  value={
                    formData.expiresAt
                      ? new Date(formData.expiresAt).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-max-uses">
                  Max Uses (0 = unlimited)
                </Label>
                <Input
                  id="coupon-max-uses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="100"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="coupon-min-purchase">Min Purchase Amount</Label>
                <Input
                  id="coupon-min-purchase"
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchaseAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="coupon-active"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="coupon-active" className="cursor-pointer">
                Active immediately
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setEditOpen(false);
                setSelectedCoupon(null);
                resetForm();
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={editOpen ? handleEdit : handleCreate}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editOpen ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon code{" "}
              <strong>{selectedCoupon?.code}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
