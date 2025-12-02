"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Save,
  RefreshCw,
  ShoppingCart,
  Search,
  Menu,
  User,
  Settings,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { HeaderNavigation } from "@/types/cms";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { headerNavigationApi } from "@/services/cms.service";
import { useToast } from "@/context/ToastContext";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface HeaderEditorProps {
  headerId?: string;
  initialData?: Partial<HeaderNavigation>;
  onSave?: (data: HeaderNavigation) => void;
}

interface HeaderNavigationWithId extends HeaderNavigation {
  _id?: string;
}

export function HeaderEditor({
  headerId,
  initialData,
  onSave,
}: HeaderEditorProps) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { data: activeHeader, isLoading } = useQuery({
    queryKey: ["activeHeader"],
    queryFn: headerNavigationApi.getActive,
  });

  const effectiveHeader = useMemo<HeaderNavigation | null>(() => {
    if (
      initialData &&
      initialData.logo &&
      initialData.cart &&
      initialData.search &&
      initialData.navigation &&
      initialData.userMenu &&
      initialData.cta &&
      initialData.seo
    ) {
      return initialData as HeaderNavigation;
    }
    return activeHeader ?? null;
  }, [initialData, activeHeader]);

  const [data, setData] = useState<HeaderNavigation | null>(() => {
    // Ensure SEO field exists with default values
    if (effectiveHeader && !effectiveHeader.seo) {
      return {
        ...effectiveHeader,
        seo: {
          title: "Personal Wings - Learn. Grow. Succeed.",
          description: "Empower your learning journey with Personal Wings",
          keywords: ["education", "online courses", "learning platform"],
          ogImage: "",
          ogUrl: "",
          ogType: "website",
          twitterCard: "summary_large_image",
          twitterSite: "",
          canonicalUrl: "",
          locale: "en_US",
        },
      };
    }
    return effectiveHeader;
  });
  const [activeTab, setActiveTab] = useState("logo");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(
    new Set()
  );

  const toggleMenu = (index: number) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSubmenu = (menuIndex: number, submenuIndex: number) => {
    const key = `${menuIndex}-${submenuIndex}`;
    setExpandedSubmenus((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const addMenuItem = () => {
    if (!data) return;
    const newMenuItem = {
      title: "New Menu",
      href: "",
      hasDropdown: false,
      icon: "",
      description: "",
      featured: {
        title: "",
        description: "",
        image: "",
        href: "",
        badge: "",
      },
      submenus: [] as any[],
    };
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: {
          ...prev.navigation,
          menuItems: [...prev.navigation.menuItems, newMenuItem],
        },
      };
    });
  };

  const removeMenuItem = (index: number) => {
    if (!data) return;
    const menuItems = [...data.navigation.menuItems];
    menuItems.splice(index, 1);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems },
      };
    });
  };

  const moveMenuItem = (fromIndex: number, toIndex: number) => {
    if (!data) return;
    const menuItems = [...data.navigation.menuItems];
    const [movedItem] = menuItems.splice(fromIndex, 1);
    menuItems.splice(toIndex, 0, movedItem);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems },
      };
    });
  };

  const handleMenuDragEnd = (result: DropResult) => {
    if (!result.destination || !data) return;

    const items = Array.from(data.navigation.menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: items },
      };
    });
  };

  const handleSubmenuDragEnd = (result: DropResult, menuIndex: number) => {
    if (!result.destination || !data) return;

    const newMenuItems = [...data.navigation.menuItems];
    const submenus = Array.from(newMenuItems[menuIndex].submenus || []);
    const [reorderedItem] = submenus.splice(result.source.index, 1);
    submenus.splice(result.destination.index, 0, reorderedItem);

    newMenuItems[menuIndex].submenus = submenus;

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: newMenuItems },
      };
    });
  };

  const handleLinkDragEnd = (
    result: DropResult,
    menuIndex: number,
    submenuIndex: number
  ) => {
    if (!result.destination || !data) return;

    const newMenuItems = [...data.navigation.menuItems];
    const links = Array.from(
      newMenuItems[menuIndex].submenus![submenuIndex].links
    );
    const [reorderedItem] = links.splice(result.source.index, 1);
    links.splice(result.destination.index, 0, reorderedItem);

    newMenuItems[menuIndex].submenus![submenuIndex].links = links;

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: newMenuItems },
      };
    });
  };

  const addSubmenu = (menuIndex: number) => {
    if (!data) return;
    const newSubmenu = {
      title: "New Section",
      icon: "",
      links: [] as any[],
    };
    const newMenuItems = [...data.navigation.menuItems];
    if (!newMenuItems[menuIndex].submenus) {
      newMenuItems[menuIndex].submenus = [];
    }
    newMenuItems[menuIndex].submenus!.push(newSubmenu);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: newMenuItems },
      };
    });
  };

  const removeSubmenu = (menuIndex: number, submenuIndex: number) => {
    if (!data) return;
    const newMenuItems = [...data.navigation.menuItems];
    newMenuItems[menuIndex].submenus!.splice(submenuIndex, 1);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: newMenuItems },
      };
    });
  };

  const addSubmenuLink = (menuIndex: number, submenuIndex: number) => {
    if (!data) return;
    const newLink = {
      text: "New Link",
      href: "",
      icon: "",
      description: "",
      badge: "",
    };
    const newMenuItems = [...data.navigation.menuItems];
    newMenuItems[menuIndex].submenus![submenuIndex].links.push(newLink);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: newMenuItems },
      };
    });
  };

  const removeSubmenuLink = (
    menuIndex: number,
    submenuIndex: number,
    linkIndex: number
  ) => {
    if (!data) return;
    const newMenuItems = [...data.navigation.menuItems];
    newMenuItems[menuIndex].submenus![submenuIndex].links.splice(linkIndex, 1);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        navigation: { ...prev.navigation, menuItems: newMenuItems },
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!data) return;
      const id = headerId || data._id;
      if (!id) {
        const created = await headerNavigationApi.create(data);
        queryClient.invalidateQueries({ queryKey: ["headers"] });
        queryClient.invalidateQueries({ queryKey: ["activeHeader"] });
        push({ message: "Header created", type: "success" });
        setData(created);
      } else {
        const updated = await headerNavigationApi.update(id, data);
        queryClient.invalidateQueries({ queryKey: ["headers"] });
        queryClient.invalidateQueries({ queryKey: ["activeHeader"] });
        push({ message: "Header updated", type: "success" });
        setData(updated);
      }
      if (onSave) onSave(data as HeaderNavigation);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (field: string, file: File) => {
    if (!data || !(data._id || headerId)) return;
    const id = headerId || (data._id as string);

    try {
      // Initialize progress at 0
      setUploadProgress((prev) => ({ ...prev, [field]: 0 }));

      if (field === "logo.dark" || field === "logo.light") {
        const type = field.endsWith("dark") ? "dark" : "light";
        const updated = await headerNavigationApi.uploadLogo(
          id,
          file,
          type,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [field]: progress }));
          }
        );
        setData(updated);
        // Clear progress after short delay to show completion
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[field];
            return newProgress;
          });
        }, 1000);
        push({ message: "Logo uploaded successfully", type: "success" });
        return;
      }

      if (
        field.startsWith("navigation.menuItems") &&
        field.endsWith("featured.image")
      ) {
        const parts = field.split(".");
        const menuIndex = parseInt(parts[2]);
        const updated = await headerNavigationApi.uploadFeaturedImage(
          id,
          menuIndex,
          file,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [field]: progress }));
          }
        );
        setData(updated);
        // Clear progress after short delay to show completion
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[field];
            return newProgress;
          });
        }, 1000);
        push({
          message: "Featured image uploaded successfully",
          type: "success",
        });
        return;
      }

      if (field === "seo.ogImage") {
        const updated = await headerNavigationApi.uploadSeoImage(
          id,
          file,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [field]: progress }));
          }
        );
        setData(updated);
        // Clear progress after short delay to show completion
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[field];
            return newProgress;
          });
        }, 1000);
        push({
          message: "SEO image uploaded successfully",
          type: "success",
        });
        return;
      }
    } catch (error) {
      // Clear progress on error
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[field];
        return newProgress;
      });
      push({
        message: error instanceof Error ? error.message : "Upload failed",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (effectiveHeader) {
      // Ensure SEO field exists with default values
      if (!effectiveHeader.seo) {
        setData({
          ...effectiveHeader,
          seo: {
            title: "Personal Wings - Learn. Grow. Succeed.",
            description: "Empower your learning journey with Personal Wings",
            keywords: ["education", "online courses", "learning platform"],
            ogImage: "",
            ogUrl: "",
            ogType: "website",
            twitterCard: "summary_large_image",
            twitterSite: "",
            canonicalUrl: "",
            locale: "en_US",
          },
        });
      } else {
        setData(effectiveHeader);
      }
    }
  }, [effectiveHeader]);

  const ImageUploadField = ({
    label,
    value,
    onUpload,
    field,
    className = "",
  }: {
    label: string;
    value: string;
    onUpload: (field: string, file: File) => void;
    field: string;
    className?: string;
  }) => {
    const progress = uploadProgress[field];
    const isUploading = progress !== undefined && progress < 100;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(field, file);
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor={field}>{label}</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isUploading
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 cursor-pointer"
          }`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <RefreshCw className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Uploading...
                </p>
                <p className="text-xs text-blue-600 mt-1">{progress}%</p>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          ) : value ? (
            <div className="space-y-2 pointer-events-none">
              <img
                src={value}
                alt="Preview"
                className="mx-auto h-20 w-20 object-contain rounded"
              />
              <p className="text-sm text-gray-600 truncate">{value}</p>
            </div>
          ) : (
            <div className="text-center pointer-events-none">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload</p>
            </div>
          )}
          {!isUploading && (
            <Input
              id={field}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>
      </div>
    );
  };

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Loading header navigation...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Header Navigation Editor
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your website's header navigation and settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.isActive}
                onCheckedChange={(checked) =>
                  setData((prev) =>
                    prev ? { ...prev, isActive: checked } : prev
                  )
                }
              />
              <Label
                className={
                  data.isActive
                    ? "text-green-600 font-semibold"
                    : "text-gray-600"
                }
              >
                {data.isActive ? "Active" : "Inactive"}
              </Label>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-6 gap-1 sm:gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl overflow-x-auto">
            <TabsTrigger
              value="logo"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Logo</span>
              <span className="sm:hidden">Logo</span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger
              value="navigation"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Navigation</span>
              <span className="sm:hidden">Nav</span>
            </TabsTrigger>
            <TabsTrigger
              value="user"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">User Menu</span>
              <span className="sm:hidden">User</span>
            </TabsTrigger>
            <TabsTrigger
              value="cta"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">CTA</span>
              <span className="sm:hidden">CTA</span>
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white min-w-[80px] sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">SEO</span>
              <span className="sm:hidden">SEO</span>
            </TabsTrigger>
          </TabsList>

          {/* Logo Tab */}
          <TabsContent value="logo">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Logo Settings
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Configure your logo for light and dark themes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <ImageUploadField
                    label="Dark Theme Logo"
                    value={data.logo.dark}
                    onUpload={handleImageUpload}
                    field="logo.dark"
                  />
                  <ImageUploadField
                    label="Light Theme Logo"
                    value={data.logo.light}
                    onUpload={handleImageUpload}
                    field="logo.light"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-alt">Alt Text</Label>
                  <Input
                    id="logo-alt"
                    value={data.logo.alt}
                    onChange={(e) =>
                      setData((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          logo: { ...prev.logo, alt: e.target.value },
                        };
                      })
                    }
                    placeholder="Logo alt text for accessibility"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-6 h-6" />
                  Search Configuration
                </CardTitle>
                <CardDescription className="text-green-100">
                  Customize search functionality display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="search-placeholder">Placeholder Text</Label>
                    <Input
                      id="search-placeholder"
                      value={data.search.placeholder}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            search: {
                              ...prev.search,
                              placeholder: e.target.value,
                            },
                          };
                        })
                      }
                      placeholder="Search for courses..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-button">Button Text</Label>
                    <Input
                      id="search-button"
                      value={data.search.buttonText}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            search: {
                              ...prev.search,
                              buttonText: e.target.value,
                            },
                          };
                        })
                      }
                      placeholder="Search"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results-per-page">Results Per Page</Label>
                    <Input
                      id="results-per-page"
                      type="number"
                      min="1"
                      max="50"
                      value={data.search.resultsPerPage}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            search: {
                              ...prev.search,
                              resultsPerPage: parseInt(e.target.value) || 10,
                            },
                          };
                        })
                      }
                    />
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Search Results</p>
                      <p className="text-sm text-muted-foreground">
                        Search results are dynamically fetched from your course
                        database. Configure the display settings above to
                        customize how search results appear.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cart Link Configuration */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Cart Settings
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Configure the cart page link. Cart items are managed
                      dynamically by users.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cart-href">Cart Page Link</Label>
                    <Input
                      id="cart-href"
                      value={data.cart.href}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            cart: { ...prev.cart, href: e.target.value },
                          };
                        })
                      }
                      placeholder="/cart"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL where users will be directed when they click on the
                      cart icon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Menu className="w-6 h-6" />
                  Navigation Menu
                </CardTitle>
                <CardDescription className="text-yellow-100">
                  Manage your main navigation menu items and structure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {/* Info Banner */}
                <div className="rounded-lg border bg-blue-50/50 p-3 sm:p-4 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Menu className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">
                        Collapsible Menu Items
                      </p>
                      <p className="text-sm text-blue-800">
                        Click the <ChevronDown className="inline w-4 h-4" />{" "}
                        icon to expand/collapse menu details. Drag the{" "}
                        <GripVertical className="inline w-4 h-4" /> icon to
                        reorder items.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const allIndexes = new Set(
                          data.navigation.menuItems.map((_, i) => i)
                        );
                        setExpandedMenus(allIndexes);
                      }}
                    >
                      Expand All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedMenus(new Set())}
                    >
                      Collapse All
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" onClick={addMenuItem}>
                    <Plus className="w-4 h-4" /> Add Menu Item
                  </Button>
                </div>
                <DragDropContext onDragEnd={handleMenuDragEnd}>
                  <Droppable droppableId="menu-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {data.navigation.menuItems.map((menuItem, index) => (
                          <Draggable
                            key={`menu-${index}`}
                            draggableId={`menu-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-l-4 border-l-primary/30 transition-all ${
                                  snapshot.isDragging ? "shadow-lg" : ""
                                }`}
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                                      >
                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="shrink-0"
                                      >
                                        #{index + 1}
                                      </Badge>
                                      <Input
                                        value={menuItem.title}
                                        onChange={(e) => {
                                          const newMenuItems = [
                                            ...data.navigation.menuItems,
                                          ];
                                          newMenuItems[index].title =
                                            e.target.value;
                                          setData((prev) => {
                                            if (!prev) return prev;
                                            return {
                                              ...prev,
                                              navigation: {
                                                ...prev.navigation,
                                                menuItems: newMenuItems,
                                              },
                                            };
                                          });
                                        }}
                                        placeholder="Menu title"
                                        className="h-8 max-w-xs"
                                      />
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={menuItem.hasDropdown}
                                          onCheckedChange={(checked) => {
                                            const newMenuItems = [
                                              ...data.navigation.menuItems,
                                            ];
                                            newMenuItems[index].hasDropdown =
                                              checked;
                                            setData((prev) => {
                                              if (!prev) return prev;
                                              return {
                                                ...prev,
                                                navigation: {
                                                  ...prev.navigation,
                                                  menuItems: newMenuItems,
                                                },
                                              };
                                            });
                                          }}
                                        />
                                        <Label className="text-xs">
                                          Dropdown
                                        </Label>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleMenu(index)}
                                      >
                                        {expandedMenus.has(index) ? (
                                          <ChevronUp className="w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMenuItem(index)}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                {expandedMenus.has(index) && (
                                  <CardContent className="space-y-4 pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Icon Name</Label>
                                        <Input
                                          value={menuItem.icon}
                                          onChange={(e) => {
                                            const newMenuItems = [
                                              ...data.navigation.menuItems,
                                            ];
                                            newMenuItems[index].icon =
                                              e.target.value;
                                            setData((prev) => {
                                              if (!prev) return prev;
                                              return {
                                                ...prev,
                                                navigation: {
                                                  ...prev.navigation,
                                                  menuItems: newMenuItems,
                                                },
                                              };
                                            });
                                          }}
                                          placeholder="GraduationCap"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>
                                          Link URL{" "}
                                          {!menuItem.hasDropdown &&
                                            "(Required for non-dropdown)"}
                                        </Label>
                                        <Input
                                          value={menuItem.href || ""}
                                          onChange={(e) => {
                                            const newMenuItems = [
                                              ...data.navigation.menuItems,
                                            ];
                                            newMenuItems[index].href =
                                              e.target.value;
                                            setData((prev) => {
                                              if (!prev) return prev;
                                              return {
                                                ...prev,
                                                navigation: {
                                                  ...prev.navigation,
                                                  menuItems: newMenuItems,
                                                },
                                              };
                                            });
                                          }}
                                          placeholder="/courses"
                                          disabled={menuItem.hasDropdown}
                                        />
                                      </div>
                                    </div>

                                    {menuItem.hasDropdown && (
                                      <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                          value={menuItem.description || ""}
                                          onChange={(e) => {
                                            const newMenuItems = [
                                              ...data.navigation.menuItems,
                                            ];
                                            newMenuItems[index].description =
                                              e.target.value;
                                            setData((prev) => {
                                              if (!prev) return prev;
                                              return {
                                                ...prev,
                                                navigation: {
                                                  ...prev.navigation,
                                                  menuItems: newMenuItems,
                                                },
                                              };
                                            });
                                          }}
                                          placeholder="Short description for this menu"
                                        />
                                      </div>
                                    )}

                                    {/* Submenu Management */}
                                    {menuItem.hasDropdown && (
                                      <div className="space-y-4 mt-6 pt-6 border-t">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <Label className="text-base font-semibold">
                                              Submenu Sections
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              Organize dropdown content into
                                              sections with multiple links
                                            </p>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSubmenu(index)}
                                          >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Section
                                          </Button>
                                        </div>

                                        {menuItem.submenus &&
                                        menuItem.submenus.length > 0 ? (
                                          <DragDropContext
                                            onDragEnd={(result) =>
                                              handleSubmenuDragEnd(
                                                result,
                                                index
                                              )
                                            }
                                          >
                                            <Droppable
                                              droppableId={`submenus-${index}`}
                                            >
                                              {(provided) => (
                                                <div
                                                  {...provided.droppableProps}
                                                  ref={provided.innerRef}
                                                  className="space-y-4"
                                                >
                                                  {menuItem.submenus!.map(
                                                    (submenu, submenuIndex) => (
                                                      <Draggable
                                                        key={`submenu-${index}-${submenuIndex}`}
                                                        draggableId={`submenu-${index}-${submenuIndex}`}
                                                        index={submenuIndex}
                                                      >
                                                        {(
                                                          provided,
                                                          snapshot
                                                        ) => (
                                                          <Card
                                                            ref={
                                                              provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            className={`bg-muted/30 transition-shadow ${
                                                              snapshot.isDragging
                                                                ? "shadow-lg"
                                                                : ""
                                                            }`}
                                                          >
                                                            <CardHeader className="pb-3">
                                                              <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 flex-1">
                                                                  <div
                                                                    {...provided.dragHandleProps}
                                                                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                                                                  >
                                                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                                                  </div>
                                                                  <Badge
                                                                    variant="outline"
                                                                    className="shrink-0"
                                                                  >
                                                                    {submenuIndex +
                                                                      1}
                                                                  </Badge>
                                                                  <Input
                                                                    value={
                                                                      submenu.title
                                                                    }
                                                                    onChange={(
                                                                      e
                                                                    ) => {
                                                                      const newMenuItems =
                                                                        [
                                                                          ...data
                                                                            .navigation
                                                                            .menuItems,
                                                                        ];
                                                                      newMenuItems[
                                                                        index
                                                                      ].submenus![
                                                                        submenuIndex
                                                                      ].title =
                                                                        e.target.value;
                                                                      setData(
                                                                        (
                                                                          prev
                                                                        ) => {
                                                                          if (
                                                                            !prev
                                                                          )
                                                                            return prev;
                                                                          return {
                                                                            ...prev,
                                                                            navigation:
                                                                              {
                                                                                ...prev.navigation,
                                                                                menuItems:
                                                                                  newMenuItems,
                                                                              },
                                                                          };
                                                                        }
                                                                      );
                                                                    }}
                                                                    placeholder="Section title"
                                                                    className="h-8 max-w-xs"
                                                                  />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                  <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                      toggleSubmenu(
                                                                        index,
                                                                        submenuIndex
                                                                      )
                                                                    }
                                                                  >
                                                                    {expandedSubmenus.has(
                                                                      `${index}-${submenuIndex}`
                                                                    ) ? (
                                                                      <ChevronUp className="w-4 h-4" />
                                                                    ) : (
                                                                      <ChevronDown className="w-4 h-4" />
                                                                    )}
                                                                  </Button>
                                                                  <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                      removeSubmenu(
                                                                        index,
                                                                        submenuIndex
                                                                      )
                                                                    }
                                                                  >
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                  </Button>
                                                                </div>
                                                              </div>
                                                            </CardHeader>
                                                            {expandedSubmenus.has(
                                                              `${index}-${submenuIndex}`
                                                            ) && (
                                                              <CardContent className="space-y-4 pt-0">
                                                                {/* Submenu Links */}
                                                                <div className="space-y-3">
                                                                  <div className="flex items-center justify-between">
                                                                    <Label className="text-sm font-semibold">
                                                                      Links
                                                                    </Label>
                                                                    <Button
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() =>
                                                                        addSubmenuLink(
                                                                          index,
                                                                          submenuIndex
                                                                        )
                                                                      }
                                                                    >
                                                                      <Plus className="w-3 h-3 mr-1" />
                                                                      Add Link
                                                                    </Button>
                                                                  </div>

                                                                  {submenu.links &&
                                                                  submenu.links
                                                                    .length >
                                                                    0 ? (
                                                                    <DragDropContext
                                                                      onDragEnd={(
                                                                        result
                                                                      ) =>
                                                                        handleLinkDragEnd(
                                                                          result,
                                                                          index,
                                                                          submenuIndex
                                                                        )
                                                                      }
                                                                    >
                                                                      <Droppable
                                                                        droppableId={`links-${index}-${submenuIndex}`}
                                                                      >
                                                                        {(
                                                                          provided
                                                                        ) => (
                                                                          <div
                                                                            {...provided.droppableProps}
                                                                            ref={
                                                                              provided.innerRef
                                                                            }
                                                                            className="space-y-3"
                                                                          >
                                                                            {submenu.links.map(
                                                                              (
                                                                                link,
                                                                                linkIndex
                                                                              ) => (
                                                                                <Draggable
                                                                                  key={`link-${index}-${submenuIndex}-${linkIndex}`}
                                                                                  draggableId={`link-${index}-${submenuIndex}-${linkIndex}`}
                                                                                  index={
                                                                                    linkIndex
                                                                                  }
                                                                                >
                                                                                  {(
                                                                                    provided,
                                                                                    snapshot
                                                                                  ) => (
                                                                                    <Card
                                                                                      ref={
                                                                                        provided.innerRef
                                                                                      }
                                                                                      {...provided.draggableProps}
                                                                                      className={`bg-background transition-shadow ${
                                                                                        snapshot.isDragging
                                                                                          ? "shadow-lg"
                                                                                          : ""
                                                                                      }`}
                                                                                    >
                                                                                      <CardContent className="pt-4 space-y-3">
                                                                                        <div className="flex items-start justify-between gap-2">
                                                                                          <div
                                                                                            {...provided.dragHandleProps}
                                                                                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded mt-6"
                                                                                          >
                                                                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                                                                          </div>
                                                                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                                                                            <div className="space-y-2">
                                                                                              <Label className="text-xs">
                                                                                                Link
                                                                                                Title
                                                                                              </Label>
                                                                                              <Input
                                                                                                value={
                                                                                                  link.text
                                                                                                }
                                                                                                onChange={(
                                                                                                  e
                                                                                                ) => {
                                                                                                  const newMenuItems =
                                                                                                    [
                                                                                                      ...data
                                                                                                        .navigation
                                                                                                        .menuItems,
                                                                                                    ];
                                                                                                  newMenuItems[
                                                                                                    index
                                                                                                  ].submenus![
                                                                                                    submenuIndex
                                                                                                  ].links[
                                                                                                    linkIndex
                                                                                                  ].text =
                                                                                                    e.target.value;
                                                                                                  setData(
                                                                                                    (
                                                                                                      prev
                                                                                                    ) => {
                                                                                                      if (
                                                                                                        !prev
                                                                                                      )
                                                                                                        return prev;
                                                                                                      return {
                                                                                                        ...prev,
                                                                                                        navigation:
                                                                                                          {
                                                                                                            ...prev.navigation,
                                                                                                            menuItems:
                                                                                                              newMenuItems,
                                                                                                          },
                                                                                                      };
                                                                                                    }
                                                                                                  );
                                                                                                }}
                                                                                                placeholder="Link title"
                                                                                              />
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                              <Label className="text-xs">
                                                                                                URL
                                                                                              </Label>
                                                                                              <Input
                                                                                                value={
                                                                                                  link.href
                                                                                                }
                                                                                                onChange={(
                                                                                                  e
                                                                                                ) => {
                                                                                                  const newMenuItems =
                                                                                                    [
                                                                                                      ...data
                                                                                                        .navigation
                                                                                                        .menuItems,
                                                                                                    ];
                                                                                                  newMenuItems[
                                                                                                    index
                                                                                                  ].submenus![
                                                                                                    submenuIndex
                                                                                                  ].links[
                                                                                                    linkIndex
                                                                                                  ].href =
                                                                                                    e.target.value;
                                                                                                  setData(
                                                                                                    (
                                                                                                      prev
                                                                                                    ) => {
                                                                                                      if (
                                                                                                        !prev
                                                                                                      )
                                                                                                        return prev;
                                                                                                      return {
                                                                                                        ...prev,
                                                                                                        navigation:
                                                                                                          {
                                                                                                            ...prev.navigation,
                                                                                                            menuItems:
                                                                                                              newMenuItems,
                                                                                                          },
                                                                                                      };
                                                                                                    }
                                                                                                  );
                                                                                                }}
                                                                                                placeholder="/path"
                                                                                              />
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                              <Label className="text-xs">
                                                                                                Icon
                                                                                                Name
                                                                                              </Label>
                                                                                              <Input
                                                                                                value={
                                                                                                  link.icon ||
                                                                                                  ""
                                                                                                }
                                                                                                onChange={(
                                                                                                  e
                                                                                                ) => {
                                                                                                  const newMenuItems =
                                                                                                    [
                                                                                                      ...data
                                                                                                        .navigation
                                                                                                        .menuItems,
                                                                                                    ];
                                                                                                  newMenuItems[
                                                                                                    index
                                                                                                  ].submenus![
                                                                                                    submenuIndex
                                                                                                  ].links[
                                                                                                    linkIndex
                                                                                                  ].icon =
                                                                                                    e.target.value;
                                                                                                  setData(
                                                                                                    (
                                                                                                      prev
                                                                                                    ) => {
                                                                                                      if (
                                                                                                        !prev
                                                                                                      )
                                                                                                        return prev;
                                                                                                      return {
                                                                                                        ...prev,
                                                                                                        navigation:
                                                                                                          {
                                                                                                            ...prev.navigation,
                                                                                                            menuItems:
                                                                                                              newMenuItems,
                                                                                                          },
                                                                                                      };
                                                                                                    }
                                                                                                  );
                                                                                                }}
                                                                                                placeholder="BookOpen"
                                                                                              />
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                              <Label className="text-xs">
                                                                                                Badge
                                                                                                (Optional)
                                                                                              </Label>
                                                                                              <Input
                                                                                                value={
                                                                                                  link.badge ||
                                                                                                  ""
                                                                                                }
                                                                                                onChange={(
                                                                                                  e
                                                                                                ) => {
                                                                                                  const newMenuItems =
                                                                                                    [
                                                                                                      ...data
                                                                                                        .navigation
                                                                                                        .menuItems,
                                                                                                    ];
                                                                                                  newMenuItems[
                                                                                                    index
                                                                                                  ].submenus![
                                                                                                    submenuIndex
                                                                                                  ].links[
                                                                                                    linkIndex
                                                                                                  ].badge =
                                                                                                    e.target.value;
                                                                                                  setData(
                                                                                                    (
                                                                                                      prev
                                                                                                    ) => {
                                                                                                      if (
                                                                                                        !prev
                                                                                                      )
                                                                                                        return prev;
                                                                                                      return {
                                                                                                        ...prev,
                                                                                                        navigation:
                                                                                                          {
                                                                                                            ...prev.navigation,
                                                                                                            menuItems:
                                                                                                              newMenuItems,
                                                                                                          },
                                                                                                      };
                                                                                                    }
                                                                                                  );
                                                                                                }}
                                                                                                placeholder="New, Hot, etc."
                                                                                              />
                                                                                            </div>
                                                                                          </div>
                                                                                          <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={() =>
                                                                                              removeSubmenuLink(
                                                                                                index,
                                                                                                submenuIndex,
                                                                                                linkIndex
                                                                                              )
                                                                                            }
                                                                                          >
                                                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                                                          </Button>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                          <Label className="text-xs">
                                                                                            Description
                                                                                            (Optional)
                                                                                          </Label>
                                                                                          <Input
                                                                                            value={
                                                                                              link.description ||
                                                                                              ""
                                                                                            }
                                                                                            onChange={(
                                                                                              e
                                                                                            ) => {
                                                                                              const newMenuItems =
                                                                                                [
                                                                                                  ...data
                                                                                                    .navigation
                                                                                                    .menuItems,
                                                                                                ];
                                                                                              newMenuItems[
                                                                                                index
                                                                                              ].submenus![
                                                                                                submenuIndex
                                                                                              ].links[
                                                                                                linkIndex
                                                                                              ].description =
                                                                                                e.target.value;
                                                                                              setData(
                                                                                                (
                                                                                                  prev
                                                                                                ) => {
                                                                                                  if (
                                                                                                    !prev
                                                                                                  )
                                                                                                    return prev;
                                                                                                  return {
                                                                                                    ...prev,
                                                                                                    navigation:
                                                                                                      {
                                                                                                        ...prev.navigation,
                                                                                                        menuItems:
                                                                                                          newMenuItems,
                                                                                                      },
                                                                                                  };
                                                                                                }
                                                                                              );
                                                                                            }}
                                                                                            placeholder="Brief description of this link"
                                                                                          />
                                                                                        </div>
                                                                                      </CardContent>
                                                                                    </Card>
                                                                                  )}
                                                                                </Draggable>
                                                                              )
                                                                            )}
                                                                            {
                                                                              provided.placeholder
                                                                            }
                                                                          </div>
                                                                        )}
                                                                      </Droppable>
                                                                    </DragDropContext>
                                                                  ) : (
                                                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                                                      <p className="text-sm">
                                                                        No links
                                                                        added
                                                                        yet
                                                                      </p>
                                                                      <p className="text-xs mt-1">
                                                                        Click
                                                                        "Add
                                                                        Link" to
                                                                        create
                                                                        your
                                                                        first
                                                                        link
                                                                      </p>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </CardContent>
                                                            )}
                                                          </Card>
                                                        )}
                                                      </Draggable>
                                                    )
                                                  )}
                                                  {provided.placeholder}
                                                </div>
                                              )}
                                            </Droppable>
                                          </DragDropContext>
                                        ) : (
                                          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                            <p className="text-sm font-medium">
                                              No submenu sections yet
                                            </p>
                                            <p className="text-xs mt-1">
                                              Click "Add Section" to create your
                                              first submenu section
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {menuItem.hasDropdown &&
                                      menuItem.featured && (
                                        <div className="border rounded-lg p-4 space-y-4">
                                          <div>
                                            <Label className="text-base font-semibold">
                                              Featured Item
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              Highlight a special course or
                                              offer in this menu dropdown
                                            </p>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ImageUploadField
                                              label="Featured Image"
                                              value={menuItem.featured.image}
                                              onUpload={handleImageUpload}
                                              field={`navigation.menuItems.${index}.featured.image`}
                                            />
                                            <div className="space-y-4">
                                              <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                  value={
                                                    menuItem.featured.title
                                                  }
                                                  onChange={(e) => {
                                                    const newMenuItems = [
                                                      ...data.navigation
                                                        .menuItems,
                                                    ];
                                                    newMenuItems[
                                                      index
                                                    ].featured!.title =
                                                      e.target.value;
                                                    setData((prev) => {
                                                      if (!prev) return prev;
                                                      return {
                                                        ...prev,
                                                        navigation: {
                                                          ...prev.navigation,
                                                          menuItems:
                                                            newMenuItems,
                                                        },
                                                      };
                                                    });
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                  value={
                                                    menuItem.featured
                                                      .description
                                                  }
                                                  onChange={(e) => {
                                                    const newMenuItems = [
                                                      ...data.navigation
                                                        .menuItems,
                                                    ];
                                                    newMenuItems[
                                                      index
                                                    ].featured!.description =
                                                      e.target.value;
                                                    setData((prev) => {
                                                      if (!prev) return prev;
                                                      return {
                                                        ...prev,
                                                        navigation: {
                                                          ...prev.navigation,
                                                          menuItems:
                                                            newMenuItems,
                                                        },
                                                      };
                                                    });
                                                  }}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Link URL</Label>
                                                <Input
                                                  value={menuItem.featured.href}
                                                  onChange={(e) => {
                                                    const newMenuItems = [
                                                      ...data.navigation
                                                        .menuItems,
                                                    ];
                                                    newMenuItems[
                                                      index
                                                    ].featured!.href =
                                                      e.target.value;
                                                    setData((prev) => {
                                                      if (!prev) return prev;
                                                      return {
                                                        ...prev,
                                                        navigation: {
                                                          ...prev.navigation,
                                                          menuItems:
                                                            newMenuItems,
                                                        },
                                                      };
                                                    });
                                                  }}
                                                  placeholder="/course/featured-course"
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Badge (Optional)</Label>
                                                <Input
                                                  value={
                                                    menuItem.featured.badge ||
                                                    ""
                                                  }
                                                  onChange={(e) => {
                                                    const newMenuItems = [
                                                      ...data.navigation
                                                        .menuItems,
                                                    ];
                                                    newMenuItems[
                                                      index
                                                    ].featured!.badge =
                                                      e.target.value;
                                                    setData((prev) => {
                                                      if (!prev) return prev;
                                                      return {
                                                        ...prev,
                                                        navigation: {
                                                          ...prev.navigation,
                                                          menuItems:
                                                            newMenuItems,
                                                        },
                                                      };
                                                    });
                                                  }}
                                                  placeholder="Featured, New, Hot"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </CardContent>
                                )}
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Menu Tab */}
          <TabsContent value="user">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6" />
                  User Menu Settings
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Configure user dropdown menu structure and links
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {/* Info Banner */}
                <div className="rounded-lg border bg-muted/50 p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Dynamic User Data</p>
                      <p className="text-sm text-muted-foreground">
                        User profile information (name, email, avatar) is
                        automatically populated from the authentication system.
                        Here you can configure the menu structure and available
                        links.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Display Settings */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Profile Display Settings
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure default display settings for user profile
                      section
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-link">Profile Page Link</Label>
                      <Input
                        id="profile-link"
                        value={data.userMenu.profile.profileLink}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              userMenu: {
                                ...prev.userMenu,
                                profile: {
                                  ...prev.userMenu.profile,
                                  profileLink: e.target.value,
                                },
                              },
                            };
                          })
                        }
                        placeholder="/profile"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar-fallback">
                        Avatar Fallback Text
                      </Label>
                      <Input
                        id="avatar-fallback"
                        value={data.userMenu.profile.avatarFallback}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              userMenu: {
                                ...prev.userMenu,
                                profile: {
                                  ...prev.userMenu.profile,
                                  avatarFallback: e.target.value,
                                },
                              },
                            };
                          })
                        }
                        placeholder="U"
                        maxLength={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Shown when user has no avatar (1-2 characters)
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Menu Items Structure */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Menu Structure
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      The user menu displays links organized in sections.
                      Configure the structure and labels here.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Main Menu</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {data.userMenu.menuItems.length} items
                        <p className="text-xs mt-1">Dashboard, Courses, etc.</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Support Links</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {data.userMenu.supportLinks.length} items
                        <p className="text-xs mt-1">Help, Contact, etc.</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {data.userMenu.settingsLinks.length} items
                        <p className="text-xs mt-1">Settings, Logout, etc.</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-lg border bg-blue-50/50 p-4 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900">
                          Menu Configuration
                        </p>
                        <p className="text-sm text-blue-800">
                          Menu items, support links, and settings are configured
                          in the backend API. Use the{" "}
                          <strong>User Management</strong> section to manage
                          menu structure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CTA Tab */}
          <TabsContent value="cta">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-6 h-6" />
                  Call to Action
                </CardTitle>
                <CardDescription className="text-pink-100">
                  Configure the main call-to-action button
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cta-text">Button Text</Label>
                    <Input
                      id="cta-text"
                      value={data.cta.text}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            cta: { ...prev.cta, text: e.target.value },
                          };
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-href">Link URL</Label>
                    <Input
                      id="cta-href"
                      value={data.cta.href}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            cta: { ...prev.cta, href: e.target.value },
                          };
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-variant">Variant</Label>
                    <Input
                      id="cta-variant"
                      value={data.cta.variant}
                      onChange={(e) =>
                        setData((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            cta: { ...prev.cta, variant: e.target.value },
                          };
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-6 h-6" />
                  SEO Optimization
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Configure search engine optimization settings for better
                  visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-6">
                {/* Info Banner */}
                <div className="rounded-lg border bg-blue-50/50 p-4 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">
                        Search Engine Optimization
                      </p>
                      <p className="text-sm text-blue-800">
                        These settings help search engines understand your site
                        better and improve your visibility in search results.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic SEO */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Basic SEO</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure basic meta information for your website
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-title">Page Title</Label>
                      <Input
                        id="seo-title"
                        value={data.seo?.title || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: { ...prev.seo!, title: e.target.value },
                            };
                          })
                        }
                        placeholder="Personal Wings - Learn. Grow. Succeed."
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended length: 50-60 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-description">Meta Description</Label>
                      <Textarea
                        id="seo-description"
                        value={data.seo?.description || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                description: e.target.value,
                              },
                            };
                          })
                        }
                        placeholder="Empower your learning journey with Personal Wings"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended length: 150-160 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-keywords">
                        Keywords (comma-separated)
                      </Label>
                      <Input
                        id="seo-keywords"
                        value={data.seo?.keywords?.join(", ") || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                keywords: e.target.value
                                  .split(",")
                                  .map((k) => k.trim())
                                  .filter((k) => k),
                              },
                            };
                          })
                        }
                        placeholder="education, online courses, learning platform"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add relevant keywords separated by commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-canonical">Canonical URL</Label>
                      <Input
                        id="seo-canonical"
                        value={data.seo?.canonicalUrl || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                canonicalUrl: e.target.value,
                              },
                            };
                          })
                        }
                        placeholder="https://personalwings.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        The preferred URL for this page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-locale">Locale</Label>
                      <Input
                        id="seo-locale"
                        value={data.seo?.locale || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: { ...prev.seo!, locale: e.target.value },
                            };
                          })
                        }
                        placeholder="en_US"
                      />
                      <p className="text-xs text-muted-foreground">
                        Language and region code (e.g., en_US, es_ES)
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Open Graph */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Open Graph (Social Media)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure how your site appears when shared on social
                      media
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-og-url">OG URL</Label>
                      <Input
                        id="seo-og-url"
                        value={data.seo?.ogUrl || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: { ...prev.seo!, ogUrl: e.target.value },
                            };
                          })
                        }
                        placeholder="https://personalwings.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-og-type">OG Type</Label>
                      <Input
                        id="seo-og-type"
                        value={data.seo?.ogType || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: { ...prev.seo!, ogType: e.target.value },
                            };
                          })
                        }
                        placeholder="website"
                      />
                      <p className="text-xs text-muted-foreground">
                        Type: website, article, product, etc.
                      </p>
                    </div>
                  </div>

                  <ImageUploadField
                    label="OG Image"
                    value={data.seo?.ogImage || ""}
                    onUpload={handleImageUpload}
                    field="seo.ogImage"
                    className="md:col-span-2"
                  />
                </div>

                <Separator />

                {/* Twitter Card */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Twitter Card
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure how your site appears on Twitter/X
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo-twitter-card">
                        Twitter Card Type
                      </Label>
                      <Input
                        id="seo-twitter-card"
                        value={data.seo?.twitterCard || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                twitterCard: e.target.value,
                              },
                            };
                          })
                        }
                        placeholder="summary_large_image"
                      />
                      <p className="text-xs text-muted-foreground">
                        Types: summary, summary_large_image, app, player
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo-twitter-site">
                        Twitter Site Handle
                      </Label>
                      <Input
                        id="seo-twitter-site"
                        value={data.seo?.twitterSite || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                twitterSite: e.target.value,
                              },
                            };
                          })
                        }
                        placeholder="@personalwings"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Twitter/X username (with @)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Search Result Preview
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      How your page might appear in search results
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-blue-600 text-lg font-medium">
                      {data.seo?.title || "Page Title"}
                    </div>
                    <div className="text-sm text-green-700">
                      {data.seo?.canonicalUrl || "https://example.com"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.seo?.description ||
                        "Page description will appear here..."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
