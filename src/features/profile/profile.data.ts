import { KeyRound, LogIn, UserCog, type LucideIcon } from 'lucide-react';

/**
 * Datos simulados de la cuenta que no salen de `MOCK_USERS`: dispositivos con
 * sesión abierta, historial y estado de la cuenta. Son fijos a propósito —la app no tiene
 * backend— y sirven para que Seguridad muestre información real de leer, no un
 * formulario suelto en medio de una pantalla vacía.
 */

export interface ActiveDevice {
  id: string;
  /** Equipo tal y como lo reconocería el usuario ("Laptop del aula 3"). */
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  /** El dispositivo desde el que se está usando la app ahora mismo. */
  current?: boolean;
}

export const ACTIVE_DEVICES: ActiveDevice[] = [
  {
    id: 'dev-1',
    device: 'Laptop del colegio',
    browser: 'Chrome · Windows 10',
    location: 'Sala de docentes',
    lastActive: 'Ahora mismo',
    current: true,
  },
  {
    id: 'dev-2',
    device: 'Celular personal',
    browser: 'Chrome · Android',
    location: 'Fuera del colegio',
    lastActive: 'Ayer, 07:40 p. m.',
  },
  {
    id: 'dev-3',
    device: 'Computadora de dirección',
    browser: 'Edge · Windows 11',
    location: 'Dirección',
    lastActive: 'Hace 3 días',
  },
];

export interface AccountEvent {
  id: string;
  label: string;
  detail: string;
  icon: LucideIcon;
}

/**
 * Historial de la cuenta, en el panel derecho de Datos personales. "Cuenta
 * creada" hace de fecha de alta, así que no hay además un dato "Miembro desde"
 * en la tarjeta de al lado: sería el mismo dato dos veces en la misma pantalla.
 */
export const ACCOUNT_ACTIVITY: AccountEvent[] = [
  { id: 'ev-1', label: 'Último inicio de sesión', detail: 'Hoy, 08:30 a. m. · Laptop del colegio', icon: LogIn },
  { id: 'ev-2', label: 'Contraseña actualizada', detail: 'Hace 2 meses', icon: KeyRound },
  { id: 'ev-3', label: 'Cuenta creada por un administrador', detail: 'Marzo de 2024', icon: UserCog },
];

/**
 * Estado de la cuenta que se usa como etiqueta de la cabecera del panel cuando
 * está abierta la sección Seguridad. El resto de datos de estado no se repiten
 * aquí: viven en `ACCOUNT_ACTIVITY` o en la ficha del usuario.
 */
export const ACCOUNT_STATUS = {
  passwordUpdated: 'Hace 2 meses',
} as const;
