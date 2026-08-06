import React from 'react';
import { AlertTriangle, type LucideIcon } from 'lucide-react';

import {
  DIALOG_ACTION_CLASS,
  DialogShellCancelButton,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * La segunda —y última— forma de ventana de la app: el aviso. Se usa para
 * confirmar una acción («Eliminar usuario») o dar una noticia que exige un
 * «Entendido», nunca para un formulario.
 *
 * Frente a la ventana estándar (`DialogShell`) cambia solo en tamaño: es
 * compacta (500 px) y crece con su contenido en vez de reservar un alto fijo
 * —una pregunta de dos líneas dentro de una ventana de 680 px de alto parece
 * un error—. Todo lo demás es idéntico: cabecera y pie grises, cuerpo en
 * blanco, salir a la izquierda y la acción a la derecha.
 */

export type ConfirmTone = 'destructive' | 'warning' | 'primary';

const TONE_STYLES: Record<ConfirmTone, string> = {
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  primary: 'bg-primary/10 text-primary',
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  /** Icono de la cabecera. Por defecto, el triángulo de aviso. */
  icon?: LucideIcon;
  tone?: ConfirmTone;
  title: string;
  /** Consecuencia de la acción, en una línea. */
  description?: string;
  /** Detalle opcional: a quién afecta, la lista de lo que se borra… */
  children?: React.ReactNode;
  confirmLabel: string;
  /** Icono junto a la acción principal (papelera, check…). */
  confirmIcon?: LucideIcon;
  confirmDisabled?: boolean;
  /** Texto del botón de salida. «Cancelar» salvo que la ventana solo informe. */
  cancelLabel?: string;
  /** Sin confirmación: la ventana solo informa y el pie lleva un único botón. */
  hideCancel?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({
  open,
  icon: Icon = AlertTriangle,
  tone = 'destructive',
  title,
  description,
  children,
  confirmLabel,
  confirmIcon: ConfirmIcon,
  confirmDisabled,
  cancelLabel = 'Cancelar',
  hideCancel = false,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogContent className="flex w-full max-w-[500px] flex-col gap-0 overflow-hidden rounded-2xl p-0 max-h-[85vh]">
      <DialogHeader className="shrink-0 space-y-1 border-b border-slate-200 bg-slate-50 p-6 pr-14 text-left dark:border-slate-800 dark:bg-slate-900">
        <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              TONE_STYLES[tone],
            )}
          >
            <Icon size={20} strokeWidth={2} />
          </span>
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      {children && (
        <div className="hidden-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-background p-6">
          {children}
        </div>
      )}

      <div
        className={cn(
          'flex shrink-0 items-center gap-3 border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900',
          hideCancel ? 'justify-end' : 'justify-between',
        )}
      >
        {!hideCancel && <DialogShellCancelButton onClick={onClose}>{cancelLabel}</DialogShellCancelButton>}
        <Button
          type="button"
          variant={tone === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={DIALOG_ACTION_CLASS}
        >
          {ConfirmIcon && <ConfirmIcon size={20} />} {confirmLabel}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
