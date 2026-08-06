import React from 'react';
import { Clock, Headset, Mail, Phone } from 'lucide-react';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';

/**
 * «Contactar soporte» del login: no hay mesa de ayuda real detrás, así que en
 * vez de un enlace `mailto:`/`tel:` que no llega a nadie, se muestran los
 * datos de contacto de la institución tal como los tendría cualquier docente
 * a mano — mismo patrón que «¿Olvidaste tu contraseña?».
 */
export const ContactSupportDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => (
  <ConfirmDialog
    open={open}
    icon={Headset}
    tone="primary"
    title="Contactar soporte"
    description="Si tiene problemas para ingresar, comuníquese con la Oficina de Sistemas del colegio."
    hideCancel
    confirmLabel="Entendido"
    onClose={onClose}
    onConfirm={onClose}
  >
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Phone size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Teléfono</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">(01) 447-0123</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Correo</p>
          <p className="truncate text-base font-bold text-slate-900 dark:text-white">
            soporte@ie6049.edu.pe
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Clock size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Horario de atención</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            Lunes a viernes, 8:00 a.m. – 4:00 p.m.
          </p>
        </div>
      </div>
    </div>
  </ConfirmDialog>
);
