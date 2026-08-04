import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ShieldCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/** Modal para justificar una falta o tardanza del calendario de asistencia. */
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
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shadow-sm">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                      Justificar {dayToJustify?.originalStatus}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      Validación Manual
                    </p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="h-10 w-10 rounded-xl text-gray-400"
                      >
                        <X size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cerrar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex gap-3 mb-6">
                <AlertTriangle
                  className="text-amber-600 shrink-0"
                  size={20}
                />
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                  Asegúrate de que los documentos físicos presentados
                  sean correctos. Esta acción quedará registrada en el
                  historial.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Estudiante
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {studentName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fecha: {dayToJustify?.date}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-widest">
                    Motivo / Observación (Opcional)
                  </label>
                  <textarea
                    value={justificationObservation}
                    onChange={(e) =>
                      setJustificationObservation(e.target.value)
                    }
                    placeholder="Ej: Presentó certificado médico físico..."
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-200 transition-all min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-12 rounded-xl font-bold text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={onConfirm}
                  className="h-12 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none [&_svg]:size-[18px]"
                >
                  <Check size={18} /> Confirmar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
