import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Clock, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';

/** Modal con el estado de las notificaciones de asistencia/salida de un estudiante. */
export const AttendanceNotificationsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  activeAttendanceTab: "asistencia" | "salidas";
  setActiveAttendanceTab: (tab: "asistencia" | "salidas") => void;
  personalIncidents: PersonalIncidentEntry[];
}> = ({
  isOpen,
  onClose,
  studentName,
  activeAttendanceTab,
  setActiveAttendanceTab,
  personalIncidents,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Estado de Notificaciones
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ingresos y salidas de {studentName}
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
                      className="h-10 w-10 rounded-full text-slate-500 dark:text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cerrar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveAttendanceTab("asistencia")}
                  className={cn(
                    'h-auto rounded-none border-b-2 pb-3 px-4 text-sm font-medium hover:bg-transparent dark:hover:bg-transparent',
                    activeAttendanceTab === "asistencia"
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                  )}
                >
                  Asistencia
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveAttendanceTab("salidas")}
                  className={cn(
                    'h-auto rounded-none border-b-2 pb-3 px-4 text-sm font-medium hover:bg-transparent dark:hover:bg-transparent',
                    activeAttendanceTab === "salidas"
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                  )}
                >
                  Salidas
                </Button>
              </div>

              <div className="space-y-4">
                {personalIncidents.filter((inc) =>
                  inc.id.startsWith(
                    activeAttendanceTab === "asistencia"
                      ? "att-in-"
                      : "att-out-",
                  ),
                ).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No hay notificaciones de{" "}
                    {activeAttendanceTab === "asistencia"
                      ? "asistencia"
                      : "salida"}{" "}
                    registradas.
                  </div>
                ) : (
                  personalIncidents
                    .filter((inc) =>
                      inc.id.startsWith(
                        activeAttendanceTab === "asistencia"
                          ? "att-in-"
                          : "att-out-",
                      ),
                    )
                    .map((incident) => (
                      <div
                        key={incident.id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${incident.type.color}`}
                          >
                            <incident.type.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 dark:text-white">
                                {incident.type.label}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />{" "}
                                {incident.date}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{" "}
                                {incident.time}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {incident.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
