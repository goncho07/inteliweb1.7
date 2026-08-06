import { Bell, Key, Mail, MonitorSmartphone, Moon, Palette, ShieldAlert, Sun, User, type LucideIcon } from 'lucide-react';

import type { ThemeMode } from '@/features/theme/ThemeContext';

/** Las cuatro secciones del módulo, en el orden en que aparecen en el sidebar. */
export type ProfileSection = 'personal' | 'security' | 'notifications' | 'appearance';

export const PROFILE_SECTIONS: {
  id: ProfileSection;
  title: string;
  /** Línea corta de la tarjeta del sidebar. */
  description: string;
  /** Frase larga que explica la sección en la cabecera del panel. */
  summary: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'personal',
    title: 'Datos personales',
    description: 'Foto, nombre y contacto',
    summary: 'Tu foto, tu contacto y los datos que gestiona el colegio.',
    icon: User,
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Contraseña y dispositivos',
    summary: 'Tu contraseña y los dispositivos donde tienes la sesión abierta.',
    icon: Key,
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Qué avisos quieres recibir',
    summary: 'Elige por dónde quieres que te avisemos. Cada cambio se aplica de inmediato.',
    icon: Bell,
  },
  {
    id: 'appearance',
    title: 'Apariencia',
    description: 'Modo de vista y color',
    summary: 'El cambio se aplica al momento y solo afecta a tu cuenta.',
    icon: Palette,
  },
];

/**
 * Hábitos de seguridad, en una línea cada uno: se leen en la columna derecha de
 * la sección, junto a los dispositivos, sin robarle alto al formulario.
 */
export const SECURITY_TIPS = [
  'No compartas tu contraseña con nadie.',
  'Cierra sesión en computadoras compartidas.',
  'Cámbiala si crees que alguien más la conoce.',
];

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (value) => value.length >= 8 },
  { id: 'upper', label: 'Al menos una letra mayúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Al menos un número', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'Al menos un carácter especial (!@#$%^&*)', test: (value) => /[!@#$%^&*]/.test(value) },
];

/**
 * Fortaleza de la contraseña según cuántos requisitos cumple. Cuatro escalones
 * y ni uno más: el objetivo es que se entienda de un vistazo, no medir bits.
 *
 * Los cinco pasos se pintan solo con los tres hues de severidad de
 * `DESIGN_SYSTEM.md` § A4 (rose → amber → emerald). Antes usaba `red`,
 * `orange` y `lime`, tres escalas que el sistema no admite para comunicar
 * severidad y que no aparecen en ningún otro módulo. La gradación dentro de
 * cada hue (600 vs. 500) más el largo de la barra y la etiqueta bastan para
 * distinguir "Muy débil" de "Débil" y "Buena" de "Fuerte".
 */
export const PASSWORD_STRENGTH_LEVELS: { label: string; barClassName: string; textClassName: string }[] = [
  { label: 'Muy débil', barClassName: 'bg-rose-600', textClassName: 'text-rose-700 dark:text-rose-400' },
  { label: 'Débil', barClassName: 'bg-rose-400', textClassName: 'text-rose-600 dark:text-rose-300' },
  { label: 'Aceptable', barClassName: 'bg-amber-500', textClassName: 'text-amber-700 dark:text-amber-400' },
  { label: 'Buena', barClassName: 'bg-emerald-400', textClassName: 'text-emerald-700 dark:text-emerald-300' },
  { label: 'Fuerte', barClassName: 'bg-emerald-600', textClassName: 'text-emerald-700 dark:text-emerald-400' },
];

export interface NotificationPref {
  id: string;
  title: string;
  description: string;
}

/**
 * Avisos agrupados por canal (dónde llega el mensaje), no por tema: el docente
 * decide antes "por dónde quiero que me avisen" que "de qué".
 */
export const NOTIFICATION_GROUPS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  prefs: NotificationPref[];
}[] = [
  {
    id: 'app',
    title: 'En la aplicación',
    description: 'Avisos que aparecen mientras usas Intelicole.',
    icon: MonitorSmartphone,
    prefs: [
      {
        id: 'push',
        title: 'Notificaciones en el navegador',
        description: 'Recibir alertas en el navegador mientras usas la aplicación.',
      },
      {
        id: 'direct-messages',
        title: 'Mensajes directos',
        description: 'Avisarme cuando reciba un mensaje de otro usuario.',
      },
    ],
  },
  {
    id: 'email',
    title: 'Correo electrónico',
    description: 'Lo que llega a tu bandeja de entrada.',
    icon: Mail,
    prefs: [
      {
        id: 'weekly-summary',
        title: 'Resumen semanal',
        description: 'Un resumen de la actividad de la semana, cada lunes.',
      },
      {
        id: 'system-updates',
        title: 'Actualizaciones del sistema',
        description: 'Correos sobre nuevas funciones y mantenimientos.',
      },
    ],
  },
  {
    id: 'urgent',
    title: 'Avisos urgentes',
    description: 'Situaciones que no pueden esperar al resumen.',
    icon: ShieldAlert,
    prefs: [
      {
        id: 'incidents',
        title: 'Incidencias graves',
        description: 'Avisarme de inmediato cuando se registre una incidencia grave.',
      },
      {
        id: 'citations',
        title: 'Respuestas de apoderados',
        description: 'Avisarme cuando un apoderado confirme o rechace una citación.',
      },
    ],
  },
];

export const DEFAULT_NOTIFICATIONS: Record<string, boolean> = {
  push: true,
  'direct-messages': true,
  'weekly-summary': true,
  'system-updates': false,
  incidents: true,
  citations: true,
};

/** Modo de visualización: claro u oscuro. Es lo mismo que alterna el riel, elegido aquí de forma explícita. */
export const DISPLAY_MODES: { id: 'claro' | 'oscuro'; title: string; description: string; icon: LucideIcon }[] = [
  { id: 'claro', title: 'Modo claro', description: 'Fondo blanco. Recomendado con luz de día.', icon: Sun },
  { id: 'oscuro', title: 'Modo oscuro', description: 'Fondo negro. Descansa la vista de noche.', icon: Moon },
];

export const THEME_OPTIONS: { id: ThemeMode; title: string; description: string; swatchClassName: string }[] = [
  {
    id: 'azul',
    title: 'Azul (por defecto)',
    description: 'Color institucional del sistema',
    swatchClassName: 'bg-blue-600',
  },
  {
    id: 'rojo',
    title: 'Institucional (rojo)',
    description: 'Colores institucionales (UGEL)',
    swatchClassName: 'bg-rose-600',
  },
];
