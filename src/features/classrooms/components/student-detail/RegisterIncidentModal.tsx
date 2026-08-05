import React from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  DialogShellBody,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { LabeledSelect } from '@/components/common/LabeledSelect';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserItem } from '@/types';

interface IncidentFormState {
  type: string;
  description: string;
  teacher: string;
}

/** Tipos que se pueden registrar a mano desde la ficha del estudiante. */
const INCIDENT_OPTIONS = [
  'Conducta en clase',
  'Falta de respeto',
  'Falta de material',
  'Uso indebido de celular',
  'Incumplimiento de tareas',
] as const;

/**
 * Registro manual de una incidencia. Usa la ventana estándar de la app
 * (`DialogShell`): antes era un `fixed inset-0` propio, con su cabecera, su
 * radio y sus hex sueltos (`#0D082C`, `#EAEBF0`, `#8792A2`), y sin cierre con
 * `Esc` ni foco atrapado.
 */
export const RegisterIncidentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student: UserItem;
  incidentForm: IncidentFormState;
  setIncidentForm: React.Dispatch<React.SetStateAction<IncidentFormState>>;
}> = ({ isOpen, onClose, student, incidentForm, setIncidentForm }) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogShellContent size="sm">
      <DialogShellHeader
        icon={AlertTriangle}
        tone="destructive"
        title="Registrar incidencia"
        description={`${student.name} · ${student.grade.replace('° Grado', '')}° ${student.section}`}
      />

      <DialogShellBody>
        <LabeledSelect
          id="incidencia-tipo"
          label="Tipo de incidencia"
          value={incidentForm.type}
          options={INCIDENT_OPTIONS}
          onChange={(type) => setIncidentForm((prev) => ({ ...prev, type }))}
          placeholder="Elige el tipo de incidencia"
        />

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="incidencia-descripcion"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Descripción detallada
          </Label>
          <Textarea
            id="incidencia-descripcion"
            value={incidentForm.description}
            onChange={(event) =>
              setIncidentForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Describa el suceso ocurrido…"
            className="min-h-[120px] resize-none rounded-xl text-base"
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
          variant="destructive"
          disabled={!incidentForm.type || !incidentForm.description}
          className="h-12 rounded-xl px-6 text-base font-semibold"
        >
          Registrar incidencia
        </Button>
      </DialogShellFooter>
    </DialogShellContent>
  </Dialog>
);
