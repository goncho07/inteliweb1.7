import React from 'react';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';

import {
  DialogShellBody,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Justificación de una falta o tardanza del calendario de asistencia. Ventana
 * estándar de la app (`DialogShell`), como el resto de confirmaciones.
 */
export const JustifyAbsenceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dayToJustify: { originalStatus?: string; date?: string } | null;
  studentName: string;
  justificationObservation: string;
  setJustificationObservation: (value: string) => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  onClose,
  dayToJustify,
  studentName,
  justificationObservation,
  setJustificationObservation,
  onConfirm,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogShellContent size="sm">
      <DialogShellHeader
        icon={ShieldCheck}
        title={`Justificar ${dayToJustify?.originalStatus ?? 'inasistencia'}`}
        description={`${studentName} · ${dayToJustify?.date ?? ''}`}
      />

      <DialogShellBody>
        <div
          role="note"
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
        >
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" size={20} />
          <p className="text-base text-slate-700 dark:text-slate-300">
            Comprueba que los documentos físicos presentados sean correctos. Esta acción queda
            registrada en el historial del estudiante.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="justificacion-observacion"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Motivo u observación (opcional)
          </Label>
          <Textarea
            id="justificacion-observacion"
            value={justificationObservation}
            onChange={(event) => setJustificationObservation(event.target.value)}
            placeholder="Ej: Presentó certificado médico físico…"
            className="min-h-[100px] resize-none rounded-xl text-base"
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
          className="h-12 gap-2 rounded-xl px-6 text-base font-semibold"
        >
          <Check size={20} /> Confirmar justificación
        </Button>
      </DialogShellFooter>
    </DialogShellContent>
  </Dialog>
);
