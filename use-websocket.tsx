import { useState, useEffect, useCallback } from 'react';
import { websocketService, NotificationData } from '@/lib/websocket';

/**
 * React hook for WebSocket connectivity and real-time notifications
 * @param {string} token - JWT Access token (pass null or undefined if not authenticated)
 */
export function useWebSocket(token?: string | null) {
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Handle connection status changes
  useEffect(() => {
    // Register connection callback
    const unsubscribe = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    
    return unsubscribe;
  }, []);

  // Authenticate when token changes
  useEffect(() => {
    if (token) {
      websocketService.authenticate(token);
    }
  }, [token]);

  // Handle incoming notifications
  useEffect(() => {
    // Register notification callback
    const unsubscribe = websocketService.onNotification((notification) => {
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    });
    
    return unsubscribe;
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((id: number) => {
    setNotifications((prevNotifications) => 
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  // Send a message to the WebSocket server
  const sendMessage = useCallback((message: any) => {
    websocketService.sendMessage(message);
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
    sendMessage
  };
}