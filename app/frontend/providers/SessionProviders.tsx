'use client';

import { IAuthInfo } from '@/app/interfaces';
import { createContext, useContext } from 'react';


const SessionContext = createContext<IAuthInfo | null>(null);

export function SessionProviders({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: IAuthInfo | null;
}) {
  return (
    <SessionContext.Provider value={initialSession}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);