"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useHeaderStore } from "@/lib/store/header-store";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { Header } from "@/types/header";

const themeSchema = z.object({
  enabled: z.boolean(),
  defaultTheme: z.enum(["light", "dark", "system"]),
});

type ThemeFormValues = z.infer<typeof themeSchema>;

interface ThemeEditorProps {
  header: Header;
}

export function ThemeEditor({ header }: ThemeEditorProps) {
  const { updateActiveHeader, loading } = useHeaderStore();

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      enabled: header.theme?.enabled ?? true,
      defaultTheme: header.theme?.defaultTheme ?? "light",
    },
  });

  const onSubmit = async (data: ThemeFormValues) => {
    try {
      toast.loading("Saving theme settings...", {
        id: "save-theme",
        description: "Updating your website theme configuration.",
      });

      await updateActiveHeader({ theme: data });

      toast.success("Theme settings updated successfully! 🎉", {
        id: "save-theme",
        description: "Your theme preferences have been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update theme settings:", error);

      toast.error("Failed to update theme settings", {
        id: "save-theme",
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
        enabled: header.theme?.enabled ?? true,
        defaultTheme: header.theme?.defaultTheme ?? "light",
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
  const isEnabled = form.watch("enabled");

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure theme settings for your website. Users can switch between
          light, dark, and system themes.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Theme Toggle Card */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Toggle</CardTitle>
              <CardDescription>
                Enable or disable theme switching functionality
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
                        Enable Theme Switcher
                      </FormLabel>
                      <FormDescription>
                        Allow users to switch between light and dark themes
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

          {/* Default Theme Card */}
          <Card>
            <CardHeader>
              <CardTitle>Default Theme</CardTitle>
              <CardDescription>
                Select the default theme for new visitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="defaultTheme"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        disabled={!isEnabled}
                      >
                        {/* Light Theme */}
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <RadioGroupItem
                                value="light"
                                id="light"
                                className="peer sr-only"
                              />
                              <label
                                htmlFor="light"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer p-6 transition-all"
                              >
                                <Sun className="mb-3 h-8 w-8 text-yellow-500" />
                                <div className="text-center">
                                  <div className="font-semibold mb-1">
                                    Light
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Bright and clean
                                  </div>
                                </div>
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>

                        {/* Dark Theme */}
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <RadioGroupItem
                                value="dark"
                                id="dark"
                                className="peer sr-only"
                              />
                              <label
                                htmlFor="dark"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-slate-950 text-white hover:bg-slate-900 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer p-6 transition-all"
                              >
                                <Moon className="mb-3 h-8 w-8 text-blue-400" />
                                <div className="text-center">
                                  <div className="font-semibold mb-1">Dark</div>
                                  <div className="text-sm text-slate-400">
                                    Easy on the eyes
                                  </div>
                                </div>
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>

                        {/* System Theme */}
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <RadioGroupItem
                                value="system"
                                id="system"
                                className="peer sr-only"
                              />
                              <label
                                htmlFor="system"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-linear-to-br from-white to-slate-950 hover:opacity-90 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer p-6 transition-all"
                              >
                                <Monitor className="mb-3 h-8 w-8 text-slate-600" />
                                <div className="text-center">
                                  <div className="font-semibold mb-1 text-slate-700">
                                    System
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    Follow device
                                  </div>
                                </div>
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Light Preview */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Light Theme</div>
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 rounded bg-slate-200" />
                      <div className="h-2 w-1/2 rounded bg-slate-200" />
                      <div className="h-2 w-2/3 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Dark Preview */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Dark Theme</div>
                  <div className="rounded-lg border bg-slate-950 p-4 shadow-sm">
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 rounded bg-slate-800" />
                      <div className="h-2 w-1/2 rounded bg-slate-800" />
                      <div className="h-2 w-2/3 rounded bg-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
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
