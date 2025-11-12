import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Slide, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface Notification {
  id: string;
  message: string;
  type: AlertColor;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type?: AlertColor, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: AlertColor = 'info', duration = 6000) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const showSuccess = (message: string) => showNotification(message, 'success', 4000);
  const showError = (message: string) => showNotification(message, 'error', 8000);
  const showWarning = (message: string) => showNotification(message, 'warning', 6000);
  const showInfo = (message: string) => showNotification(message, 'info', 6000);

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => handleClose(notification.id)}
          TransitionComponent={Slide}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            top: `${24 + index * 80}px !important`,
          }}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            onClose={() => handleClose(notification.id)}
            sx={{
              minWidth: 300,
              boxShadow: 3,
              '& .MuiAlert-message': {
                fontSize: 14,
                fontWeight: 500,
              },
            }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => handleClose(notification.id)}
              >
                <Close fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
