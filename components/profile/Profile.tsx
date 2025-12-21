"use client";

import * as React from "react";
import Image from "next/image";
import {
  Download,
  Save,
  Camera,
  MapPin,
  Mail,
  Calendar,
  UserCheck,
  Trash,
  Loader2,
  Shield,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Globe,
  Settings,
  LogOut,
  FileText,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { validatePassword } from "@/lib/validation";

export default function Profile() {
  const [activeTab, setActiveTab] = React.useState("Profile");
  const { state, actions, isLoading, error } = useProfile();
  const { user } = useAuth();
  const router = useRouter();
  const {
    firstName,
    lastName,
    email,
    phone,
    bio,
    avatar,
    saving,
    uploadProgress,
    country,
    state: userState,
    city,
    notifications,
    unreadCount,
    invoices,
    orders,
    loadingTab,
    emailVerified,
    resendingVerification,
    sessions,
    notificationPrefs,
    privacySettings,
    profileStats,
    validationErrors,
    profileCompletion,
  } = state;
  const {
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
    setBio,
    setCountry,
    setState,
    setCity,
    save,
    changeAvatar,
    updatePassword,
    loadNotifications,
    markRead,
    markAllRead,
    removeNotification,
    loadBilling,
    deleteAccount,
    resendVerification,
    loadSessions,
    removeSession,
    removeAllSessions,
    setNotificationPrefs,
    saveNotificationPreferences,
    loadNotificationPreferences,
    setPrivacySettings,
    savePrivacySettings,
    loadPrivacySettings,
    downloadInvoiceFile,
    downloadOrderFile,
    validatePassword: validatePasswordFunc,
  } = actions;
  const [position, setPosition] = React.useState("User");
  const [currentPwd, setCurrentPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [showPassword, setShowPassword] = React.useState({
    current: false,
    new: false,
  });
  const [passwordStrength, setPasswordStrength] = React.useState<ReturnType<
    typeof validatePassword
  > | null>(null);
  const firstNameRef = React.useRef<HTMLInputElement | null>(null);

  function exportData() {
    const data = {
      id: user?.id,
      email,
      firstName,
      lastName,
      phone,
      bio,
      avatar,
      location: { country, state: userState, city },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-${user?.id || "me"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  React.useEffect(() => {
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Administrator",
      instructor: "Instructor",
      student: "Student",
      affiliate: "Affiliate",
    };
    if (user?.role) {
      setPosition(roleMap[user.role] || user.role);
    }
    // Load notifications for both Profile tab (Recent Activity) and Notifications tab
    if (activeTab === "Profile" || activeTab === "Notifications") {
      loadNotifications();
    }
    if (activeTab === "Billing") {
      loadBilling();
    }
    if (activeTab === "Security") {
      loadSessions();
    }
    if (activeTab === "Preferences") {
      loadNotificationPreferences();
      loadPrivacySettings();
    }
  }, [
    activeTab,
    loadNotifications,
    loadBilling,
    loadSessions,
    loadNotificationPreferences,
    loadPrivacySettings,
  ]);

  React.useEffect(() => {
    if (newPwd) {
      const strength = validatePassword(newPwd);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [newPwd]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      return;
    }
    const success = await deleteAccount();
    if (success) {
      router.push("/login");
    }
    setShowDeleteDialog(false);
    setDeleteConfirmText("");
  };

  if (isLoading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Loading profile…</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <Alert variant="destructive" className="max-w-xl">
          <AlertTitle>Failed to load profile</AlertTitle>
          <AlertDescription>
            {(typeof error === "string" ? error : undefined) ||
              "Please try again later."}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            User Profile
          </h2>
          <p className="text-gray-600">
            Manage your account details, preferences, and settings.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={exportData}
          >
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />{" "}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            "Profile",
            "Security",
            "Preferences",
            "Billing",
            "Notifications",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {activeTab === "Profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="relative">
                      <Image
                        src={
                          avatar ||
                          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                        }
                        alt="Profile"
                        width={96}
                        height={96}
                        className="rounded-full border-4 border-white shadow-lg"
                        unoptimized
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                      <Camera className="text-white w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) changeAvatar(f);
                        }}
                      />
                    </label>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Uploading {uploadProgress}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-secondary mb-1">
                    {[firstName, lastName].filter(Boolean).join(" ") || email}
                  </h3>
                  <p className="text-gray-600 mb-2">{position}</p>
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {[city, userState, country].filter(Boolean).join(", ") ||
                        "Not set"}
                    </span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Active now</span>
                    </div>
                    {!emailVerified && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-sm text-yellow-800">
                          Email not verified.{" "}
                          <button
                            onClick={resendVerification}
                            disabled={resendingVerification}
                            className="underline font-medium"
                          >
                            {resendingVerification
                              ? "Sending..."
                              : "Resend verification"}
                          </button>
                        </AlertDescription>
                      </Alert>
                    )}
                    {emailVerified && (
                      <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Email Verified</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Profile Completion
                        </span>
                        <span className="font-semibold">
                          {profileCompletion.percentage}%
                        </span>
                      </div>
                      <Progress
                        value={profileCompletion.percentage}
                        className="h-2"
                      />
                      {profileCompletion.missing.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Missing:{" "}
                          {profileCompletion.missing.slice(0, 2).join(", ")}
                          {profileCompletion.missing.length > 2 && "..."}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Role</div>
                      <div className="text-lg font-bold text-secondary">
                        {position}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Member Since</div>
                      <div className="text-lg font-bold text-secondary">
                        {state.createdAt &&
                        !isNaN(new Date(state.createdAt).getTime())
                          ? new Date(state.createdAt).toLocaleDateString()
                          : user?.createdAt &&
                            !isNaN(new Date(user.createdAt).getTime())
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">
                        Unread Notices
                      </div>
                      <div className="text-lg font-bold text-secondary">
                        {unreadCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-secondary mb-4">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="text-blue-600 w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-sm font-medium">{email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <PhoneIcon />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="text-sm font-medium">
                        {phone || "Not set"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-purple-600 w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Joined</div>
                      <div className="text-sm font-medium">
                        {state.createdAt &&
                        !isNaN(new Date(state.createdAt).getTime())
                          ? new Date(state.createdAt).toLocaleDateString()
                          : user?.createdAt &&
                            !isNaN(new Date(user.createdAt).getTime())
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-secondary">
                    Personal Information
                  </h4>
                  <button
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                    onClick={() => firstNameRef.current?.focus()}
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                        validationErrors.firstName
                          ? "border-red-300 focus:ring-red-500/20"
                          : "border-gray-200 focus:ring-primary/20"
                      }`}
                      ref={firstNameRef}
                    />
                    {validationErrors.firstName && (
                      <p className="text-xs text-red-600 mt-1">
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                        validationErrors.lastName
                          ? "border-red-300 focus:ring-red-500/20"
                          : "border-gray-200 focus:ring-primary/20"
                      }`}
                    />
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1">
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                        validationErrors.email
                          ? "border-red-300 focus:ring-red-500/20"
                          : "border-gray-200 focus:ring-primary/20"
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                        validationErrors.phone
                          ? "border-red-300 focus:ring-red-500/20"
                          : "border-gray-200 focus:ring-primary/20"
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="text-xs text-red-600 mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-secondary mb-4">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {profileStats.coursesEnrolled || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Courses Enrolled
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {profileStats.coursesCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Courses Completed
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {profileStats.certificatesEarned || 0}
                    </div>
                    <div className="text-sm text-gray-600">Certificates</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ${profileStats.totalSpent || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
                {profileStats.lastLogin && (
                  <div className="mt-4 text-sm text-gray-500">
                    Last login:{" "}
                    {new Date(profileStats.lastLogin).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-secondary mb-4">
                  Recent Activity
                </h4>
                <div className="space-y-4">
                  {notifications.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No recent activity
                    </div>
                  )}
                  {notifications.slice(0, 6).map((n: any) => {
                    const notificationId =
                      n._id || n.id || String(n._id || n.id || Math.random());
                    const title = n.title || n.subject || "Notification";
                    const message = n.message || n.body || n.content || "";
                    const createdAt =
                      n.createdAt ||
                      n.created_at ||
                      n.date ||
                      new Date().toISOString();
                    const formattedDate =
                      createdAt && !isNaN(new Date(createdAt).getTime())
                        ? new Date(createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";

                    return (
                      <div
                        key={notificationId}
                        className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <UserCheck className="text-blue-600 w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-secondary">
                            <span className="font-medium">{title}</span>
                            {message && (
                              <span className="text-gray-600">
                                {" "}
                                -{" "}
                                {message.length > 50
                                  ? `${message.substring(0, 50)}...`
                                  : message}
                              </span>
                            )}
                          </p>
                          {formattedDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formattedDate}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {activeTab === "Security" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        current: !showPassword.current,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        new: !showPassword.new,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(passwordStrength.score / 5) * 100}
                        className={`h-2 flex-1 ${
                          passwordStrength.strength === "weak"
                            ? "bg-red-200"
                            : passwordStrength.strength === "medium"
                            ? "bg-yellow-200"
                            : "bg-green-200"
                        }`}
                      />
                      <Badge
                        variant={
                          passwordStrength.strength === "weak"
                            ? "destructive"
                            : passwordStrength.strength === "medium"
                            ? "default"
                            : "default"
                        }
                        className={
                          passwordStrength.strength === "strong"
                            ? "bg-green-500"
                            : ""
                        }
                      >
                        {passwordStrength.strength}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div
                        className={`flex items-center gap-1 ${
                          passwordStrength.checks.length
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.length ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordStrength.checks.uppercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.uppercase ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordStrength.checks.lowercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.lowercase ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordStrength.checks.number
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.number ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordStrength.checks.special
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.special ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => updatePassword(currentPwd, newPwd)}
                disabled={
                  !currentPwd ||
                  !newPwd ||
                  (passwordStrength ? !passwordStrength.valid : false)
                }
              >
                Update Password
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-secondary flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Active Sessions
              </h4>
              {sessions.length > 1 && (
                <Button variant="outline" size="sm" onClick={removeAllSessions}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout All
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {session.device || "Unknown Device"}
                      </span>
                      {session.isCurrent && (
                        <Badge variant="default" className="bg-green-500">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {session.browser && `${session.browser} • `}
                      {session.ip && `${session.ip} • `}
                      {session.location && `${session.location} • `}
                      {session.lastActive &&
                        `Last active: ${new Date(
                          session.lastActive
                        ).toLocaleString()}`}
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSession(session._id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-gray-500">No active sessions</p>
              )}
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-sm border border-red-200 bg-red-50">
            <h4 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </h4>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      )}

      {activeTab === "Preferences" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-secondary mb-4">
              Location Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  value={userState}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={save} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />{" "}
                {saving ? "Saving..." : "Save Location"}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Email Notifications
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-course"
                      checked={notificationPrefs.email?.courseUpdates ?? true}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          email: {
                            ...notificationPrefs.email,
                            courseUpdates: checked === true,
                          },
                        })
                      }
                    />
                    <label
                      htmlFor="email-course"
                      className="text-sm text-gray-700"
                    >
                      Course updates and announcements
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-marketing"
                      checked={notificationPrefs.email?.marketing ?? false}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          email: {
                            ...notificationPrefs.email,
                            marketing: checked === true,
                          },
                        })
                      }
                    />
                    <label
                      htmlFor="email-marketing"
                      className="text-sm text-gray-700"
                    >
                      Marketing and promotional emails
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-security"
                      checked={notificationPrefs.email?.security ?? true}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          email: {
                            ...notificationPrefs.email,
                            security: checked === true,
                          },
                        })
                      }
                    />
                    <label
                      htmlFor="email-security"
                      className="text-sm text-gray-700"
                    >
                      Security alerts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-system"
                      checked={notificationPrefs.email?.system ?? true}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          email: {
                            ...notificationPrefs.email,
                            system: checked === true,
                          },
                        })
                      }
                    />
                    <label
                      htmlFor="email-system"
                      className="text-sm text-gray-700"
                    >
                      System notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={saveNotificationPreferences}>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Preferences
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Privacy Settings
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={privacySettings.profileVisibility || "public"}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      profileVisibility: e.target.value as
                        | "public"
                        | "private"
                        | "friends",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-email"
                    checked={privacySettings.showEmail ?? false}
                    onCheckedChange={(checked) =>
                      setPrivacySettings({
                        ...privacySettings,
                        showEmail: checked === true,
                      })
                    }
                  />
                  <label htmlFor="show-email" className="text-sm text-gray-700">
                    Show email address on profile
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-phone"
                    checked={privacySettings.showPhone ?? false}
                    onCheckedChange={(checked) =>
                      setPrivacySettings({
                        ...privacySettings,
                        showPhone: checked === true,
                      })
                    }
                  />
                  <label htmlFor="show-phone" className="text-sm text-gray-700">
                    Show phone number on profile
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-messages"
                    checked={privacySettings.allowMessages ?? true}
                    onCheckedChange={(checked) =>
                      setPrivacySettings({
                        ...privacySettings,
                        allowMessages: checked === true,
                      })
                    }
                  />
                  <label
                    htmlFor="allow-messages"
                    className="text-sm text-gray-700"
                  >
                    Allow messages from other users
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-activity"
                    checked={privacySettings.showActivity ?? true}
                    onCheckedChange={(checked) =>
                      setPrivacySettings({
                        ...privacySettings,
                        showActivity: checked === true,
                      })
                    }
                  />
                  <label
                    htmlFor="show-activity"
                    className="text-sm text-gray-700"
                  >
                    Show activity status
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={savePrivacySettings}>
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-secondary">Billing</h4>
            {loadingTab === "Billing" && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">Invoices</h5>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Order</th>
                      <th className="px-3 py-2 text-left">Total</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="border-t">
                        <td className="px-3 py-2">{inv.invoiceDate || ""}</td>
                        <td className="px-3 py-2">
                          {inv.order?.orderNumber || ""}
                        </td>
                        <td className="px-3 py-2">${inv.order?.total || 0}</td>
                        <td className="px-3 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadInvoiceFile(inv._id)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-gray-500" colSpan={4}>
                          No invoices
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Orders</h5>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Order #</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Total</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord._id} className="border-t">
                        <td className="px-3 py-2">{ord.orderNumber || ""}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              ord.status === "completed" ? "default" : "outline"
                            }
                          >
                            {ord.status || "Pending"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">${ord.total || 0}</td>
                        <td className="px-3 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadOrderFile(ord._id)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-gray-500" colSpan={4}>
                          No orders
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-secondary">
              Notifications
            </h4>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                Unread: {unreadCount}
              </span>
              <Button variant="outline" onClick={markAllRead}>
                Mark all read
              </Button>
            </div>
          </div>
          {loadingTab === "Notifications" ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading</span>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {n.title || "Notification"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {n.message || ""}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {n.createdAt || ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markRead(n._id)}
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeNotification(n._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-sm text-gray-500">No notifications</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                All your data, courses, progress, and account information will
                be permanently deleted.
              </AlertDescription>
            </Alert>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-green-600 w-4 h-4"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72l.2 1.43a2 2 0 0 1-.57 1.82l-1.27 1.27a16 16 0 0 0 6.88 6.88l1.27-1.27a2 2 0 0 1 1.82-.57l1.43.2A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
