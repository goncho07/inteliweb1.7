/**
 * Persistencia de «Mantener sesión iniciada» en el login. Sin backend: lo
 * único que se guarda es el id del usuario, en `localStorage` del navegador,
 * para poder resolver la sesión de nuevo al abrir la app — nunca la clave,
 * que ni siquiera se valida.
 */
const STORAGE_KEY = 'intelicole-remembered-user-id';

export const rememberUser = (userId: string): void => {
  localStorage.setItem(STORAGE_KEY, userId);
};

export const forgetRememberedUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getRememberedUserId = (): string | null => localStorage.getItem(STORAGE_KEY);
