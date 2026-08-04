import React, { createContext, useContext } from 'react';

import type { Session } from './session';

const SessionContext = createContext<Session | null>(null);

/** Envuelve el árbol autenticado; `App.tsx` solo lo monta cuando ya hay una sesión. */
export const SessionProvider: React.FC<{ session: Session; children: React.ReactNode }> = ({
  session,
  children,
}) => <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;

/** Lee la sesión activa. Solo se usa dentro de módulos ya autenticados. */
export const useSession = (): Session => {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession debe usarse dentro de un <SessionProvider>.');
  }
  return session;
};
