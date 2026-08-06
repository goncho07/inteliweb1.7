import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';

import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  CSV_COLUMNS,
  downloadCsvTemplate,
  parseUsersCsv,
  type ImportResult,
} from '@/features/users/users.import';
import type { UserFormValues } from '@/features/users/users.form';
import { cn } from '@/lib/utils';

/**
 * Carga masiva desde CSV. El archivo se lee y valida en el navegador y se
 * muestra exactamente qué filas entrarán y cuáles se descartan (con el número
 * de línea y el motivo) antes de confirmar nada: importar a ciegas y
 * descubrir después medio padrón mal cargado no es reversible.
 */
interface ImportUsersDialogProps {
  open: boolean;
  existingDnis: Set<string>;
  onClose: () => void;
  onImport: (rows: UserFormValues[]) => void;
}

/**
 * Cuerpo de la ventana. Aparte del contenedor porque `DialogContent` solo
 * monta a sus hijos mientras está abierta: al cerrar se olvida el archivo
 * anterior sin necesidad de un efecto que limpie el estado.
 */
const ImportUsersBody: React.FC<Omit<ImportUsersDialogProps, 'open'>> = ({
  existingDnis,
  onClose,
  onImport,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    setIsReading(true);
    setFileName(file.name);
    try {
      const text = await file.text();
      setResult(parseUsersCsv(text, existingDnis));
    } catch {
      setResult({
        valid: [],
        invalid: [],
        fatalError: 'No se pudo leer el archivo. Comprueba que sea un CSV.',
      });
    } finally {
      setIsReading(false);
    }
  };

  const handleConfirm = () => {
    if (!result || result.valid.length === 0) return;
    onImport(result.valid.map((row) => row.values));
  };

  const validCount = result?.valid.length ?? 0;
  const invalidCount = result?.invalid.length ?? 0;

  return (
    <>
      <DialogShellHeader
        icon={Upload}
        title="Subir usuarios desde un archivo"
        description="Carga varios usuarios de una vez con un archivo CSV (el que exporta Excel)."
      />

      <DialogShellBody flush>
        <DialogShellSection title="Formato del archivo" icon={FileSpreadsheet}>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            El archivo debe tener estas columnas, en la primera fila:
          </p>
          <p className="break-words text-base text-slate-600 dark:text-slate-400">
            {CSV_COLUMNS.join(' · ')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={downloadCsvTemplate}
            className="h-11 w-fit gap-2 rounded-xl px-4 text-base font-semibold"
          >
            <Download size={20} /> Descargar plantilla CSV
          </Button>
        </DialogShellSection>

        <DialogShellSection title="Tu archivo" icon={Upload}>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void readFile(file);
            }}
            className={cn(
              'flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
            )}
          >
            <FileSpreadsheet size={32} className="text-slate-400" aria-hidden />
            <p className="text-base text-slate-600 dark:text-slate-400">
              {fileName
                ? `Archivo elegido: ${fileName}`
                : 'Arrastra el archivo aquí o elígelo desde tu equipo.'}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void readFile(file);
                // Permite volver a elegir el mismo archivo tras corregirlo.
                event.target.value = '';
              }}
            />
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isReading}
              className="h-11 gap-2 rounded-xl px-6 text-base font-semibold"
            >
              <Upload size={20} /> {isReading ? 'Leyendo el archivo…' : 'Elegir archivo CSV'}
            </Button>
          </div>

          {result?.fatalError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            >
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-destructive" />
              <p className="text-base text-slate-700 dark:text-slate-300">{result.fatalError}</p>
            </div>
          )}
        </DialogShellSection>

        {result && !result.fatalError && (
          <DialogShellSection title="Resultado de la lectura" icon={CheckCircle2}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <CheckCircle2
                  size={24}
                  className="shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                <div>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    {validCount}
                  </p>
                  <p className="text-base text-emerald-700/80 dark:text-emerald-400/80">
                    listos para importar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <AlertTriangle size={24} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    {invalidCount}
                  </p>
                  <p className="text-base text-amber-700/80 dark:text-amber-400/80">
                    se descartarán
                  </p>
                </div>
              </div>
            </div>

            {invalidCount > 0 && (
              <ul className="hidden-scrollbar max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {result.invalid.map((row) => (
                  <li key={row.line} className="flex flex-col gap-1 px-4 py-3">
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      Línea {row.line} · {row.name}
                    </p>
                    <p className="text-base text-slate-600 dark:text-slate-400">
                      {Object.values(row.errors).filter(Boolean).join(' ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {validCount === 0 && invalidCount === 0 && (
              <p className="text-base text-slate-600 dark:text-slate-400">
                El archivo tiene la cabecera correcta pero ninguna fila de datos.
              </p>
            )}
          </DialogShellSection>
        )}
      </DialogShellBody>

      <DialogShellFooter>
        <DialogShellCancelButton onClick={onClose} />
        <DialogShellActionButton onClick={handleConfirm} disabled={validCount === 0}>
          {validCount === 0 ? 'Importar usuarios' : `Importar ${validCount} usuarios`}
        </DialogShellActionButton>
      </DialogShellFooter>
    </>
  );
};

export const ImportUsersDialog: React.FC<ImportUsersDialogProps> = ({ open, onClose, ...rest }) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogShellContent>
      <ImportUsersBody onClose={onClose} {...rest} />
    </DialogShellContent>
  </Dialog>
);
