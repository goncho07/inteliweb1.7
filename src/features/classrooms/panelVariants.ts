import { AlertTriangle, Mail, type LucideIcon } from 'lucide-react';

import type { CitationItem } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';

/**
 * Descriptor de una variante del panel de seguimiento (`CitationsBoardPanel`).
 *
 * Incidencias y Comunicados comparten toda la lógica —bandeja, filtros,
 * composición, reprogramación— y sólo difieren en copy, icono y color. Cada
 * variante aporta únicamente las clases de *color*; la geometría (tamaños,
 * radios, tipografía) vive en el JSX del panel para que ambas variantes tengan
 * exactamente el mismo layout.
 */
export interface CitationsPanelVariant {
  /** Título de la cabecera. */
  title: string;
  /** Icono de la cabecera. */
  icon: LucideIcon;
  /** Etiqueta en plural usada en los subtítulos de estado. */
  pluralLabel: string;
  /** Atajo "+" de composición en la cabecera (sólo Incidencias). */
  showComposeShortcut: boolean;
  /** Clases del botón principal de composición. */
  composeButtonClass: string;
  /** Clases del icono dentro de ese botón. */
  composeIconClass: string;
  /** Clases de la etiqueta de categoría en las tarjetas. */
  badgeClass: string;
  /** Color del avatar. La variante con color usa el del propio estudiante. */
  avatarColorClass: (avatarColor?: string) => string;
  /** Color del chip de motivo. La variante con color depende del tema del ítem. */
  reasonChipClass: (theme?: CitationItem['theme']) => string;
}

const MONOCHROME =
  'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';

/** Variante con color: refleja la gravedad mediante el tema de cada incidencia. */
export const INCIDENCIAS_VARIANT: CitationsPanelVariant = {
  title: 'Incidencias',
  icon: AlertTriangle,
  pluralLabel: 'Incidencias',
  showComposeShortcut: true,
  composeButtonClass:
    'bg-[#c2e7ff] text-[#041e49] hover:bg-[#b5dfff] shadow-sm shadow-blue-500/10',
  composeIconClass: 'fill-[#041e49] text-[#041e49]',
  badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  avatarColorClass: (avatarColor) => cn('text-white', avatarColor),
  reasonChipClass: (theme) => {
    if (theme === 'yellow' || theme === 'orange') {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
    if (theme === 'blue') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  },
};

/** Variante monocroma: los comunicados no transmiten gravedad. */
export const COMUNICADOS_VARIANT: CitationsPanelVariant = {
  title: 'Comunicados',
  icon: Mail,
  pluralLabel: 'Comunicados',
  showComposeShortcut: false,
  composeButtonClass:
    'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm',
  composeIconClass: '',
  badgeClass:
    'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400',
  avatarColorClass: () => MONOCHROME,
  reasonChipClass: () => MONOCHROME,
};
