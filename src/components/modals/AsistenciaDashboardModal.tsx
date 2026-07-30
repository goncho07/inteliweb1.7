import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { MonitorPlay, ArrowLeft, CheckCircle2, Clock, X, ChevronRight, BookOpen } from 'lucide-react';
import { COMMON_MODAL_CLASSES } from '@/components/modals/ComunicadosModal';

export const AsistenciaDashboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'select' | 'mark'>('select');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [attendanceState, setAttendanceState] = useState<Record<string, "presente" | "tardanza" | "falta">>({});

  const mockStudents = [
    { id: '1', name: "Piero Reyna Huaman", ini: "P", col: "bg-emerald-500", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: '2', name: "Alessia Suarez Mendoza", ini: "A", col: "bg-[#00c2ff]", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: '3', name: "Matias Campos Perez", ini: "M", col: "bg-emerald-500", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: '4', name: "Valery Perez Reyna", ini: "V", col: "bg-teal-500", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: '5', name: "Ximena Ramos Delgado", ini: "X", col: "bg-teal-600", avatar: "https://i.pravatar.cc/150?u=5" },
    { id: '6', name: "Luana Sanchez Fernandez", ini: "L", col: "bg-purple-500", avatar: "https://i.pravatar.cc/150?u=6" },
  ];

  const handleMark = (studentId: string, status: "presente" | "tardanza" | "falta") => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = () => {
    alert("Asistencia virtual registrada correctamente.");
    setStep('select');
    onClose();
  };

  const currentDate = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={COMMON_MODAL_CLASSES}
      >
          <div className="bg-[#f0f4f8] dark:bg-slate-800/50 p-6 border-b border-gray-200 dark:border-slate-700 shrink-0 flex flex-col gap-4">
               <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                     {step === 'mark' && (
                       <button onClick={() => setStep('select')} className="w-10 h-10 flex border items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 transition-colors">
                         <ArrowLeft size={20} strokeWidth={2.5} />
                       </button>
                     )}
                     <div className="relative w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#00c2ff] to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                       <MonitorPlay className="w-7 h-7 text-white" strokeWidth={2.5} />
                     </div>
                     <div>
                       <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                         {step === 'select' ? 'Asistencia' : `Asistencia: ${selectedClass}`}
                       </h2>
                       <p className="text-slate-600 dark:text-slate-400 font-medium text-sm capitalize mt-1">
                         {currentDate}
                       </p>
                     </div>
                   </div>
                   <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 transition-colors">
                     <X size={20} strokeWidth={2.5} />
                   </button>
               </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/20 custom-scrollbar">
            {step === 'select' ? (
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    <h3 className="text-[12px] font-extrabold text-[#0D082C] dark:text-slate-300 uppercase tracking-widest block">SELECCIONA EL AULA</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['3° A', '3° B', '4° A', '4° B', '5° A'].map((cls) => (
                        <button
                          key={cls}
                          onClick={() => {
                            setSelectedClass(cls);
                            setStep('mark');
                          }}
                          className="flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00c2ff] dark:hover:border-[#00c2ff] transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-[#00c2ff] flex items-center justify-center">
                              <BookOpen size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-lg">{cls}</p>
                              <p className="text-sm font-medium text-slate-500">Secundaria</p>
                            </div>
                          </div>
                          <ChevronRight className="text-slate-400 group-hover:text-[#00c2ff] transition-colors" />
                        </button>
                      ))}
                    </div>
                 </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                   <div className="grid grid-cols-[60px_1fr_160px] gap-4 p-4 border-b border-slate-200 dark:border-slate-700 font-extrabold text-[12px] text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="text-center">#</div>
                      <div>ESTUDIANTE</div>
                      <div className="text-right pr-4">ESTADO</div>
                   </div>
                   
                   <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {mockStudents.map((student, i) => {
                         const status = attendanceState[student.id];
                         return (
                           <div key={student.id} className="grid grid-cols-[60px_1fr_160px] gap-4 items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="text-center text-slate-400 font-medium">{i + 1}</div>
                              <div className="flex items-center gap-3">
                                 <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                 <span className="font-bold text-slate-900 dark:text-white text-[14px]">{student.name}</span>
                              </div>
                              <div className="flex items-center justify-end gap-2 pr-4">
                                <button
                                  onClick={() => handleMark(student.id, "presente")}
                                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-colors focus:ring-4 focus:ring-emerald-500/20 active:bg-emerald-100 ${
                                    status === "presente"
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-500 dark:bg-emerald-500/20"
                                      : "border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                                  }`}
                                >
                                  <CheckCircle2 size={18} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => handleMark(student.id, "tardanza")}
                                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-colors focus:ring-4 focus:ring-amber-500/20 active:bg-amber-100 ${
                                    status === "tardanza"
                                      ? "bg-amber-50 border-amber-500 text-amber-500 dark:bg-amber-500/20"
                                      : "border-slate-200 text-slate-400 hover:border-amber-500 hover:text-amber-500"
                                  }`}
                                >
                                  <Clock size={18} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => handleMark(student.id, "falta")}
                                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-colors focus:ring-4 focus:ring-rose-500/20 active:bg-rose-100 ${
                                    status === "falta"
                                      ? "bg-rose-50 border-rose-500 text-rose-500 dark:bg-rose-500/20"
                                      : "border-slate-200 text-slate-400 hover:border-rose-500 hover:text-rose-500"
                                  }`}
                                >
                                  <X size={18} strokeWidth={2.5} />
                                </button>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
            )}
          </div>

          {step === 'mark' && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
               <button
                 onClick={handleSave}
                 className="w-full bg-[#00c2ff] hover:bg-[#00a3d6] focus:ring-4 focus:ring-[#00c2ff]/30 text-white font-bold py-3.5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={20} /> Guardar Asistencia
               </button>
            </div>
          )}
      </motion.div>
    </div>
  , document.body);
};
