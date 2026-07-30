import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, Calendar, Check, CheckCircle2, Clock, MessageCircle, X } from 'lucide-react';

import type { PersonalIncidentEntry } from '@/features/classrooms/types';

/** Modal con el estado de las notificaciones de asistencia/salida de un estudiante. */
export const AttendanceNotificationsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  unconfirmedAttendancesCount: number;
  activeAttendanceTab: "asistencia" | "salidas";
  setActiveAttendanceTab: (tab: "asistencia" | "salidas") => void;
  personalIncidents: PersonalIncidentEntry[];
  onSimulateWhatsApp: (incident: PersonalIncidentEntry) => void;
}> = ({
  isOpen,
  onClose,
  studentName,
  unconfirmedAttendancesCount,
  activeAttendanceTab,
  setActiveAttendanceTab,
  personalIncidents,
  onSimulateWhatsApp,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {unconfirmedAttendancesCount > 0 && (
                <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-800 dark:text-amber-300 font-bold text-sm">
                      Acción Requerida
                    </h4>
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Hay {unconfirmedAttendancesCount} notificaciones
                      esperando confirmación del padre/apoderado.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveAttendanceTab("asistencia")}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeAttendanceTab === "asistencia" ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                >
                  Asistencia
                </button>
                <button
                  onClick={() => setActiveAttendanceTab("salidas")}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeAttendanceTab === "salidas" ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                >
                  Salidas
                </button>
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

                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 ${incident.signatureStatus === "signed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                          >
                            {incident.signatureStatus ===
                            "signed" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {incident.signatureStatus ===
                            "signed"
                              ? "Confirmado por el padre"
                              : "Esperando confirmación"}
                          </span>

                          {incident.signatureStatus ===
                          "signed" ? (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-500" />{" "}
                              {incident.signatureDate}
                            </span>
                          ) : (
                            <button
                              onClick={() => onSimulateWhatsApp(incident)}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />{" "}
                              Simular WhatsApp
                            </button>
                          )}
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
