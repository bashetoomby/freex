'use client'

import { IAuthInfo } from '@/app/interfaces';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  session: IAuthInfo | null;
}

export const SocketProvider = ({ children, session }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.isAuth) {
      console.log('No auth session, skipping socket connection');
      return;
    }

    // Определяем URL для WebSocket
    const getWebSocketUrl = () => {
      if (typeof window !== 'undefined') {
        // В продакшене используем тот же домен с путем /backend
        if (process.env.NODE_ENV === 'production') {
          return window.location.origin;
        }
        // В разработке localhost
        return 'http://localhost:8080';
      }
      return 'http://localhost:8080';
    };

    const websocketUrl = getWebSocketUrl();
    console.log('🔌 Connecting to WebSocket:', websocketUrl);

    const newSocket = io(websocketUrl, {
      auth: {
        token: session.token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      timeout: 10000,
      path: '/backend/socket.io'
    });

    const onConnect = () => {
      console.log('✅ SUCCESS: Connected to backend WebSocket');
      setIsConnected(true);
      setConnectionError(null);
      newSocket.emit('joinRoom', { room: 'room/' + session.userdata.id });
    };

    const onDisconnect = (reason: string) => {
      console.log('❌ DISCONNECTED from WebSocket:', reason);
      setIsConnected(false);
      setConnectionError(`Disconnected: ${reason}`);
    };

    const onConnectError = (error: Error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionError(`Connection error: ${error.message}`);
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('connect_error', onConnectError);
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session?.token, session?.userdata?.id, session?.isAuth]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};