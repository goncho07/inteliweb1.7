import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

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
            className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full flex flex-col transition-all duration-300 max-w-xl`}
          >
            <div className="flex flex-col lg:flex-row w-full h-full max-h-[90vh]">
              {/* Form Section */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto custom-scrollbar">
                <div className="px-6 py-[22px] border-b border-[#EAEBF0] dark:border-slate-800 flex justify-between items-center bg-transparent sticky top-0 z-10 bg-white dark:bg-slate-900">
                  <h3 className="text-xl font-extrabold text-[#0D082C] dark:text-white flex items-center gap-2.5">
                    <AlertTriangle className="w-[22px] h-[22px] text-rose-500" />{" "}
                    <span className="pt-0.5">Registrar Incidencia</span>
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-[#8792A2] hover:text-[#0D082C] dark:hover:text-slate-300 transition-colors bg-[#F2F4FC] dark:bg-slate-800 w-9 h-9 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-6 flex-1">
                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                      Estudiante
                    </label>
                    <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border-none shadow-none">
                      <div
                        className={`w-[45px] h-[45px] rounded-full flex items-center justify-center text-white font-bold text-[18px] bg-rose-500`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-rose-900 dark:text-rose-100 text-[17px] leading-none mb-1">
                          {student.name}
                        </p>
                        <p className="text-[13px] text-rose-700 dark:text-rose-400 font-semibold">
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
                    <select
                      value={incidentForm.type}
                      onChange={(e) =>
                        setIncidentForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 appearance-none focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      <option value="" disabled>
                        Seleccione un tipo
                      </option>
                      <option value="Conducta en clase">
                        Conducta en clase
                      </option>
                      <option value="Falta de respeto">
                        Falta de respeto
                      </option>
                      <option value="Falta de material">
                        Falta de material
                      </option>
                      <option value="Uso indebido de celular">
                        Uso indebido de celular
                      </option>
                      <option value="Incumplimiento de tareas">
                        Incumplimiento de tareas
                      </option>
                    </select>
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
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] px-4 py-3 font-medium text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4 bg-transparent sticky bottom-0 z-10 bg-white dark:bg-slate-900">
                  <button
                    onClick={onClose}
                    className="px-[25px] py-[11px] rounded-[10px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors border border-slate-200 dark:border-slate-700 text-[13px]"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={
                      !incidentForm.type || !incidentForm.description
                    }
                    className="px-[25px] py-[11px] rounded-[10px] font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-none text-[13px]"
                  >
                    Registrar Incidencia
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
