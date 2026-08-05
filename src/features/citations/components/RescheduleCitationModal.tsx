import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import {
  DialogShellBody,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      <DialogShellContent size="sm">
        <DialogShellHeader
          icon={CalendarDays}
          title="Reprogramar citación"
          description={citation ? `${citation.student} · ${citation.reason}` : undefined}
        />

        <DialogShellBody>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="reschedule-date"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Nueva fecha
            </Label>
            <CustomCalendar
              mode="date"
              value={reschedDate}
              onChange={onRescheduleDateChange}
              placeholder="Seleccionar fecha"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="reschedule-time"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              <Clock size={16} className="text-primary" /> Nueva hora
            </Label>
            <Input
              id="reschedule-time"
              type="time"
              value={reschedTime}
              onChange={(e) => onRescheduleTimeChange(e.target.value)}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="reschedule-reason"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Motivo de reprogramación (opcional)
            </Label>
            <Textarea
              id="reschedule-reason"
              value={reschedReason}
              onChange={(e) => onRescheduleReasonChange(e.target.value)}
              placeholder="Ej: Cruce de horarios con el padre de familia…"
              className="h-20 resize-none rounded-xl text-base"
            />
          </div>
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
            onClick={onConfirm}
            disabled={!reschedDate || !reschedTime}
            className="h-12 rounded-xl px-6 text-base font-semibold"
          >
            Guardar cambios
          </Button>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
