// WebSocket Client Utility for Hunger Heroes Platform

type MessageTypes =
  | 'authenticate'
  | 'authenticated'
  | 'notification'
  | 'error'
  | 'info';

interface SocketMessage {
  type: MessageTypes;
  [key: string]: any;
}

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  createdAt: Date;
}

interface NotificationMessage {
  type: 'notification';
  data: NotificationData;
}

type NotificationCallback = (notification: NotificationData) => void;
type ConnectionCallback = (status: boolean) => void;

/**
 * WebSocket client service for real-time updates
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectInterval = 3000; // 3 seconds
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private accessToken: string | null = null;
  private notificationCallbacks: NotificationCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private connected = false;

  constructor() {
    this.setupSocketConnection();
  }

  /**
   * Set up the WebSocket connection
   */
  private setupSocketConnection() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket setup error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection open
   */
  private handleOpen() {
    console.log('WebSocket connection established');
    this.resetReconnectAttempts();
    this.connected = true;
    this.notifyConnectionChange(true);

    // If we have a token, authenticate immediately
    if (this.accessToken) {
      this.authenticate(this.accessToken);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data) as SocketMessage;

      switch (message.type) {
        case 'notification':
          this.handleNotification(message as NotificationMessage);
          break;
        case 'authenticated':
          console.log('Successfully authenticated WebSocket connection');
          break;
        case 'error':
          console.error('WebSocket error:', message.message);
          break;
        case 'info':
          console.info('WebSocket info:', message.message);
          break;
        default:
          console.log('Unhandled message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket connection close
   */
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    this.connected = false;
    this.notifyConnectionChange(false);
    this.scheduleReconnect();
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    // Socket will close after an error, which will trigger reconnect
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.reconnectTimer) {
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.reconnectAttempts++;
        this.setupSocketConnection();
      }, this.reconnectInterval);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
    }
  }

  /**
   * Reset reconnection attempt counter
   */
  private resetReconnectAttempts() {
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Handle notification messages
   */
  private handleNotification(message: NotificationMessage) {
    const notification = message.data;
    // Convert ISO string date to Date object if needed
    if (typeof notification.createdAt === 'string') {
      notification.createdAt = new Date(notification.createdAt);
    }
    
    // Notify all registered callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Notify connection status changes
   */
  private notifyConnectionChange(status: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  /**
   * Authenticate the WebSocket connection with a JWT token
   */
  public authenticate(token: string) {
    this.accessToken = token;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'authenticate',
        token
      }));
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  public sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message, WebSocket is not open');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Register a notification callback
   */
  public onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register a connection status callback
   */
  public onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    
    // Immediately call with current status
    try {
      callback(this.connected);
    } catch (error) {
      console.error('Error in connection callback:', error);
    }
    
    // Return a function to unregister the callback
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Close the WebSocket connection
   */
  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();