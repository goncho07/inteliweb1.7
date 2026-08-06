import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, Filter, IdCard } from 'lucide-react';

import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { EmptyState } from '@/components/common/EmptyState';
import { LabeledSelect } from '@/components/common/LabeledSelect';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ALL, COURSES, LEVEL_OPTIONS, MAX_CARNET_CARDS } from '@/features/users/users.constants';
import { gradesForLevel, sectionsForGrade } from '@/features/users/users.form';
import { countCarnets, downloadCarnetsPdf, selectCarnetStudents } from '@/features/users/utils';
import type { UserItem } from '@/types';

/**
 * Generación de carnets QR por lote.
 *
 * Arranca con el aula que ya estuviera filtrada en la tabla, pero a partir de
 * ahí los filtros son suyos y no la tocan: antes compartían estado, así que
 * elegir «Primaria» aquí dejaba la lista de usuarios filtrada por Primaria al
 * cerrar, sin que nadie lo hubiera pedido.
 *
 * Además muestra cuántos carnets saldrán antes de empezar y avisa cuando el
 * lote es demasiado grande: cada carnet pide su QR a un servicio externo, y
 * lanzar los del colegio entero dejaba la pestaña colgada varios minutos.
 */
interface GenerateCarnetsDialogProps {
  open: boolean;
  users: UserItem[];
  /** Aula ya filtrada en la tabla, como punto de partida. */
  initialClassroom: { level: string; grade: string; section: string };
  onClose: () => void;
  onFinished: (studentCount: number, failed: number) => void;
  onError: () => void;
}

/** Cuerpo de la ventana: `DialogContent` lo monta al abrir, así los filtros arrancan siempre desde la tabla. */
const GenerateCarnetsBody: React.FC<
  Omit<GenerateCarnetsDialogProps, 'open'> & { onGeneratingChange: (generating: boolean) => void }
> = ({ users, initialClassroom, onClose, onFinished, onError, onGeneratingChange }) => {
  const [level, setLevel] = useState(initialClassroom.level);
  const [grade, setGrade] = useState(initialClassroom.grade);
  const [section, setSection] = useState(initialClassroom.section);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const students = useMemo(
    () => selectCarnetStudents(users, level, grade, section),
    [grade, level, section, users],
  );
  const cards = countCarnets(students);
  const isTooLarge = cards > MAX_CARNET_CARDS;
  const isGenerating = progress !== null;

  const changeLevel = (value: string) => {
    setLevel(value);
    setGrade(ALL);
    setSection(ALL);
  };

  const changeGrade = (value: string) => {
    setGrade(value);
    setSection(ALL);
  };

  const handleGenerate = async () => {
    setProgress({ done: 0, total: cards });
    // Mientras se genera, el contenedor bloquea el cierre: interrumpir a
    // medias dejaba un PDF a medio escribir sin decir nada.
    onGeneratingChange(true);
    try {
      const name = ['Carnets', level, grade, section]
        .filter((part) => part !== ALL)
        .join('_')
        .replace(/\s+/g, '');
      const { failed } = await downloadCarnetsPdf(students, name || 'Carnets', (done, total) =>
        setProgress({ done, total }),
      );
      onFinished(students.length, failed);
      onClose();
    } catch {
      onError();
    } finally {
      setProgress(null);
      onGeneratingChange(false);
    }
  };

  return (
    <>
      <DialogShellHeader
        icon={IdCard}
        title="Descargar carnets QR"
        description={`Un carnet por estudiante y curso (${COURSES.length} cursos), en un único PDF.`}
      />

      <DialogShellBody flush>
        <DialogShellSection title="Qué aulas entran" icon={Filter}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabeledSelect
              id="carnet-nivel"
              label="Nivel educativo"
              value={level}
              options={LEVEL_OPTIONS}
              onChange={changeLevel}
              disabled={isGenerating}
              allValue={ALL}
              allLabel="Todos los niveles"
            />
            <LabeledSelect
              id="carnet-grado"
              label="Grado"
              value={grade}
              options={gradesForLevel(level)}
              onChange={changeGrade}
              disabled={isGenerating || level === ALL}
              allValue={ALL}
              allLabel="Todos los grados"
              hint={level === ALL ? 'Elige primero un nivel.' : undefined}
            />
            <LabeledSelect
              id="carnet-seccion"
              label="Sección"
              value={section}
              options={sectionsForGrade(level, grade)}
              onChange={setSection}
              disabled={isGenerating || grade === ALL}
              allValue={ALL}
              allLabel="Todas las secciones"
              hint={grade === ALL ? 'Elige primero un grado.' : undefined}
            />
          </div>
        </DialogShellSection>

        <DialogShellSection title="Lo que se va a descargar" icon={IdCard}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-base text-slate-700 dark:text-slate-300">
              <strong className="font-bold text-slate-900 dark:text-white">
                {students.length}
              </strong>{' '}
              {students.length === 1 ? 'estudiante' : 'estudiantes'} ·{' '}
              <strong className="font-bold text-slate-900 dark:text-white">{cards}</strong>{' '}
              {cards === 1 ? 'carnet' : 'carnets'}
            </p>
          </div>

          {students.length === 0 && (
            <div role="alert">
              <EmptyState
                icon={IdCard}
                title="No hay estudiantes con estos filtros"
                description="Prueba con otro nivel, grado o sección."
                className="min-h-[160px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"
              />
            </div>
          )}

          {isTooLarge && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />
              <p className="text-base text-slate-700 dark:text-slate-300">
                Son demasiados carnets para un solo PDF (el máximo son {MAX_CARNET_CARDS}). Acota el
                lote eligiendo un grado o una sección.
              </p>
            </div>
          )}

          {progress && (
            <div className="flex flex-col gap-2" aria-live="polite">
              <p className="text-base text-slate-700 dark:text-slate-300">
                Generando carnet {progress.done} de {progress.total}…
              </p>
              <Progress value={progress.total === 0 ? 0 : (progress.done / progress.total) * 100} />
            </div>
          )}
        </DialogShellSection>
      </DialogShellBody>

      <DialogShellFooter>
        <DialogShellCancelButton onClick={onClose} disabled={isGenerating} />
        <DialogShellActionButton
          onClick={handleGenerate}
          disabled={students.length === 0 || isTooLarge || isGenerating}
        >
          <Download size={20} /> {isGenerating ? 'Generando…' : 'Generar PDF'}
        </DialogShellActionButton>
      </DialogShellFooter>
    </>
  );
};

export const GenerateCarnetsDialog: React.FC<GenerateCarnetsDialogProps> = ({
  open,
  onClose,
  ...rest
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isGenerating && onClose()}>
      <DialogShellContent>
        <GenerateCarnetsBody onClose={onClose} onGeneratingChange={setIsGenerating} {...rest} />
      </DialogShellContent>
    </Dialog>
  );
};
