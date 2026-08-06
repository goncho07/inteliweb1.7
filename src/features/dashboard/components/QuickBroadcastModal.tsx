import React, { useMemo, useState } from 'react';
import { Megaphone, Send } from 'lucide-react';

import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { ClassroomSelect } from '@/components/common/ClassroomSelect';
import { Field } from '@/components/common/FormField';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { studentsInClassroom } from '@/data/users';
import type { ClassroomRef } from '@/types';

/**
 * Acción rápida de Inicio: aviso general por WhatsApp a todos los
 * apoderados de un aula. Un solo formulario: elegir aula arriba y escribir
 * el aviso debajo, todo visible a la vez. El envío es simulado (no hay
 * backend de mensajería aquí); el módulo WhatsApp sigue siendo el único
 * lugar para conversar uno a uno con un apoderado.
 */
export const QuickBroadcastModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  classrooms: ClassroomRef[];
  onSend: (classroom: ClassroomRef, message: string, guardianCount: number) => void;
}> = ({ isOpen, onClose, classrooms, onSend }) => {
  const [classroom, setClassroom] = useState<ClassroomRef | null>(null);
  const [message, setMessage] = useState('');

  const guardianCount = useMemo(() => {
    if (!classroom) return 0;
    const ids = new Set<string>();
    studentsInClassroom(classroom).forEach((student) => (student.guardianIds ?? []).forEach((id) => ids.add(id)));
    return ids.size;
  }, [classroom]);

  const reset = () => {
    setClassroom(null);
    setMessage('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!classroom || !message.trim()) return;
    onSend(classroom, message.trim(), guardianCount);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogShellContent>
        <DialogShellHeader
          icon={Megaphone}
          title="Comunicados"
          description="Aviso general por WhatsApp a los apoderados de un aula"
        />

        <DialogShellBody flush>
          <DialogShellSection title="Aula" icon={Megaphone} className="border-t-0">
            <Field id="broadcast-classroom" label="Aula" required>
              <ClassroomSelect id="broadcast-classroom" classrooms={classrooms} value={classroom} onChange={setClassroom} />
            </Field>

            {classroom && (
              <p className="text-base text-slate-600 dark:text-slate-300">
                El aviso llegará por WhatsApp a los {guardianCount} apoderados con contacto registrado de esta aula.
              </p>
            )}
          </DialogShellSection>

          <DialogShellSection title="Mensaje" icon={Send}>
            <Field id="broadcast-message" label="Aviso general" required>
              <Textarea
                id="broadcast-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej: Mañana los alumnos deben traer su uniforme de educación física…"
                className="min-h-[140px] resize-none rounded-xl text-base"
              />
            </Field>
          </DialogShellSection>
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={handleClose} />
          <DialogShellActionButton
            onClick={handleSubmit}
            disabled={!classroom || !message.trim() || guardianCount === 0}
          >
            <Send size={20} /> Enviar aviso
          </DialogShellActionButton>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
