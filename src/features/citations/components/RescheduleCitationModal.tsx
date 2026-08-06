import React from 'react';
import { CalendarDays, FileText } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import { CustomTimePicker } from '@/components/calendar/CustomTimePicker';
import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { Field, FieldGrid } from '@/components/common/FormField';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import type { Citation } from '../types';

/** Modal para reprogramar una citación pendiente: nueva fecha, hora y motivo opcional. */
export const RescheduleCitationModal: React.FC<{
  isOpen: boolean;
  citation: Citation | null;
  reschedDate: string;
  onRescheduleDateChange: (value: string) => void;
  reschedTime: string;
  onRescheduleTimeChange: (value: string) => void;
  reschedReason: string;
  onRescheduleReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  citation,
  reschedDate,
  onRescheduleDateChange,
  reschedTime,
  onRescheduleTimeChange,
  reschedReason,
  onRescheduleReasonChange,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogShellContent>
        <DialogShellHeader
          icon={CalendarDays}
          title="Reprogramar citación"
          description={citation ? `${citation.student} · ${citation.reason}` : undefined}
        />

        <DialogShellBody flush>
          <DialogShellSection title="Nueva fecha y hora" icon={CalendarDays}>
            <FieldGrid>
              <Field id="reschedule-date" label="Fecha" required>
                <CustomCalendar
                  mode="date"
                  value={reschedDate}
                  onChange={onRescheduleDateChange}
                  placeholder="Seleccionar fecha"
                />
              </Field>

              <Field id="reschedule-time" label="Hora" required>
                <CustomTimePicker value={reschedTime} onChange={onRescheduleTimeChange} placeholder="Seleccionar hora" />
              </Field>
            </FieldGrid>
          </DialogShellSection>

          <DialogShellSection title="Motivo del cambio" icon={FileText}>
            <Field
              id="reschedule-reason"
              label="Motivo de reprogramación"
              hint="Opcional. Queda registrado en el historial de la citación."
            >
              <Textarea
                id="reschedule-reason"
                value={reschedReason}
                onChange={(e) => onRescheduleReasonChange(e.target.value)}
                placeholder="Ej: Cruce de horarios con el padre de familia…"
                className="min-h-[100px] resize-none rounded-xl text-base"
              />
            </Field>
          </DialogShellSection>
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={onClose} />
          <DialogShellActionButton onClick={onConfirm} disabled={!reschedDate || !reschedTime}>
            Guardar cambios
          </DialogShellActionButton>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
