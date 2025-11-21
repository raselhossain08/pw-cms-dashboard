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
  Folder,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Footer, SectionsForm } from "@/types/footer";

const sectionsSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().min(1, "Section title is required"),
      links: z.array(
        z.object({
          label: z.string().min(1, "Link label is required"),
          href: z.string().min(1, "Link URL is required"),
        })
      ),
    })
  ),
});

type SectionsFormValues = z.infer<typeof sectionsSchema>;

interface SectionsEditorProps {
  footer: Footer;
}

const predefinedSections = [
  {
    title: "LEARNING",
    links: [
      { label: "All Courses", href: "/course" },
      { label: "Lessons", href: "/lesson" },
      { label: "Events", href: "/events" },
      { label: "Subscription", href: "/subscription" },
    ],
  },
  {
    title: "SHOP",
    links: [
      { label: "Browse Shop", href: "/shop" },
      { label: "My Wishlist", href: "/dashboard/wishlist" },
      { label: "Order History", href: "/dashboard/order-history" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "MY ACCOUNT",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile", href: "/dashboard/profile" },
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

export function SectionsEditor({ footer }: SectionsEditorProps) {
  const { updateSections, loading } = useFooterStore();

  const form = useForm<SectionsFormValues>({
    resolver: zodResolver(sectionsSchema),
    defaultValues: {
      sections: footer.sections || [],
    },
  });

  const sectionsArray = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const onSubmit = async (data: SectionsFormValues) => {
    try {
      toast.loading("Saving footer sections...", {
        id: "save-sections",
        description: "Updating your footer navigation sections.",
      });

      await updateSections(data.sections);

      toast.success("Footer sections updated successfully! 🎉", {
        id: "save-sections",
        description: "Your footer navigation has been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update footer sections:", error);

      toast.error("Failed to update footer sections", {
        id: "save-sections",
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
        sections: footer.sections || [],
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

  const addPredefinedSection = (section: (typeof predefinedSections)[0]) => {
    sectionsArray.append(section);
    toast.success(`"${section.title}" section added`, {
      description: `Added with ${section.links.length} links`,
      duration: 3000,
    });
  };

  const addCustomSection = () => {
    sectionsArray.append({
      title: "New Section",
      links: [{ label: "New Link", href: "/" }],
    });
  };

  const addLink = (sectionIndex: number) => {
    const currentLinks = form.getValues(`sections.${sectionIndex}.links`) || [];
    form.setValue(`sections.${sectionIndex}.links`, [
      ...currentLinks,
      { label: "New Link", href: "/" },
    ]);
  };

  const removeLink = (sectionIndex: number, linkIndex: number) => {
    const currentLinks = form.getValues(`sections.${sectionIndex}.links`) || [];
    const updatedLinks = currentLinks.filter((_, i) => i !== linkIndex);
    form.setValue(`sections.${sectionIndex}.links`, updatedLinks);
  };

  const isDirty = form.formState.isDirty;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Create organized sections with navigation links for your footer. These
          help visitors find important pages quickly.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Add Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Quick Add Common Sections
              </CardTitle>
              <CardDescription>
                Add popular footer sections with pre-configured links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predefinedSections.map((section, index) => {
                  const exists = sectionsArray.fields.some(
                    (field) => field.title === section.title
                  );

                  return (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      onClick={() => addPredefinedSection(section)}
                      disabled={exists}
                      className="justify-start gap-3 h-auto p-4"
                    >
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {section.title.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {section.links.length} links
                          {exists && " (Already added)"}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Footer Sections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Footer Sections</CardTitle>
                  <CardDescription>
                    Manage your footer navigation sections and links
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1">
                    <Folder className="h-3 w-3" />
                    {sectionsArray.fields.length} sections
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomSection}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Custom Section
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sectionsArray.fields.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
                  <Folder className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No footer sections yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add sections to organize your footer navigation
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      onClick={addCustomSection}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Add Section
                    </Button>
                  </div>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {sectionsArray.fields.map((field, sectionIndex) => {
                    const sectionLinks =
                      form.watch(`sections.${sectionIndex}.links`) || [];

                    return (
                      <AccordionItem
                        key={field.id}
                        value={`section-${sectionIndex}`}
                        className="border rounded-lg overflow-hidden bg-card"
                      >
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                <span className="text-xs text-primary font-medium">
                                  {form
                                    .watch(`sections.${sectionIndex}.title`)
                                    ?.charAt(0) || "S"}
                                </span>
                              </div>
                              <div className="text-left">
                                <span className="font-medium">
                                  {form.watch(
                                    `sections.${sectionIndex}.title`
                                  ) || "Section"}
                                </span>
                                <div className="text-sm text-muted-foreground">
                                  {sectionLinks.length}{" "}
                                  {sectionLinks.length === 1 ? "link" : "links"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-4 border-t bg-muted/20">
                          <div className="space-y-4">
                            {/* Section Title */}
                            <FormField
                              control={form.control}
                              name={`sections.${sectionIndex}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">
                                    Section Title
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="LEARNING, SHOP, COMPANY..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Separator />

                            {/* Section Links */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  Links
                                </Label>
                                <Button
                                  type="button"
                                  onClick={() => addLink(sectionIndex)}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Link
                                </Button>
                              </div>

                              {sectionLinks.length === 0 ? (
                                <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                  <p className="text-sm text-muted-foreground">
                                    No links in this section
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {sectionLinks.map((_, linkIndex) => (
                                    <div
                                      key={linkIndex}
                                      className="flex items-start gap-3 p-3 border rounded-lg bg-background group"
                                    >
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FormField
                                          control={form.control}
                                          name={`sections.${sectionIndex}.links.${linkIndex}.label`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs">
                                                Link Text
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  placeholder="All Courses"
                                                  className="h-8"
                                                  {...field}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`sections.${sectionIndex}.links.${linkIndex}.href`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs">
                                                URL
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  placeholder="/course"
                                                  className="h-8 font-mono text-sm"
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
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          removeLink(sectionIndex, linkIndex)
                                        }
                                        className="h-8 w-8 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity mt-6"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button
                              type="button"
                              onClick={() => sectionsArray.remove(sectionIndex)}
                              variant="outline"
                              className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Section
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>

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

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
