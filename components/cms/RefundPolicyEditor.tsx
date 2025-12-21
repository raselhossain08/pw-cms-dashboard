"use client";

import React, { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  Edit,
  X,
  ChevronUp,
  ChevronDown,
  Download,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRefundPolicy } from "@/hooks/useRefundPolicy";
import type {
  RefundPolicy,
  HeaderSection,
  PolicySection,
  SubSection,
  ContactInfo,
  SeoMeta,
} from "@/lib/services/refund-policy.service";
import { useToast } from "@/context/ToastContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RefundPolicyEditor() {
  const { push } = useToast();
  const {
    refundPolicy,
    loading,
    saving,
    uploadProgress,
    updateRefundPolicy,
    updateRefundPolicyWithUpload,
    toggleActiveStatus,
    duplicateRefundPolicy,
    exportRefundPolicy,
    refreshRefundPolicy,
  } = useRefundPolicy();
  const [activeTab, setActiveTab] = useState("header");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState<Partial<RefundPolicy>>({
    headerSection: {
      title: "",
      subtitle: "",
      image: "",
      imageAlt: "",
    },
    lastUpdated: "",
    sections: [],
    contactInfo: {
      refundDepartment: "",
      generalSupport: "",
      phone: "",
      businessHours: "",
      address: "",
    },
    seoMeta: {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
    isActive: true,
  });

  const [editingSection, setEditingSection] = useState<PolicySection | null>(
    null
  );
  const [sectionForm, setSectionForm] = useState<PolicySection>({
    id: "",
    title: "",
    content: [],
    subsections: [],
    isActive: true,
    order: 0,
  });

  const [contentInput, setContentInput] = useState("");
  const [subsectionForm, setSubsectionForm] = useState<SubSection>({
    title: "",
    content: [],
  });
  const [subsectionContentInput, setSubsectionContentInput] = useState("");

  useEffect(() => {
    if (refundPolicy) {
      setFormData({
        headerSection: refundPolicy.headerSection,
        lastUpdated: refundPolicy.lastUpdated,
        sections: refundPolicy.sections,
        contactInfo: refundPolicy.contactInfo,
        seoMeta: refundPolicy.seoMeta,
        isActive: refundPolicy.isActive,
      });
      if (refundPolicy.headerSection?.image) {
        setImagePreview(refundPolicy.headerSection.image);
      }
    }
  }, [refundPolicy]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!refundPolicy?._id) {
      push({ message: "No refund policy data found", type: "error" });
      return;
    }

    if (imageFile) {
      const formDataObj = new FormData();
      formDataObj.append("image", imageFile);
      formDataObj.append(
        "headerSection",
        JSON.stringify(formData.headerSection)
      );
      formDataObj.append("lastUpdated", formData.lastUpdated || "");
      formDataObj.append("sections", JSON.stringify(formData.sections));
      formDataObj.append("contactInfo", JSON.stringify(formData.contactInfo));
      formDataObj.append("seoMeta", JSON.stringify(formData.seoMeta));
      formDataObj.append("isActive", String(formData.isActive));

      await updateRefundPolicyWithUpload(refundPolicy._id, formDataObj);
      setImageFile(null);
    } else {
      await updateRefundPolicy(refundPolicy._id, formData);
    }
  };

  const handleRefresh = () => {
    refreshRefundPolicy();
    setImageFile(null);
  };

  const handleToggleActive = async () => {
    if (!refundPolicy?._id) return;
    await toggleActiveStatus(refundPolicy._id);
  };

  const handleDuplicate = async () => {
    if (!refundPolicy?._id) return;
    await duplicateRefundPolicy(refundPolicy._id);
    await refreshRefundPolicy();
  };

  const handleExport = async (format: "json" | "pdf") => {
    if (!refundPolicy?._id) return;
    setIsExporting(true);
    try {
      await exportRefundPolicy(format, refundPolicy._id);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddContentParagraph = () => {
    if (contentInput.trim()) {
      setSectionForm({
        ...sectionForm,
        content: [...sectionForm.content, contentInput.trim()],
      });
      setContentInput("");
    }
  };

  const handleRemoveContentParagraph = (index: number) => {
    const updatedContent = sectionForm.content.filter((_, i) => i !== index);
    setSectionForm({ ...sectionForm, content: updatedContent });
  };

  const handleAddSubsectionContent = () => {
    if (subsectionContentInput.trim()) {
      setSubsectionForm({
        ...subsectionForm,
        content: [...subsectionForm.content, subsectionContentInput.trim()],
      });
      setSubsectionContentInput("");
    }
  };

  const handleRemoveSubsectionContent = (index: number) => {
    const updatedContent = subsectionForm.content.filter((_, i) => i !== index);
    setSubsectionForm({ ...subsectionForm, content: updatedContent });
  };

  const handleAddSubsection = () => {
    if (!subsectionForm.title || subsectionForm.content.length === 0) {
      push({
        message: "Subsection title and at least one content item required",
        type: "error",
      });
      return;
    }

    setSectionForm({
      ...sectionForm,
      subsections: [...(sectionForm.subsections || []), subsectionForm],
    });
    setSubsectionForm({ title: "", content: [] });
  };

  const handleRemoveSubsection = (index: number) => {
    const updatedSubsections = (sectionForm.subsections || []).filter(
      (_, i) => i !== index
    );
    setSectionForm({ ...sectionForm, subsections: updatedSubsections });
  };

  const handleSaveSection = () => {
    if (
      !sectionForm.id ||
      !sectionForm.title ||
      sectionForm.content.length === 0
    ) {
      push({
        message:
          "Section ID, title, and at least one content paragraph required",
        type: "error",
      });
      return;
    }

    const updatedSections = [...(formData.sections || [])];
    if (editingSection) {
      const index = updatedSections.findIndex(
        (s) => s.id === editingSection.id
      );
      if (index !== -1) {
        updatedSections[index] = sectionForm;
      }
    } else {
      updatedSections.push(sectionForm);
    }

    setFormData({ ...formData, sections: updatedSections });
    setSectionForm({
      id: "",
      title: "",
      content: [],
      subsections: [],
      isActive: true,
      order: 0,
    });
    setEditingSection(null);

    push({
      message: editingSection ? "Section updated" : "Section added",
      type: "success",
    });
  };

  const handleEditSection = (section: PolicySection) => {
    setEditingSection(section);
    setSectionForm(section);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = (formData.sections || []).filter(
      (s) => s.id !== sectionId
    );
    setFormData({ ...formData, sections: updatedSections });
    push({ message: "Section deleted", type: "success" });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const sections = [...(formData.sections || [])];
    [sections[index - 1], sections[index]] = [
      sections[index],
      sections[index - 1],
    ];
    sections.forEach((s, i) => (s.order = i + 1));
    setFormData({ ...formData, sections });
  };

  const moveSectionDown = (index: number) => {
    const sections = [...(formData.sections || [])];
    if (index === sections.length - 1) return;
    [sections[index], sections[index + 1]] = [
      sections[index + 1],
      sections[index],
    ];
    sections.forEach((s, i) => (s.order = i + 1));
    setFormData({ ...formData, sections });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Refund Policy Management
          </h2>
          <p className="text-muted-foreground">
            Manage refund policy content, sections, contact info, and SEO
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={saving || loading}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isExporting || saving || loading}
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
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={saving || loading || !refundPolicy?._id}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Active Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Page Status</CardTitle>
              <CardDescription>
                Control visibility of the Refund Policy page
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={handleToggleActive}
                disabled={saving || loading || !refundPolicy?._id}
              />
              <Label>{formData.isActive ? "Active" : "Inactive"}</Label>
              {formData.isActive ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Section</CardTitle>
              <CardDescription>
                Configure the header content for your refund policy page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.headerSection?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="Refund Policy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.headerSection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        subtitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Our commitment to your satisfaction..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastUpdated">Last Updated</Label>
                <Input
                  id="lastUpdated"
                  value={formData.lastUpdated || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lastUpdated: e.target.value })
                  }
                  placeholder="November 17, 2025"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Header Image (Optional)</Label>
                {imagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Header preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                    type="button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {imageFile && (
                    <Badge variant="secondary">{imageFile.name}</Badge>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageAlt">Image Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={formData.headerSection?.imageAlt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        imageAlt: e.target.value,
                      },
                    })
                  }
                  placeholder="Descriptive text for the image"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSection ? "Edit Section" : "Add Section"}
              </CardTitle>
              <CardDescription>
                {editingSection
                  ? "Update section information"
                  : "Create a new policy section"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionId">Section ID</Label>
                  <Input
                    id="sectionId"
                    value={sectionForm.id}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, id: e.target.value })
                    }
                    placeholder="introduction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sectionOrder">Order</Label>
                  <Input
                    id="sectionOrder"
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionTitle">Title</Label>
                <Input
                  id="sectionTitle"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  placeholder="1. Introduction"
                />
              </div>

              {/* Content Paragraphs */}
              <div className="space-y-2">
                <Label>Content Paragraphs</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder="Add a content paragraph..."
                    rows={3}
                  />
                  <Button type="button" onClick={handleAddContentParagraph}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {sectionForm.content.map((paragraph, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded border"
                    >
                      <p className="flex-1 text-sm">{paragraph}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveContentParagraph(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subsections */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Subsections</h4>

                <div className="space-y-2">
                  <Label>Subsection Title</Label>
                  <Input
                    value={subsectionForm.title}
                    onChange={(e) =>
                      setSubsectionForm({
                        ...subsectionForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Step 1: Contact Support"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subsection Content</Label>
                  <div className="flex gap-2">
                    <Input
                      value={subsectionContentInput}
                      onChange={(e) =>
                        setSubsectionContentInput(e.target.value)
                      }
                      placeholder="Add subsection content item..."
                    />
                    <Button type="button" onClick={handleAddSubsectionContent}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 mt-2">
                    {subsectionForm.content.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="flex-1 text-sm">{item}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSubsectionContent(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="button" onClick={handleAddSubsection}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subsection
                </Button>

                <div className="space-y-2">
                  {(sectionForm.subsections || []).map((subsection, index) => (
                    <div key={index} className="p-3 border rounded bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{subsection.title}</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {subsection.content.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSubsection(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={sectionForm.isActive}
                  onCheckedChange={(checked) =>
                    setSectionForm({ ...sectionForm, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSection}>
                  {editingSection ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Section
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </>
                  )}
                </Button>
                {editingSection && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSection(null);
                      setSectionForm({
                        id: "",
                        title: "",
                        content: [],
                        subsections: [],
                        isActive: true,
                        order: 0,
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sections List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Policy Sections ({formData.sections?.length || 0})
              </CardTitle>
              <CardDescription>Manage your policy sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.sections
                  ?.sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      className="p-4 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{section.title}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {section.content[0]?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{section.order}</Badge>
                            <Badge variant="secondary">
                              {section.subsections?.length || 0} subsections
                            </Badge>
                            {!section.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveSectionUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveSectionDown(index)}
                            disabled={
                              index === (formData.sections?.length || 0) - 1
                            }
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSection(section)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {(!formData.sections || formData.sections.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No sections added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update contact details for refund requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refundDepartment">
                  Refund Department Email
                </Label>
                <Input
                  id="refundDepartment"
                  value={formData.contactInfo?.refundDepartment || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo!,
                        refundDepartment: e.target.value,
                      },
                    })
                  }
                  placeholder="refunds@personalwings.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="generalSupport">General Support Email</Label>
                <Input
                  id="generalSupport"
                  value={formData.contactInfo?.generalSupport || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo!,
                        generalSupport: e.target.value,
                      },
                    })
                  }
                  placeholder="support@personalwings.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.contactInfo?.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo!,
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder="+444 555 666 777"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  value={formData.contactInfo?.businessHours || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo!,
                        businessHours: e.target.value,
                      },
                    })
                  }
                  placeholder="Monday - Friday, 9:00 AM - 6:00 PM (EST)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Textarea
                  id="address"
                  value={formData.contactInfo?.address || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo!,
                        address: e.target.value,
                      },
                    })
                  }
                  placeholder="123 Education Street, Learning City, ED 12345"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your refund policy page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Page Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoMeta?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="Refund Policy - Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoMeta?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        description: e.target.value,
                      },
                    })
                  }
                  placeholder="Learn about Personal Wings refund policy..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoMeta?.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k),
                      },
                    })
                  }
                  placeholder="refund policy, money-back guarantee, course refunds"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  value={formData.seoMeta?.ogTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        ogTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Refund Policy - Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.seoMeta?.ogDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        ogDescription: e.target.value,
                      },
                    })
                  }
                  placeholder="Our commitment to your satisfaction..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.seoMeta?.ogImage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        ogImage: e.target.value,
                      },
                    })
                  }
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.seoMeta?.canonicalUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoMeta: {
                        ...formData.seoMeta!,
                        canonicalUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://personalwings.com/refund-policy"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Progress Indicator */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading image...</span>
                  <span className="text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Refund Policy Preview</DialogTitle>
            <DialogDescription>
              Preview how your Refund Policy page will appear to users
            </DialogDescription>
          </DialogHeader>
          {refundPolicy ? (
            <div className="space-y-6 mt-4">
              {/* Header Section */}
              {refundPolicy.headerSection && (
                <div className="space-y-4">
                  {refundPolicy.headerSection.image && (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      <Image
                        src={refundPolicy.headerSection.image}
                        alt={refundPolicy.headerSection.imageAlt || "Header"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold">
                      {refundPolicy.headerSection.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {refundPolicy.headerSection.subtitle}
                    </p>
                    {refundPolicy.lastUpdated && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Last Updated: {refundPolicy.lastUpdated}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Sections */}
              {refundPolicy.sections && refundPolicy.sections.length > 0 && (
                <div className="space-y-6">
                  {refundPolicy.sections
                    .filter((section) => section.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div key={section.id} className="space-y-4">
                        <h2 className="text-2xl font-semibold">
                          {section.title}
                        </h2>
                        {section.content && section.content.length > 0 && (
                          <div className="space-y-2">
                            {section.content.map((paragraph, idx) => (
                              <p key={idx} className="text-muted-foreground">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        )}
                        {section.subsections &&
                          section.subsections.length > 0 && (
                            <div className="ml-4 space-y-4">
                              {section.subsections.map((subsection, idx) => (
                                <div key={idx} className="space-y-2">
                                  <h3 className="text-xl font-medium">
                                    {subsection.title}
                                  </h3>
                                  {subsection.content &&
                                    subsection.content.length > 0 && (
                                      <ul className="list-disc list-inside space-y-1 ml-4">
                                        {subsection.content.map(
                                          (item, itemIdx) => (
                                            <li
                                              key={itemIdx}
                                              className="text-muted-foreground"
                                            >
                                              {item}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                </div>
              )}

              {/* Contact Info */}
              {refundPolicy.contactInfo && (
                <div className="border-t pt-6 space-y-2">
                  <h3 className="text-xl font-semibold">Contact Information</h3>
                  <div className="space-y-1 text-muted-foreground">
                    {refundPolicy.contactInfo.refundDepartment && (
                      <p>
                        Refund Department:{" "}
                        {refundPolicy.contactInfo.refundDepartment}
                      </p>
                    )}
                    {refundPolicy.contactInfo.generalSupport && (
                      <p>
                        General Support:{" "}
                        {refundPolicy.contactInfo.generalSupport}
                      </p>
                    )}
                    {refundPolicy.contactInfo.phone && (
                      <p>Phone: {refundPolicy.contactInfo.phone}</p>
                    )}
                    {refundPolicy.contactInfo.businessHours && (
                      <p>
                        Business Hours: {refundPolicy.contactInfo.businessHours}
                      </p>
                    )}
                    {refundPolicy.contactInfo.address && (
                      <p>Address: {refundPolicy.contactInfo.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
