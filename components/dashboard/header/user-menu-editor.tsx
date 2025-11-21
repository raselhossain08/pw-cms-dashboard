"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useHeaderStore } from "@/lib/store/header-store";
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
  User,
  Settings,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Header } from "@/types/header";

const userMenuSchema = z.object({
  profile: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    avatar: z.string().url("Must be a valid URL").or(z.literal("")),
    avatarFallback: z
      .string()
      .min(1, "Avatar fallback is required")
      .max(2, "Max 2 characters"),
    profileLink: z.string().min(1, "Profile link is required"),
  }),
  isLoggedIn: z.boolean(),
  menuItems: z.array(
    z.object({
      icon: z.string().min(1, "Icon is required"),
      text: z.string().min(1, "Text is required"),
      href: z.string().min(1, "Link is required"),
      description: z.string().min(1, "Description is required"),
    })
  ),
  supportLinks: z.array(
    z.object({
      icon: z.string().min(1, "Icon is required"),
      text: z.string().min(1, "Text is required"),
      href: z.string().min(1, "Link is required"),
    })
  ),
  settingsLinks: z.array(
    z.object({
      icon: z.string().min(1, "Icon is required"),
      text: z.string().min(1, "Text is required"),
      href: z.string().min(1, "Link is required"),
    })
  ),
});

type UserMenuFormValues = z.infer<typeof userMenuSchema>;

interface UserMenuEditorProps {
  header: Header;
}

export function UserMenuEditor({ header }: UserMenuEditorProps) {
  const { updateUserMenu, loading } = useHeaderStore();
  const [expandedSection, setExpandedSection] = useState<string>("profile");

  const form = useForm<UserMenuFormValues>({
    resolver: zodResolver(userMenuSchema),
    defaultValues: {
      profile: header.userMenu?.profile || {
        name: "",
        email: "",
        avatar: "",
        avatarFallback: "",
        profileLink: "",
      },
      isLoggedIn: header.userMenu?.isLoggedIn ?? true,
      menuItems: header.userMenu?.menuItems || [],
      supportLinks: header.userMenu?.supportLinks || [],
      settingsLinks: header.userMenu?.settingsLinks || [],
    },
  });

  const menuItemsArray = useFieldArray({
    control: form.control,
    name: "menuItems",
  });

  const supportLinksArray = useFieldArray({
    control: form.control,
    name: "supportLinks",
  });

  const settingsLinksArray = useFieldArray({
    control: form.control,
    name: "settingsLinks",
  });

  const onSubmit = async (data: UserMenuFormValues) => {
    try {
      toast.loading("Saving user menu configuration...", {
        id: "save-user-menu",
        description: "Updating your website's user menu settings.",
      });

      await updateUserMenu(data);

      toast.success("User menu updated successfully! 🎉", {
        id: "save-user-menu",
        description: "Your user menu configuration has been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update user menu:", error);

      toast.error("Failed to update user menu", {
        id: "save-user-menu",
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
        profile: header.userMenu?.profile || {
          name: "",
          email: "",
          avatar: "",
          avatarFallback: "",
          profileLink: "",
        },
        isLoggedIn: header.userMenu?.isLoggedIn ?? true,
        menuItems: header.userMenu?.menuItems || [],
        supportLinks: header.userMenu?.supportLinks || [],
        settingsLinks: header.userMenu?.settingsLinks || [],
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
          Configure the user menu that appears when logged in. Includes profile
          information, menu items, support links, and settings.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Login Status */}
          <Card>
            <CardHeader>
              <CardTitle>Login Status</CardTitle>
              <CardDescription>
                Toggle user logged-in state for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isLoggedIn"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        User Logged In
                      </FormLabel>
                      <FormDescription>
                        Enable to show user menu in logged-in state
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
            {/* Profile Section */}
            <AccordionItem value="profile" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">User Profile</div>
                    <div className="text-sm text-muted-foreground">
                      Name, email, avatar settings
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="profile.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profile.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profile.avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/avatar.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Full URL to the user's avatar image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profile.avatarFallback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar Fallback</FormLabel>
                          <FormControl>
                            <Input placeholder="JD" maxLength={2} {...field} />
                          </FormControl>
                          <FormDescription>
                            2 character initials
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.profileLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Link</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/dashboard/profile"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Menu Items Section */}
            <AccordionItem value="menu-items" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Menu Items</div>
                    <div className="text-sm text-muted-foreground">
                      {menuItemsArray.fields.length} items
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  {menuItemsArray.fields.map((field, index) => (
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
                                  name={`menuItems.${index}.icon`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Icon</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Home" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`menuItems.${index}.text`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Text</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="My Dashboard"
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
                                name={`menuItems.${index}.href`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="/dashboard"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`menuItems.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="View your overview"
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
                              onClick={() => menuItemsArray.remove(index)}
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
                      menuItemsArray.append({
                        icon: "Home",
                        text: "",
                        href: "",
                        description: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Menu Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Support Links Section */}
            <AccordionItem value="support-links" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Support Links</div>
                    <div className="text-sm text-muted-foreground">
                      {supportLinksArray.fields.length} links
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  {supportLinksArray.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid gap-4 flex-1 grid-cols-3">
                              <FormField
                                control={form.control}
                                name={`supportLinks.${index}.icon`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="BookOpen"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`supportLinks.${index}.text`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Text</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Help & Support"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`supportLinks.${index}.href`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl>
                                      <Input placeholder="/faqs" {...field} />
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
                              onClick={() => supportLinksArray.remove(index)}
                              className="text-destructive hover:text-destructive mt-8"
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
                      supportLinksArray.append({
                        icon: "BookOpen",
                        text: "",
                        href: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Support Link
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Settings Links Section */}
            <AccordionItem value="settings-links" className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Settings Links</div>
                    <div className="text-sm text-muted-foreground">
                      {settingsLinksArray.fields.length} links
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-4">
                  {settingsLinksArray.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-l-purple-500"
                    >
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid gap-4 flex-1 grid-cols-3">
                              <FormField
                                control={form.control}
                                name={`settingsLinks.${index}.icon`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Settings"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`settingsLinks.${index}.text`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Text</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Settings"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`settingsLinks.${index}.href`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="/dashboard/settings"
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
                              onClick={() => settingsLinksArray.remove(index)}
                              className="text-destructive hover:text-destructive mt-8"
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
                      settingsLinksArray.append({
                        icon: "Settings",
                        text: "",
                        href: "",
                      })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Settings Link
                  </Button>
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
