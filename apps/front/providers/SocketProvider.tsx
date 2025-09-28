'use client'

import { IAuthInfo } from '@/app/interfaces';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  session: IAuthInfo | null;
}

export const SocketProvider = ({ children, session }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.isAuth) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || '', {
      auth: {
        token: session.token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    const onConnect = () => {
      setIsConnected(true);
      newSocket.emit('joinRoom', { room: 'room/' + session.userdata.id });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);

    setSocket(newSocket);

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.close();
      setSocket(null);
    };
  }, [session?.token, session?.userdata?.id, session?.isAuth]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
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