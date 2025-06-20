import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAppDispatch } from '../../../store';
import { showToast } from '../../../store/slices/uiSlice';

interface UseWebSocketOptions {
  userId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

const useWebSocket = ({
  userId,
  onConnect,
  onDisconnect,
  onMessage,
  onError
}: UseWebSocketOptions) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  
  // Connect to the WebSocket server
  const connect = useCallback(() => {
    try {
      // In a real app, the URL would be an environment variable
      const socket = io('https://api.example.com', {
        query: { userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      socketRef.current = socket;
      
      // Set up event listeners
      socket.on('connect', () => {
        console.log('WebSocket connected');
        if (onConnect) onConnect();
      });
      
      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        if (onDisconnect) onDisconnect();
      });
      
      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        dispatch(showToast({
          message: 'Connection error. Some features may be unavailable.',
          type: 'error'
        }));
        if (onError) onError(error);
      });
      
      socket.on('message', (data) => {
        console.log('WebSocket message:', data);
        if (onMessage) onMessage(data);
      });
      
      return socket;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      dispatch(showToast({
        message: 'Failed to establish real-time connection.',
        type: 'error'
      }));
      if (onError) onError(error);
      return null;
    }
  }, [userId, onConnect, onDisconnect, onMessage, onError, dispatch]);
  
  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
      return true;
    } else {
      dispatch(showToast({
        message: 'Not connected. Message will be sent when reconnected.',
        type: 'warning'
      }));
      return false;
    }
  }, [dispatch]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: socketRef.current?.connected || false
  };
};

export default useWebSocket;