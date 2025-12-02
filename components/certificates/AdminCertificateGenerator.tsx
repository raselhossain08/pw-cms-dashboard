"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { certificatesService } from "@/services/certificates.service";
import { coursesService } from "@/services/courses.service";
import { usersService } from "@/services/users.service";
import {
  Award,
  Mail,
  Send,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminCertificateGenerator() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [sendEmail, setSendEmail] = React.useState(true);

  const { data: coursesData } = useQuery({
    queryKey: ["courses", { page: 1, limit: 100 }],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users", { page: 1, limit: 100 }],
    queryFn: () => usersService.getAllUsers({ page: 1, limit: 100 }),
  });

  const courseList: any[] = React.useMemo(() => {
    const raw: any = coursesData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.courses)) return raw.courses;
    return [];
  }, [coursesData]);

  const usersList: any[] = React.useMemo(() => {
    const raw: any = usersData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.users)) return raw.users;
    return [];
  }, [usersData]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !selectedCourseId) {
        throw new Error("Please select both user and course");
      }
      return certificatesService.adminGenerateCertificate(
        selectedUserId,
        selectedCourseId,
        sendEmail
      );
    },
    onMutate() {
      push({ type: "loading", message: "Generating certificate..." });
    },
    onSuccess() {
      push({
        type: "success",
        message: sendEmail
          ? "Certificate generated and email sent!"
          : "Certificate generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
      setGenerateDialogOpen(false);
      setSelectedUserId("");
      setSelectedCourseId("");
      setSendEmail(true);
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to generate certificate"),
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      return certificatesService.adminSendCertificateEmail(certificateId);
    },
    onMutate() {
      push({ type: "loading", message: "Sending email..." });
    },
    onSuccess() {
      push({ type: "success", message: "Certificate email sent!" });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to send email"),
      });
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
              <span>Admin Certificate Generator</span>
            </h2>
            <p className="text-primary-foreground/90 text-sm sm:text-base lg:text-lg">
              Generate and send certificates to students via email
            </p>
          </div>
          <Button
            onClick={() => setGenerateDialogOpen(true)}
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md w-full sm:w-auto"
            size="lg"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Generate Certificate</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Certificates
              </p>
              <p className="text-3xl font-bold text-secondary mt-2">
                {/* You can add actual count here */}
                --
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="text-purple-600 w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Emails Sent</p>
              <p className="text-3xl font-bold text-secondary mt-2">--</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <Mail className="text-green-600 w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Courses
              </p>
              <p className="text-3xl font-bold text-secondary mt-2">
                {courseList.length}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-600 w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-secondary mb-2 sm:mb-3">
              How It Works
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  1.
                </span>
                <span>Select a student from the user list</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  2.
                </span>
                <span>Choose the course they completed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  3.
                </span>
                <span>
                  Optionally enable email delivery to send the certificate
                  directly to the student
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  4.
                </span>
                <span>
                  The certificate will be generated with a unique ID and
                  verification URL
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generate Certificate Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Generate Certificate
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Generate a certificate for a student and optionally send it via
              email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-secondary flex items-center gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Select Student
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {usersList.map((user: any) => (
                    <SelectItem
                      key={user._id}
                      value={user._id}
                      className="text-xs sm:text-sm"
                    >
                      <span className="truncate block max-w-[250px] sm:max-w-full">
                        {user.firstName} {user.lastName} ({user.email})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-secondary flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Select Course
              </label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courseList.map((course: any) => (
                    <SelectItem
                      key={course._id}
                      value={course._id}
                      className="text-xs sm:text-sm"
                    >
                      <span className="truncate block max-w-[250px] sm:max-w-full">
                        {course.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                className="mt-0.5 sm:mt-0"
              />
              <label
                htmlFor="send-email"
                className="text-xs sm:text-sm font-medium text-secondary cursor-pointer flex items-center gap-1.5 sm:gap-2 flex-1"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>Send certificate via email to student</span>
              </label>
            </div>

            {sendEmail && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-accent-foreground/90 flex items-start gap-2">
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0 text-accent" />
                  <span>
                    The student will receive a professionally formatted email
                    with their certificate link, certificate ID, and
                    verification details.
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setGenerateDialogOpen(false)}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={
                !selectedUserId ||
                !selectedCourseId ||
                generateMutation.isPending
              }
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto text-xs sm:text-sm"
            >
              {generateMutation.isPending ? (
                <>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
