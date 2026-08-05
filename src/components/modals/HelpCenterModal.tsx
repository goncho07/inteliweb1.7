import React from 'react';
import { BookOpen, HelpCircle, Phone, PlayCircle } from 'lucide-react';

import {
  DialogShellBody,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

/** Teléfonos de soporte del colegio. */
const SUPPORT_PHONES = ['+51 960 960 752', '+51 934 973 356'];

/**
 * Ayuda y soporte. Antes era un `fixed inset-0` propio con su propio radio y
 * tipografías de hasta `text-3xl`; ahora es la misma ventana que el resto de la
 * app, con cabecera, cuerpo con scroll propio y pie.
 */
export const HelpCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogShellContent size="md">
      <DialogShellHeader
        icon={HelpCircle}
        title="Ayuda y soporte"
        description="Contacto directo con el equipo y material de consulta."
      />

      <DialogShellBody>
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-800/40">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone size={20} />
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Soporte y emergencias
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Para cualquier duda o problema con la plataforma, comuníquese al:
          </p>
          <div className="flex flex-col gap-2">
            {SUPPORT_PHONES.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="rounded-xl px-3 py-2 text-2xl font-bold text-primary hover:underline"
              >
                {phone}
              </a>
            ))}
          </div>
          <p className="text-base text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Horario de atención:
            </span>{' '}
            lunes a viernes, de 7:00 a. m. a 4:00 p. m.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Manuales y videos tutoriales
          </h3>
          <a
            href="#"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen size={20} />
            </span>
            <span>
              <span className="block text-base font-bold text-slate-900 dark:text-white">
                Manual del docente (PDF)
              </span>
              <span className="block text-base text-slate-500 dark:text-slate-400">
                Toda la información necesaria, paso a paso.
              </span>
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PlayCircle size={20} />
            </span>
            <span>
              <span className="block text-base font-bold text-slate-900 dark:text-white">
                Video tutorial: crear una citación
              </span>
              <span className="block text-base text-slate-500 dark:text-slate-400">
                Cómo enviar un aviso al apoderado, de principio a fin.
              </span>
            </span>
          </a>
        </section>
      </DialogShellBody>

      <DialogShellFooter className="justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-12 rounded-xl px-6 text-base font-semibold"
        >
          Cerrar
        </Button>
      </DialogShellFooter>
    </DialogShellContent>
  </Dialog>
);
