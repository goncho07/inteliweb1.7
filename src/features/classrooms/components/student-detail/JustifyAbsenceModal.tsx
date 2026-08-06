import React, { useRef, useState } from 'react';
import { AlertTriangle, Check, FileText, Paperclip, ShieldCheck, X } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatShortDate } from '@/features/classrooms/overview.rows';
import type { AttendanceCalendarDay } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';

/** Tamaño máximo por archivo: suficiente para una foto o un PDF escaneado del certificado. */
const MAX_FILE_SIZE_MB = 10;

const formatFileSize = (bytes: number): string =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Justificación de una falta o tardanza del calendario de asistencia. Ventana
 * estándar de la app (`DialogShell`), como el resto de confirmaciones.
 *
 * Además de la observación, el docente puede adjuntar el documento físico ya
 * escaneado (certificado médico, carta del apoderado…) para que quede junto a
 * la justificación en vez de guardarse aparte.
 */
export const JustifyAbsenceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dayToJustify: AttendanceCalendarDay | null;
  studentName: string;
  justificationObservation: string;
  setJustificationObservation: (value: string) => void;
  justificationFiles: File[];
  setJustificationFiles: (files: File[]) => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  onClose,
  dayToJustify,
  studentName,
  justificationObservation,
  setJustificationObservation,
  justificationFiles,
  setJustificationFiles,
  onConfirm,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const tooLarge: string[] = [];
    const accepted: File[] = [];
    Array.from(incoming).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        tooLarge.push(file.name);
      } else {
        accepted.push(file);
      }
    });
    setSizeError(
      tooLarge.length > 0 ? `${tooLarge.join(', ')} supera los ${MAX_FILE_SIZE_MB} MB y no se adjuntó.` : null,
    );
    if (accepted.length > 0) setJustificationFiles([...justificationFiles, ...accepted]);
  };

  const removeFile = (name: string) => {
    setJustificationFiles(justificationFiles.filter((file) => file.name !== name));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSizeError(null);
          onClose();
        }
      }}
    >
      <DialogShellContent>
        <DialogShellHeader
          icon={ShieldCheck}
          title={`Justificar ${(dayToJustify?.originalStatus ?? 'inasistencia').toLowerCase()}`}
          description={
            dayToJustify
              ? `${studentName} · ${formatShortDate(new Date(`${dayToJustify.date}T00:00:00`))}`
              : studentName
          }
        />

        <DialogShellBody flush>
          <DialogShellSection title="Antes de justificar" icon={AlertTriangle}>
            <div
              role="note"
              className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                size={20}
              />
              <p className="text-base text-slate-700 dark:text-slate-300">
                Comprueba que los documentos físicos presentados sean correctos. Esta acción queda
                registrada en el historial del estudiante.
              </p>
            </div>
          </DialogShellSection>

          <DialogShellSection title="Observación" icon={FileText}>
            <Field
              id="justificacion-observacion"
              label="Motivo u observación"
              hint="Opcional. Ayuda a recordar por qué se justificó."
            >
              <Textarea
                id="justificacion-observacion"
                value={justificationObservation}
                onChange={(event) => setJustificationObservation(event.target.value)}
                placeholder="Ej: Presentó certificado médico físico…"
                className="min-h-[100px] resize-none rounded-xl text-base"
              />
            </Field>
          </DialogShellSection>

          <DialogShellSection title="Documento de respaldo" icon={Paperclip}>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
              }}
              className={cn(
                'flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              <Paperclip size={32} className="text-slate-400" aria-hidden />
              <p className="text-base text-slate-600 dark:text-slate-400">
                Arrastra el certificado o la carta aquí, o elígelo desde tu equipo.
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files?.length) addFiles(event.target.files);
                  // Permite volver a elegir el mismo archivo si se quitó por error.
                  event.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="h-11 gap-2 rounded-xl px-6 text-base font-semibold"
              >
                <Paperclip size={20} /> Adjuntar archivo
              </Button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Imágenes o PDF, hasta {MAX_FILE_SIZE_MB} MB por archivo. Opcional.
              </p>
            </div>

            {sizeError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {sizeError}
              </p>
            )}

            {justificationFiles.length > 0 && (
              <ul className="flex flex-col gap-2">
                {justificationFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText size={20} className="shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate text-base font-medium text-slate-700 dark:text-slate-300">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Quitar ${file.name}`}
                      onClick={() => removeFile(file.name)}
                      className="h-10 w-10 shrink-0 rounded-lg"
                    >
                      <X size={18} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </DialogShellSection>
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={onClose} />
          <DialogShellActionButton onClick={onConfirm}>
            <Check size={20} /> Confirmar justificación
          </DialogShellActionButton>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
