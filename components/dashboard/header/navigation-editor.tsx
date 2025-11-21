"use client";

import React, { useState } from "react";
import { Header, MenuItem, Submenu, MenuLink } from "@/types/header";
import { useHeaderStore } from "@/lib/store/header-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  X,
  Check,
  ArrowUpDown,
  Eye,
  EyeOff,
  Settings,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationEditorProps {
  header: Header;
}

export const NavigationEditor: React.FC<NavigationEditorProps> = ({
  header,
}) => {
  const { updateNavigation, loading } = useHeaderStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    header.navigation?.menuItems || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [savingItem, setSavingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  // Form state for editing menu item
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    title: "",
    href: "",
    hasDropdown: false,
    icon: "",
    description: "",
    featured: undefined,
    submenus: [],
  });

  const handleAddNewItem = () => {
    try {
      const newItem: MenuItem = {
        title: "New Menu Item",
        hasDropdown: false,
        icon: "Menu",
        href: "/",
      };
      setMenuItems([...menuItems, newItem]);
      setHasChanges(true);
      toast.success("New menu item added successfully! ✨", {
        description: "Configure the item details and save your changes.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to add new menu item", {
        description: "Please try again or refresh the page.",
        duration: 5000,
      });
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setEditDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!formData.title?.trim()) {
      toast.error("Menu title is required", {
        description: "Please enter a title for your menu item.",
        duration: 4000,
      });
      return;
    }

    if (!formData.hasDropdown && !formData.href?.trim()) {
      toast.error("URL is required for direct links", {
        description: "Please enter a valid URL for this menu item.",
        duration: 4000,
      });
      return;
    }

    setSavingItem(true);

    try {
      toast.loading("Saving menu item...", {
        id: "save-menu-item",
        description: "Please wait while we update your menu.",
      });

      const updatedItems = menuItems.map((item) =>
        item.title === editingItem?.title ? (formData as MenuItem) : item
      );

      setMenuItems(updatedItems);
      setHasChanges(true);
      setEditDialogOpen(false);
      setEditingItem(null);

      toast.success("Menu item updated successfully! 🎉", {
        id: "save-menu-item",
        description:
          "Your menu item has been saved. Don't forget to save all changes.",
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to save menu item:", error);
      toast.error("Failed to save menu item", {
        id: "save-menu-item",
        description:
          "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    setDeletingItem(item.title);

    try {
      toast.loading(`Deleting "${item.title}"...`, {
        id: "delete-menu-item",
        description: "Removing menu item from your navigation.",
      });

      // Add a small delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMenuItems(menuItems.filter((i) => i.title !== item.title));
      setHasChanges(true);

      toast.success(`"${item.title}" deleted successfully`, {
        id: "delete-menu-item",
        description: "Menu item has been removed from your navigation.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error(`Failed to delete "${item.title}"`, {
        id: "delete-menu-item",
        description: "Please try again or refresh the page.",
        duration: 5000,
      });
    } finally {
      setDeletingItem(null);
    }
  };

  const handleAddSubmenu = () => {
    const newSubmenu: Submenu = {
      title: "New Submenu",
      icon: "Folder",
      links: [],
    };
    setFormData({
      ...formData,
      submenus: [...(formData.submenus || []), newSubmenu],
    });
  };

  const handleUpdateSubmenu = (
    index: number,
    field: keyof Submenu,
    value: any
  ) => {
    const updatedSubmenus = [...(formData.submenus || [])];
    updatedSubmenus[index] = { ...updatedSubmenus[index], [field]: value };
    setFormData({ ...formData, submenus: updatedSubmenus });
  };

  const handleDeleteSubmenu = (index: number) => {
    const updatedSubmenus = formData.submenus?.filter((_, i) => i !== index);
    setFormData({ ...formData, submenus: updatedSubmenus });
  };

  const handleAddLink = (submenuIndex: number) => {
    const newLink: MenuLink = {
      text: "New Link",
      href: "/",
      icon: "Link",
      description: "Description",
    };
    const updatedSubmenus = [...(formData.submenus || [])];
    updatedSubmenus[submenuIndex].links.push(newLink);
    setFormData({ ...formData, submenus: updatedSubmenus });
  };

  const handleUpdateLink = (
    submenuIndex: number,
    linkIndex: number,
    field: keyof MenuLink,
    value: any
  ) => {
    const updatedSubmenus = [...(formData.submenus || [])];
    updatedSubmenus[submenuIndex].links[linkIndex] = {
      ...updatedSubmenus[submenuIndex].links[linkIndex],
      [field]: value,
    };
    setFormData({ ...formData, submenus: updatedSubmenus });
  };

  const handleDeleteLink = (submenuIndex: number, linkIndex: number) => {
    const updatedSubmenus = [...(formData.submenus || [])];
    updatedSubmenus[submenuIndex].links = updatedSubmenus[
      submenuIndex
    ].links.filter((_, i) => i !== linkIndex);
    setFormData({ ...formData, submenus: updatedSubmenus });
  };

  const handleSaveAll = async () => {
    try {
      toast.loading("Saving navigation menu...", {
        id: "save-navigation",
        description: "Updating your website navigation structure.",
      });

      await updateNavigation({ menuItems });
      setHasChanges(false);

      toast.success("Navigation menu updated successfully! 🚀", {
        id: "save-navigation",
        description: "Your navigation changes are now live on your website.",
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to update navigation menu:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast.error("Failed to update navigation menu", {
        id: "save-navigation",
        description: errorMessage.includes("Network")
          ? "Please check your internet connection and try again."
          : "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    }
  };

  const handleReset = () => {
    try {
      setMenuItems(header.navigation?.menuItems || []);
      setHasChanges(false);
      toast.info("Changes discarded", {
        description: "All unsaved changes have been reverted.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to reset changes", {
        description: "Please refresh the page to start over.",
        duration: 4000,
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Navigation Menu</h3>
            <p className="text-sm text-muted-foreground">
              Manage navigation menu items, dropdowns, and submenus
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="secondary" className="gap-1 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Unsaved Changes
              </Badge>
            )}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Eye className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Click on any menu item to edit its properties, submenus, and links.
          </AlertDescription>
        </Alert>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNewItem} className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Menu Item
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Reorder
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {menuItems.length} {menuItems.length === 1 ? "item" : "items"}
          </div>
        </div>

        {/* Menu Items List/Grid */}
        <div className="space-y-3">
          {menuItems.length === 0 ? (
            <Card className="p-12 text-center border-dashed bg-muted/20">
              <div className="flex flex-col items-center gap-3">
                <Settings className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-medium text-muted-foreground mb-2">
                    No menu items yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start building your navigation menu by adding your first
                    item
                  </p>
                </div>
                <Button onClick={handleAddNewItem} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Item
                </Button>
              </div>
            </Card>
          ) : viewMode === "list" ? (
            // List View
            menuItems.map((item, index) => (
              <Card
                key={item.title}
                className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary cursor-pointer"
                onClick={() => handleEditItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab transition-colors group-hover:text-foreground" />
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {item.icon?.charAt(0) || "M"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          {item.featured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {item.hasDropdown && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Eye className="h-3 w-3" />
                              Dropdown
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.hasDropdown ? (
                            <span>
                              {item.submenus?.length || 0} submenus •{" "}
                              {item.submenus?.reduce(
                                (acc, s) => acc + s.links.length,
                                0
                              ) || 0}{" "}
                              links
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {item.href || "No URL set"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item);
                            }}
                            disabled={deletingItem === item.title}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deletingItem === item.title ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {deletingItem === item.title
                            ? "Deleting..."
                            : "Delete"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <Card
                  key={item.title}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-t-4 border-t-primary/50 h-full"
                  onClick={() => handleEditItem(item)}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {item.icon?.charAt(0) || "M"}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          {item.featured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description || "No description"}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-2">
                          {item.hasDropdown ? (
                            <>
                              <Badge variant="secondary" className="text-xs">
                                {item.submenus?.length || 0} Submenus
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {item.submenus?.reduce(
                                  (acc, s) => acc + s.links.length,
                                  0
                                ) || 0}{" "}
                                Links
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs gap-1">
                              <LinkIcon className="h-3 w-3" />
                              Direct Link
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Dialog - Enhanced Design */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b bg-muted/50">
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Edit Menu Item
              </DialogTitle>
              <DialogDescription>
                Configure menu properties, submenus, and navigation links
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="basic" className="p-6">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger
                    value="dropdown"
                    disabled={!formData.hasDropdown}
                  >
                    Dropdown Content
                  </TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Basic Information
                      </CardTitle>
                      <CardDescription>
                        Core settings for your menu item
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="flex items-center gap-2"
                          >
                            Menu Title
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Home, Shop, About..."
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="icon">Icon Name</Label>
                          <Input
                            id="icon"
                            value={formData.icon}
                            onChange={(e) =>
                              setFormData({ ...formData, icon: e.target.value })
                            }
                            placeholder="Home, Store, Info..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Short description for this menu item..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium">
                            Dropdown Menu
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Enable to add submenus and multiple links
                          </p>
                        </div>
                        <Switch
                          checked={formData.hasDropdown}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hasDropdown: checked })
                          }
                        />
                      </div>

                      {!formData.hasDropdown && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="href"
                            className="flex items-center gap-2"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Direct Link URL
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="href"
                            value={formData.href}
                            onChange={(e) =>
                              setFormData({ ...formData, href: e.target.value })
                            }
                            placeholder="/about, /contact..."
                            className="font-mono text-sm"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="dropdown" className="space-y-6">
                  {/* Featured Item */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Featured Item</CardTitle>
                      <CardDescription>
                        Highlight a special item in your dropdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium">
                            Enable Featured Item
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Show a prominent featured card in the dropdown
                          </p>
                        </div>
                        <Switch
                          checked={!!formData.featured}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                featured: {
                                  title: "Featured Item",
                                  description: "",
                                  image: "",
                                  href: "",
                                  badge: "New",
                                },
                              });
                            } else {
                              setFormData({ ...formData, featured: undefined });
                            }
                          }}
                        />
                      </div>

                      {formData.featured && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Title</Label>
                              <Input
                                value={formData.featured.title}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    featured: {
                                      ...formData.featured!,
                                      title: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Featured item title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Badge Text</Label>
                              <Input
                                value={formData.featured.badge}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    featured: {
                                      ...formData.featured!,
                                      badge: e.target.value,
                                    },
                                  })
                                }
                                placeholder="New, Featured, Hot"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">Description</Label>
                            <Textarea
                              value={formData.featured.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  featured: {
                                    ...formData.featured!,
                                    description: e.target.value,
                                  },
                                })
                              }
                              placeholder="Describe your featured item..."
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Image URL</Label>
                              <Input
                                value={formData.featured.image}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    featured: {
                                      ...formData.featured!,
                                      image: e.target.value,
                                    },
                                  })
                                }
                                placeholder="/images/featured.jpg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Link URL</Label>
                              <Input
                                value={formData.featured.href}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    featured: {
                                      ...formData.featured!,
                                      href: e.target.value,
                                    },
                                  })
                                }
                                placeholder="/featured-item"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Submenus */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Submenus</CardTitle>
                          <CardDescription>
                            Organize your dropdown content into sections
                          </CardDescription>
                        </div>
                        <Button
                          onClick={handleAddSubmenu}
                          size="sm"
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Submenu
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.submenus?.length === 0 ? (
                          <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
                            <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">
                              No submenus yet
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Add your first submenu to organize links
                            </p>
                            <Button onClick={handleAddSubmenu} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Submenu
                            </Button>
                          </div>
                        ) : (
                          <Accordion type="multiple" className="space-y-3">
                            {formData.submenus?.map((submenu, submenuIndex) => (
                              <AccordionItem
                                key={submenuIndex}
                                value={`submenu-${submenuIndex}`}
                                className="border rounded-lg overflow-hidden bg-card"
                              >
                                <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                        <span className="text-xs text-primary font-medium">
                                          {submenu.icon?.charAt(0) || "S"}
                                        </span>
                                      </div>
                                      <span className="font-medium text-left">
                                        {submenu.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {submenu.links.length} links
                                      </Badge>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-4 border-t bg-muted/20">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-sm">
                                          Submenu Title
                                        </Label>
                                        <Input
                                          value={submenu.title}
                                          onChange={(e) =>
                                            handleUpdateSubmenu(
                                              submenuIndex,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Section name"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm">Icon</Label>
                                        <Input
                                          value={submenu.icon}
                                          onChange={(e) =>
                                            handleUpdateSubmenu(
                                              submenuIndex,
                                              "icon",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Folder, Box, Users..."
                                        />
                                      </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                          Links
                                        </Label>
                                        <Button
                                          onClick={() =>
                                            handleAddLink(submenuIndex)
                                          }
                                          size="sm"
                                          variant="outline"
                                          className="gap-2"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Add Link
                                        </Button>
                                      </div>

                                      {submenu.links.length === 0 ? (
                                        <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                          <p className="text-sm text-muted-foreground">
                                            No links in this submenu
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {submenu.links.map(
                                            (link, linkIndex) => (
                                              <div
                                                key={linkIndex}
                                                className="flex items-start gap-3 p-3 border rounded-lg bg-background group"
                                              >
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                  <div className="space-y-1">
                                                    <Label className="text-xs">
                                                      Link Text
                                                    </Label>
                                                    <Input
                                                      value={link.text}
                                                      onChange={(e) =>
                                                        handleUpdateLink(
                                                          submenuIndex,
                                                          linkIndex,
                                                          "text",
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Link text"
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <Label className="text-xs">
                                                      URL
                                                    </Label>
                                                    <Input
                                                      value={link.href}
                                                      onChange={(e) =>
                                                        handleUpdateLink(
                                                          submenuIndex,
                                                          linkIndex,
                                                          "href",
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="/url"
                                                      className="h-8 text-sm font-mono"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <Label className="text-xs">
                                                      Icon
                                                    </Label>
                                                    <Input
                                                      value={link.icon}
                                                      onChange={(e) =>
                                                        handleUpdateLink(
                                                          submenuIndex,
                                                          linkIndex,
                                                          "icon",
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Icon name"
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                  <div className="space-y-1">
                                                    <Label className="text-xs">
                                                      Badge
                                                    </Label>
                                                    <Input
                                                      value={link.badge || ""}
                                                      onChange={(e) =>
                                                        handleUpdateLink(
                                                          submenuIndex,
                                                          linkIndex,
                                                          "badge",
                                                          e.target.value ||
                                                            undefined
                                                        )
                                                      }
                                                      placeholder="Optional badge"
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                  <div className="space-y-1 col-span-2">
                                                    <Label className="text-xs">
                                                      Description
                                                    </Label>
                                                    <Input
                                                      value={link.description}
                                                      onChange={(e) =>
                                                        handleUpdateLink(
                                                          submenuIndex,
                                                          linkIndex,
                                                          "description",
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Link description"
                                                      className="h-8 text-sm"
                                                    />
                                                  </div>
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() =>
                                                    handleDeleteLink(
                                                      submenuIndex,
                                                      linkIndex
                                                    )
                                                  }
                                                  className="h-8 w-8 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <Button
                                      onClick={() =>
                                        handleDeleteSubmenu(submenuIndex)
                                      }
                                      variant="outline"
                                      className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Submenu
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>
                        Additional configuration options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Custom CSS Class</Label>
                        <Input
                          placeholder="custom-menu-item"
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Visibility Conditions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="visibility" />
                            <Label htmlFor="visibility" className="text-sm">
                              Show only to logged-in users
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="mobile-only" />
                            <Label htmlFor="mobile-only" className="text-sm">
                              Mobile only
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-muted/50 gap-3">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveItem}
                disabled={loading || savingItem}
                className="gap-2"
              >
                {savingItem ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="sticky bottom-0 bg-background border-t p-4 -mx-6 -mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                You have unsaved changes
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading}
                  size="sm"
                >
                  Discard Changes
                </Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={loading}
                  size="sm"
                  className="gap-2 min-w-[100px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
