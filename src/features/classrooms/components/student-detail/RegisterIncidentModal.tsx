import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserItem } from '@/types';

interface IncidentFormState {
  type: string;
  description: string;
  teacher: string;
}

/** Modal de registro manual de una incidencia para un estudiante. */
export const RegisterIncidentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student: UserItem;
  incidentForm: IncidentFormState;
  setIncidentForm: React.Dispatch<React.SetStateAction<IncidentFormState>>;
}> = ({ isOpen, onClose, student, incidentForm, setIncidentForm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden w-full flex flex-col transition-all duration-300 max-w-xl`}
          >
            <div className="flex flex-col lg:flex-row w-full h-full max-h-[90vh]">
              {/* Form Section */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto custom-scrollbar">
                <div className="px-6 py-[22px] border-b border-[#EAEBF0] dark:border-slate-800 flex justify-between items-center bg-transparent sticky top-0 z-10 bg-white dark:bg-slate-900">
                  <h3 className="text-xl font-extrabold text-[#0D082C] dark:text-white flex items-center gap-2.5">
                    <AlertTriangle className="w-[22px] h-[22px] text-rose-500" />{" "}
                    <span className="pt-0.5">Registrar Incidencia</span>
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          aria-label="Cerrar"
                          className="h-10 w-10 rounded-full text-[#8792A2] hover:text-[#0D082C] dark:hover:text-slate-300 bg-[#F2F4FC] dark:bg-slate-800"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cerrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="p-6 flex flex-col gap-6 flex-1">
                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                      Estudiante
                    </label>
                    <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border-none shadow-none">
                      <div
                        className={`w-[45px] h-[45px] rounded-full flex items-center justify-center text-white font-bold text-lg bg-rose-500`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-rose-900 dark:text-rose-100 text-lg leading-none mb-1">
                          {student.name}
                        </p>
                        <p className="text-sm text-rose-700 dark:text-rose-400 font-semibold">
                          {student.grade.replace("° Grado", "")}°{" "}
                          {student.section}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                      Tipo de Incidencia
                    </label>
                    <Select
                      value={incidentForm.type || undefined}
                      onValueChange={(value) =>
                        setIncidentForm((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:ring-rose-500">
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conducta en clase">
                          Conducta en clase
                        </SelectItem>
                        <SelectItem value="Falta de respeto">
                          Falta de respeto
                        </SelectItem>
                        <SelectItem value="Falta de material">
                          Falta de material
                        </SelectItem>
                        <SelectItem value="Uso indebido de celular">
                          Uso indebido de celular
                        </SelectItem>
                        <SelectItem value="Incumplimiento de tareas">
                          Incumplimiento de tareas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                      Descripción Detallada
                    </label>
                    <textarea
                      value={incidentForm.description}
                      onChange={(e) =>
                        setIncidentForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describa el suceso ocurrido..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4 bg-transparent sticky bottom-0 z-10 bg-white dark:bg-slate-900">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-10 rounded-xl px-6 font-extrabold text-slate-700 dark:text-slate-300 text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={
                      !incidentForm.type || !incidentForm.description
                    }
                    className="h-10 min-w-[120px] rounded-xl px-6 font-extrabold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Registrar Incidencia
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
