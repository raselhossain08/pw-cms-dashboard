"use client";

import { useEffect, useRef } from "react";

export function useChatNotifications() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3");
    }
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play notification sound:", error);
      });
    }
  };

  const showDesktopNotification = async (
    title: string,
    body: string,
    icon?: string
  ) => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/logo.png",
        badge: "/logo.png",
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          body,
          icon: icon || "/logo.png",
          badge: "/logo.png",
        });
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  };

  return {
    playNotificationSound,
    showDesktopNotification,
    requestNotificationPermission,
    hasNotificationPermission: typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted",
  };
}

