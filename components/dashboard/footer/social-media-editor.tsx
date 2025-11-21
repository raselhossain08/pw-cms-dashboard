"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFooterStore } from "@/lib/store/footer-store";
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
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { Footer, SocialMediaForm } from "@/types/footer";

const socialMediaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  enabled: z.boolean(),
  links: z.array(
    z.object({
      platform: z.string().min(1, "Platform is required"),
      href: z.string().min(1, "URL is required").url("Must be a valid URL"),
      label: z.string().min(1, "Label is required"),
      icon: z.string().min(1, "Icon is required"),
    })
  ),
});

type SocialMediaFormValues = z.infer<typeof socialMediaSchema>;

interface SocialMediaEditorProps {
  footer: Footer;
}

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: "Facebook" },
  { value: "twitter", label: "Twitter", icon: "Twitter" },
  { value: "instagram", label: "Instagram", icon: "Instagram" },
  { value: "linkedin", label: "LinkedIn", icon: "LinkedIn" },
  { value: "youtube", label: "YouTube", icon: "Youtube" },
  { value: "tiktok", label: "TikTok", icon: "Music" },
  { value: "discord", label: "Discord", icon: "MessageSquare" },
  { value: "github", label: "GitHub", icon: "Github" },
];

export function SocialMediaEditor({ footer }: SocialMediaEditorProps) {
  const { updateSocialMedia, loading } = useFooterStore();

  const form = useForm<SocialMediaFormValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      title: footer.socialMedia?.title || "Follow us on social media",
      enabled: footer.socialMedia?.enabled ?? true,
      links: footer.socialMedia?.links || [],
    },
  });

  const linksArray = useFieldArray({
    control: form.control,
    name: "links",
  });

  const onSubmit = async (data: SocialMediaFormValues) => {
    try {
      toast.loading("Saving social media configuration...", {
        id: "save-social-media",
        description: "Updating your footer's social media settings.",
      });

      await updateSocialMedia(data);

      toast.success("Social media updated successfully! 🎉", {
        id: "save-social-media",
        description: "Your social media links have been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update social media:", error);

      toast.error("Failed to update social media", {
        id: "save-social-media",
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
        title: footer.socialMedia?.title || "Follow us on social media",
        enabled: footer.socialMedia?.enabled ?? true,
        links: footer.socialMedia?.links || [],
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

  const addPlatformLink = (platform: (typeof socialPlatforms)[0]) => {
    linksArray.append({
      platform: platform.value,
      href: "",
      label: `Follow us on ${platform.label}`,
      icon: platform.icon,
    });
  };

  const isDirty = form.formState.isDirty;
  const isEnabled = form.watch("enabled");

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure social media links that appear in your footer. These help
          visitors connect with you on various platforms.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Social Media Settings
              </CardTitle>
              <CardDescription>
                Configure the social media section in your footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Social Media
                      </FormLabel>
                      <FormDescription>
                        Show social media links in footer
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

              {isEnabled && (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Follow us on social media"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The heading text for your social media section
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Social Media Links */}
          {isEnabled && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Social Media Links
                    </CardTitle>
                    <CardDescription>
                      Add links to your social media profiles
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {linksArray.fields.length}{" "}
                    {linksArray.fields.length === 1 ? "link" : "links"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Add Buttons */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Quick Add Popular Platforms:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socialPlatforms.map((platform) => {
                      const exists = linksArray.fields.some(
                        (field) => field.platform === platform.value
                      );

                      return (
                        <Button
                          key={platform.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPlatformLink(platform)}
                          disabled={exists}
                          className="gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          {platform.label}
                          {exists && <span className="text-xs">(Added)</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {linksArray.fields.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">
                      No social media links yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add social media platforms to help visitors connect with
                      you
                    </p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-3">
                    {linksArray.fields.map((field, index) => (
                      <AccordionItem
                        key={field.id}
                        value={`link-${index}`}
                        className="border rounded-lg overflow-hidden bg-card"
                      >
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <span className="text-xs text-primary font-medium">
                                  {form
                                    .watch(`links.${index}.platform`)
                                    ?.charAt(0)
                                    .toUpperCase() || "S"}
                                </span>
                              </div>
                              <div className="text-left">
                                <span className="font-medium capitalize">
                                  {form.watch(`links.${index}.platform`) ||
                                    "Social Link"}
                                </span>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  {form.watch(`links.${index}.href`) ||
                                    "No URL set"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-4 border-t bg-muted/20">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`links.${index}.platform`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">
                                      Platform
                                    </FormLabel>
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
                                name={`links.${index}.icon`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm">
                                      Icon
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Facebook, Twitter, Instagram"
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
                              name={`links.${index}.href`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://facebook.com/yourpage"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`links.${index}.label`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">
                                    Accessibility Label
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Follow us on Facebook"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Screen reader description for accessibility
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              onClick={() => linksArray.remove(index)}
                              variant="outline"
                              className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove Social Link
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}

                {/* Custom Add Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    linksArray.append({
                      platform: "",
                      href: "",
                      label: "",
                      icon: "ExternalLink",
                    })
                  }
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Social Link
                </Button>
              </CardContent>
            </Card>
          )}

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
