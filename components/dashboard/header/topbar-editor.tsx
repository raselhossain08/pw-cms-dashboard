"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHeaderStore } from "@/lib/store/header-store";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  Save,
  RotateCcw,
  Info,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Globe,
  DollarSign,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import type { Header } from "@/types/header";

const topBarSchema = z.object({
  enabled: z.boolean(),
  backgroundColor: z.string().min(1, "Background color is required"),
  textColor: z.string().min(1, "Text color is required"),
  socialStats: z.object({
    enabled: z.boolean(),
    items: z.array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        count: z.string().min(1, "Count/text is required"),
        label: z.string().min(1, "Label is required"),
        href: z.string().min(1, "Link is required"),
      })
    ),
  }),
  news: z.object({
    enabled: z.boolean(),
    badge: z.string().min(1, "Badge is required"),
    text: z.string().min(1, "Text is required"),
    icon: z.string().optional(),
    link: z.string().optional(),
  }),
  socialLinks: z.object({
    enabled: z.boolean(),
    items: z.array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        href: z.string().min(1, "URL is required").url("Must be a valid URL"),
      })
    ),
  }),
  language: z.object({
    enabled: z.boolean(),
    defaultLanguage: z.string().min(1, "Default language is required"),
    languages: z.array(
      z.object({
        code: z.string().min(1, "Language code is required"),
        name: z.string().min(1, "Language name is required"),
        flag: z
          .string()
          .min(1, "Flag URL is required")
          .url("Must be a valid URL"),
      })
    ),
  }),
  currency: z.object({
    enabled: z.boolean(),
    defaultCurrency: z.string().min(1, "Default currency is required"),
    currencies: z.array(
      z.object({
        code: z.string().min(1, "Currency code is required"),
        name: z.string().min(1, "Currency name is required"),
      })
    ),
  }),
  mobile: z.object({
    expandable: z.boolean(),
    showSocialStats: z.boolean(),
    showSocialLinks: z.boolean(),
  }),
});

type TopBarFormValues = z.infer<typeof topBarSchema>;

interface TopBarEditorProps {
  header: Header;
}

