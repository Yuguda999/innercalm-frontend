import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  disconnect: () => void;
  reconnect: () => void;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
}

export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const pingTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Prevent multiple connections
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Throttle connection attempts to prevent resource exhaustion
    if (connectionAttempts >= 10) {
      setConnectionError('Too many connection attempts. Please refresh the page.');
      return;
    }

    // Clean up any existing connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setConnectionAttempts(prev => prev + 1);

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectCount.current = 0;
        setConnectionAttempts(0); // Reset connection attempts on successful connection

        // Start ping/pong to keep connection alive
        if (pingTimer.current) {
          clearInterval(pingTimer.current);
        }
        pingTimer.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle pong messages
          if (message.type === 'pong') {
            return;
          }

          onMessageRef.current?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);

        if (pingTimer.current) {
          clearInterval(pingTimer.current);
          pingTimer.current = null;
        }

        // Only attempt reconnection if it wasn't a manual close and we haven't exceeded attempts
        if (event.code !== 1000 && reconnectCount.current < reconnectAttempts && connectionAttempts < 10) {
          setConnectionError(`Connection lost. Reconnecting... (${reconnectCount.current + 1}/${reconnectAttempts})`);

          // Clear any existing reconnect timer
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
          }

          // Exponential backoff: increase delay with each attempt
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectCount.current), 30000);

          reconnectTimer.current = setTimeout(() => {
            reconnectCount.current++;
            connect();
          }, delay);
        } else if (reconnectCount.current >= reconnectAttempts || connectionAttempts >= 10) {
          setConnectionError('Failed to reconnect. Please refresh the page.');
        }

        onDisconnectRef.current?.();
      };

      ws.current.onerror = (error) => {
        setConnectionError('Connection error occurred');
        onErrorRef.current?.(error);
      };

    } catch (error) {
      setIsConnecting(false);
      setConnectionError('Failed to establish connection');
      console.error('WebSocket connection error:', error);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (pingTimer.current) {
      clearInterval(pingTimer.current);
      pingTimer.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setConnectionError('Failed to send message');
      }
    } else {
      console.warn('WebSocket is not connected');
      setConnectionError('Not connected to chat');
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectCount.current = 0;
    setTimeout(connect, 1000);
  }, []);

  // Store callback refs to avoid recreating connect function
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  useEffect(() => {
    // Debounce connection attempts to prevent rapid reconnections
    const timer = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [url]); // Only depend on URL, not the callback functions

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
    reconnect,
    lastMessage,
    connectionError,
  };
};
