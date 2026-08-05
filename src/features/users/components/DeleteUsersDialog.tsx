import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import {
  DialogShellBody,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { UserItem } from '@/types';

/**
 * Confirmación de baja, obligatoria antes de borrar. Muestra a quién afecta
 * (nombre y DNI, o la lista completa en una baja múltiple) para que nadie
 * elimine a la persona equivocada por haber marcado mal una casilla.
 */
export const DeleteUsersDialog: React.FC<{
  open: boolean;
  users: UserItem[];
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, users, onClose, onConfirm }) => {
  const isBulk = users.length > 1;
  const single = users[0];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogShellContent size="md" height="fixed">
        <DialogShellHeader
          icon={AlertTriangle}
          tone="destructive"
          title={isBulk ? `Eliminar ${users.length} usuarios` : 'Eliminar usuario'}
          description="Esta acción no se puede deshacer."
        />

        <DialogShellBody>
          {isBulk ? (
            <>
              <p className="text-base text-slate-700 dark:text-slate-300">
                Se dará de baja a estas {users.length} personas y dejarán de aparecer en aulas,
                citaciones y notificaciones:
              </p>
              <ul className="custom-scrollbar divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="truncate text-base font-medium text-slate-800 dark:text-slate-200">
                      {user.name}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                      DNI {user.dni}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            single && (
              <p className="text-base text-slate-700 dark:text-slate-300">
                Se dará de baja a{' '}
                <strong className="font-bold text-slate-900 dark:text-white">{single.name}</strong>{' '}
                (DNI {single.dni}). Dejará de aparecer en aulas, citaciones y notificaciones.
              </p>
            )
          )}
        </DialogShellBody>

        <DialogShellFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 rounded-xl px-6 text-base font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="h-12 gap-2 rounded-xl px-6 text-base font-semibold"
          >
            <Trash2 size={20} /> {isBulk ? `Eliminar ${users.length}` : 'Eliminar'}
          </Button>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
