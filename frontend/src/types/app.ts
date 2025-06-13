import type { AlertColor } from "@mui/material";

export interface NotificationState {
  message: string;
  severity: AlertColor;
}

export interface AppState {
  isAdmin: boolean;
  busy: boolean;
  notification: NotificationState | null;
  // Optional extension:
  // setNotification?: (n: NotificationState | null) => void;
}
