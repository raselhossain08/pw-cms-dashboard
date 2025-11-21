"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/types/header";
import { useHeaderStore } from "@/lib/store/header-store";
import { ImageUploader } from "@/components/shared/image-uploader";
import { uploadService } from "@/lib/api/upload-service";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Save,
  Image as ImageIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";

const logoSchema = z.object({
  dark: z.string().min(1, "Dark logo is required"),
  light: z.string().min(1, "Light logo is required"),
  alt: z.string().min(1, "Alt text is required"),
});

type LogoFormData = z.infer<typeof logoSchema>;

interface LogoEditorProps {
  header: Header;
}

export const LogoEditor: React.FC<LogoEditorProps> = ({ header }) => {
  const { updateLogo, loading } = useHeaderStore();
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [uploadStates, setUploadStates] = useState<{
    light: { isUploading: boolean };
    dark: { isUploading: boolean };
  }>({
    light: { isUploading: false },
    dark: { isUploading: false },
  });

  const form = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    defaultValues: {
      dark: header.logo.dark,
      light: header.logo.light,
      alt: header.logo.alt,
    },
  });

  const handleImageUpload = async (type: "dark" | "light", url: string) => {
    // Set uploading state when upload starts
    setUploadStates((prev) => ({
      ...prev,
      [type]: { isUploading: true },
    }));

    try {
      // Store the exact URL returned from the backend and mark form as dirty
      form.setValue(type, url, { shouldDirty: true, shouldTouch: true });

      if (url) {
        // Success notification with upload complete
        toast.success(
          `${
            type === "dark" ? "Dark" : "Light"
          } logo uploaded successfully! ✨`,
          {
            description:
              "Your logo is now ready to use. Click Save Configuration to apply changes.",
            duration: 4000,
          }
        );

        // Log the exact URL being stored
        console.log(
          `Storing ${type} logo URL:`,
          url,
          "Form isDirty:",
          form.formState.isDirty
        );
      } else {
        // Remove notification
        toast.info(`${type === "dark" ? "Dark" : "Light"} logo removed`, {
          description: "Logo has been removed from the form.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error(`Failed to process ${type} logo:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast.error(
        `Failed to process ${type === "dark" ? "dark" : "light"} logo`,
        {
          description: errorMessage.includes("size")
            ? "File size too large. Please use an image under 2MB."
            : errorMessage.includes("format")
            ? "Invalid file format. Please use PNG, JPG, or WebP."
            : "Please try uploading the image again.",
          duration: 5000,
        }
      );
    } finally {
      // Reset uploading state
      setUploadStates((prev) => ({
        ...prev,
        [type]: { isUploading: false },
      }));
    }
  };

  const onSubmit = async (data: LogoFormData) => {
    try {
      // Show loading toast
      toast.loading("Saving logo configuration...", {
        id: "save-logo",
        description: "Please wait while we update your settings.",
      });

      await updateLogo(data);

      // Success notification
      toast.success("Logo configuration saved successfully! 🎉", {
        id: "save-logo",
        description: "Your logo settings have been updated and are now live.",
        duration: 4000,
      });

      // Reset form dirty state after successful save
      form.reset(form.getValues());
    } catch (error) {
      console.error("Failed to save logo configuration:", error);

      // Error notification with more specific error message
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      toast.error("Failed to save logo configuration", {
        id: "save-logo",
        description: errorMessage.includes("Network")
          ? "Please check your internet connection and try again."
          : "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    }
  };

  const darkLogo = form.watch("dark");
  const lightLogo = form.watch("light");
  const altText = form.watch("alt");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Logo Configuration
          </h3>
          <p className="text-muted-foreground mt-2">
            Upload and configure your website logos for both light and dark
            themes
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <ImageIcon className="h-3 w-3" />
          Brand Identity
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Live Preview */}
          <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription className="text-blue-700">
                See how your logos will appear in different themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={previewMode === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("light")}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Light Theme
                  </Button>
                  <Button
                    type="button"
                    variant={previewMode === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("dark")}
                    className="gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    Dark Theme
                  </Button>
                </div>

                <div
                  className={`rounded-xl border-2 p-8 transition-all duration-300 ${
                    previewMode === "light"
                      ? "bg-white border-gray-200"
                      : "bg-gray-900 border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Logo Preview */}
                      <div className="flex items-center justify-center w-32 h-12">
                        {previewMode === "light" ? (
                          lightLogo ? (
                            <img
                              src={
                                lightLogo.startsWith("http")
                                  ? lightLogo
                                  : uploadService.getImageUrl(lightLogo)
                              }
                              alt={altText}
                              className="max-h-8 max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="text-center text-gray-400">
                              <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                              <p className="text-xs">Light Logo</p>
                            </div>
                          )
                        ) : darkLogo ? (
                          <img
                            src={
                              darkLogo.startsWith("http")
                                ? darkLogo
                                : uploadService.getImageUrl(darkLogo)
                            }
                            alt={altText}
                            className="max-h-8 max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                            <p className="text-xs">Dark Logo</p>
                          </div>
                        )}
                      </div>

                      {/* Navigation Preview */}
                      <div
                        className={`text-sm font-medium ${
                          previewMode === "light"
                            ? "text-gray-600"
                            : "text-gray-300"
                        }`}
                      >
                        Navigation Menu
                      </div>
                    </div>

                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        previewMode === "light"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-blue-900 text-blue-200"
                      }`}
                    >
                      Preview
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    Light Logo: {lightLogo ? "✓ Uploaded" : "✗ Missing"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dark Logo: {darkLogo ? "✓ Uploaded" : "✗ Missing"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Light Logo Upload */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  Light Theme Logo
                </CardTitle>
                <CardDescription>
                  Logo for light backgrounds. Recommended: PNG with transparent
                  background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="light"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        Logo Image
                        {uploadStates.light.isUploading && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">Uploading...</span>
                          </div>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ImageUploader
                            onUpload={(url) => {
                              console.log("Light logo upload result:", url);
                              handleImageUpload("light", url);
                            }}
                            currentImage={field.value}
                            uploadKey="light-logo"
                            label="Light Theme Logo"
                            accept="image/*"
                            maxSize={2 * 1024 * 1024} // 2MB for logos
                          />
                          {uploadStates.light.isUploading && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                                <p className="text-sm text-gray-600">
                                  Processing logo...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dark Logo Upload */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                  Dark Theme Logo
                </CardTitle>
                <CardDescription>
                  Logo for dark backgrounds. Usually a light-colored version of
                  your logo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        Logo Image
                        {uploadStates.dark.isUploading && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">Uploading...</span>
                          </div>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ImageUploader
                            onUpload={(url) => {
                              console.log("Dark logo upload result:", url);
                              handleImageUpload("dark", url);
                            }}
                            currentImage={field.value}
                            uploadKey="dark-logo"
                            label="Dark Theme Logo"
                            accept="image/*"
                            maxSize={2 * 1024 * 1024} // 2MB for logos
                          />
                          {uploadStates.dark.isUploading && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                                <p className="text-sm text-gray-600">
                                  Processing logo...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Alt Text and Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Accessibility Settings
                </CardTitle>
                <CardDescription>
                  Configure text alternatives for screen readers and SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Alt Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your logo for accessibility and SEO (e.g., 'Aviation Academy - Flight Training Courses')"
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This text is read by screen readers and displayed if
                        images fail to load
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                {(uploadStates.light.isUploading ||
                  uploadStates.dark.isUploading) && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing upload...
                  </div>
                )}
                {form.formState.isDirty &&
                  !uploadStates.light.isUploading &&
                  !uploadStates.dark.isUploading && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      You have unsaved changes
                    </div>
                  )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={
                    loading ||
                    !form.formState.isDirty ||
                    uploadStates.light.isUploading ||
                    uploadStates.dark.isUploading
                  }
                >
                  Reset Changes
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !form.formState.isDirty ||
                    uploadStates.light.isUploading ||
                    uploadStates.dark.isUploading
                  }
                  className="gap-2 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : uploadStates.light.isUploading ||
                    uploadStates.dark.isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
