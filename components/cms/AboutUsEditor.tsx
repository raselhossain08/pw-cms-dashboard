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
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useAboutUs } from "@/hooks/useAboutUs";
import type {
  AboutUs,
  HeaderSection,
  ContentSection,
  SeoMeta,
  TeamMember,
  TeamSection,
  Stat,
  StatsSection,
} from "@/lib/services/about-us.service";
import { useToast } from "@/context/ToastContext";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
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
import { ExternalLink, Copy, Download, Loader2 } from "lucide-react";

export function AboutUsEditor() {
  const { push } = useToast();
  const {
    aboutUs,
    loading,
    saving,
    uploadProgress,
    fetchAboutUs,
    updateAboutUs,
    updateAboutUsWithUpload,
    toggleActiveStatus,
    duplicateAboutUs,
    exportAboutUs,
    refreshAboutUs,
  } = useAboutUs();
  const [activeTab, setActiveTab] = useState("header");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<Partial<AboutUs>>({
    headerSection: {
      title: "",
      subtitle: "",
      image: "",
      imageAlt: "",
    },
    sections: [],
    seo: {
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

  const [editingSection, setEditingSection] = useState<ContentSection | null>(
    null
  );
  const [sectionForm, setSectionForm] = useState<ContentSection>({
    id: "",
    title: "",
    content: "",
    image: "",
    imageAlt: "",
    isActive: true,
    order: 0,
  });
  const [sectionImageFile, setSectionImageFile] = useState<File | null>(null);
  const [sectionImagePreview, setSectionImagePreview] = useState<string>("");

  // Team Management State
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(
    null
  );
  const [teamMemberForm, setTeamMemberForm] = useState<TeamMember>({
    id: "",
    name: "",
    position: "",
    image: "",
    imageAlt: "",
    bio: "",
    certifications: "",
    isActive: true,
    order: 0,
  });
  const [teamMemberImageFile, setTeamMemberImageFile] = useState<File | null>(
    null
  );
  const [teamMemberImagePreview, setTeamMemberImagePreview] =
    useState<string>("");
  const [teamMemberImageFiles, setTeamMemberImageFiles] = useState<
    Map<string, File>
  >(new Map());

  // Stats Management State
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [statForm, setStatForm] = useState<Stat>({
    value: "",
    label: "",
  });

  useEffect(() => {
    if (aboutUs) {
      setFormData({
        headerSection: aboutUs.headerSection || {
          title: "",
          subtitle: "",
          image: "",
          imageAlt: "",
        },
        sections: aboutUs.sections || [],
        teamSection: aboutUs.teamSection || {
          isActive: true,
          title: "",
          subtitle: "",
          description: "",
          members: [],
        },
        statsSection: aboutUs.statsSection || {
          isActive: true,
          stats: [],
        },
        seo: aboutUs.seo || {
          title: "",
          description: "",
          keywords: [],
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          canonicalUrl: "",
        },
        isActive: aboutUs.isActive !== undefined ? aboutUs.isActive : true,
      });
      if (aboutUs.headerSection?.image) {
        setHeaderImagePreview(aboutUs.headerSection.image);
      }
    }
  }, [aboutUs]);

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSectionImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSectionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!aboutUs?._id) {
      push({ message: "About Us page not found", type: "error" });
      return;
    }

    try {
      if (
        headerImageFile ||
        sectionImageFile ||
        teamMemberImageFile ||
        teamMemberImageFiles.size > 0
      ) {
        const formDataToSend = new FormData();
        formDataToSend.append(
          "headerSection",
          JSON.stringify(formData.headerSection)
        );
        formDataToSend.append("sections", JSON.stringify(formData.sections));
        if (formData.teamSection) {
          formDataToSend.append(
            "teamSection",
            JSON.stringify(formData.teamSection)
          );
        }
        if (formData.statsSection) {
          formDataToSend.append(
            "statsSection",
            JSON.stringify(formData.statsSection)
          );
        }
        formDataToSend.append("seo", JSON.stringify(formData.seo));
        formDataToSend.append("isActive", String(formData.isActive));

        if (headerImageFile) {
          formDataToSend.append("headerImage", headerImageFile);
        }

        if (sectionImageFile) {
          formDataToSend.append("sectionImages", sectionImageFile);
        }

        // Collect team member images in order
        if (teamMemberImageFiles.size > 0 || teamMemberImageFile) {
          const members = formData.teamSection?.members || [];
          const sortedMembers = [...members].sort((a, b) => a.order - b.order);

          // Add current editing member's image if exists
          if (teamMemberImageFile && editingTeamMember) {
            const newMap = new Map(teamMemberImageFiles);
            newMap.set(editingTeamMember.id, teamMemberImageFile);
            setTeamMemberImageFiles(newMap);
          }

          // Append images in member order
          sortedMembers.forEach((member) => {
            const file = teamMemberImageFiles.get(member.id);
            if (file) {
              formDataToSend.append("teamMemberImages", file);
            }
          });
        }

        await updateAboutUsWithUpload(aboutUs._id, formDataToSend);
        setHeaderImageFile(null);
        setSectionImageFile(null);
        setTeamMemberImageFile(null);
        setTeamMemberImageFiles(new Map());
      } else {
        await updateAboutUs(aboutUs._id, formData);
      }
    } catch (error: any) {
      console.error("Failed to save:", error);
    }
  };

  const handleRefresh = () => {
    refreshAboutUs();
    setHeaderImageFile(null);
    setSectionImageFile(null);
    setTeamMemberImageFile(null);
    setTeamMemberImageFiles(new Map());
  };

  const handleToggleActive = async () => {
    if (!aboutUs?._id) return;
    await toggleActiveStatus(aboutUs._id);
    // Update local form data
    setFormData({ ...formData, isActive: !formData.isActive });
  };

  const handleDuplicate = async () => {
    if (!aboutUs?._id) return;
    await duplicateAboutUs(aboutUs._id);
  };

  const handleExport = async (format: "json" | "pdf") => {
    if (!aboutUs?._id) return;
    setIsExporting(true);
    try {
      await exportAboutUs(format, aboutUs._id);
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSection = () => {
    if (!sectionForm.id || !sectionForm.title || !sectionForm.content.trim()) {
      push({
        message: "Section ID, title, and content are required",
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
        updatedSections[index] = { ...sectionForm };
      }
    } else {
      updatedSections.push({ ...sectionForm });
    }

    // Update orders
    updatedSections.forEach((s, i) => (s.order = i + 1));

    setFormData({ ...formData, sections: updatedSections });
    setSectionForm({
      id: "",
      title: "",
      content: "",
      image: "",
      imageAlt: "",
      isActive: true,
      order: 0,
    });
    setEditingSection(null);
    setSectionImageFile(null);
    setSectionImagePreview("");

    push({
      message: editingSection ? "Section updated" : "Section added",
      type: "success",
    });
  };

  const handleEditSection = (section: ContentSection) => {
    setEditingSection(section);
    setSectionForm(section);
    if (section.image) {
      setSectionImagePreview(section.image);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = (formData.sections || []).filter(
      (s) => s.id !== sectionId
    );
    updatedSections.forEach((s, i) => (s.order = i + 1));
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
            About Us Page Management
          </h2>
          <p className="text-muted-foreground">
            Manage About Us page content with WordPress-like editor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={saving || isExporting}>
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
            disabled={saving || !aboutUs?._id}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

      {/* Active Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Page Status</CardTitle>
              <CardDescription>
                Control visibility of the About Us page
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={handleToggleActive}
                disabled={saving}
              />
              <Label>{formData.isActive ? "Active" : "Inactive"}</Label>
              {formData.isActive ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-red-500" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleActive}
                disabled={saving}
              >
                {formData.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="sections">Content Sections</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Section</CardTitle>
              <CardDescription>
                Configure the header content for your About Us page
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
                  placeholder="About Us"
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
                  placeholder="LEARN MORE ABOUT PERSONAL WINGS"
                  rows={2}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Header Image (Optional)</Label>
                {headerImagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Image
                      src={headerImagePreview}
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
                      document.getElementById("header-image-upload")?.click()
                    }
                    type="button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {headerImageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {headerImageFile && (
                    <Badge variant="secondary">{headerImageFile.name}</Badge>
                  )}
                </div>
                <input
                  id="header-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeaderImageChange}
                />
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
                {editingSection ? "Edit Section" : "Add New Section"}
              </CardTitle>
              <CardDescription>
                {editingSection
                  ? "Update section information"
                  : "Create a new content section with rich text editor"}
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
                    placeholder="mission"
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
                  placeholder="Our Mission"
                />
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label>Content (WordPress-like Editor)</Label>
                <RichTextEditor
                  content={sectionForm.content}
                  onChange={(content) =>
                    setSectionForm({ ...sectionForm, content })
                  }
                  placeholder="Write your content here..."
                />
              </div>

              {/* Section Image */}
              <div className="space-y-4">
                <Label>Section Image (Optional)</Label>
                {sectionImagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={sectionImagePreview}
                      alt="Section preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("section-image-upload")?.click()
                    }
                    type="button"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {sectionImageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {sectionImageFile && (
                    <Badge variant="secondary">{sectionImageFile.name}</Badge>
                  )}
                </div>
                <input
                  id="section-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSectionImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionImageAlt">Image Alt Text</Label>
                <Input
                  id="sectionImageAlt"
                  value={sectionForm.imageAlt || ""}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, imageAlt: e.target.value })
                  }
                  placeholder="Descriptive text for the image"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={sectionForm.isActive}
                  onCheckedChange={(checked) =>
                    setSectionForm({ ...sectionForm, isActive: checked })
                  }
                />
                <Label>Section Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSection} className="flex-1">
                  {editingSection ? "Update Section" : "Add Section"}
                </Button>
                {editingSection && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSection(null);
                      setSectionForm({
                        id: "",
                        title: "",
                        content: "",
                        image: "",
                        imageAlt: "",
                        isActive: true,
                        order: 0,
                      });
                      setSectionImageFile(null);
                      setSectionImagePreview("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Sections List */}
          <Card>
            <CardHeader>
              <CardTitle>Content Sections</CardTitle>
              <CardDescription>
                Manage your content sections. Drag to reorder or edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(formData.sections || [])
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex flex-col gap-2">
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
                            index === (formData.sections || []).length - 1
                          }
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{section.title}</h4>
                          <Badge
                            variant={section.isActive ? "default" : "secondary"}
                          >
                            {section.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            Order: {section.order}
                          </Badge>
                        </div>
                        <div
                          className="text-sm text-gray-600 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                        {section.image && (
                          <div className="relative w-32 h-20 rounded overflow-hidden">
                            <Image
                              src={section.image}
                              alt={section.imageAlt || section.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSection(section)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {(!formData.sections || formData.sections.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No sections yet. Add your first section above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Section Settings</CardTitle>
              <CardDescription>
                Configure the team section header and manage team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.teamSection?.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        teamSection: {
                          ...formData.teamSection!,
                          isActive: checked,
                          members: formData.teamSection?.members || [],
                        },
                      })
                    }
                  />
                  <Label>Enable Team Section</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamTitle">Section Title</Label>
                <Input
                  id="teamTitle"
                  value={formData.teamSection?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSection: {
                        ...formData.teamSection!,
                        title: e.target.value,
                        members: formData.teamSection?.members || [],
                      },
                    })
                  }
                  placeholder="Meet Our Expert Instructors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSubtitle">Section Subtitle</Label>
                <Input
                  id="teamSubtitle"
                  value={formData.teamSection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSection: {
                        ...formData.teamSection!,
                        subtitle: e.target.value,
                        members: formData.teamSection?.members || [],
                      },
                    })
                  }
                  placeholder="Our Team"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamDescription">Section Description</Label>
                <Textarea
                  id="teamDescription"
                  value={formData.teamSection?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSection: {
                        ...formData.teamSection!,
                        description: e.target.value,
                        members: formData.teamSection?.members || [],
                      },
                    })
                  }
                  placeholder="Our dedicated team of aviation professionals..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Team Member */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTeamMember ? "Edit Team Member" : "Add Team Member"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input
                    id="memberId"
                    value={teamMemberForm.id}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        id: e.target.value,
                      })
                    }
                    placeholder="team-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberOrder">Order</Label>
                  <Input
                    id="memberOrder"
                    type="number"
                    value={teamMemberForm.order}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Name</Label>
                  <Input
                    id="memberName"
                    value={teamMemberForm.name}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Captain John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberPosition">Position</Label>
                  <Input
                    id="memberPosition"
                    value={teamMemberForm.position}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        position: e.target.value,
                      })
                    }
                    placeholder="Chief Flight Instructor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberBio">Bio</Label>
                <Textarea
                  id="memberBio"
                  value={teamMemberForm.bio}
                  onChange={(e) =>
                    setTeamMemberForm({
                      ...teamMemberForm,
                      bio: e.target.value,
                    })
                  }
                  placeholder="Brief bio about the team member..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberCertifications">Certifications</Label>
                <Input
                  id="memberCertifications"
                  value={teamMemberForm.certifications}
                  onChange={(e) =>
                    setTeamMemberForm({
                      ...teamMemberForm,
                      certifications: e.target.value,
                    })
                  }
                  placeholder="ATP, CFI, CFII, MEI"
                />
              </div>

              <div className="space-y-4">
                <Label>Member Image (Optional)</Label>
                {teamMemberImagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={teamMemberImagePreview}
                      alt="Team member preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("member-image-upload")?.click()
                    }
                    type="button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {teamMemberImageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {teamMemberImageFile && (
                    <Badge variant="secondary">
                      {teamMemberImageFile.name}
                    </Badge>
                  )}
                </div>
                <input
                  id="member-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTeamMemberImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const preview = reader.result as string;
                        setTeamMemberImagePreview(preview);
                        // Store preview URL in form for now, will be replaced with actual URL on save
                        setTeamMemberForm({
                          ...teamMemberForm,
                          image: preview,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberImageAlt">Image Alt Text</Label>
                <Input
                  id="memberImageAlt"
                  value={teamMemberForm.imageAlt}
                  onChange={(e) =>
                    setTeamMemberForm({
                      ...teamMemberForm,
                      imageAlt: e.target.value,
                    })
                  }
                  placeholder="Team member name"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={teamMemberForm.isActive}
                  onCheckedChange={(checked) =>
                    setTeamMemberForm({ ...teamMemberForm, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const members = formData.teamSection?.members || [];
                    if (editingTeamMember) {
                      // Store image file for edited member
                      if (teamMemberImageFile) {
                        const newMap = new Map(teamMemberImageFiles);
                        newMap.set(editingTeamMember.id, teamMemberImageFile);
                        setTeamMemberImageFiles(newMap);
                      }
                      const updated = members.map((m) =>
                        m.id === editingTeamMember.id ? teamMemberForm : m
                      );
                      setFormData({
                        ...formData,
                        teamSection: {
                          ...formData.teamSection!,
                          members: updated,
                        },
                      });
                      setEditingTeamMember(null);
                    } else {
                      // Store image file for new member
                      if (teamMemberImageFile) {
                        const newMap = new Map(teamMemberImageFiles);
                        newMap.set(teamMemberForm.id, teamMemberImageFile);
                        setTeamMemberImageFiles(newMap);
                      }
                      setFormData({
                        ...formData,
                        teamSection: {
                          ...formData.teamSection!,
                          members: [...members, teamMemberForm],
                        },
                      });
                    }
                    const newOrder = editingTeamMember
                      ? teamMemberForm.order
                      : members.length;
                    setTeamMemberForm({
                      id: "",
                      name: "",
                      position: "",
                      image: "",
                      imageAlt: "",
                      bio: "",
                      certifications: "",
                      isActive: true,
                      order: newOrder,
                    });
                    setTeamMemberImageFile(null);
                    setTeamMemberImagePreview("");
                  }}
                >
                  {editingTeamMember ? "Update Member" : "Add Member"}
                </Button>
                {editingTeamMember && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTeamMember(null);
                      setTeamMemberForm({
                        id: "",
                        name: "",
                        position: "",
                        image: "",
                        imageAlt: "",
                        bio: "",
                        certifications: "",
                        isActive: true,
                        order: 0,
                      });
                      setTeamMemberImageFile(null);
                      setTeamMemberImagePreview("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members. Drag to reorder or edit/delete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.teamSection?.members
                  ?.sort((a, b) => a.order - b.order)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col">
                          <span className="font-semibold">{member.name}</span>
                          <span className="text-sm text-gray-500">
                            {member.position}
                          </span>
                          <span className="text-xs text-gray-400">
                            Order: {member.order} |{" "}
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {member.image && (
                          <div className="relative w-16 h-16 rounded overflow-hidden">
                            <Image
                              src={member.image}
                              alt={member.imageAlt || member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTeamMember(member);
                            setTeamMemberForm(member);
                            if (member.image) {
                              setTeamMemberImagePreview(member.image);
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const members = formData.teamSection?.members || [];
                            setFormData({
                              ...formData,
                              teamSection: {
                                ...formData.teamSection!,
                                members: members.filter(
                                  (m) => m.id !== member.id
                                ),
                              },
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {(!formData.teamSection?.members ||
                  formData.teamSection.members.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No team members yet. Add your first team member above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stats Section Settings</CardTitle>
              <CardDescription>
                Configure statistics displayed on the about page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.statsSection?.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        statsSection: {
                          ...formData.statsSection!,
                          isActive: checked,
                          stats: formData.statsSection?.stats || [],
                        },
                      })
                    }
                  />
                  <Label>Enable Stats Section</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Stat */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingStat ? "Edit Stat" : "Add Statistic"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statValue">Value</Label>
                  <Input
                    id="statValue"
                    value={statForm.value}
                    onChange={(e) =>
                      setStatForm({ ...statForm, value: e.target.value })
                    }
                    placeholder="15+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statLabel">Label</Label>
                  <Input
                    id="statLabel"
                    value={statForm.label}
                    onChange={(e) =>
                      setStatForm({ ...statForm, label: e.target.value })
                    }
                    placeholder="Years Experience"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const stats = formData.statsSection?.stats || [];
                    if (editingStat) {
                      const index = stats.findIndex(
                        (s) =>
                          s.value === editingStat.value &&
                          s.label === editingStat.label
                      );
                      if (index !== -1) {
                        const updated = [...stats];
                        updated[index] = statForm;
                        setFormData({
                          ...formData,
                          statsSection: {
                            ...formData.statsSection!,
                            stats: updated,
                          },
                        });
                      }
                      setEditingStat(null);
                    } else {
                      setFormData({
                        ...formData,
                        statsSection: {
                          ...formData.statsSection!,
                          stats: [...stats, statForm],
                        },
                      });
                    }
                    setStatForm({ value: "", label: "" });
                  }}
                >
                  {editingStat ? "Update Stat" : "Add Stat"}
                </Button>
                {editingStat && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingStat(null);
                      setStatForm({ value: "", label: "" });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats List */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Manage statistics displayed on the about page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.statsSection?.stats?.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg">
                        {stat.value}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stat.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingStat(stat);
                          setStatForm(stat);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const stats = formData.statsSection?.stats || [];
                          setFormData({
                            ...formData,
                            statsSection: {
                              ...formData.statsSection!,
                              stats: stats.filter((s, i) => i !== index),
                            },
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!formData.statsSection?.stats ||
                  formData.statsSection.stats.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No statistics yet. Add your first statistic above.
                  </p>
                )}
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
                Configure search engine optimization for the About Us page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seo?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, title: e.target.value },
                    })
                  }
                  placeholder="About Us | Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seo?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, description: e.target.value },
                    })
                  }
                  placeholder="Learn about Personal Wings and our commitment to excellence"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seo?.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: {
                        ...formData.seo!,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k),
                      },
                    })
                  }
                  placeholder="about, aviation training, flight school"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  value={formData.seo?.ogTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, ogTitle: e.target.value },
                    })
                  }
                  placeholder="About Us | Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.seo?.ogDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: {
                        ...formData.seo!,
                        ogDescription: e.target.value,
                      },
                    })
                  }
                  placeholder="Learn about our mission and values"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.seo?.ogImage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, ogImage: e.target.value },
                    })
                  }
                  placeholder="https://example.com/about-og-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.seo?.canonicalUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, canonicalUrl: e.target.value },
                    })
                  }
                  placeholder="https://personalwings.com/about-us"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl lg:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Preview About Us Page
            </DialogTitle>
            <DialogDescription>
              This is how your About Us page will appear to visitors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Header Section Preview */}
            {formData.headerSection && (
              <div className="border rounded-lg p-6">
                <h2 className="text-3xl font-bold mb-2">
                  {formData.headerSection.title || "About Us"}
                </h2>
                {formData.headerSection.subtitle && (
                  <p className="text-lg text-gray-600 mb-4">
                    {formData.headerSection.subtitle}
                  </p>
                )}
                {headerImagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <Image
                      src={headerImagePreview}
                      alt={formData.headerSection.imageAlt || "Header image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sections Preview */}
            {formData.sections && formData.sections.length > 0 && (
              <div className="space-y-6">
                {formData.sections
                  .filter((s) => s.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id} className="border rounded-lg p-6">
                      <h3 className="text-2xl font-semibold mb-4">
                        {section.title}
                      </h3>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                      {section.image && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border mt-4">
                          <Image
                            src={section.image}
                            alt={section.imageAlt || section.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Team Section Preview */}
            {formData.teamSection?.isActive && formData.teamSection.members && (
              <div className="border rounded-lg p-6">
                {formData.teamSection.title && (
                  <h3 className="text-2xl font-semibold mb-2">
                    {formData.teamSection.title}
                  </h3>
                )}
                {formData.teamSection.subtitle && (
                  <p className="text-lg text-gray-600 mb-4">
                    {formData.teamSection.subtitle}
                  </p>
                )}
                {formData.teamSection.description && (
                  <p className="text-gray-700 mb-6">
                    {formData.teamSection.description}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.teamSection.members
                    .filter((m) => m.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((member) => (
                      <div key={member.id} className="border rounded-lg p-4">
                        {member.image && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border mb-4">
                            <Image
                              src={member.image}
                              alt={member.imageAlt || member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        <p className="text-gray-600 mb-2">{member.position}</p>
                        {member.bio && (
                          <p className="text-sm text-gray-700 mb-2">
                            {member.bio}
                          </p>
                        )}
                        {member.certifications && (
                          <p className="text-xs text-gray-500">
                            {member.certifications}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Stats Section Preview */}
            {formData.statsSection?.isActive && formData.statsSection.stats && (
              <div className="border rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.statsSection.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const frontendUrl =
                  process.env.NEXT_PUBLIC_FRONTEND_URL ||
                  "http://localhost:3000";
                window.open(`${frontendUrl}/about-us`, "_blank");
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Page
            </Button>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 w-80 z-50">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Uploading images...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <span className="text-xs text-gray-500 mt-1">{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
}
