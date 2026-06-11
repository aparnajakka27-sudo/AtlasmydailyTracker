"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  triggerNotification: (title: string, message: string, type?: "info" | "success" | "warning" | "error") => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  requestBrowserPermission: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    // Initial request
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const triggerNotification = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    // 1. In-App list
    const newNotif: InAppNotification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // limit 50

    // 2. HTML5 Browser Notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, {
            body: message,
            icon: "/favicon.ico"
          });
        } catch (err) {
          console.error("Browser notification error", err);
        }
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => setNotifications([]);

  const requestBrowserPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          triggerNotification("Notifications Enabled! 🔔", "You will now receive task reminders here.");
        }
      });
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, triggerNotification, markAsRead, clearAll, requestBrowserPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
