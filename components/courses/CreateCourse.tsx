"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { coursesService } from "@/services/courses.service";
import { uploadService } from "@/services/upload.service";
import { courseCategoriesService } from "@/services/course-categories.service";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { CheckCircle, Plus, X, ImageIcon, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CreateCourse() {
  const router = useRouter();
  const { push } = useToast();
  const qc = useQueryClient();
  const [selectedCats, setSelectedCats] = React.useState<string[]>([]);
  const [customCategory, setCustomCategory] = React.useState<string>("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [customTag, setCustomTag] = React.useState<string>("");
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [instructors, setInstructors] = React.useState<any[]>([]);
  const [selectedInstructor, setSelectedInstructor] =
    React.useState<string>("");

  React.useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/instructors"
        );
        const data = await response.json();
        setInstructors(data.data || []);
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
      }
    };
    fetchInstructors();
  }, []);

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => courseCategoriesService.getAllCategories(),
    staleTime: 60000,
  });

  const availableCategories = React.useMemo(() => {
    const categoryList = categoriesData?.data?.categories ?? [];
    return categoryList
      .filter((cat: any) => cat.isActive !== false)
      .map((cat: any) => cat.name);
  }, [categoriesData]);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      push({ type: "error", message: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      push({ type: "error", message: "Image size must be less than 5MB" });
      return;
    }

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <h2 className="text-3xl font-bold text-secondary mb-2">
          Create New Course
        </h2>
        <p className="text-gray-600">
          Add details for your Personal Wings aviation training course.
        </p>
      </div>

      <div className="bg-card rounded-xl p-8 shadow-sm border border-gray-100">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const title = String(fd.get("title") || "").trim();
            const description = String(fd.get("description") || "").trim();
            const content = String(fd.get("content") || "").trim();
            const level = String(fd.get("level") || "beginner");
            const type = String(fd.get("type") || "theoretical");
            const price = Number(fd.get("price") || 0);
            const originalPriceRaw = fd.get("originalPrice");
            const originalPrice =
              originalPriceRaw && Number(originalPriceRaw) > 0
                ? Number(originalPriceRaw)
                : undefined;
            const duration = Number(fd.get("duration") || 1);
            const maxStudents = Number(fd.get("maxStudents") || 1);
            const status = String(fd.get("status") || "draft");
            const instructor = String(fd.get("instructor") || "").trim();
            const prerequisitesInput = String(fd.get("prerequisites") || "");
            const learningObjectivesInput = String(
              fd.get("learningObjectives") || ""
            );

            const tags = selectedTags.length > 0 ? selectedTags : undefined;
            const prerequisites = prerequisitesInput
              ? prerequisitesInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined;
            const learningObjectives = learningObjectivesInput
              ? learningObjectivesInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined;

            const slug = title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-");

            try {
              let thumbnailUrl = "";

              if (thumbnailFile) {
                setIsUploading(true);
                try {
                  console.log(
                    "Uploading thumbnail:",
                    thumbnailFile.name,
                    thumbnailFile.size,
                    "bytes"
                  );
                  const uploadResult = await uploadService.uploadFile(
                    thumbnailFile,
                    {
                      type: "image",
                      description: "Course thumbnail",
                      tags: ["course", "thumbnail"],
                      onProgress: (progress) => {
                        setUploadProgress(progress.percentage);
                      },
                    }
                  );
                  console.log("Upload successful:", uploadResult.url);
                  thumbnailUrl = uploadResult.url;
                  setIsUploading(false);
                } catch (uploadError) {
                  setIsUploading(false);
                  console.error("Thumbnail upload failed:", uploadError);
                  push({
                    type: "error",
                    message:
                      "Failed to upload thumbnail. Saving course without image.",
                  });
                  // Continue with course creation even if upload fails
                }
              }

              const createPayload: any = {
                title,
                slug,
                description,
                content: content || undefined,
                level: level as any,
                type: type as any,
                price,
                originalPrice,
                duration: Math.max(duration, 1),
                durationHours: Math.max(duration, 1),
                maxStudents,
                isPublished: status === "published",
                tags,
                categories: selectedCats.length ? selectedCats : undefined,
                prerequisites,
                learningObjectives,
                instructor: instructor || undefined,
              };

              // Only include thumbnail if it has a value
              if (thumbnailUrl) {
                createPayload.thumbnail = thumbnailUrl;
              }

              console.log("Create payload:", createPayload);
              await coursesService.createCourse(createPayload);

              push({ type: "success", message: "Course created successfully" });
              qc.invalidateQueries({ queryKey: ["courses"] });
              router.push("/courses");
            } catch (err) {
              setIsUploading(false);
              const msg =
                err instanceof Error ? err.message : "Failed to create course";
              push({ type: "error", message: msg });
            }
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Course Title *
                </label>
                <input
                  name="title"
                  placeholder="e.g., Citation Jet Pro Line 21 Training"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    defaultValue="beginner"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    defaultValue="theoretical"
                  >
                    <option value="theoretical">Theoretical</option>
                    <option value="practical">Practical</option>
                    <option value="simulator">Simulator</option>
                    <option value="combined">Combined</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Brief Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Brief course description (excerpt)"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Detailed Content
                </label>
                <textarea
                  name="content"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Detailed course content and curriculum description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Sale Price ($) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Original Price ($)
                  </label>
                  <input
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For discount display
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min={1}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Max Students *
                  </label>
                  <input
                    name="maxStudents"
                    type="number"
                    min={1}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary block mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    defaultValue="draft"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Instructor *
                </label>
                <select
                  name="instructor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  required
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.firstName} {instructor.lastName} (
                      {instructor.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the instructor who will teach this course
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Prerequisites
                </label>
                <input
                  name="prerequisites"
                  placeholder="Comma-separated (e.g., Private Pilot License, Medical Certificate)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Learning Objectives
                </label>
                <textarea
                  name="learningObjectives"
                  rows={3}
                  placeholder="Comma-separated (e.g., Master Pro Line 21 systems, Perform emergency procedures)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Thumbnail Upload */}
              <div>
                <label className="text-sm font-medium text-secondary block mb-2">
                  Course Thumbnail
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <div className="relative w-full h-64 rounded-lg overflow-hidden">
                        <Image
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearThumbnail}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {isUploading && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-12 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or WEBP (MAX. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary">
                    Categories
                  </label>
                  <span className="text-xs text-gray-500">
                    {selectedCats.length} selected
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Add custom category"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = customCategory.trim();
                        if (trimmed && !selectedCats.includes(trimmed)) {
                          setSelectedCats((prev) => [...prev, trimmed]);
                          setCustomCategory("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const trimmed = customCategory.trim();
                      if (trimmed && !selectedCats.includes(trimmed)) {
                        setSelectedCats((prev) => [...prev, trimmed]);
                        setCustomCategory("");
                      }
                    }}
                    className="bg-accent hover:bg-accent/90 text-white"
                    disabled={!customCategory.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                  {availableCategories.length > 0 ? (
                    availableCategories.map((cat) => {
                      const isSelected = selectedCats.includes(cat);
                      return (
                        <Badge
                          key={cat}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            isSelected ? "bg-primary text-white" : ""
                          }`}
                          onClick={() => {
                            setSelectedCats((prev) =>
                              prev.includes(cat)
                                ? prev.filter((c) => c !== cat)
                                : [...prev, cat]
                            );
                          }}
                        >
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {cat}
                        </Badge>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      No categories available. Create categories first in the
                      Course Categories section.
                    </p>
                  )}
                </div>

                {selectedCats.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg">
                    {selectedCats.map((cat) => (
                      <Badge key={cat} className="bg-accent text-white">
                        {cat}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCats((prev) =>
                              prev.filter((c) => c !== cat)
                            )
                          }
                          className="ml-2 hover:bg-white/30 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary">
                    SEO Tags
                  </label>
                  <span className="text-xs text-gray-500">
                    {selectedTags.length} tags
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add SEO tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = customTag.trim().toLowerCase();
                        if (trimmed && !selectedTags.includes(trimmed)) {
                          setSelectedTags((prev) => [...prev, trimmed]);
                          setCustomTag("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const trimmed = customTag.trim().toLowerCase();
                      if (trimmed && !selectedTags.includes(trimmed)) {
                        setSelectedTags((prev) => [...prev, trimmed]);
                        setCustomTag("");
                      }
                    }}
                    className="bg-accent hover:bg-accent/90 text-white"
                    disabled={!customTag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                  {[
                    "flight training",
                    "aviation courses",
                    "pilot training",
                    "jet training",
                    "aircraft training",
                  ].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer ${
                          isSelected ? "bg-blue-600 text-white" : ""
                        }`}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {isSelected && <CheckCircle className="w-3 h-3 mr-1" />}
                        {tag}
                      </Badge>
                    );
                  })}
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50/50 rounded-lg">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} className="bg-blue-600 text-white">
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTags((prev) =>
                              prev.filter((t) => t !== tag)
                            )
                          }
                          className="ml-2 hover:bg-white/30 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
