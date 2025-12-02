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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [activeTab, setActiveTab] = React.useState("Profile");
  const { state, actions } = useProfile();
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
    flightHours,
    certifications,
    notifications,
    unreadCount,
    invoices,
    orders,
    loadingTab,
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
    setFlightHours,
    setCertifications,
    save,
    changeAvatar,
    updatePassword,
    loadNotifications,
    markRead,
    markAllRead,
    removeNotification,
    loadBilling,
    deleteAccount,
  } = actions;
  const [position, setPosition] = React.useState("Pilot");
  const [department, setDepartment] = React.useState("Flight Operations");
  const [currentPwd, setCurrentPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
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
      flightHours,
      certifications,
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
    if (activeTab === "Notifications") {
      loadNotifications();
    }
    if (activeTab === "Billing") {
      loadBilling();
    }
  }, [activeTab, loadNotifications, loadBilling]);

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Pilot Profile
          </h2>
          <p className="text-gray-600">
            Manage your aviation details, certifications, and account settings.
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="Profile">Profile</TabsTrigger>
          <TabsTrigger value="Security">Security</TabsTrigger>
          <TabsTrigger value="Preferences">Preferences</TabsTrigger>
          <TabsTrigger value="Billing">Billing</TabsTrigger>
          <TabsTrigger value="Notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="Profile">
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
                  <p className="text-gray-600 mb-2">{user?.role || ""}</p>
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {[city, userState, country].filter(Boolean).join(", ") ||
                        "Not set"}
                    </span>
                  </div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Active now</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">
                        {certifications.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        Certifications
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">
                        {flightHours ?? 0}
                      </div>
                      <div className="text-xs text-gray-500">Flight Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">
                        {unreadCount}
                      </div>
                      <div className="text-xs text-gray-500">
                        Unread Notices
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
                        {state.createdAt
                          ? new Date(state.createdAt).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-secondary mb-4">
                  Certifications
                </h4>
                <div className="space-y-2">
                  {certifications.length > 0 ? (
                    certifications.map((c) => (
                      <div key={c} className="text-sm">
                        {c}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      No certifications
                    </div>
                  )}
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                      ref={firstNameRef}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
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
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-secondary">
                    Professional Details
                  </h4>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pilot">Pilot</SelectItem>
                        <SelectItem value="Instructor">Instructor</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Crew">Crew</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operation
                    </label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flight Operations">
                          Flight Operations
                        </SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Dispatch">Dispatch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate ID
                    </label>
                    <input
                      value={certifications[0] || ""}
                      placeholder="Not set"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <input
                      value={
                        state.createdAt
                          ? new Date(state.createdAt).toLocaleDateString()
                          : ""
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
                  </div>
                </div>
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
                  {notifications.slice(0, 6).map((n: any) => (
                    <div
                      key={n._id}
                      className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <UserCheck className="text-blue-600 w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary">
                          <span className="font-medium">
                            {n.title || "Notification"}
                          </span>
                          {n.message ? ` - ${n.message}` : ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-red-200">
            <h4 className="text-lg font-semibold text-red-700 mb-4">
              Danger Zone
            </h4>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <div className="font-medium text-secondary mb-1">
                  Delete Account
                </div>
                <div className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </div>
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  if (!window.confirm("Delete account permanently?")) return;
                  const ok = await deleteAccount();
                  if (ok) {
                    router.push("/login");
                  }
                }}
              >
                <Trash className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Security">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-secondary mb-4">
              Security
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => updatePassword(currentPwd, newPwd)}
                disabled={!currentPwd || !newPwd}
              >
                Update Password
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Preferences">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-secondary mb-4">
              Preferences
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Hours
                </label>
                <input
                  type="number"
                  value={flightHours ?? ""}
                  onChange={(e) =>
                    setFlightHours(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications (comma separated)
                </label>
                <input
                  value={certifications.join(", ")}
                  onChange={(e) =>
                    setCertifications(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={save} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />{" "}
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Billing">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-secondary">Billing</h4>
              {loadingTab === "Billing" && (
                <div className="text-sm text-gray-500">Loading...</div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="border-t">
                          <td className="px-3 py-2">{inv.invoiceDate || ""}</td>
                          <td className="px-3 py-2">
                            {inv.order?.orderNumber || ""}
                          </td>
                          <td className="px-3 py-2">
                            ${inv.order?.total || 0}
                          </td>
                        </tr>
                      ))}
                      {invoices.length === 0 && (
                        <tr>
                          <td className="px-3 py-3 text-gray-500" colSpan={3}>
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
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id} className="border-t">
                          <td className="px-3 py-2">{ord.orderNumber || ""}</td>
                          <td className="px-3 py-2">{ord.status || ""}</td>
                          <td className="px-3 py-2">${ord.total || 0}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td className="px-3 py-3 text-gray-500" colSpan={3}>
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
        </TabsContent>

        <TabsContent value="Notifications">
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
              <div className="text-sm text-gray-500">Loading...</div>
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
        </TabsContent>
      </Tabs>
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
