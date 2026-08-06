import React, { createContext, useContext } from 'react';

/**
 * Cómo se muestra la persona que inició sesión en toda la aplicación: su foto
 * y el nombre que ella misma editó en Mi Perfil.
 *
 * Vive fuera del módulo a propósito. La foto y el nombre no son solo de la
 * pantalla de perfil: el riel de navegación los enseña en su tarjeta de
 * usuario, así que si el estado viviera dentro de `ProfileModule` el riel
 * seguiría mostrando las iniciales y el nombre viejo tras editarlos. `App.tsx`
 * es dueño del estado real y lo comparte aquí, igual que hace con el tema.
 *
 * No hay backend: se pierde al cerrar sesión, como todo lo demás.
 */
interface ProfileIdentityValue {
  /** Nombre a mostrar. Arranca en el de la sesión y cambia al guardar Datos personales. */
  name: string;
  setName: (name: string) => void;
  /** Foto en `data:` URL, o `null` para mostrar las iniciales. */
  photo: string | null;
  setPhoto: (photo: string | null) => void;
}

const ProfileIdentityContext = createContext<ProfileIdentityValue | null>(null);

export const ProfileIdentityProvider: React.FC<{
  value: ProfileIdentityValue;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <ProfileIdentityContext.Provider value={value}>{children}</ProfileIdentityContext.Provider>
);

export const useProfileIdentity = (): ProfileIdentityValue => {
  const context = useContext(ProfileIdentityContext);
  if (!context) {
    throw new Error('useProfileIdentity debe usarse dentro de un <ProfileIdentityProvider>.');
  }
  return context;
};
