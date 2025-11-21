"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image,
  Menu,
  Settings,
  Users,
  Home,
  Plus,
  Zap,
  ChevronRight,
  Sparkles,
  Cloud,
  Palette,
  Bell,
  Search,
  X,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SystemStatusCard } from "@/components/shared/system-status-card";
import { MediaBadge } from "@/components/shared/media-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: "New",
    description: "Overview & analytics",
  },
  {
    href: "/dashboard/header",
    label: "Header",
    icon: Menu,
    description: "Navigation & branding",
  },
  {
    href: "/dashboard/footer",
    label: "Footer",
    icon: Layers,
    description: "Footer content & links",
  },
  {
    href: "/dashboard/media",
    label: "Media Library",
    icon: Image,
    badge: "12",
    description: "Images & documents",
  },
];

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const DashboardSidebar = ({
  isMobileOpen = false,
  onMobileToggle,
}: DashboardSidebarProps = {}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Handle mobile menu state
  useEffect(() => {
    setIsOpen(isMobileOpen);
  }, [isMobileOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    if (onMobileToggle) {
      onMobileToggle();
    }
  }, [pathname]); // Remove onMobileToggle from dependencies to prevent infinite loop

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
    if (onMobileToggle) {
      onMobileToggle();
    }
  }, [onMobileToggle]);

  const SidebarContent = () => (
    <TooltipProvider>
      <div className="w-full sm:w-80 bg-linear-to-b from-slate-50/90 to-blue-50/50 backdrop-blur-xl border-r border-slate-200/60 h-screen flex flex-col shadow-xl relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-linear-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-linear-to-tl from-green-200/15 to-cyan-200/15 rounded-full translate-x-1/2 translate-y-1/2 blur-xl"></div>

        {/* Header */}
        <div className="relative p-4 sm:p-6 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PW CMS
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  Pro Edition
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden p-2 h-8 w-8 hover:bg-slate-100"
              onClick={handleLinkClick}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 sm:px-4 py-4 sm:py-6 relative z-10">
          <div className="space-y-4">
            <div className="px-3 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                Navigation
              </p>
            </div>

            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (pathname.startsWith(link.href + "/") &&
                  link.href !== "/dashboard");

              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link href={link.href} onClick={handleLinkClick}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 sm:gap-3 h-10 sm:h-12 px-3 sm:px-4 relative group transition-all duration-200 mb-2",
                          isActive
                            ? "bg-linear-to-r from-blue-500/10 to-purple-500/10 border-r-2 border-blue-500 shadow-sm"
                            : "hover:bg-slate-100/80 hover:shadow-md"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md"
                              : "bg-slate-200/60 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-medium transition-colors",
                                isActive
                                  ? "text-blue-700"
                                  : "text-slate-700 group-hover:text-slate-900"
                              )}
                            >
                              {link.label}
                            </span>
                            {link.badge && link.href === "/dashboard/media" ? (
                              <MediaBadge
                                variant={isActive ? "default" : "secondary"}
                                className={cn(
                                  "text-xs h-5 px-1.5",
                                  isActive
                                    ? "bg-white text-blue-600"
                                    : "bg-blue-500 text-white"
                                )}
                                isActive={isActive}
                              />
                            ) : link.badge ? (
                              <Badge
                                variant={isActive ? "default" : "secondary"}
                                className={cn(
                                  "text-xs h-5 px-1.5",
                                  isActive
                                    ? "bg-white text-blue-600"
                                    : "bg-blue-500 text-white"
                                )}
                              >
                                {link.badge}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-500 text-left mt-0.5">
                            {link.description}
                          </p>
                        </div>

                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-blue-500 ml-auto" />
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {link.description}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <Separator className="my-6 bg-slate-200/40" />

          {/* System Status */}
          <SystemStatusCard />
        </ScrollArea>

        {/* User Profile */}
        <div className="relative p-3 sm:p-4 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/40 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
            <Avatar className="h-10 w-10 border-2 border-white shadow-md group-hover:border-blue-200 transition-colors">
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold">
                AU
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                Admin User
              </p>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                admin@cms.com
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
          onClick={handleLinkClick}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden sm:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out sm:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};

// Export hamburger menu component for use in header
export const MobileMenuToggle = ({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="sm:hidden p-2 h-9 w-9 hover:bg-slate-100"
    onClick={onToggle}
  >
    <Menu
      className={cn(
        "h-5 w-5 transition-transform duration-200",
        isOpen && "rotate-90"
      )}
    />
  </Button>
);
