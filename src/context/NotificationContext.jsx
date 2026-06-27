"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const playSound = () => {
    const audio = new Audio("/sounds/admin-notification.mp3");

    audio.volume = 0.7;

    audio.play().catch(() => {});
  };

  const addNotification = ({ type, title, message }) => {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      createdAt: new Date().toLocaleTimeString(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);

    playSound();

    toast.success(title, {
      description: message,
      duration: 5000,
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    );
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
