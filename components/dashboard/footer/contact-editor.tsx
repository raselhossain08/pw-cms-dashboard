"use client";

import React from "react";
import { useForm } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  RotateCcw,
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import type { Footer, ContactForm } from "@/types/footer";

const contactSchema = z.object({
  phone: z.object({
    number: z.string().min(1, "Phone number is required"),
    display: z.string().min(1, "Display format is required"),
    enabled: z.boolean(),
  }),
  email: z.object({
    address: z.string().email("Valid email address is required"),
    enabled: z.boolean(),
  }),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP code is required"),
    enabled: z.boolean(),
  }),
  hours: z.object({
    weekday: z.string().min(1, "Weekday hours are required"),
    weekend: z.string().min(1, "Weekend hours are required"),
    enabled: z.boolean(),
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactEditorProps {
  footer: Footer;
}

export function ContactEditor({ footer }: ContactEditorProps) {
  const { updateContact, loading } = useFooterStore();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: {
        number: footer.contact?.phone?.number || "+1234567890",
        display: footer.contact?.phone?.display || "+1 (234) 567-890",
        enabled: footer.contact?.phone?.enabled ?? true,
      },
      email: {
        address: footer.contact?.email?.address || "info@personalwings.com",
        enabled: footer.contact?.email?.enabled ?? true,
      },
      address: {
        street:
          footer.contact?.address?.street || "123 Aviation Way, Suite 100",
        city: footer.contact?.address?.city || "Sky Harbor",
        state: footer.contact?.address?.state || "AZ",
        zip: footer.contact?.address?.zip || "85034",
        enabled: footer.contact?.address?.enabled ?? true,
      },
      hours: {
        weekday:
          footer.contact?.hours?.weekday || "Mon - Fri: 8:00 AM - 6:00 PM",
        weekend:
          footer.contact?.hours?.weekend || "Sat - Sun: 9:00 AM - 4:00 PM",
        enabled: footer.contact?.hours?.enabled ?? true,
      },
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      toast.loading("Saving contact information...", {
        id: "save-contact",
        description: "Updating your footer contact details.",
      });

      await updateContact(data);

      toast.success("Contact information updated successfully! 🎉", {
        id: "save-contact",
        description: "Your contact details have been saved and applied.",
        duration: 4000,
      });

      form.reset(data);
    } catch (error: any) {
      console.error("Failed to update contact information:", error);

      toast.error("Failed to update contact information", {
        id: "save-contact",
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
        phone: {
          number: footer.contact?.phone?.number || "+1234567890",
          display: footer.contact?.phone?.display || "+1 (234) 567-890",
          enabled: footer.contact?.phone?.enabled ?? true,
        },
        email: {
          address: footer.contact?.email?.address || "info@personalwings.com",
          enabled: footer.contact?.email?.enabled ?? true,
        },
        address: {
          street:
            footer.contact?.address?.street || "123 Aviation Way, Suite 100",
          city: footer.contact?.address?.city || "Sky Harbor",
          state: footer.contact?.address?.state || "AZ",
          zip: footer.contact?.address?.zip || "85034",
          enabled: footer.contact?.address?.enabled ?? true,
        },
        hours: {
          weekday:
            footer.contact?.hours?.weekday || "Mon - Fri: 8:00 AM - 6:00 PM",
          weekend:
            footer.contact?.hours?.weekend || "Sat - Sun: 9:00 AM - 4:00 PM",
          enabled: footer.contact?.hours?.enabled ?? true,
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
  const phoneEnabled = form.watch("phone.enabled");
  const emailEnabled = form.watch("email.enabled");
  const addressEnabled = form.watch("address.enabled");
  const hoursEnabled = form.watch("hours.enabled");

  const enabledCount = [
    phoneEnabled,
    emailEnabled,
    addressEnabled,
    hoursEnabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure contact information that appears in your footer. This helps
          visitors get in touch with you easily.
        </AlertDescription>
      </Alert>

      {/* Summary */}
      <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Building className="h-5 w-5" />
            Contact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              {enabledCount}/4 sections enabled
            </Badge>
            <div className="flex gap-2">
              {phoneEnabled && (
                <Badge variant="outline" className="gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Badge>
              )}
              {emailEnabled && (
                <Badge variant="outline" className="gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Badge>
              )}
              {addressEnabled && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  Address
                </Badge>
              )}
              {hoursEnabled && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Hours
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="phone" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="phone" className="gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="address" className="gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </TabsTrigger>
              <TabsTrigger value="hours" className="gap-2">
                <Clock className="h-4 w-4" />
                Hours
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Information
                  </CardTitle>
                  <CardDescription>
                    Configure your business phone number
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Phone Number
                          </FormLabel>
                          <FormDescription>
                            Display phone number in footer
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

                  {phoneEnabled && (
                    <>
                      <FormField
                        control={form.control}
                        name="phone.number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Raw)</FormLabel>
                            <FormControl>
                              <Input placeholder="+1234567890" {...field} />
                            </FormControl>
                            <FormDescription>
                              Raw phone number for tel: links (no spaces or
                              dashes)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone.display"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Format</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (234) 567-890"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              How the phone number will be displayed to visitors
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Information
                  </CardTitle>
                  <CardDescription>
                    Configure your business email address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Email Address
                          </FormLabel>
                          <FormDescription>
                            Display email address in footer
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

                  {emailEnabled && (
                    <FormField
                      control={form.control}
                      name="email.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="info@personalwings.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your business email address for contact
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                  <CardDescription>
                    Configure your business address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Address
                          </FormLabel>
                          <FormDescription>
                            Display business address in footer
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

                  {addressEnabled && (
                    <>
                      <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Aviation Way, Suite 100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="address.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Sky Harbor" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="AZ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address.zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="85034" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                  <CardDescription>
                    Configure your operating hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hours.enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Business Hours
                          </FormLabel>
                          <FormDescription>
                            Display operating hours in footer
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

                  {hoursEnabled && (
                    <>
                      <FormField
                        control={form.control}
                        name="hours.weekday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekday Hours</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mon - Fri: 8:00 AM - 6:00 PM"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Business hours for Monday through Friday
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hours.weekend"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekend Hours</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Sat - Sun: 9:00 AM - 4:00 PM"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Business hours for Saturday and Sunday
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
