import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, AlertTriangle, X, ChevronDown, Check, ArrowRight, CalendarDays, Clock, AlertCircle, CheckCircle2, Send, BookOpen } from 'lucide-react';
import { CustomCalendar } from './CustomCalendar';
import { COMMON_MODAL_CLASSES } from './ComunicadosModal';
import { APP_CONFIG } from '../../constants';

export const ComposeCitationModal: React.FC<{ isOpen: boolean; onClose: () => void; onGenerate: (citation: any) => void; }> = ({ isOpen, onClose, onGenerate }) => {
  const [composeStep, setComposeStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [citeReason, setCiteReason] = useState<"Incidencias" | "Académico" | "Otros" | "">("");
  const [hideTeacherName, setHideTeacherName] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [citeSchedDate, setCiteSchedDate] = useState("");
  const [citeSchedTime, setCiteSchedTime] = useState("");
  const [citeDateError, setCiteDateError] = useState("");
  const [customReason, setCustomReason] = useState("");

  const availableIncidents = useMemo(() => [
    { id: '1', label: 'Evasión de clase de matemáticas (Reincidencia)', date: '04 mar 26', time: '10:30 AM', registrar: 'Ana Gómez' },
    { id: '2', label: 'Uso de celular en horario no permitido', date: '01 mar 26', time: '11:15 AM', registrar: 'Carlos Mendoza' },
    { id: '3', label: 'Falta de respeto a compañero', date: '25 feb 26', time: '09:00 AM', registrar: 'Luis Pérez' }
  ], []);

  const handleDateChange = (value: string) => {
    setCiteSchedDate(value);
    const dateObj = new Date(value);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      setCiteDateError("No se pueden agendar citaciones los fines de semana.");
    } else {
      setCiteDateError("");
    }
  };

  const resetForm = () => {
    setComposeStep(1);
    setCiteReason('');
    setSelectedStudent('');
    setSelectedIncidents([]);
    setCiteSchedDate("");
    setCiteSchedTime("");
    setCiteDateError("");
    setCustomReason("");
    setHideTeacherName(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGenerate = () => {
    onGenerate({
        student: selectedStudent,
        reason: citeReason === 'Otros' ? customReason : citeReason,
        date: citeSchedDate,
        time: citeSchedTime,
        incidents: selectedIncidents,
    });
    handleClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden w-full max-w-[480px] h-auto max-h-[95vh] flex flex-col relative my-auto border border-slate-200 dark:border-slate-800 transition-all duration-300"
        >
          <div className="flex flex-col w-full">
            <div className="flex flex-col relative w-full">
              <div className="px-6 py-[22px] border-b border-[#EAEBF0] dark:border-slate-800 flex justify-between items-center bg-transparent sticky top-0 z-20 bg-white dark:bg-slate-900 rounded-t-[24px]">
                <div className="flex items-center gap-3 text-[#041e49] dark:text-white">
                  {composeStep === 2 ? <AlertTriangle size={20} className="text-rose-500" /> : <Edit2 size={20} className="text-[#3030b8]" />}
                  <h3 className="text-xl font-extrabold text-[#0D082C] dark:text-white flex items-center gap-2.5">
                     {composeStep === 2 ? 'Selección de Incidencias' : 'Generar Citación'}
                  </h3>
                </div>
                <button onClick={handleClose} className="text-[#8792A2] hover:text-[#0D082C] dark:hover:text-slate-300 transition-colors bg-[#F2F4FC] dark:bg-slate-800 w-9 h-9 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6 w-full">
                {composeStep === 1 ? (
                  <>
                    <div>
                      <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5">Aula (Grado/Sección)</label>
                      <div className="relative">
                        <select 
                          defaultValue=""
                          className="w-full bg-[#f8fafd] dark:bg-slate-800 border border-[#EAEBF0] dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-[14px] font-bold text-[#0D082C] dark:text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#3030b8] transition-all"
                        >
                          <option value="" disabled>Seleccionar Aula</option>
                          <option value="1">1° A</option>
                          <option value="2">2° B</option>
                          <option value="3">3° A</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18}/>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5">Estudiante</label>
                      <div className="relative">
                        <select 
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="w-full bg-[#f8fafd] dark:bg-slate-800 border border-[#EAEBF0] dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-[14px] font-bold text-[#0D082C] dark:text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#3030b8] transition-all"
                        >
                          <option value="" disabled>Seleccionar Estudiante</option>
                          <option value="Valery Mamani Campos">Valery Mamani Campos</option>
                          <option value="Lucas Vega">Lucas Vega</option>
                          <option value="Valentina Sol">Valentina Sol</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18}/>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5">Motivo de Citación</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => setCiteReason("Incidencias")}
                          className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${citeReason === 'Incidencias' ? 'border-rose-600 bg-rose-50 dark:bg-rose-900/20 shadow-[0px_4px_16px_rgba(225,29,72,0.06)]' : 'border-[#EAEBF0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'}`}
                        >
                           <AlertTriangle size={24} className={citeReason === 'Incidencias' ? 'text-rose-600' : 'text-[#8792A2]'} />
                           <span className={`font-extrabold text-[14px] text-center ${citeReason === 'Incidencias' ? 'text-rose-800 dark:text-rose-400' : 'text-[#546274] dark:text-slate-400'}`}>Incidencias</span>
                        </button>
                        <button 
                          onClick={() => setCiteReason("Académico")}
                          className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${citeReason === 'Académico' ? 'border-[#3030b8] bg-[#f8fafd] dark:bg-indigo-900/20 shadow-[0px_4px_16px_rgba(48,48,184,0.06)]' : 'border-[#EAEBF0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'}`}
                        >
                           <BookOpen size={24} className={citeReason === 'Académico' ? 'text-[#3030b8]' : 'text-[#8792A2]'} />
                           <span className={`font-extrabold text-[14px] text-center ${citeReason === 'Académico' ? 'text-[#0D082C] dark:text-white' : 'text-[#546274] dark:text-slate-400'}`}>Rendimiento Académico</span>
                        </button>
                        <button 
                          onClick={() => setCiteReason("Otros")}
                          className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${citeReason === 'Otros' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-[0px_4px_16px_rgba(245,158,11,0.06)]' : 'border-[#EAEBF0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'}`}
                        >
                           <AlertCircle size={24} className={citeReason === 'Otros' ? 'text-amber-500' : 'text-[#8792A2]'} />
                           <span className={`font-extrabold text-[14px] text-center ${citeReason === 'Otros' ? 'text-amber-700 dark:text-amber-500' : 'text-[#546274] dark:text-slate-400'}`}>Otros</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end pt-6 border-t border-[#EAEBF0] dark:border-slate-800">
                       <button onClick={() => setComposeStep(citeReason === 'Incidencias' ? 2 : 3)} className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#3030b8] hover:bg-blue-800 text-white font-bold transition-all shadow-[0px_4px_12px_rgba(48,48,184,0.2)] hover:shadow-[0px_6px_16px_rgba(48,48,184,0.3)] flex items-center justify-center gap-2" disabled={!selectedStudent || !citeReason}>
                         Continuar <ArrowRight size={18} />
                       </button>
                    </div>
                  </>
                ) : composeStep === 2 && citeReason === 'Incidencias' ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between xl:-mb-1">
                      <p className="font-extrabold text-[#0D082C] dark:text-slate-100 text-[15px]">Seleccionar incidencias a citar</p>
                      <label className="flex items-center gap-2 cursor-pointer group">
                         <span className="text-[13px] font-bold text-[#3030b8] dark:text-indigo-400 select-none">Seleccionar todo</span>
                         <input type="checkbox" className="hidden" 
                           checked={selectedIncidents.length === availableIncidents.length && availableIncidents.length > 0} 
                           onChange={(e) => {
                             if (e.target.checked) setSelectedIncidents(availableIncidents.map(i => i.id));
                             else setSelectedIncidents([]);
                           }} 
                         />
                       </label>
                    </div>
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                       {availableIncidents.map((incident) => {
                         const isSelected = selectedIncidents.includes(incident.id);
                         return (
                           <label key={incident.id} className={`flex items-start gap-4 p-4 rounded-xl border shadow-[0px_4px_16px_rgba(13,8,44,0.02)] cursor-pointer transition-all bg-white hover:border-[#3030b8] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-400 ${isSelected ? 'border-[1.5px] border-[#3030b8] shadow-[0px_4px_16px_rgba(48,48,184,0.06)]' : 'border-[#EAEBF0] border'}`}>
                             <div className={`mt-0.5 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[1.5px] border-[#3030b8] bg-transparent' : 'border-[#8792A2] dark:border-slate-600'}`}>
                               {isSelected && <Check className="w-[14px] h-[14px] text-[#3030b8]" strokeWidth={4} />}
                             </div>
                             <input type="checkbox" className="hidden" checked={isSelected} onChange={() => {
                               setSelectedIncidents(prev => isSelected ? prev.filter(id => id !== incident.id) : [...prev, incident.id]);
                             }} />
                             <div className="flex-1">
                               <div className="flex items-start justify-between">
                                 <p className={`font-extrabold text-[15px] leading-tight ${isSelected ? 'text-[#0D082C] dark:text-indigo-100' : 'text-[#0D082C] dark:text-slate-200'}`}>{incident.label}</p>
                                 <div className="text-right">
                                   <p className="text-[12px] font-extrabold text-[#8792A2] dark:text-slate-400">{incident.date}</p>
                                   <p className="text-[12px] font-extrabold text-[#8792A2] dark:text-slate-400">{incident.time}</p>
                                 </div>
                               </div>
                               <p className="text-[12px] font-semibold text-[#546274] mt-2.5">Registrado por: {incident.registrar}</p>
                             </div>
                           </label>
                         );
                       })}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-[#EAEBF0] dark:border-slate-800">
                       <button onClick={() => setComposeStep(1)} className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-[#546274] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"> Volver </button>
                       <button onClick={() => setComposeStep(3)} className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#3030b8] hover:bg-blue-800 text-white font-bold transition-all shadow-[0px_4px_12px_rgba(48,48,184,0.2)] hover:shadow-[0px_6px_16px_rgba(48,48,184,0.3)] flex items-center justify-center gap-2" disabled={selectedIncidents.length === 0}> Continuar <ArrowRight size={18} /> </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-5 z-20 relative">
                      <div>
                        <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-[#8792A2]"/> Día sugerido</label>
                        <div className="w-full relative z-[60]">
                          <CustomCalendar mode="date" value={citeSchedDate} onChange={handleDateChange} placeholder="dd/mm/aaaa" />
                        </div>
                        {citeDateError && <p className="text-xs text-red-500 mt-1.5 font-bold">{citeDateError}</p>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5 flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#8792A2]"/> Hora sugerida</label>
                        <div className="relative z-10">
                          <input type="time" value={citeSchedTime} onChange={e => setCiteSchedTime(e.target.value)} className="w-full bg-[#f8fafd] dark:bg-slate-800 border border-[#EAEBF0] dark:border-slate-700 rounded-[10px] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3030b8] transition-all shadow-none h-[42px]" style={{ fontFamily: "'Poppins', sans-serif" }} />
                        </div>
                      </div>
                    </div>

                    {citeReason === 'Otros' && (
                      <div>
                        <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5 mt-2">Motivo de la citación</label>
                        <textarea
                          className="w-full bg-[#f8fafd] dark:bg-slate-800 border border-[#EAEBF0] dark:border-slate-700 rounded-[10px] px-4 py-3 font-medium text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3030b8] shadow-none placeholder:text-[#8792A2] resize-none min-h-[90px]"
                          placeholder="Escriba el detalle del motivo por el cual cita al estudiante..."
                          autoFocus
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                       <button
                          onClick={() => setHideTeacherName(!hideTeacherName)}
                          className={`w-11 h-6 rounded-full flex items-center transition-colors relative shrink-0 ${hideTeacherName ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                       >
                          <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute ${hideTeacherName ? 'translate-x-6' : 'translate-x-[4px]'}`} />
                       </button>
                       <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                          Ocultar nombre del docente
                       </span>
                    </div>

                    <div>
                       <label className="block text-[13px] font-extrabold text-[#0D082C] dark:text-indigo-100 mb-2.5">Mensaje predeterminado para el apoderado</label>
                       <div className="w-full bg-[#efeae2] dark:bg-[#0b141a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shrink-0 relative overflow-hidden">
                          <div className="bg-[#075e54] dark:bg-[#202c33] px-3 py-2 flex items-center gap-3 z-20 shrink-0 shadow-md">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white/50">
                                 <img src={APP_CONFIG.schoolLogo} alt="Logo" className="w-full h-full object-cover scale-[1.7]" referrerPolicy="no-referrer" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-white font-semibold text-[14px] leading-tight flex items-center gap-1">
                                  Asistencia Ricardo Palma Secundaria
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#53bdeb] ml-0.5" strokeWidth={3} />
                                </span>
                                <span className="text-white/80 text-[11px] leading-tight mt-0.5">Chatbot</span>
                             </div>
                          </div>

                          <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.06] pointer-events-none mt-[54px] z-0" style={{
                             backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                             backgroundSize: '400px'
                          }}></div>

                          <div className="p-4 flex flex-col gap-3 relative z-10 custom-scrollbar pb-6 max-h-[350px] overflow-y-auto">
                             <div className="self-center bg-[#E1F3FB] dark:bg-[#182229] text-slate-500 dark:text-slate-400 text-[11px] font-medium px-3 py-1 rounded-md shadow-sm mb-2 uppercase tracking-wide">
                                Hoy
                             </div>

                             <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none p-2 shadow-sm max-w-[92%] relative z-10 text-left self-start">
                                <svg viewBox="0 0 8 13" width="8" height="13" className="absolute -left-[8px] top-0 text-white dark:text-[#202c33]">
                                   <path fill="currentColor" d="M1.533,3.568L8,12.193V1H2.812C1.042,1,0.474,2.156,1.533,3.568z"></path>
                                </svg>

                                <div className="text-[14px] leading-[1.35] whitespace-pre-wrap break-words text-[#111b21] dark:text-[#e9edef] p-1 pb-4 relative">
                                   <p className="font-bold flex items-center gap-2 mb-2">
                                      📣 Citación Oficial
                                   </p>
                                   <p className="mb-2">
                                      Estimado padre/madre de familia de <span className="font-semibold text-[#075e54] dark:text-emerald-400">{selectedStudent || "[Estudiante]"}</span>, nos comunicamos para solicitar una cita por motivo de: <strong>{citeReason === 'Otros' ? (customReason || '...') : citeReason === 'Académico' ? 'Rendimiento académico' : citeReason === 'Incidencias' ? 'Acumulación de incidencias' : citeReason}</strong>.
                                   </p>
                                   <p>La cita está programada para el día {citeSchedDate ? citeSchedDate.split('-').reverse().join('/') : "[Día]"} a las {citeSchedTime || "[Hora]"}.</p>
                                   
                                   {citeReason === 'Incidencias' && selectedIncidents.length > 0 && (
                                      <div className="mt-2 text-[13px]">
                                        <p className="font-medium">Incidencias a tratar:</p>
                                        <ul className="list-disc pl-4 mt-1 opacity-90">
                                          {availableIncidents.filter(i => selectedIncidents.includes(i.id)).map((i, idx) => <li key={idx}>{i.label} ({i.date})</li>)}
                                        </ul>
                                      </div>
                                   )}

                                   <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[13.5px]">
                                      <p>Atentamente,</p>
                                      {!hideTeacherName && <p className="font-bold mt-1">Carlos Mendoza</p>}
                                      <p className={`${hideTeacherName ? 'font-bold mt-1' : 'italic opacity-80 text-[12.5px]'}`}>Docente del curso de DPCC</p>
                                   </div>
                                   <div className="absolute bottom-0 right-0 text-[11px] text-[#667781] dark:text-[#8696a0] font-medium mt-1.5 flex justify-end items-center gap-1 pb-0.5">
                                      {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} 
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#53bdeb] dark:text-[#53bdeb] inline ml-1" />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-[#EAEBF0] dark:border-slate-800">
                       <button onClick={() => setComposeStep(citeReason === 'Incidencias' ? 2 : 1)} className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-[#546274] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                         Volver
                       </button>
                       <button onClick={handleGenerate} className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#3030b8] hover:bg-blue-800 text-white font-bold transition-all shadow-[0px_4px_12px_rgba(48,48,184,0.2)] hover:shadow-[0px_6px_16px_rgba(48,48,184,0.3)] flex items-center justify-center gap-2" disabled={!citeSchedDate || citeDateError.length > 0}>
                         <Send size={18} /> Generar Citación
                       </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
