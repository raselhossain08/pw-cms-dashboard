"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFooterStore } from "@/lib/store/footer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Save, RotateCcw, Info, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import type { Footer, NewsletterForm } from "@/types/footer";

const newsletterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  placeholder: z.string().min(1, "Placeholder text is required"),
  buttonText: z.string().min(1, "Button text is required"),
  enabled: z.boolean(),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

interface NewsletterEditorProps {
  footer: Footer;
}

export function NewsletterEditor({ footer }: NewsletterEditorProps) {
  const { updateNewsletter, loading } = useFooterStore();

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      title: footer.newsletter?.title || "GET IN TOUCH",
      description:
        footer.newsletter?.description || "We don't send spam so don't worry.",
      placeholder: footer.newsletter?.placeholder || "Email...",
      buttonText: footer.newsletter?.buttonText || "Subscribe",
      enabled: footer.newsletter?.enabled ?? true,
    },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    try {
      toast.loading("Saving newsletter configuration...", {
        id: "save-newsletter",
        description: "Updating your footer newsletter settings.",
      });

      await updateNewsletter(data);

      toast.success("Newsletter section updated successfully! 🎉", {
        id: "save-newsletter",
        description:
          "Your newsletter configuration has been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update newsletter:", error);

      toast.error("Failed to update newsletter", {
        id: "save-newsletter",
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
        title: footer.newsletter?.title || "GET IN TOUCH",
        description:
          footer.newsletter?.description ||
          "We don't send spam so don't worry.",
        placeholder: footer.newsletter?.placeholder || "Email...",
        buttonText: footer.newsletter?.buttonText || "Subscribe",
        enabled: footer.newsletter?.enabled ?? true,
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
          Configure the newsletter subscription section in your footer. This
          helps you collect email addresses from visitors interested in your
          updates.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Newsletter Settings
              </CardTitle>
              <CardDescription>
                Configure the newsletter subscription section
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
                        Enable Newsletter Section
                      </FormLabel>
                      <FormDescription>
                        Show newsletter subscription in footer
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
                <>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="GET IN TOUCH" {...field} />
                        </FormControl>
                        <FormDescription>
                          The heading for your newsletter section
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="We don't send spam so don't worry."
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Reassuring message to encourage subscriptions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="placeholder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Placeholder</FormLabel>
                          <FormControl>
                            <Input placeholder="Email..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Placeholder text for email input
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buttonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Subscribe" {...field} />
                          </FormControl>
                          <FormDescription>
                            Text for the subscribe button
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {isEnabled && (
            <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Send className="h-5 w-5" />
                  Newsletter Preview
                </CardTitle>
                <CardDescription className="text-blue-700">
                  See how your newsletter section will appear to visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border-2 border-blue-200 bg-white p-6">
                  <div className="max-w-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {form.watch("title") || "GET IN TOUCH"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {form.watch("description") ||
                        "We don't send spam so don't worry."}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder={form.watch("placeholder") || "Email..."}
                        className="flex-1"
                        disabled
                      />
                      <Button type="button" className="gap-2" disabled>
                        <Send className="h-4 w-4" />
                        {form.watch("buttonText") || "Subscribe"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Newsletter Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  Keep your title concise and action-oriented
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  Use reassuring description to build trust (mention no spam)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  Make the button text compelling (Subscribe, Join, Get Updates)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  Consider offering an incentive (discount, free resource)
                </li>
              </ul>
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
