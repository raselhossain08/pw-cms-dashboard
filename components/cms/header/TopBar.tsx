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
import {
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Globe,
  DollarSign,
  Megaphone,
  Share2,
  Image,
  Languages,
  Download,
  Copy,
  Eye,
  Loader2,
} from "lucide-react";
import type { TopBar, Language, Currency, SocialLink } from "@/types/cms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { topBarApi } from "@/services/cms.service";
import { useToast } from "@/context/ToastContext";
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

interface TopBarEditorProps {
  topBarId?: string;
  initialData?: Partial<TopBar>;
  onSave?: (data: TopBar) => void;
}

export function TopBarEditor({
  topBarId,
  initialData,
  onSave,
}: TopBarEditorProps) {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { data: activeTopBar, isLoading } = useQuery({
    queryKey: ["activeTopBar"],
    queryFn: topBarApi.getActive,
  });

  const effectiveTopBar = useMemo<TopBar | null>(() => {
    if (
      initialData &&
      initialData.languages &&
      initialData.currencies &&
      initialData.socialLinks &&
      initialData.news
    ) {
      return initialData as TopBar;
    }
    return activeTopBar ?? null;
  }, [initialData, activeTopBar]);

  const [data, setData] = useState<TopBar | null>(effectiveTopBar);
  const [activeTab, setActiveTab] = useState("news");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (effectiveTopBar && !data) {
      setData(effectiveTopBar);
    }
  }, [effectiveTopBar, data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!data) return;
      const id = topBarId || data._id;
      if (!id) {
        const created = await topBarApi.create(data);
        queryClient.invalidateQueries({ queryKey: ["top-bars"] });
        queryClient.invalidateQueries({ queryKey: ["activeTopBar"] });
        push({ message: "Top bar created", type: "success" });
        setData(created);
      } else {
        const updated = await topBarApi.update(id, data);
        queryClient.invalidateQueries({ queryKey: ["top-bars"] });
        queryClient.invalidateQueries({ queryKey: ["activeTopBar"] });
        push({ message: "Top bar updated", type: "success" });
        setData(updated);
      }
      if (onSave) onSave(data as TopBar);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (field: string, file: File) => {
    if (!data || !(data._id || topBarId)) return;
    const id = topBarId || (data._id as string);
    if (field === "news.icon") {
      const updated = await topBarApi.uploadNewsIcon(id, file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [field]: progress }));
      });
      setData(updated);
      setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
      return;
    }
    if (field.startsWith("languages") && field.endsWith("flag")) {
      const parts = field.split(".");
      const index = parseInt(parts[1]);
      const code = data.languages[index]?.code;
      if (!code) {
        push({
          message: "Set language code before uploading flag",
          type: "error",
        });
        return;
      }
      const updated = await topBarApi.uploadLanguageFlag(
        id,
        code,
        file,
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, [field]: progress }));
        }
      );
      setData(updated);
      setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
      return;
    }
  };

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
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(field, file);
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <Label>{label}</Label>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
          {value ? (
            <div className="space-y-2 pointer-events-none">
              <img
                src={value}
                alt="Preview"
                className="mx-auto h-12 w-12 object-cover rounded"
              />
              <p className="text-xs text-gray-600 truncate">
                Current: {value.split("/").pop()}
              </p>
            </div>
          ) : (
            <div className="text-center py-4 pointer-events-none">
              <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
              <p className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</p>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        {uploadProgress[field] !== undefined && uploadProgress[field] < 100 && (
          <div className="space-y-1">
            <Progress value={uploadProgress[field]} className="w-full" />
            <p className="text-xs text-gray-500 text-center">
              Uploading... {uploadProgress[field]}%
            </p>
          </div>
        )}
      </div>
    );
  };

  const addLanguage = () => {
    const newLanguage: Language = {
      code: "",
      name: "",
      flag: "",
    };
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, languages: [...prev.languages, newLanguage] };
    });
  };

  const updateLanguage = (
    index: number,
    field: keyof Language,
    value: string
  ) => {
    const newLanguages = [...(data?.languages ?? [])];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setData((prev) => (prev ? { ...prev, languages: newLanguages } : prev));
  };

  const removeLanguage = (index: number) => {
    const newLanguages = (data?.languages ?? []).filter((_, i) => i !== index);
    setData((prev) => (prev ? { ...prev, languages: newLanguages } : prev));
  };

  const addCurrency = () => {
    const newCurrency: Currency = {
      code: "",
      name: "",
    };
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, currencies: [...prev.currencies, newCurrency] };
    });
  };

  const updateCurrency = (
    index: number,
    field: keyof Currency,
    value: string
  ) => {
    const newCurrencies = [...(data?.currencies ?? [])];
    newCurrencies[index] = { ...newCurrencies[index], [field]: value };
    setData((prev) => (prev ? { ...prev, currencies: newCurrencies } : prev));
  };

  const removeCurrency = (index: number) => {
    const newCurrencies = (data?.currencies ?? []).filter(
      (_, i) => i !== index
    );
    setData((prev) => (prev ? { ...prev, currencies: newCurrencies } : prev));
  };

  const addSocialLink = () => {
    const newSocialLink: SocialLink = {
      platform: "",
      href: "",
    };
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, socialLinks: [...prev.socialLinks, newSocialLink] };
    });
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    const newSocialLinks = [...(data?.socialLinks ?? [])];
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
    setData((prev) => (prev ? { ...prev, socialLinks: newSocialLinks } : prev));
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = (data?.socialLinks ?? []).filter(
      (_, i) => i !== index
    );
    setData((prev) => (prev ? { ...prev, socialLinks: newSocialLinks } : prev));
  };

  const socialPlatforms = [
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "youtube",
    "tiktok",
    "pinterest",
    "whatsapp",
    "telegram",
    "discord",
  ];

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading top bar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-sm">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Top Bar Editor</h1>
            <p className="text-gray-600 mt-2">
              Manage your website's top bar content and settings
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
          <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-5 gap-1 sm:gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl overflow-x-auto">
            <TabsTrigger
              value="news"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">News Bar</span>
              <span className="sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger
              value="languages"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">Languages</span>
              <span className="sm:hidden">Lang</span>
            </TabsTrigger>
            <TabsTrigger
              value="currencies"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Currencies</span>
              <span className="sm:hidden">Money</span>
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Social Links</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gray-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
              <span className="sm:hidden">Preview</span>
            </TabsTrigger>
          </TabsList>

          {/* News Bar Tab */}
          <TabsContent value="news">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-6 h-6" />
                  News Bar Settings
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Configure the promotional news bar at the top of your website
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="news-badge">Badge Text</Label>
                    <Input
                      id="news-badge"
                      value={data.news.badge}
                      onChange={(e) =>
                        setData((prev) =>
                          prev
                            ? {
                                ...prev,
                                news: { ...prev.news, badge: e.target.value },
                              }
                            : prev
                        )
                      }
                      placeholder="e.g., Hot, New, Sale"
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="news-text">News Text</Label>
                    <Input
                      id="news-text"
                      value={data.news.text}
                      onChange={(e) =>
                        setData((prev) =>
                          prev
                            ? {
                                ...prev,
                                news: { ...prev.news, text: e.target.value },
                              }
                            : prev
                        )
                      }
                      placeholder="Enter your promotional message"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="News Icon"
                  value={data.news.icon}
                  onUpload={handleImageUpload}
                  field="news.icon"
                />

                {/* Preview */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                  <Label>Preview</Label>
                  <div className="mt-3 flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    {data.news.badge && (
                      <Badge variant="destructive" className="animate-pulse">
                        {data.news.badge}
                      </Badge>
                    )}
                    {data.news.icon && (
                      <img src={data.news.icon} alt="" className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {data.news.text}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-6 h-6" />
                  Language Settings
                </CardTitle>
                <CardDescription className="text-green-100">
                  Manage available languages and their flags
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <Label>Available Languages ({data.languages.length})</Label>
                  <Button onClick={addLanguage} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.languages.map((language, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Flag Upload */}
                        <div className="md:col-span-3">
                          <ImageUploadField
                            label="Flag"
                            value={language.flag}
                            onUpload={handleImageUpload}
                            field={`languages.${index}.flag`}
                          />
                        </div>

                        {/* Language Details */}
                        <div className="md:col-span-8 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Language Code</Label>
                              <Input
                                value={language.code}
                                onChange={(e) =>
                                  updateLanguage(index, "code", e.target.value)
                                }
                                placeholder="e.g., en, fr, de"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Language Name</Label>
                              <Input
                                value={language.name}
                                onChange={(e) =>
                                  updateLanguage(index, "name", e.target.value)
                                }
                                placeholder="e.g., English, Français"
                              />
                            </div>
                          </div>

                          {/* Preview */}
                          {language.flag && (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={language.flag}
                                alt=""
                                className="w-6 h-6 rounded"
                              />
                              <span className="text-sm font-medium">
                                {language.name} ({language.code})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLanguage(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currencies Tab */}
          <TabsContent value="currencies">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Currency Settings
                </CardTitle>
                <CardDescription className="text-yellow-100">
                  Manage available currencies for your store
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <Label>Available Currencies ({data.currencies.length})</Label>
                  <Button onClick={addCurrency} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Currency
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.currencies.map((currency, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-5">
                          <div className="space-y-2">
                            <Label>Currency Code</Label>
                            <Input
                              value={currency.code}
                              onChange={(e) =>
                                updateCurrency(index, "code", e.target.value)
                              }
                              placeholder="e.g., USD, EUR, GBP"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-5">
                          <div className="space-y-2">
                            <Label>Currency Name</Label>
                            <Input
                              value={currency.name}
                              onChange={(e) =>
                                updateCurrency(index, "name", e.target.value)
                              }
                              placeholder="e.g., US Dollar, Euro"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCurrency(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-6 h-6" />
                  Social Media Links
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Manage your social media profiles and links
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <Label>Social Links ({data.socialLinks.length})</Label>
                  <Button onClick={addSocialLink} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>

                <div className="space-y-4">
                  {data.socialLinks.map((link, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4">
                          <div className="space-y-2">
                            <Label>Platform</Label>
                            <select
                              value={link.platform}
                              onChange={(e) =>
                                updateSocialLink(
                                  index,
                                  "platform",
                                  e.target.value
                                )
                              }
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select Platform</option>
                              {socialPlatforms.map((platform) => (
                                <option key={platform} value={platform}>
                                  {platform.charAt(0).toUpperCase() +
                                    platform.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="md:col-span-6">
                          <div className="space-y-2">
                            <Label>Profile URL</Label>
                            <Input
                              value={link.href}
                              onChange={(e) =>
                                updateSocialLink(index, "href", e.target.value)
                              }
                              placeholder="https://platform.com/yourprofile"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocialLink(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card className="border-0 shadow-lg pt-0">
              <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Live Preview
                </CardTitle>
                <CardDescription className="text-gray-100">
                  See how your top bar will appear to visitors
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Top Bar Preview */}
                  <div className="bg-gray-800 text-white p-2">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                      {/* Left Side - News */}
                      <div className="flex items-center space-x-3">
                        {data.news.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {data.news.badge}
                          </Badge>
                        )}
                        {data.news.icon && (
                          <img
                            src={data.news.icon}
                            alt=""
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-sm">{data.news.text}</span>
                      </div>

                      {/* Right Side - Controls */}
                      <div className="flex items-center space-x-4 text-sm">
                        {/* Languages */}
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <select className="bg-transparent border-none text-white focus:outline-none">
                            {data.languages.map((lang, i) => (
                              <option key={i} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Currencies */}
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <select className="bg-transparent border-none text-white focus:outline-none">
                            {data.currencies.map((currency, i) => (
                              <option key={i} value={currency.code}>
                                {currency.code}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-2">
                          {data.socialLinks.slice(0, 3).map((link, i) => (
                            <a
                              key={i}
                              href={link.href}
                              className="hover:text-blue-300 transition-colors"
                            >
                              {link.platform}
                            </a>
                          ))}
                          {data.socialLinks.length > 3 && (
                            <span className="text-xs">
                              +{data.socialLinks.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="p-8 bg-white">
                    <div className="text-center text-gray-500">
                      <p>Website content preview area</p>
                      <p className="text-sm mt-2">
                        The top bar above shows how your configuration will
                        appear
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Header Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4 mt-6 p-4 bg-white rounded-lg border">
          <Badge variant={data?.isActive ? "default" : "secondary"}>
            {data?.isActive ? "Active" : "Inactive"}
          </Badge>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!data || isSaving}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            {data?._id && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isExporting || isSaving}
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={async () => {
                        if (!data._id) return;
                        setIsExporting(true);
                        try {
                          await topBarApi.export(data._id, "json");
                          push({
                            message: "Top bar exported as JSON",
                            type: "success",
                          });
                        } catch (err) {
                          push({ message: "Failed to export", type: "error" });
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                    >
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (!data._id) return;
                        setIsExporting(true);
                        try {
                          await topBarApi.export(data._id, "pdf");
                          push({
                            message: "Top bar exported as PDF",
                            type: "success",
                          });
                        } catch (err) {
                          push({ message: "Failed to export", type: "error" });
                        } finally {
                          setIsExporting(false);
                        }
                      }}
                    >
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!data._id) return;
                    setIsSaving(true);
                    try {
                      const duplicated = await topBarApi.duplicate(data._id);
                      queryClient.invalidateQueries({ queryKey: ["top-bars"] });
                      queryClient.invalidateQueries({
                        queryKey: ["activeTopBar"],
                      });
                      push({
                        message: "Top bar duplicated successfully",
                        type: "success",
                      });
                      setData(duplicated);
                    } catch (err) {
                      push({ message: "Failed to duplicate", type: "error" });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!data._id) return;
                    setIsSaving(true);
                    try {
                      const toggled = await topBarApi.toggleActive(data._id);
                      queryClient.invalidateQueries({ queryKey: ["top-bars"] });
                      queryClient.invalidateQueries({
                        queryKey: ["activeTopBar"],
                      });
                      push({
                        message: `Top bar ${
                          toggled.isActive ? "activated" : "deactivated"
                        }`,
                        type: "success",
                      });
                      setData(toggled);
                    } catch (err) {
                      push({
                        message: "Failed to toggle status",
                        type: "error",
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isSaving ? "animate-spin" : ""}`}
                  />
                  Toggle Active
                </Button>
              </>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
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

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Top Bar Preview</DialogTitle>
              <DialogDescription>
                Preview how your top bar will appear to users
              </DialogDescription>
            </DialogHeader>
            {data && (
              <div className="space-y-6 mt-4">
                {/* News Preview */}
                {data.news && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">News Announcement</h3>
                    <div className="p-4 border rounded-lg">
                      {data.news.icon && (
                        <img
                          src={data.news.icon}
                          alt="News Icon"
                          className="w-8 h-8 mb-2"
                        />
                      )}
                      <p className="font-medium">{data.news.text}</p>
                      {data.news.link && (
                        <p className="text-sm text-muted-foreground">
                          {data.news.link}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Languages Preview */}
                {data.languages && data.languages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline">
                          {lang.flag && (
                            <img
                              src={lang.flag}
                              alt={lang.name}
                              className="w-4 h-4 mr-1"
                            />
                          )}
                          {lang.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Currencies Preview */}
                {data.currencies && data.currencies.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Currencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.currencies.map((curr, idx) => (
                        <Badge key={idx} variant="outline">
                          {curr.symbol} {curr.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links Preview */}
                {data.socialLinks && data.socialLinks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Social Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.socialLinks.map((social, idx) => (
                        <Badge key={idx} variant="outline">
                          {social.platform}: {social.href}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Status</h3>
                  <Badge variant={data.isActive ? "default" : "secondary"}>
                    {data.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
