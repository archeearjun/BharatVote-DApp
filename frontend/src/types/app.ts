export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  message: string;
  severity: NotificationSeverity;
}

export interface AppState {
  isAdmin: boolean;
  busy: boolean;
  notification: NotificationState | null;
  // Optional extension:
  // setNotification?: (n: NotificationState | null) => void;
}
