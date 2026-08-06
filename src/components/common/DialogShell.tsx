import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * Ventana estándar de la app: la de mostrar información o rellenar un
 * formulario. Es una sola forma, sin variantes — mismo ancho, mismo alto,
 * misma cabecera y mismo pie en todos los módulos. Para un aviso o una
 * confirmación corta existe la otra forma, `ConfirmDialog`, que es compacta.
 *
 * Lo que fija este contrato:
 *
 * - **Un solo tamaño.** 720 px de ancho y un alto reservado de 680 px (o el
 *   90 % de la pantalla en el portátil de 1366×768). Ninguna ventana elige el
 *   suyo: abrir dos seguidas ya no cambia el marco de sitio, y una ficha con
 *   pestañas no salta de alto al cambiar de pestaña.
 * - **Cabecera y pie en gris, cuerpo en blanco.** Las tres zonas se distinguen
 *   de un vistazo: dónde estoy (arriba), qué leo o relleno (centro) y qué
 *   puedo hacer (abajo). Cabecera y pie quedan siempre fijos.
 * - **El scroll vive solo en el cuerpo** y es invisible: la barra nativa de
 *   Windows es ancha, gris y rompe el radio de la ventana.
 * - **Los botones del pie siempre en el mismo sitio**: salir a la izquierda,
 *   acción principal a la derecha, ambos de 48 px de alto.
 */

/** Fondo compartido por cabecera, tira de pestañas y pie. */
const DIALOG_CHROME = 'bg-slate-50 dark:bg-slate-900';

/** Alto de los botones del pie: 48px, la acción principal de una pantalla. */
export const DIALOG_ACTION_CLASS = 'h-12 gap-2 rounded-xl px-6 text-base font-semibold';

export const DialogShellContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(
      'flex w-full max-w-[720px] flex-col gap-0 overflow-hidden rounded-2xl p-0',
      // 680px es el alto de la pestaña más larga de la ficha de usuario con
      // margen de crecimiento; en el portátil de 1366×768 manda el 90vh.
      'h-[min(680px,90vh)]',
      className,
    )}
    {...props}
  />
));
DialogShellContent.displayName = 'DialogShellContent';

/**
 * Cabecera: icono en círculo de 44px a la izquierda, y a su derecha una
 * columna con el título y la línea de contexto. Lo accesorio (etiquetas de
 * rol, de estado) va en `aside`, alineado al extremo derecho de la segunda
 * línea: así la cabecera reparte su ancho en vez de amontonarlo a la
 * izquierda, y no se cruza con el botón de cerrar, que ocupa la esquina
 * superior derecha (de ahí el `pr-16`).
 */
export const DialogShellHeader: React.FC<{
  icon?: LucideIcon;
  /** Sustituye al icono cuando la ventana es la ficha de una persona (su avatar). */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** Línea de contexto bajo el título (a quién afecta, de qué aula…). */
  description?: React.ReactNode;
  /** Etiquetas o dato secundario, al extremo derecho de la cabecera. */
  aside?: React.ReactNode;
  /**
   * `center` centra verticalmente el nombre junto al avatar (a su lado, no
   * debajo) y deja las etiquetas de `aside` apiladas al extremo derecho — es
   * la disposición de la ficha de una persona. `left` deja el contexto en
   * línea con el título, para el resto.
   */
  align?: 'left' | 'center';
  /** Apila las etiquetas de `aside` en columna en vez de en fila. */
  asideStack?: boolean;
  /** `destructive` para bajas y borrados; `primary` para el resto. */
  tone?: 'primary' | 'destructive';
  className?: string;
}> = ({
  icon: Icon,
  leading,
  title,
  description,
  aside,
  align = 'left',
  asideStack = false,
  tone = 'primary',
  className,
}) => {
  const isCentered = align === 'center';

  return (
    <DialogHeader
      className={cn(
        'shrink-0 space-y-0 border-b border-slate-200 p-6 pr-16 text-left dark:border-slate-800',
        DIALOG_CHROME,
        className,
      )}
    >
      <div className={cn('flex gap-4', isCentered ? 'items-center' : 'items-start')}>
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

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <DialogTitle className="max-w-full truncate text-xl font-bold leading-tight text-slate-900 dark:text-white">
            {title}
          </DialogTitle>

          {isCentered
            ? description !== undefined && (
                <DialogDescription className="max-w-full truncate text-base text-slate-500 dark:text-slate-400">
                  {description}
                </DialogDescription>
              )
            : (description !== undefined || aside) && (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <DialogDescription className="min-w-0 text-base text-slate-500 dark:text-slate-400">
                    {description}
                  </DialogDescription>
                  {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
                </div>
              )}
        </div>

        {isCentered && aside && (
          <div
            className={cn(
              'flex shrink-0 gap-2',
              asideStack ? 'flex-col items-end' : 'items-center',
            )}
          >
            {aside}
          </div>
        )}
      </div>
    </DialogHeader>
  );
};

/**
 * Pestañas dentro de una ventana: la tira va pegada a la cabecera, comparte su
 * fondo gris y queda fuera del scroll, así que no se mueve al cambiar de
 * pestaña. Se usan con `Tabs` de shadcn envolviendo a `DialogShellTabs`.
 */
export const DialogShellTabs = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
  <TabsList
    ref={ref}
    className={cn(
      'h-auto w-full shrink-0 justify-start gap-0 rounded-none border-b border-slate-200 p-0 px-6 dark:border-slate-800',
      DIALOG_CHROME,
      className,
    )}
    {...props}
  />
));
DialogShellTabs.displayName = 'DialogShellTabs';

