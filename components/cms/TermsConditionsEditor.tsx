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
} from "lucide-react";
import Image from "next/image";
import { TermsConditionsService } from "@/lib/services/terms-conditions.service";
import type {
  TermsConditions,
  HeaderSection,
  PolicySection,
  SubSection,
  ContactInfo,
  SeoMeta,
} from "@/lib/services/terms-conditions.service";
import { useToast } from "@/context/ToastContext";

export function TermsConditionsEditor() {
  const { push } = useToast();
  const [TermsConditions, setTermsConditions] =
    useState<TermsConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("header");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<Partial<TermsConditions>>({
    headerSection: {
      title: "",
      subtitle: "",
      image: "",
      imageAlt: "",
    },
    lastUpdated: "",
    sections: [],
    contactInfo: {
      email: "",
      generalSupport: "",
      phone: "",
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
    fetchTermsConditions();
  }, []);

  useEffect(() => {
    if (TermsConditions) {
      setFormData({
        headerSection: TermsConditions.headerSection,
        lastUpdated: TermsConditions.lastUpdated,
        sections: TermsConditions.sections,
        contactInfo: TermsConditions.contactInfo,
        seoMeta: TermsConditions.seoMeta,
        isActive: TermsConditions.isActive,
      });
      if (TermsConditions.headerSection?.image) {
        setImagePreview(TermsConditions.headerSection.image);
      }
    }
  }, [TermsConditions]);

  const fetchTermsConditions = async () => {
    try {
      setLoading(true);
      const response = await TermsConditionsService.getDefaultTermsConditions();
      if (response.success && response.data) {
        setTermsConditions(response.data as TermsConditions);
      } else {
        push({
          title: "Error",
          description: response.message || "Failed to fetch Terms & Conditions",
          variant: "error",
        });
      }
    } catch (error) {
      push({
        title: "Error",
        description: "Failed to fetch Terms & Conditions",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (!TermsConditions?._id) {
      push({
        title: "Error",
        description: "No Terms & Conditions data found",
        variant: "error",
      });
      return;
    }

    try {
      setSaving(true);

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

        setUploadProgress(0);
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const response =
          await TermsConditionsService.updateTermsConditionsWithUpload(
            TermsConditions._id,
            formDataObj
          );

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.success) {
          push({
            title: "Success",
            description: "Terms & Conditions updated successfully with image",
            variant: "success",
          });
          setTimeout(() => {
            setUploadProgress(0);
            setImageFile(null);
          }, 1000);
          await fetchTermsConditions();
        } else {
          throw new Error(response.message);
        }
      } else {
        const response = await TermsConditionsService.updateTermsConditions(
          TermsConditions._id,
          formData
        );
        if (response.success) {
          push({
            title: "Success",
            description: "Terms & Conditions updated successfully",
            variant: "success",
          });
          await fetchTermsConditions();
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error: any) {
      push({
        title: "Error",
        description: error.message || "Failed to save Terms & Conditions",
        variant: "error",
      });
      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchTermsConditions();
    setImageFile(null);
    setUploadProgress(0);
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
        title: "Error",
        description: "Subsection title and at least one content item required",
        variant: "error",
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
        title: "Error",
        description:
          "Section ID, title, and at least one content paragraph required",
        variant: "error",
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
      title: "Success",
      description: editingSection ? "Section updated" : "Section added",
      variant: "success",
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
    push({
      title: "Success",
      description: "Section deleted",
      variant: "success",
    });
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
            Terms & Conditions Management
          </h2>
          <p className="text-muted-foreground">
            Manage Terms & Conditions content, sections, contact info, and SEO
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
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
                Control visibility of the Terms & Conditions page
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
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
                Configure the header content for your Terms & Conditions page
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
                  placeholder="Terms & Conditions"
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
                  placeholder="Your privacy is important to us..."
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

        {/* Sections Tab - Continue in next part due to length */}
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
                    placeholder="2.1 Personal Information"
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
                Update contact details for terms & conditions inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Support Email</Label>
                <Input
                  id="email"
                  value={formData.contactInfo?.email || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo!,
                        email: e.target.value,
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
                Optimize your Terms & Conditions page for search engines
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
                  placeholder="Terms & Conditions - Personal Wings"
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
                  placeholder="Learn how Personal Wings protects your privacy..."
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
                  placeholder="Terms & Conditions, data protection, GDPR"
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
                  placeholder="Terms & Conditions - Personal Wings"
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
                  placeholder="Your privacy matters..."
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
                  placeholder="https://personalwings.com/terms-conditions"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
