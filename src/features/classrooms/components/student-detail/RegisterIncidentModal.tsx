import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';

import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { Field } from '@/components/common/FormField';
import { LabeledSelect } from '@/components/common/LabeledSelect';
import { Dialog } from '@/components/ui/dialog';
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
  /** Guarda la incidencia. Obligatorio: el pie no puede tener un botón que no hace nada. */
  onRegister: () => void;
}> = ({ isOpen, onClose, student, incidentForm, setIncidentForm, onRegister }) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogShellContent>
      <DialogShellHeader
        icon={AlertTriangle}
        tone="destructive"
        title="Registrar incidencia"
        description={`${student.name} · ${student.grade.replace('° Grado', '')}° ${student.section}`}
      />

      <DialogShellBody flush>
        <DialogShellSection title="Qué ocurrió" icon={AlertTriangle}>
          <LabeledSelect
            id="incidencia-tipo"
            label="Tipo de incidencia"
            value={incidentForm.type}
            options={INCIDENT_OPTIONS}
            onChange={(type) => setIncidentForm((prev) => ({ ...prev, type }))}
            placeholder="Elige el tipo de incidencia"
          />
        </DialogShellSection>

        <DialogShellSection title="Detalle" icon={FileText}>
          <Field id="incidencia-descripcion" label="Descripción detallada" required>
            <Textarea
              id="incidencia-descripcion"
              value={incidentForm.description}
              onChange={(event) =>
                setIncidentForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Describa el suceso ocurrido…"
              className="min-h-[120px] resize-none rounded-xl text-base"
            />
          </Field>
        </DialogShellSection>
      </DialogShellBody>

      <DialogShellFooter>
        <DialogShellCancelButton onClick={onClose} />
        <DialogShellActionButton
          variant="destructive"
          onClick={onRegister}
          disabled={!incidentForm.type || !incidentForm.description}
        >
          Registrar incidencia
        </DialogShellActionButton>
      </DialogShellFooter>
    </DialogShellContent>
  </Dialog>
);
