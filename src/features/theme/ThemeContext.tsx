import React, { createContext, useContext } from 'react';

/** Paleta de color activa para toda la app (ver `index.css` § tema Rojo). */
export type ThemeMode = 'azul' | 'rojo';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  /** Modo oscuro (clase `.dark` en `<html>`). El riel lo alterna; Perfil › Apariencia lo elige explícitamente. */
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Expone el tema de color activo (y su setter) al árbol autenticado.
 * `App.tsx` es dueño del estado real; esto solo lo comparte por contexto en
 * vez de un global en `window` — así lo consume cualquier módulo (hoy solo
 * Perfil, pestaña Apariencia) con seguridad de tipos y sin fugas de memoria.
 */
export const ThemeProvider: React.FC<{ value: ThemeContextValue; children: React.ReactNode }> = ({
  value,
  children,
}) => <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;

export const useThemeMode = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode debe usarse dentro de un <ThemeProvider>.');
  }
  return context;
};
