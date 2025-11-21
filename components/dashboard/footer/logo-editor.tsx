"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Footer } from "@/types/footer";
import { useFooterStore } from "@/lib/store/footer-store";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Save,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

const logoSchema = z.object({
  src: z.string().min(1, "Logo source is required"),
  alt: z.string().min(1, "Alt text is required"),
  width: z.number().min(1, "Width must be positive"),
  height: z.number().min(1, "Height must be positive"),
});

const descriptionSchema = z.object({
  text: z.string().min(1, "Description text is required"),
  enabled: z.boolean(),
});

type LogoFormData = z.infer<typeof logoSchema>;
type DescriptionFormData = z.infer<typeof descriptionSchema>;

interface FooterLogoEditorProps {
  footer: Footer;
}

export const FooterLogoEditor: React.FC<FooterLogoEditorProps> = ({
  footer,
}) => {
  const { updateLogo, updateDescription, loading } = useFooterStore();
  const [uploadState, setUploadState] = useState({ isUploading: false });

  const logoForm = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    defaultValues: {
      src: footer.logo.src,
      alt: footer.logo.alt,
      width: footer.logo.width,
      height: footer.logo.height,
    },
  });

  const descriptionForm = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      text: footer.description.text,
      enabled: footer.description.enabled,
    },
  });

  const handleImageUpload = async (url: string) => {
    setUploadState({ isUploading: true });

    try {
      // Debug logging to track the exact URL being set
      console.log("🔍 Footer Logo Upload Debug:", {
        receivedUrl: url,
        isFullPath: url.startsWith("/uploads/"),
        isHttpUrl: url.startsWith("http"),
        timestamp: new Date().toISOString(),
        currentFormValue: logoForm.getValues().src,
      });

      logoForm.setValue("src", url, { shouldDirty: true, shouldTouch: true });

      // Verify the form value was set correctly
      const formValueAfterSet = logoForm.getValues().src;
      console.log("✅ Form value set:", {
        originalUrl: url,
        formValue: formValueAfterSet,
        matches: url === formValueAfterSet,
        isDirty: logoForm.formState.isDirty,
      });

      if (url) {
        toast.success("Footer logo uploaded successfully! ✨", {
          description:
            "Your logo is ready to use. Click Save Logo to apply changes.",
          duration: 4000,
        });
        console.log("Storing footer logo URL:", url);
      } else {
        toast.info("Footer logo removed", {
          description: "Logo has been removed from the form.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to process footer logo:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast.error("Failed to process footer logo", {
        description: errorMessage.includes("size")
          ? "File size too large. Please use an image under 2MB."
          : errorMessage.includes("format")
          ? "Invalid file format. Please use PNG, JPG, or WebP."
          : "Please try uploading the image again.",
        duration: 5000,
      });
    } finally {
      setUploadState({ isUploading: false });
    }
  };

  const onLogoSubmit = async (data: LogoFormData) => {
    try {
      // Debug logging for the save process
      console.log("💾 Footer Logo Save Debug:", {
        formData: data,
        srcPath: data.src,
        isValidUploadPath: data.src.startsWith("/uploads/"),
        isHttpUrl: data.src.startsWith("http"),
        timestamp: new Date().toISOString(),
      });

      toast.loading("Saving logo configuration...", {
        id: "save-footer-logo",
        description: "Please wait while we update your footer logo.",
      });

      // Validate the data before sending
      if (!data.src || data.src.trim().length === 0) {
        throw new Error("Logo source is required");
      }

      if (!data.src.startsWith("/uploads/") && !data.src.startsWith("http")) {
        console.warn("⚠️ Logo src might be invalid:", data.src);
        toast("Warning: Logo path might not be valid", {
          description:
            "The logo path doesn't follow the expected format. Proceeding anyway...",
          duration: 3000,
        });
      }

      const result = await updateLogo(data);

      console.log("✅ Logo save completed:", {
        sentData: data,
        success: true,
        timestamp: new Date().toISOString()
      });

      toast.success("Footer logo saved successfully! 🎉", {
        id: "save-footer-logo",
        description: "Your footer logo has been updated and is now live.",
        duration: 4000,
      });

      logoForm.reset(logoForm.getValues());
    } catch (error) {
      console.error("Failed to save footer logo:", error);

      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      toast.error("Failed to save footer logo", {
        id: "save-footer-logo",
        description: errorMessage.includes("Network")
          ? "Please check your internet connection and try again."
          : "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    }
  };

  const onDescriptionSubmit = async (data: DescriptionFormData) => {
    try {
      toast.loading("Saving description...", {
        id: "save-footer-description",
        description: "Please wait while we update your footer description.",
      });

      await updateDescription(data);

      toast.success("Footer description saved successfully! 🎉", {
        id: "save-footer-description",
        description: "Your footer description has been updated.",
        duration: 4000,
      });

      descriptionForm.reset(descriptionForm.getValues());
    } catch (error) {
      console.error("Failed to save footer description:", error);

      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      toast.error("Failed to save footer description", {
        id: "save-footer-description",
        description: errorMessage.includes("Network")
          ? "Please check your internet connection and try again."
          : "Please try again. If the problem persists, contact support.",
        duration: 5000,
      });
    }
  };

  const logoSrc = logoForm.watch("src");
  const altText = logoForm.watch("alt");
  const descriptionEnabled = descriptionForm.watch("enabled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            Logo & Description
          </h3>
          <p className="text-muted-foreground mt-2">
            Configure your footer logo and description text
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <ImageIcon className="h-3 w-3" />
          Brand Identity
        </Badge>
      </div>

      {/* Live Preview */}
      <Card className="bg-linear-to-r from-slate-50 to-gray-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription className="text-slate-700">
            See how your footer logo and description will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-8">
            <div className="space-y-4">
              {/* Logo Preview */}
              <div className="flex items-center justify-center">
                {logoSrc ? (
                  <img
                    src={
                      logoSrc.startsWith("http")
                        ? logoSrc
                        : uploadService.getImageUrl(logoSrc)
                    }
                    alt={altText || "Footer logo preview"}
                    width={logoForm.watch("width")}
                    height={logoForm.watch("height")}
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      const src = e.currentTarget.src;
                      const generatedUrl = uploadService.getImageUrl(logoSrc);

                      console.error("Logo preview load failed:", {
                        originalSrc: logoSrc,
                        generatedUrl,
                        actualSrc: src,
                        isFullUrl: logoSrc.startsWith("http"),
                        timestamp: new Date().toISOString(),
                      });

                      // Hide the image instead of showing broken image
                      e.currentTarget.style.display = "none";

                      // Optional: Show fallback icon
                      const fallback = document.createElement("div");
                      fallback.className = "text-center text-gray-400 p-4";
                      fallback.innerHTML =
                        '<div class="mx-auto mb-2 w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg></div><p class="text-xs">Logo preview unavailable</p>';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.appendChild(fallback);
                      }
                    }}
                    onLoad={(e) => {
                      if (process.env.NODE_ENV === "development") {
                        console.log("Logo preview loaded:", {
                          src: e.currentTarget.src,
                          originalSrc: logoSrc,
                          timestamp: new Date().toISOString(),
                        });
                      }
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Footer Logo</p>
                  </div>
                )}
              </div>

              {/* Description Preview */}
              {descriptionEnabled && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    {descriptionForm.watch("text") ||
                      "Your footer description will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Footer Logo
          </CardTitle>
          <CardDescription>
            Upload and configure your footer logo with dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...logoForm}>
            <form
              onSubmit={logoForm.handleSubmit(onLogoSubmit)}
              className="space-y-4"
            >
              <FormField
                control={logoForm.control}
                name="src"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center gap-2">
                      Logo Image
                      {uploadState.isUploading && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs">Uploading...</span>
                        </div>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ImageUploader
                          onUpload={handleImageUpload}
                          currentImage={field.value}
                          uploadKey="footer-logo"
                          label="Footer Logo"
                          accept="image/*"
                          maxSize={2 * 1024 * 1024} // 2MB for logos
                          folder="footer"
                        />
                        {uploadState.isUploading && (
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

              <FormField
                control={logoForm.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Personal Wings Logo - Aviation Training"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your logo for accessibility and SEO
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={logoForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="140"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={logoForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {uploadState.isUploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing upload...
                    </div>
                  )}
                  {logoForm.formState.isDirty && !uploadState.isUploading && (
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
                    onClick={() => logoForm.reset()}
                    disabled={
                      loading ||
                      !logoForm.formState.isDirty ||
                      uploadState.isUploading
                    }
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !logoForm.formState.isDirty ||
                      uploadState.isUploading
                    }
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
                        Save Logo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      {/* Description Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Footer Description
          </CardTitle>
          <CardDescription>
            Add a description or tagline below your footer logo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...descriptionForm}>
            <form
              onSubmit={descriptionForm.handleSubmit(onDescriptionSubmit)}
              className="space-y-4"
            >
              <FormField
                control={descriptionForm.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show Description
                      </FormLabel>
                      <FormDescription>
                        Display description text below the footer logo
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

              {descriptionEnabled && (
                <FormField
                  control={descriptionForm.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Into flight simulators? Our friends at Pro Desk Sim have multiple aircraft available for you! All links are affiliate links because we can vouch for their customer support and quality!"
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This text will appear below your footer logo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {descriptionForm.formState.isDirty && (
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
                    onClick={() => descriptionForm.reset()}
                    disabled={loading || !descriptionForm.formState.isDirty}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !descriptionForm.formState.isDirty}
                    className="gap-2 min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Description
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
