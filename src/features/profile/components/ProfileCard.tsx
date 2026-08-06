import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Piezas comunes a las cuatro secciones de Mi Perfil.
 *
 * La pantalla se compone de tarjetas, no de bandas a sangre: mismo radio,
 * borde, sombra y relleno que `ChartCard` (Inicio, Vista General del Aula), de
 * forma que Mi Perfil se lee igual que el resto de módulos con panel de
 * contenido.
 *
 * Quién es la sección y su dato de estado los dice la cabecera del panel
 * (`ModulePaneHeader`); aquí no se repite ningún título de sección. Si una
 * tarjeta tiene acciones, van en su `footer`: nunca sueltas en medio del
 * contenido.
 */

/**
 * **La estructura de las cuatro secciones, y no hay otra.** Dos paneles de
 * ancho igual: a la izquierda lo que el docente decide o edita, a la derecha lo
 * que solo consulta. Cada panel es una pila de `ProfileCard` separadas por
 * `gap-6`; una tarjeta que necesite el ancho entero se marca con
 * `xl:col-span-2` y ocupa la última fila.
 *
 * Ninguna sección inventa su propio reparto (ni una columna, ni tres): así las
 * cuatro se leen igual al cambiar de una a otra en el sidebar, y todas caben
 * enteras en el panel a 1366×768 — Mi Perfil no tiene barra de desplazamiento.
 * Si a una sección se le añade contenido, se recoloca dentro de esta rejilla;
 * no se la deja crecer hacia abajo.
 */
export const ProfileSectionGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">{children}</div>
);

/** Panel (columna) de la rejilla: una pila de tarjetas con la separación estándar. */
export const ProfileSectionColumn: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('flex flex-col gap-6', className)}>{children}</div>;
export const ProfileCard: React.FC<{
  title: string;
  icon: LucideIcon;
  description?: string;
  /** Control o etiqueta a la derecha del título. */
  action?: React.ReactNode;
  /** Acciones de la tarjeta, ancladas a su pie tras un borde. */
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, description, action, footer, className, bodyClassName, children }) => (
  <Card
    className={cn(
      'flex flex-col rounded-2xl border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900',
      className,
    )}
  >
    <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
          {description && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>

    <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>

    {footer && (
      <div className="mt-4 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
        {footer}
      </div>
    )}
  </Card>
);

/**
 * Par etiqueta/valor de solo lectura (DNI, situación, último acceso…). Compacto
 * a propósito: una fila de estos datos no debe robarle alto al formulario, que
 * es lo único que el docente puede cambiar.
 */
export const ProfileFact: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}> = ({ label, value, icon: Icon }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
    {Icon && <Icon size={20} aria-hidden className="shrink-0 text-slate-400 dark:text-slate-500" />}
    <div className="min-w-0">
      <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </div>
);
