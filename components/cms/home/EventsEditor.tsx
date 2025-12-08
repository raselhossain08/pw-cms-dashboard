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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";
import { uploadService } from "@/services/upload.service";
import type {
  Events,
  UpdateEventsDto,
  Event,
  SeoMeta,
} from "@/lib/types/events";

export function EventsEditor() {
  const {
    events,
    loading,
    uploadProgress,
    fetchEvents,
    updateEvents,
    updateEventsWithMedia,
    toggleActive,
  } = useEvents();

  const [activeTab, setActiveTab] = useState("content");
  const [eventImageFiles, setEventImageFiles] = useState<{
    [key: number]: File;
  }>({});
  const [eventImagePreviews, setEventImagePreviews] = useState<{
    [key: number]: string;
  }>({});

  const [formData, setFormData] = useState<UpdateEventsDto>({
    title: "",
    subtitle: "",
    events: [],
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
    isActive: true,
  });

  const handleEventImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImageFiles({ ...eventImageFiles, [index]: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreviews({
          ...eventImagePreviews,
          [index]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Add text fields
      submitFormData.append("title", formData.title || "");
      submitFormData.append("subtitle", formData.subtitle || "");

      // Add events array
      formData.events?.forEach((event, index) => {
        // Add event image file if present
        if (eventImageFiles[index]) {
          submitFormData.append(
            `events[${index}][image]`,
            eventImageFiles[index]
          );
        } else if (event.image && event.image.startsWith("http")) {
          // Use existing URL if no new file
          submitFormData.append(`events[${index}][image]`, event.image);
        }

        submitFormData.append(
          `events[${index}][id]`,
          String(event.id || index + 1)
        );
        submitFormData.append(`events[${index}][title]`, event.title || "");
        submitFormData.append(`events[${index}][date]`, event.date || "");
        submitFormData.append(`events[${index}][time]`, event.time || "");
        submitFormData.append(`events[${index}][venue]`, event.venue || "");
        submitFormData.append(
          `events[${index}][location]`,
          event.location || ""
        );
        submitFormData.append(`events[${index}][slug]`, event.slug || "");
        submitFormData.append(
          `events[${index}][description]`,
          event.description || ""
        );
        submitFormData.append(
          `events[${index}][price]`,
          String(event.price || 0)
        );
        submitFormData.append(
          `events[${index}][videoUrl]`,
          event.videoUrl || ""
        );

        // Add training content
        if (event.trainingContent && event.trainingContent.length > 0) {
          submitFormData.append(
            `events[${index}][trainingContent]`,
            JSON.stringify(event.trainingContent)
          );
        }

        // Add learning points
        if (event.learningPoints && event.learningPoints.length > 0) {
          submitFormData.append(
            `events[${index}][learningPoints]`,
            JSON.stringify(event.learningPoints)
          );
        }

        // Add FAQs
        if (event.faqs && event.faqs.length > 0) {
          submitFormData.append(
            `events[${index}][faqs]`,
            JSON.stringify(event.faqs)
          );
        }

        // Add instructors
        if (event.instructors && event.instructors.length > 0) {
          submitFormData.append(
            `events[${index}][instructors]`,
            JSON.stringify(event.instructors)
          );
        }

        // Add related events
        if (event.relatedEvents && event.relatedEvents.length > 0) {
          submitFormData.append(
            `events[${index}][relatedEvents]`,
            JSON.stringify(event.relatedEvents)
          );
        }
      });

      

      submitFormData.append("isActive", String(formData.isActive ?? true));

      await updateEventsWithMedia(submitFormData);
      setEventImageFiles({});
      fetchEvents();
    } catch (error) {
      console.error("Failed to update events:", error);
    }
  };

  const addEvent = () => {
    const newId =
      formData.events && formData.events.length > 0
        ? Math.max(...formData.events.map((e) => e.id)) + 1
        : 1;
    setFormData({
      ...formData,
      events: [
        ...(formData.events || []),
        {
          id: newId,
          title: "",
          image: "",
          date: "",
          time: "",
          venue: "",
          location: "",
          slug: "",
          description: "",
        },
      ],
    });
  };

  const removeEvent = (index: number) => {
    setFormData({
      ...formData,
      events: formData.events?.filter((_, i) => i !== index) || [],
    });
    // Clean up image files and previews
    const newFiles = { ...eventImageFiles };
    const newPreviews = { ...eventImagePreviews };
    delete newFiles[index];
    delete newPreviews[index];
    setEventImageFiles(newFiles);
    setEventImagePreviews(newPreviews);
  };

  const updateEvent = (
    index: number,
    field: keyof Event,
    value: string | number
  ) => {
    const newEvents = [...(formData.events || [])];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setFormData({ ...formData, events: newEvents });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <EventsForm
      key={events?._id || "empty"}
      initialEvents={events || null}
      uploadProgress={uploadProgress}
      fetchEvents={fetchEvents}
      updateEvents={updateEvents}
      updateEventsWithMedia={updateEventsWithMedia}
      toggleActive={toggleActive}
    />
  );
}

function EventsForm({
  initialEvents,
  uploadProgress,
  fetchEvents,
  updateEvents,
  updateEventsWithMedia,
  toggleActive,
}: {
  initialEvents: Events | null;
  uploadProgress: number;
  fetchEvents: () => Promise<void>;
  updateEvents: (dto: Partial<UpdateEventsDto>) => Promise<Events>;
  updateEventsWithMedia: (
    fd: FormData
  ) => Promise<{ data: Events; message: string }>;
  toggleActive: () => Promise<Events>;
}) {
  const [activeTab, setActiveTab] = useState("content");
  const [eventImageFiles, setEventImageFiles] = useState<{
    [key: number]: File;
  }>({});
  const [eventImagePreviews, setEventImagePreviews] = useState<{
    [key: number]: string;
  }>(() => {
    const previews: { [key: number]: string } = {};
    initialEvents?.events?.forEach((ev, index) => {
      if (ev.image) previews[index] = ev.image;
    });
    return previews;
  });
  const [perImageProgress, setPerImageProgress] = useState<{
    [key: number]: number;
  }>({});

  const [formData, setFormData] = useState<UpdateEventsDto>(() => ({
    title: initialEvents?.title || "",
    subtitle: initialEvents?.subtitle || "",
    events: initialEvents?.events || [],
    seo: initialEvents?.seo || {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
    isActive: initialEvents?.isActive ?? true,
  }));

  const handleEventImageChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventImageFiles({ ...eventImageFiles, [index]: file });
    setPerImageProgress((p) => ({ ...p, [index]: 0 }));
    try {
      const result = await uploadService.uploadFile(file, {
        type: "image",
        onProgress: (progress) => {
          setPerImageProgress((p) => ({ ...p, [index]: progress.percentage }));
        },
      });
      setEventImagePreviews({ ...eventImagePreviews, [index]: result.url });
      const newEvents = [...(formData.events || [])];
      if (newEvents[index]) {
        newEvents[index] = { ...newEvents[index], image: result.url } as Event;
        setFormData({ ...formData, events: newEvents });
      }
    } catch (err) {
      setPerImageProgress((p) => ({ ...p, [index]: 0 }));
      console.error("Image upload failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title || "");
      submitFormData.append("subtitle", formData.subtitle || "");
      formData.events?.forEach((event, index) => {
        if (eventImageFiles[index]) {
          submitFormData.append(
            `events[${index}][image]`,
            eventImageFiles[index]
          );
        } else if (event.image && event.image.startsWith("http")) {
          submitFormData.append(`events[${index}][image]`, event.image);
        }
        submitFormData.append(
          `events[${index}][id]`,
          String(event.id || index + 1)
        );
        submitFormData.append(`events[${index}][title]`, event.title || "");
        submitFormData.append(`events[${index}][date]`, event.date || "");
        submitFormData.append(`events[${index}][time]`, event.time || "");
        submitFormData.append(`events[${index}][venue]`, event.venue || "");
        submitFormData.append(
          `events[${index}][location]`,
          event.location || ""
        );
        submitFormData.append(`events[${index}][slug]`, event.slug || "");
        submitFormData.append(
          `events[${index}][description]`,
          event.description || ""
        );
      });
      
      submitFormData.append("isActive", String(formData.isActive ?? true));
      await updateEventsWithMedia(submitFormData);
      setEventImageFiles({});
      fetchEvents();
    } catch (error) {
      console.error("Failed to update events:", error);
    }
  };

  const addEvent = () => {
    const newId =
      formData.events && formData.events.length > 0
        ? Math.max(...formData.events.map((e) => e.id)) + 1
        : 1;
    setFormData({
      ...formData,
      events: [
        ...(formData.events || []),
        {
          id: newId,
          title: "",
          image: "",
          date: "",
          time: "",
          venue: "",
          location: "",
          slug: "",
          description: "",
        },
      ],
    });
  };

  const removeEvent = (index: number) => {
    setFormData({
      ...formData,
      events: formData.events?.filter((_, i) => i !== index) || [],
    });
    const newFiles = { ...eventImageFiles };
    const newPreviews = { ...eventImagePreviews };
    delete newFiles[index];
    delete newPreviews[index];
    setEventImageFiles(newFiles);
    setEventImagePreviews(newPreviews);
  };

  const updateEvent = (
    index: number,
    field: keyof Event,
    value: string | number
  ) => {
    const newEvents = [...(formData.events || [])];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setFormData({ ...formData, events: newEvents });
  };

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-3 gap-1 sm:gap-2 p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-x-auto">
          <TabsTrigger
            value="content"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <MapPin className="w-4 h-4" />
            <span>Events</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="content" className="space-y-6">
            <Card className="border-0 shadow-lg pt-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Section Content</CardTitle>
                    <CardDescription className="text-blue-100">
                      Manage the main title and subtitle for events section
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="active-toggle"
                      className="text-sm text-white"
                    >
                      Active
                    </Label>
                    <Switch
                      id="active-toggle"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, isActive: checked });
                        toggleActive();
                      }}
                      className="data-[state=checked]:bg-green-500"
                    />
                    {formData.isActive ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Section Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Upcoming Events"
                    className="text-base h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-base font-semibold">
                    Section Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="JOIN OUR AVIATION COMMUNITY"
                    className="text-base h-10"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Events List</CardTitle>
                    <CardDescription className="text-green-100">
                      Add and manage individual event items
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addEvent}
                    variant="secondary"
                    size="sm"
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {formData.events?.map((event, index) => (
                  <Collapsible key={index} className="group">
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Left Section - Event Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Event Image Thumbnail */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0 bg-gray-100 dark:bg-gray-700">
                              {eventImagePreviews[index] || event.image ? (
                                <Image
                                  src={eventImagePreviews[index] || event.image}
                                  alt={event.title || "Event"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Event {index + 1}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0"
                                >
                                  ID: {event.id}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                {event.title || "Untitled Event"}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {event.date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {event.date}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Actions */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <CollapsibleTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              type="button"
                              onClick={() => removeEvent(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                              Event Image
                            </Label>
                            <div
                              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                                perImageProgress[index] > 0 &&
                                perImageProgress[index] < 100
                                  ? "border-blue-400 bg-blue-50"
                                  : "border-blue-200 hover:border-blue-400 cursor-pointer bg-white dark:bg-gray-800"
                              }`}
                            >
                              {perImageProgress[index] > 0 &&
                              perImageProgress[index] < 100 ? (
                                <div className="space-y-3">
                                  <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                                  <div>
                                    <p className="text-base font-semibold text-blue-700">
                                      Uploading Image...
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1 font-medium">
                                      {perImageProgress[index]}% Complete
                                    </p>
                                  </div>
                                  <Progress
                                    value={perImageProgress[index]}
                                    className="w-full h-3 bg-blue-100"
                                  />
                                </div>
                              ) : eventImagePreviews[index] ? (
                                <div className="space-y-3">
                                  <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-blue-100 shadow-sm mx-auto max-w-md">
                                    <Image
                                      src={eventImagePreviews[index]}
                                      alt={`Event ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <p className="text-sm text-gray-600 font-medium">
                                    Image Ready
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newFiles = { ...eventImageFiles };
                                      const newPreviews = {
                                        ...eventImagePreviews,
                                      };
                                      delete newFiles[index];
                                      newPreviews[index] = event.image || "";
                                      setEventImageFiles(newFiles);
                                      setEventImagePreviews(newPreviews);
                                    }}
                                    className="border-2 hover:border-blue-400 hover:bg-blue-50"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Change Image
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                </div>
                              )}
                              {!(
                                perImageProgress[index] > 0 &&
                                perImageProgress[index] < 100
                              ) && (
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleEventImageChange(index, e)
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                              Title
                            </Label>
                            <Input
                              value={event.title}
                              onChange={(e) =>
                                updateEvent(index, "title", e.target.value)
                              }
                              placeholder="Event title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                              Description (Optional)
                            </Label>
                            <Textarea
                              value={event.description || ""}
                              onChange={(e) =>
                                updateEvent(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Event description"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date
                              </Label>
                              <Input
                                value={event.date}
                                onChange={(e) =>
                                  updateEvent(index, "date", e.target.value)
                                }
                                placeholder="15 Dec 2024"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time
                              </Label>
                              <Input
                                value={event.time}
                                onChange={(e) =>
                                  updateEvent(index, "time", e.target.value)
                                }
                                placeholder="9:00 am - 5:00 pm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">
                                Venue
                              </Label>
                              <Input
                                value={event.venue}
                                onChange={(e) =>
                                  updateEvent(index, "venue", e.target.value)
                                }
                                placeholder="Personal Wings"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location
                              </Label>
                              <Input
                                value={event.location}
                                onChange={(e) =>
                                  updateEvent(index, "location", e.target.value)
                                }
                                placeholder="Florida"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">
                                Price ($)
                              </Label>
                              <Input
                                type="number"
                                value={event.price || 0}
                                onChange={(e) =>
                                  updateEvent(
                                    index,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="3499"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">
                                Video URL
                              </Label>
                              <Input
                                value={event.videoUrl || ""}
                                onChange={(e) =>
                                  updateEvent(index, "videoUrl", e.target.value)
                                }
                                placeholder="https://youtube.com/..."
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                              URL Slug
                            </Label>
                            <Input
                              value={event.slug}
                              onChange={(e) =>
                                updateEvent(index, "slug", e.target.value)
                              }
                              placeholder="event-slug-url"
                            />
                          </div>

                          {/* Training Content Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Training Content
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].trainingContent) {
                                    updated[index].trainingContent = [];
                                  }
                                  updated[index].trainingContent!.push({
                                    text: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Item
                              </Button>
                            </div>
                            {event.trainingContent?.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <Input
                                  value={item.text}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].trainingContent![
                                      itemIndex
                                    ].text = e.target.value;
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                  placeholder="Training content item"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].trainingContent!.splice(
                                      itemIndex,
                                      1
                                    );
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Learning Points Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Learning Points
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].learningPoints) {
                                    updated[index].learningPoints = [];
                                  }
                                  updated[index].learningPoints!.push({
                                    text: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Point
                              </Button>
                            </div>
                            {event.learningPoints?.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <Input
                                  value={item.text}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].learningPoints![
                                      itemIndex
                                    ].text = e.target.value;
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                  placeholder="Learning point"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].learningPoints!.splice(
                                      itemIndex,
                                      1
                                    );
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* FAQs Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                FAQs
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].faqs) {
                                    updated[index].faqs = [];
                                  }
                                  updated[index].faqs!.push({
                                    question: "",
                                    answer: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add FAQ
                              </Button>
                            </div>
                            {event.faqs?.map((faq, faqIndex) => (
                              <Card key={faqIndex} className="p-4 bg-gray-50">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <Label className="text-sm">Question</Label>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].faqs!.splice(
                                          faqIndex,
                                          1
                                        );
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={faq.question}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(formData.events || []),
                                      ];
                                      updated[index].faqs![faqIndex].question =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        events: updated,
                                      });
                                    }}
                                    placeholder="FAQ question"
                                  />
                                  <Label className="text-sm">Answer</Label>
                                  <Textarea
                                    value={faq.answer}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(formData.events || []),
                                      ];
                                      updated[index].faqs![faqIndex].answer =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        events: updated,
                                      });
                                    }}
                                    placeholder="FAQ answer"
                                    rows={3}
                                  />
                                </div>
                              </Card>
                            ))}
                          </div>

                          {/* Instructors Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Instructors
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].instructors) {
                                    updated[index].instructors = [];
                                  }
                                  updated[index].instructors!.push({
                                    name: "",
                                    title: "",
                                    image: "",
                                    bio: "",
                                    social: {},
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Instructor
                              </Button>
                            </div>
                            {event.instructors?.map(
                              (instructor, instrIndex) => (
                                <Card
                                  key={instrIndex}
                                  className="p-4 bg-gray-50"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <Label className="text-sm font-bold">
                                        Instructor {instrIndex + 1}
                                      </Label>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].instructors!.splice(
                                            instrIndex,
                                            1
                                          );
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                          value={instructor.name}
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            updated[index].instructors![
                                              instrIndex
                                            ].name = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="John Doe"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">Title</Label>
                                        <Input
                                          value={instructor.title}
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            updated[index].instructors![
                                              instrIndex
                                            ].title = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="Chief Instructor"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs">
                                        Image URL
                                      </Label>
                                      <Input
                                        value={instructor.image}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].instructors![
                                            instrIndex
                                          ].image = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="https://..."
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Bio</Label>
                                      <Textarea
                                        value={instructor.bio}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].instructors![
                                            instrIndex
                                          ].bio = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="Brief bio"
                                        rows={2}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs">
                                          Facebook
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.facebook || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.facebook = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">
                                          Twitter
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.twitter || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.twitter = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">
                                          Instagram
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.instagram || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.instagram =
                                              e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">
                                          LinkedIn
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.linkedin || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.linkedin = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )
                            )}
                          </div>

                          {/* Related Events Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Related Events
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].relatedEvents) {
                                    updated[index].relatedEvents = [];
                                  }
                                  updated[index].relatedEvents!.push({
                                    title: "",
                                    image: "",
                                    slug: "",
                                    badge: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Related Event
                              </Button>
                            </div>
                            {event.relatedEvents?.map((related, relIndex) => (
                              <Card key={relIndex} className="p-4 bg-gray-50">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <Label className="text-sm font-bold">
                                      Related Event {relIndex + 1}
                                    </Label>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].relatedEvents!.splice(
                                          relIndex,
                                          1
                                        );
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">Title</Label>
                                      <Input
                                        value={related.title}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].relatedEvents![
                                            relIndex
                                          ].title = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="Event title"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">
                                        Badge (Optional)
                                      </Label>
                                      <Input
                                        value={related.badge || ""}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].relatedEvents![
                                            relIndex
                                          ].badge = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="New Event"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Image URL</Label>
                                    <Input
                                      value={related.image}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].relatedEvents![
                                          relIndex
                                        ].image = e.target.value;
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Slug</Label>
                                    <Input
                                      value={related.slug}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].relatedEvents![
                                          relIndex
                                        ].slug = e.target.value;
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      placeholder="event-slug"
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}

                {(!formData.events || formData.events.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No events added yet</p>
                    <p className="text-sm">
                      Click Add Event to create your first event
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Card className="shadow-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      Uploading...
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl border-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 mt-20">
            <CardContent className="pt-3">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchEvents}
                  className="h-12 px-6 text-base"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Tabs>
    </div>
  );
}
