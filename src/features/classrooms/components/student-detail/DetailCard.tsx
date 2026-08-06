import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Color del icono de la sección: verde para asistencia, rosa para incidencias. */
const TONE_CLASSES = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
} as const;

/**
 * Sección del perfil del estudiante (Asistencia, Incidencias).
 *
 * A sangre, como la tabla de Usuarios o la Vista General del Aula: no es una
 * tarjeta flotante con su margen y su radio, sino una banda que llega a los
 * bordes del panel y se separa de la siguiente por un borde. Así el calendario
 * y el historial aprovechan todo el ancho del portátil en vez de dejar aire a
 * los lados.
 *
 * **Las dos secciones se dibujan con las mismas tres bandas** —cabecera,
 * cuerpo y pie— y todas con la misma altura mínima y el mismo padding. Así las
 * líneas horizontales de la izquierda y la derecha caen a la misma altura: lo
 * único que cambia entre Asistencia e Incidencias es lo que va dentro del
 * cuerpo (una rejilla de días frente a un listado). El mes se navega dentro
 * del propio cuerpo, pegado al calendario o al listado que gobierna, en vez de
 * en una barra aparte: así se lee como parte del calendario y no como un
 * control flotante encima de él.
 *
 * | Banda | Altura | Contenido |
 * | --- | --- | --- |
 * | Cabecera | `h-16` fija | icono de 44px + título + acción principal |
 * | Cuerpo | resto (`flex-1`) | mes + calendario / listado |
 * | Pie | automática | leyenda / paginación |
 *
 * La cabecera copia la anatomía de `ModulePaneHeader` —icono circular de 44px,
 * título y acciones a la derecha— pero en `text-lg font-bold`, nunca en el
 * `font-black` del módulo: es una sección dentro del panel, no otra página.
 */
export const DetailCard: React.FC<{
  icon: LucideIcon;
  tone: keyof typeof TONE_CLASSES;
  title: string;
  /** Acción principal de la sección. Una sola, para que la cabecera nunca salte de alto. */
  action?: React.ReactNode;
  /** Pie de la sección: leyenda en Asistencia, paginación en Incidencias. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, tone, title, action, footer, children, className }) => (
  <section className={cn('flex min-w-0 flex-col bg-white dark:bg-slate-900', className)}>
    <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 dark:border-slate-800/60">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            TONE_CLASSES[tone],
          )}
        >
          <Icon size={24} strokeWidth={2.5} />
        </span>
        <h2 className="truncate text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
      {action}
    </div>

    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-6">{children}</div>

    {footer && (
      <div className="shrink-0 border-t border-slate-100 px-6 py-4 dark:border-slate-800/60">
        {footer}
      </div>
    )}
  </section>
);
