import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

import { containerVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Estructura común a todos los módulos: barra lateral + panel principal,
 * cada uno una tarjeta propia separada por un espacio (nunca pegadas). Cada
 * columna trae su propia cabecera — no hay una cabecera única de módulo que
 * cruce ambas: la izquierda (`ModuleSidebar`) siempre muestra la identidad
 * del módulo (icono + nombre); la derecha (`ModulePaneHeader`, opcional)
 * muestra el contenido activo en el panel — el aula elegida, la citación
 * abierta, el rol de usuario en pantalla — y se omite si no hay nada que
 * mostrar todavía (p. ej. antes de elegir algo en el sidebar).
 */

export const ModuleShell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="show"
    className={cn(
      'flex h-full w-full flex-col overflow-hidden bg-slate-50 font-poppins dark:bg-slate-950',
      className,
    )}
  >
    {/* Sin relleno propio: el margen contra el fondo lo pone una sola vez el
        contenedor de `App.tsx`. Las tarjetas del módulo llegan hasta el borde. */}
    <div className="flex w-full min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row lg:gap-4">
      {children}
    </div>
  </motion.div>
);

/**
 * Barra lateral: ancho fijo a partir de `lg`, y arriba del contenido — no a
 * la izquierda — cuando la pantalla es estrecha. Tarjeta propia (borde +
 * radio completos), separada del panel principal por el `gap` de la fila,
 * no pegada a él. `title`/`icon` son la cabecera del módulo — la única
 * identidad de página que existe, así que la lleva siempre.
 */
export const ModuleSidebar: React.FC<{
  children: React.ReactNode;
  className?: string;
  title: string;
  icon: LucideIcon;
  /** Controles a nivel de módulo (p. ej. un popover de fechas), no de un ítem seleccionado. */
  actions?: React.ReactNode;
}> = ({ children, className, title, icon: Icon, actions }) => (
  <section
    className={cn(
      'z-10 flex w-full min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900',
      'max-h-[45vh] lg:max-h-none lg:w-[340px] xl:w-[380px] 2xl:w-[400px]',
      className,
    )}
  >
    <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 dark:border-slate-800/60 dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <h1 className="truncate text-2xl font-black tracking-tight text-slate-800 dark:text-white">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
    {children}
  </section>
);

/**
 * Zona con scroll de la barra lateral. Fija el único relleno exterior de la
 * columna (`p-3`) y la separación entre bloques (`space-y-6`) — un módulo no
 * pone su propio padding ni anida otra tarjeta blanca aquí dentro.
 */
export const ModuleSidebarBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('hidden-scrollbar flex-1 space-y-6 overflow-y-auto p-3', className)}>{children}</div>
);

/**
 * Bloque de la barra lateral: etiqueta en mayúsculas + lista de tarjetas.
 * Es la única forma de titular una sección del sidebar, para que Inicio,
 * Aulas, Usuarios y Calendario compartan etiqueta, márgenes y separación
 * entre ítems en lugar de que cada módulo invente los suyos.
 */
export const ModuleSidebarSection: React.FC<{
  label: string;
  /** Línea de contexto bajo la etiqueta (ej. "5 grados • 33 secciones"). */
  hint?: string;
  /** Control a la derecha de la etiqueta (ej. "Ver todo"). */
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, hint, action, children }) => (
  <div>
    <div className="flex min-h-10 items-center justify-between gap-2 px-2">
      <h3 className="truncate text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </h3>
      {action}
    </div>
    {hint && <p className="px-2 pb-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    <div className="flex flex-col gap-2 pt-1">{children}</div>
  </div>
);

export const ModulePane: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <section
    className={cn(
      'relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800/60 dark:bg-slate-950',
      className,
    )}
  >
    {children}
  </section>
);

/**
 * Cabecera del panel principal: qué se está mostrando ahí ahora mismo
 * (nombre del aula, del alumno, de la citación…) y sus acciones propias. Se
 * usa como primer hijo dentro de `ModulePane`, antes de `ModuleBody` — y se
 * omite por completo si el panel todavía no tiene nada seleccionado que
 * mostrar (el panel arranca directo en su estado vacío).
 */
export const ModulePaneHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      // Misma altura exacta que la cabecera del sidebar (`h-16`): las dos
      // columnas arrancan a la misma línea, ninguna más alta que la otra. Sin
      // `flex-wrap` ni `py-*` propios — si el contenido no cabe, se recorta o
      // se reduce, nunca se apila haciendo crecer la barra.
      'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 dark:border-slate-800/60 dark:bg-slate-900',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Zona con scroll bajo la cabecera del módulo. `centered` limita el ancho para
 * el panel principal.
 *
 * `flush` quita el relleno exterior: el contenido llega a los bordes del panel
 * y ocupa todo el ancho disponible. Se reserva a los módulos cuya pantalla
 * *es* una tabla (Usuarios, Vista General del Aula), donde esos 32px de margen
 * se comen columnas de datos. En ese modo el contenido tampoco se separa con
 * `space-y-6`: los bloques se apilan pegados y se distinguen por su borde.
 */
export const ModuleBody: React.FC<{
  children: React.ReactNode;
  centered?: boolean;
  flush?: boolean;
  className?: string;
}> = ({ children, centered = false, flush = false, className }) => (
  <div
    className={cn(
      'custom-scrollbar relative z-0 flex-1 overflow-y-auto',
      !flush && 'p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-6',
      className,
    )}
  >
    {centered ? (
      <div className={cn('mx-auto w-full max-w-[1700px]', !flush && 'space-y-6')}>{children}</div>
    ) : (
      children
    )}
  </div>
);
