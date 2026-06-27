import { toast } from "sonner";

export const playNotification = () => {
  const audio = new Audio("/sounds/admin-notification.mp3");

  audio.volume = 0.5;

  audio.play().catch(() => {});
};

export const notifyAdmin = ({ title, description, type = "success" }) => {
  playNotification();

  toast[type](title, {
    description,
    duration: 5000,
  });
};