export function TopBarEditor({ header }: TopBarEditorProps) {
  const { updateTopBar, loading } = useHeaderStore();
  const [expandedSection, setExpandedSection] = useState<string>("general");

  const form = useForm<TopBarFormValues>({
    resolver: zodResolver(topBarSchema),
    defaultValues: {
      enabled: header.topBar?.enabled ?? true,
      backgroundColor: header.topBar?.backgroundColor ?? "bg-primary2",
      textColor: header.topBar?.textColor ?? "text-white",
      socialStats: header.topBar?.socialStats || {
        enabled: true,
        items: [],
      },
      news: header.topBar?.news || {
        enabled: true,
        badge: "Hot",
        text: "",
        icon: "",
        link: "",
      },
      socialLinks: header.topBar?.socialLinks || {
        enabled: true,
        items: [],
      },
      language: header.topBar?.language || {
        enabled: true,
        defaultLanguage: "en",
        languages: [],
      },
      currency: header.topBar?.currency || {
        enabled: true,
        defaultCurrency: "USD",
        currencies: [],
      },
      mobile: header.topBar?.mobile || {
        expandable: true,
        showSocialStats: true,
        showSocialLinks: true,
      },
    },
  });

  const socialStatsArray = useFieldArray({
    control: form.control,
    name: "socialStats.items",
  });

  const socialLinksArray = useFieldArray({
    control: form.control,
    name: "socialLinks.items",
  });

  const languagesArray = useFieldArray({
    control: form.control,
    name: "language.languages",
  });

  const currenciesArray = useFieldArray({
    control: form.control,
    name: "currency.currencies",
  });

  const onSubmit = async (data: TopBarFormValues) => {
    try {
      toast.loading("Saving top bar configuration...", {
        id: "save-topbar",
        description: "Updating your website's top bar settings.",
      });

      await updateTopBar(data);

      toast.success("Top bar updated successfully! 🎉", {
        id: "save-topbar",
        description: "Your top bar configuration has been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update top bar:", error);

      toast.error("Failed to update top bar", {
        id: "save-topbar",
        description:
          error?.message ||
          "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    }
  };

  const handleReset = () => {
    try {
      form.reset({
        enabled: header.topBar?.enabled ?? true,
        backgroundColor: header.topBar?.backgroundColor ?? "bg-primary2",
        textColor: header.topBar?.textColor ?? "text-white",
        socialStats: header.topBar?.socialStats || {
          enabled: true,
          items: [],
        },
        news: header.topBar?.news || {
          enabled: true,
          badge: "Hot",
          text: "",
          icon: "",
          link: "",
        },
        socialLinks: header.topBar?.socialLinks || {
          enabled: true,
          items: [],
        },
        language: header.topBar?.language || {
          enabled: true,
          defaultLanguage: "en",
          languages: [],
        },
        currency: header.topBar?.currency || {
          enabled: true,
          defaultCurrency: "USD",
          currencies: [],
        },
        mobile: header.topBar?.mobile || {
          expandable: true,
          showSocialStats: true,
          showSocialLinks: true,
        },
      });
      toast.info("Changes discarded", {
        description: "Form has been reset to saved values.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to reset changes", {
        description: "Please refresh the page to start over.",
        duration: 4000,
      });
    }
  };

  const isDirty = form.formState.isDirty;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure the top bar that appears above the main navigation. Includes
          contact info, news banner, social links, language and currency
          selectors.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Enable/disable top bar and configure colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Top Bar
                      </FormLabel>
                      <FormDescription>
                        Show the top bar on your website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            placeholder="#000000"
                            {...field}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            placeholder="#ffffff"
                            {...field}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accordion Sections */}
          <Accordion
            type="single"
            collapsible
            value={expandedSection}
            onValueChange={setExpandedSection}
            className="space-y-4"
          >
            {/* Social Stats Section */}
            <AccordionItem value="social-stats" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Contact Information</div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch("socialStats.enabled")
                        ? `${socialStatsArray.fields.length} items`
                        : "Disabled"}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="socialStats.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Contact Info
                          </FormLabel>
                          <FormDescription>
                            Display phone, email, location in top bar
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {socialStatsArray.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid gap-4 flex-1">
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`socialStats.items.${index}.platform`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Platform</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="phone, email, location"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`socialStats.items.${index}.label`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Label</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Call Us"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`socialStats.items.${index}.count`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Text / Value</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="+1 (555) 123-4567"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`socialStats.items.${index}.href`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="tel:+15551234567"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => socialStatsArray.remove(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      socialStatsArray.append({
                        platform: "phone",
                        count: "",
                        label: "",
                        href: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* News Banner Section */}
            <AccordionItem value="news" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">News Banner</div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch("news.enabled") ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="news.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show News Banner
                          </FormLabel>
                          <FormDescription>
                            Display promotional news in top bar
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="news.badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Hot, New, Sale" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="news.icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon (Optional)</FormLabel>
                          <FormControl>
                            <ImageUploader
                              onUpload={(url) => {
                                field.onChange(url);
                                form.trigger("news.icon");
                              }}
                              currentImage={field.value}
                              uploadKey="news-icon"
                              label="Upload News Icon"
                              accept="image/*"
                              maxSize={1 * 1024 * 1024} // 1MB for icons
                              folder="header"
                            />
                          </FormControl>
                          <FormDescription>
                            Upload an icon for the news banner (emoji or small
                            image)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="news.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>News Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Intro price. Get Personal Wings for Big Sale -95% off."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="news.link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="/subscription" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social Links Section */}
            <AccordionItem value="social-links" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Social Media Links</div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch("socialLinks.enabled")
                        ? `${socialLinksArray.fields.length} links`
                        : "Disabled"}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Social Links
                          </FormLabel>
                          <FormDescription>
                            Display social media icons in top bar
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {socialLinksArray.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-l-purple-500"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="grid gap-4 flex-1 grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`socialLinks.items.${index}.platform`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Platform</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="facebook, twitter, instagram"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`socialLinks.items.${index}.href`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://facebook.com/..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => socialLinksArray.remove(index)}
                            className="text-destructive hover:text-destructive mt-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      socialLinksArray.append({
                        platform: "",
                        href: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Social Link
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Language Section */}
            <AccordionItem value="language" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Language Selector</div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch("language.enabled")
                        ? `${languagesArray.fields.length} languages`
                        : "Disabled"}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="language.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Language Selector
                          </FormLabel>
                          <FormDescription>
                            Allow users to switch languages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language.defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Language Code</FormLabel>
                        <FormControl>
                          <Input placeholder="en" {...field} />
                        </FormControl>
                        <FormDescription>
                          Two-letter language code (en, es, fr, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {languagesArray.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="grid gap-4 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`language.languages.${index}.code`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="en" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`language.languages.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="English" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`language.languages.${index}.flag`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Flag Icon URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://cdn-icons-png.flaticon.com/..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => languagesArray.remove(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      languagesArray.append({
                        code: "",
                        name: "",
                        flag: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Language
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Currency Section */}
            <AccordionItem value="currency" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Currency Selector</div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch("currency.enabled")
                        ? `${currenciesArray.fields.length} currencies`
                        : "Disabled"}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="currency.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Currency Selector
                          </FormLabel>
                          <FormDescription>
                            Allow users to switch currencies
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency.defaultCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency Code</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} />
                        </FormControl>
                        <FormDescription>
                          Three-letter currency code (USD, EUR, GBP, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {currenciesArray.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="grid gap-4 flex-1 grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`currency.currencies.${index}.code`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="USD" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`currency.currencies.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="US Dollar" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => currenciesArray.remove(index)}
                            className="text-destructive hover:text-destructive mt-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      currenciesArray.append({
                        code: "",
                        name: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Currency
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Mobile Settings Section */}
            <AccordionItem value="mobile" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-pink-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Mobile Settings</div>
                    <div className="text-sm text-muted-foreground">
                      Display options for mobile devices
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="mobile.expandable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Expandable on Mobile
                          </FormLabel>
                          <FormDescription>
                            Allow top bar to expand/collapse on mobile
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile.showSocialStats"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Contact Info on Mobile
                          </FormLabel>
                          <FormDescription>
                            Display contact information on mobile devices
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile.showSocialLinks"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Social Links on Mobile
                          </FormLabel>
                          <FormDescription>
                            Display social media links on mobile devices
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!isDirty || loading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Changes
            </Button>

            <Button
              type="submit"
              disabled={!isDirty || loading}
              className="gap-2 min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
