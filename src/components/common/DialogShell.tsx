import React from 'react';
import type { LucideIcon } from 'lucide-react';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * Anatomía única de las ventanas modales: cabecera fija, cuerpo con scroll
 * propio y pie fijo. Todas las ventanas de la app se componen con estas piezas
 * — no se vuelve a escribir a mano un `DialogContent` con sus paddings, ni un
 * pie con sus botones, ni una cabecera con su icono.
 *
 * Dos cosas que resuelve y que antes fallaban:
 *
 * - **Tamaño estable.** El ancho sale de una escala cerrada de tres valores y
 *   la altura puede fijarse (`height="fixed"`). Una ficha con pestañas dejaba
 *   de saltar de alto al cambiar de pestaña: el borde de la ventana no se
 *   mueve, solo cambia lo que hay dentro.
 * - **Scroll interno y con estilo propio.** El desbordamiento vive siempre en
 *   el cuerpo (`DialogShellBody`), nunca en el contenedor, y usa la barra fina
 *   de `custom-scrollbar` en vez de la nativa del navegador.
 */

/** Anchos permitidos. Cualquier otro valor sale del contrato de diseño. */
const DIALOG_WIDTH = {
  /** Confirmaciones y formularios cortos. */
  sm: 'max-w-[500px]',
  /** Formularios largos y fichas con pestañas. */
  md: 'max-w-[720px]',
  /** Contenido ancho: tablas, horarios, cuadrículas. */
  lg: 'max-w-[900px]',
} as const;

export type DialogShellSize = keyof typeof DIALOG_WIDTH;

export const DialogShellContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & {
    size?: DialogShellSize;
    /**
     * `fixed` reserva siempre el mismo alto, para ventanas cuyo contenido
     * cambia de tamaño sin que la ventana deba moverse (pestañas, pasos de un
     * asistente). `auto` crece con el contenido hasta el 90 % de la pantalla.
     */
    height?: 'auto' | 'fixed';
  }
>(({ className, size = 'md', height = 'auto', ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(
      'flex w-full flex-col gap-0 overflow-hidden rounded-2xl p-0',
      DIALOG_WIDTH[size],
      // 680px es el alto de la pestaña más larga de la ficha de usuario con
      // margen de crecimiento; en el portátil de 1366×768 manda el 90vh.
      height === 'fixed' ? 'h-[min(680px,90vh)]' : 'max-h-[90vh]',
      className,
    )}
    {...props}
  />
));
DialogShellContent.displayName = 'DialogShellContent';

/**
 * Cabecera: icono en círculo de 44px, título y una línea de contexto. Fija —
 * nunca entra en el scroll. `pr-14` deja libre el botón de cerrar que
 * `DialogContent` coloca arriba a la derecha.
 */
export const DialogShellHeader: React.FC<{
  icon?: LucideIcon;
  /** Sustituye al icono cuando la ventana es la ficha de una persona (su avatar). */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** Línea de contexto bajo el título (a quién afecta, de qué aula…). */
  description?: React.ReactNode;
  /** `destructive` para bajas y borrados; `primary` para el resto. */
  tone?: 'primary' | 'destructive';
  className?: string;
  children?: React.ReactNode;
}> = ({ icon: Icon, leading, title, description, tone = 'primary', className, children }) => (
  <DialogHeader
    className={cn(
      'shrink-0 space-y-1 border-b border-slate-100 p-6 pr-14 text-left dark:border-slate-800',
      className,
    )}
  >
    <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
      {leading ?? (Icon && (
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            tone === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary',
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </span>
      ))}
      {title}
    </DialogTitle>
    {description !== undefined && (
      <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
        {description}
      </DialogDescription>
    )}
    {children}
  </DialogHeader>
);

/**
 * Pestañas dentro de una ventana: la tira va pegada a la cabecera y fuera del
 * scroll, así que no se mueve al cambiar de pestaña. Se usan con `Tabs` de
 * shadcn — son las clases, no otro componente, para no envolver a Radix.
 */
export const DIALOG_TABS_LIST_CLASS =
  'h-auto w-full shrink-0 justify-start gap-0 rounded-none border-b border-slate-200 bg-transparent p-0 px-6 dark:border-slate-800';

export const DIALOG_TAB_TRIGGER_CLASS = [
  'flex h-12 flex-1 items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 text-base font-semibold shadow-none',
  'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
  'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none',
].join(' ');

/**
 * Cuerpo: la única zona que puede desbordar. Bloques separados con `gap-6` y
 * barra de scroll propia.
 */
export const DialogShellBody: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn('custom-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6', className)}>
    {children}
  </div>
);

/**
 * Pie fijo: acción de salida a la izquierda, acción principal a la derecha.
 * Siempre en el mismo sitio, sin importar el scroll del cuerpo.
 */
export const DialogShellFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 p-6 dark:border-slate-800',
      className,
    )}
  >
    {children}
  </div>
);
