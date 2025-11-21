"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

interface ModernHeaderProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export function DashboardHeader({
  onMenuToggle,
  sidebarOpen,
}: ModernHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "New message",
      description: "You have a new message from John",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "System Update",
      description: "System maintenance scheduled",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment Received",
      description: "Your payment has been processed",
      time: "2 hours ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };

  // Don't render theme-dependent UI until mounted
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 h-8 w-8"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:h-9 lg:w-9"
            >
              <Moon className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="relative">
        <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-8 gap-2 sm:gap-4">
          {/* Mobile Menu Button - Only visible on mobile/tablet */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 shrink-0"
            onClick={onMenuToggle}
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Search Bar - Expandable */}
          {mobileSearchOpen && (
            <div className="absolute top-full left-0 right-0 lg:hidden bg-background border-b p-3 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pages, media, users..."
                  className="w-full pl-10 pr-10 py-2 rounded-full bg-muted/50 border-0 focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={toggleMobileSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Search Bar - Hidden on mobile, shown on desktop */}
          <div
            className=" flex-1  lg:justify-between items-center flex 
           "
          >
            <div className="hidden lg:flex relative flex-1 max-w-md xl:max-w-lg 2xl:max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search pages, media, users..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 border-0 focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Spacer for mobile and tablet */}
            <div className="flex-1 lg:hidden" />

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 shrink-0"
                onClick={toggleMobileSearch}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:h-9 lg:w-9 shrink-0"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 lg:h-5 lg:w-5" />
                ) : (
                  <Moon className="h-4 w-4 lg:h-5 lg:w-5" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 lg:h-9 lg:w-9 shrink-0"
                  >
                    <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary">{unreadCount} Unread</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-3 cursor-pointer hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                notification.unread
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 lg:h-9 lg:w-9 rounded-full shrink-0"
                  >
                    <Avatar className="h-8 w-8 lg:h-9 lg:w-9 border-2 border-transparent hover:border-blue-500 transition-colors">
                      <AvatarFallback className="bg-linear-to-r from-blue-500 to-purple-600 text-white text-xs lg:text-sm">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 sm:w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        John Doe
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        john@cms.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center justify-between w-full cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span>Dark Mode</span>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => {
                        setTheme(checked ? "dark" : "light");
                      }}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