export const DialogShellTab = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(
      'flex h-12 flex-1 items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 text-base font-semibold shadow-none',
      'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
      'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none',
      className,
    )}
    {...props}
  />
));
DialogShellTab.displayName = 'DialogShellTab';

/**
 * Cuerpo: la única zona que puede desbordar, en blanco entre las dos franjas
 * grises, y sin barra de scroll a la vista.
 *
 * `flush` lo deja sin margen propio para que los bloques (`DialogShellSection`)
 * lleguen de borde a borde y se separen entre sí con una línea completa. Es lo
 * habitual en fichas y formularios: una tarjeta con borde dentro de una
 * ventana con borde es una caja dentro de otra caja, y estrecha el contenido
 * sin ganar nada. El cuerpo suelto (`p-6` y bloques separados con `gap-6`) se
 * reserva para lo que no son secciones: un aviso, una tabla, una lista.
 */
export const DialogShellBody: React.FC<{
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ flush = false, className, children }) => (
  <div
    className={cn(
      'hidden-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto bg-background',
      flush ? 'gap-0' : 'gap-6 p-6',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Bloque de una ficha o de un formulario dentro de una ventana: una franja de
 * título con fondo gris, a sangre, y debajo su contenido en blanco. La franja
 * es lo que separa un apartado del siguiente ahora que la ficha no tiene
 * pestañas y se recorre entera hacia abajo: al desplazarse siempre se ve
 * dónde empieza «Contacto» y dónde acaba «Identidad».
 *
 * Es la misma pieza en modo lectura y en modo edición — antes cada uno
 * titulaba sus apartados a su manera (aquí un título con icono, allí una
 * etiqueta gris en mayúsculas) y la misma ficha parecía dos pantallas.
 */
export const DialogShellSection: React.FC<{
  title: string;
  icon?: LucideIcon;
  /** Acción propia del apartado, alineada a la derecha del título. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, action, className, children }) => (
  <section
    className={cn(
      // El borde superior lo pone la sección, no la franja: así el primer
      // apartado no dibuja una segunda línea pegada a la de la cabecera.
      'flex flex-col border-t border-slate-200 first:border-t-0 dark:border-slate-800',
      className,
    )}
  >
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-3 dark:border-slate-800',
        DIALOG_CHROME,
      )}
    >
      <h3 className="flex items-center gap-3 text-base font-bold text-slate-900 dark:text-white">
        {Icon && <Icon size={20} className="shrink-0 text-slate-500 dark:text-slate-400" />}
        {title}
      </h3>
      {action}
    </div>
    <div className="flex flex-col gap-4 px-6 py-6">{children}</div>
  </section>
);

/**
 * Pie fijo, en gris: acción de salida a la izquierda, acción principal a la
 * derecha. Siempre en el mismo sitio, sin importar el scroll del cuerpo.
 * Cuando solo hay una acción (una ventana de solo lectura), va a la derecha,
 * que es donde el ojo ya busca el botón.
 */
export const DialogShellFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 p-6 dark:border-slate-800',
      DIALOG_CHROME,
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Botón de salida del pie («Cancelar», «Cerrar»). Existe para que ninguna
 * ventana vuelva a escribir a mano su alto, su radio y su variante.
 */
export const DialogShellCancelButton: React.FC<
  Omit<ButtonProps, 'variant' | 'size'> & { children?: React.ReactNode }
> = ({ className, children = 'Cancelar', ...props }) => (
  <Button type="button" variant="outline" className={cn(DIALOG_ACTION_CLASS, className)} {...props}>
    {children}
  </Button>
);

/** Acción principal del pie. Solo una por ventana. */
export const DialogShellActionButton: React.FC<ButtonProps> = ({ className, ...props }) => (
  <Button type="button" className={cn(DIALOG_ACTION_CLASS, className)} {...props} />
);
