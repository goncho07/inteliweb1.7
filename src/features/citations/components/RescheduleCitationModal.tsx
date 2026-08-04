import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="rounded-2xl p-0 gap-0 max-w-[440px] overflow-hidden">
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-0">
          <DialogTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Reprogramar citación
          </DialogTitle>
          {citation && (
            <p className="text-sm text-slate-500 dark:text-slate-400 pt-1">
              {citation.student} · {citation.reason}
            </p>
          )}
        </DialogHeader>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="reschedule-date" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Nueva fecha
            </Label>
            <CustomCalendar
              mode="date"
              value={reschedDate}
              onChange={onRescheduleDateChange}
              placeholder="Seleccionar fecha"
            />
          </div>
          <div>
            <Label htmlFor="reschedule-time" className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-primary" /> Nueva hora
            </Label>
            <Input
              id="reschedule-time"
              type="time"
              value={reschedTime}
              onChange={(e) => onRescheduleTimeChange(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="reschedule-reason" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Motivo de reprogramación (opcional)
            </Label>
            <Textarea
              id="reschedule-reason"
              value={reschedReason}
              onChange={(e) => onRescheduleReasonChange(e.target.value)}
              placeholder="Ej: Cruce de horarios con el padre de familia..."
              className="rounded-xl h-20 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!reschedDate || !reschedTime}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
