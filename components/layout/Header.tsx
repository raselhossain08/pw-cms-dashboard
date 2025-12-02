"use client";

import Image from "next/image";
import * as React from "react";
import {
  Bell,
  Bot,
  ChevronDown,
  GraduationCap,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarMobile } from "./Sidebar";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api-client";
import type { NotificationItem } from "@/services/profile.service";

const MotionButton = motion(Button);

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    []
  );
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await apiFetch<{
        notifications: NotificationItem[];
        total?: number;
      }>("/notifications");
      const list = (res.data?.notifications ??
        res.data ??
        []) as NotificationItem[];
      if (mounted) setNotifications(Array.isArray(list) ? list : []);
      const uc = await apiFetch<{ count: number }>(
        "/notifications/unread-count"
      );
      if (mounted) setUnreadCount(Number(uc.data?.count ?? 0));
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl =
    user?.avatar ||
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";
  const email = user?.email || "";

  const formatTime = (iso?: string) => {
    try {
      const d = iso ? new Date(iso) : new Date();
      return d.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <MotionButton
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-secondary hover:bg-primary hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Menu className="w-5 h-5" />
                </MotionButton>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <SidebarMobile />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-secondary">Personal Wings</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search... (Cmd+K)"
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MotionButton
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-white hover:bg-primary transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -mt-1 -mr-1 w-2 h-2 bg-destructive rounded-full right-1 top-1 animate-pulse" />
                )}
              </MotionButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread`
                    : "All caught up"}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <DropdownMenuItem
                      key={i}
                      className="cursor-pointer hover:bg-primary/5 focus:bg-primary/10 px-4 py-3"
                    >
                      <div className="flex gap-3 w-full">
                        <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {n.title || "Notification"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {n.message}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full text-xs font-medium text-primary hover:text-white hover:bg-primary transition-all duration-200"
                  onClick={() => router.push("/activity-logs")}
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <MotionButton
            variant="ghost"
            size="icon"
            aria-label="AI Assistant"
            className="text-muted-foreground hover:text-white hover:bg-primary transition-all duration-200"
            onClick={() => router.push("/ai-agents")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-5 h-5" />
          </MotionButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MotionButton variant="link" size="sm" className="gap-2">
                <Image
                  src={avatarUrl}
                  alt="User"
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-primary/20"
                  unoptimized
                />
                <span className="hidden sm:inline text-sm font-medium text-secondary">
                  {displayName}
                </span>
                <ChevronDown className="text-muted-foreground w-4 h-4" />
              </MotionButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Image
                    src={avatarUrl}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-primary/20"
                    unoptimized
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <DropdownMenuItem className="cursor-pointer px-3 py-2">
                  <User className="w-4 h-4 mr-3" />
                  <span className="text-sm">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer px-3 py-2">
                  <Settings className="w-4 h-4 mr-3" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
              </div>
              <div className="border-t border-border py-1">
                <DropdownMenuItem
                  className="cursor-pointer px-3 py-2"
                  onSelect={() => setLogoutOpen(true)}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* AI Assistant button now navigates to /ai-agents */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <p className="text-foreground font-medium">
              Are you sure you want to log out?
            </p>
            <p className="text-muted-foreground text-sm">
              You will be signed out from your dashboard and redirected to the
              login page.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-secondary hover:text-white transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.header>
  );
}
