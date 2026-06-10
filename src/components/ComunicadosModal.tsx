import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, ChevronDown, AlertCircle, Info, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';

export const COMMON_MODAL_CLASSES = "bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden w-full max-w-[700px] h-[700px] max-h-[95vh] flex flex-col relative my-auto border border-slate-200 dark:border-slate-800 transition-all duration-300";

export const ComunicadosModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultDestinatario?: string;
}> = ({ isOpen, onClose, defaultDestinatario = "" }) => {
  const [tab, setTab] = useState<'redactar' | 'historial'>('redactar');
  const [step, setStep] = useState<1 | 2>(1);
  const [destinatario, setDestinatario] = useState(defaultDestinatario || "4° A");
  const [motivo, setMotivo] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");
  const [hideName, setHideName] = useState(false);

  const motivos = [
    { id: 'Urgente', icon: AlertCircle, hexBg: '#FFE5E8', hexBorder: '#ED325C', hexInner: '#FFCFD8', hexText: '#A30022' },
    { id: 'Informativo', icon: Info, hexBg: '#E5EFFF', hexBorder: '#1D60FC', hexInner: '#CCDEFF', hexText: '#002D98' },
    { id: 'Recordatorio', icon: Megaphone, hexBg: '#FFEFE5', hexBorder: '#FF6812', hexInner: '#FFDECC', hexText: '#963600' }
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={COMMON_MODAL_CLASSES}
      >
        <div className="flex justify-between items-center px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
           <h3 className="text-[22px] font-extrabold text-[#0D082C] dark:text-white flex items-center gap-3">
              <Megaphone className="text-[#3030b8] dark:text-indigo-400" size={26} />
              Comunicados
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors relative z-10">
             <X size={20} className="text-slate-500" strokeWidth={2.5} />
           </button>
        </div>
        
        <div className="px-6 sm:px-8 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
           <div className="flex items-center gap-8 translate-y-[1px]">
               <button
                  onClick={() => {setTab('redactar'); setStep(1);}}
                  className={`pb-4 text-[14px] font-bold transition-all border-b-2 ${tab === 'redactar' ? 'border-[#3030b8] text-[#3030b8] dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
               >
                 Redactar comunicado
               </button>
               <button
                  onClick={() => setTab('historial')}
                  className={`pb-4 text-[14px] font-bold transition-all border-b-2 ${tab === 'historial' ? 'border-[#3030b8] text-[#3030b8] dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
               >
                 Historial
               </button>
           </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative">
           {tab === 'redactar' ? (
             <>
               {step === 1 ? (
                 <div className="flex flex-col gap-6 flex-1 h-full">
                   <div>
                      <label className="block text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-3">DESTINATARIO</label>
                      <div className="relative">
                        <select 
                          value={destinatario}
                          onChange={(e) => setDestinatario(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3030b8]/50 appearance-none transition-all"
                        >
                          <option value="3° A">3° A</option>
                          <option value="4° A">4° A</option>
                          <option value="4° B">4° B</option>
                          <option value="5° A">5° A</option>
                          <option value="5° B">5° B</option>
                          <option value="Todas las Aulas (Secundaria)">Todas las Aulas (Secundaria)</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                      </div>
                   </div>

                   <div className="mb-4">
                      <label className="block text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-3">MOTIVO DEL COMUNICADO</label>
                      <div className="flex flex-col gap-3">
                          {motivos.map((item: any) => {
                            const isSelected = motivo === item.id;
                            return (
                              <button 
                                key={item.id}
                                onClick={() => setMotivo(item.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'shadow-sm' : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                style={isSelected ? { backgroundColor: item.hexBg, borderColor: item.hexBorder } : { border: '2px solid transparent' }}
                              >
                                <div 
                                  className={`p-2 rounded-xl transition-colors ${isSelected ? '' : 'bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500'}`}
                                  style={isSelected ? { backgroundColor: item.hexInner, color: item.hexText } : {}}
                                >
                                  <item.icon size={20} />
                                </div>
                                <span 
                                  className={`font-bold text-[15px]`}
                                  style={isSelected ? { color: item.hexText } : { color: 'inherit' }}
                                >
                                  {item.id}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                   </div>
                      
                   <div className="mt-auto pt-4">
                     <button 
                        disabled={!motivo}
                        onClick={() => setStep(2)}
                        className="bg-[#8E94E5] hover:bg-[#3030b8] text-white font-bold py-4 rounded-2xl transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-lg"
                     >
                        Siguiente
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col gap-4 flex-1 h-full">
                   <button 
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 text-[#3030b8] dark:text-indigo-400 font-bold w-fit hover:opacity-80 transition-opacity"
                   >
                      <ChevronLeft size={20} /> Volver a Atrás
                   </button>

                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                     <div>
                       <label className="block text-[12px] font-extrabold text-[#0D082C] dark:text-slate-300 uppercase mb-3">Cuerpo del Mensaje</label>
                       <textarea 
                          value={mensaje}
                          onChange={e => setMensaje(e.target.value)}
                          placeholder="Estimados apoderados, les comunicamos que..."
                          className="w-full bg-[#F5F6F8] dark:bg-slate-800/80 border border-transparent focus:border-[#3030b8] dark:focus:border-indigo-500 rounded-xl p-5 min-h-[140px] resize-none focus:outline-none focus:ring-4 focus:ring-[#3030b8]/10 transition-all font-medium text-[15px] text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                       />
                     </div>
                      
                     <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[15px] text-[#0D082C] dark:text-white">Ocultar nombre del docente</span>
                        <button 
                           onClick={() => setHideName(!hideName)}
                           className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${hideName ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                           <div className={`w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm transition-transform ${hideName ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                     </div>

                     <div className="bg-[#EBE2D9] dark:bg-[#111b21] rounded-2xl overflow-hidden mt-2 relative border border-[#EBE2D9] dark:border-[#202c33]">
                        <div className="bg-[#008069] dark:bg-[#202c33] px-4 py-3 flex items-center gap-3 relative z-10 shadow-sm">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111b21] flex items-center justify-center shrink-0">
                             <Megaphone className="text-[#008069] dark:text-[#00a884] w-5 h-5" />
                           </div>
                           <div>
                              <div className="text-white font-bold text-[14px] flex items-center gap-1.5">
                                Asistencia Ricardo Palma Secundaria <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-400 text-white" />
                              </div>
                              <div className="text-emerald-50 dark:text-[#aebac1] text-[12px] opacity-90">Chatbot</div>
                           </div>
                        </div>
                        <div className="p-4 bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] dark:bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover bg-center min-h-[160px] flex flex-col justify-end">
                           <div className="bg-white/90 dark:bg-[#202c33]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-[#8696a0] mx-auto mb-3 uppercase tracking-wider font-bold">HOY</div>
                           
                           <div className="bg-white dark:bg-[#005c4b] rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm relative">
                              <div className="text-[13px] text-[#008069] dark:text-[#00a884] font-bold mb-1 flex justify-between items-center">
                                 {hideName ? 'Administración' : 'Docente'}
                                 <span className="text-[12px] opacity-70">~ {destinatario}</span>
                              </div>
                              
                              {motivo && <p className="font-bold flex items-center gap-2 mb-2 text-[#111b21] dark:text-[#e9edef] text-[15px]">
                                 {motivo === 'Urgente' ? '⚠️' : motivo === 'Informativo' ? 'ℹ️' : '🔔'} Comunicado {motivo}
                              </p>}
                              <p className={`whitespace-pre-wrap leading-relaxed text-[15px] ${mensaje ? 'text-[#111b21] dark:text-[#e9edef]' : 'text-slate-400 dark:text-[#8696a0] italic'}`}>
                                 {mensaje || 'Redacte su mensaje en el campo superior...'}
                              </p>
                              
                              <div className="text-right text-[11px] text-slate-400 dark:text-[#8696a0] mt-1 pr-4">
                                10:44 a.m. <span className="absolute right-2 bottom-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#53bdeb] inline" /></span>
                              </div>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div className="mt-auto pt-4 shrink-0">
                     <button 
                        disabled={!mensaje || !motivo}
                        onClick={() => {
                           alert('Enviando...');
                           onClose();
                        }}
                        className="bg-[#78CCB5] hover:bg-emerald-500 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white font-bold py-4 rounded-2xl transition-all w-full flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <Send size={20} />
                        Enviar por WhatsApp Masivo
                     </button>
                   </div>
                 </div>
               )}
             </>
           ) : (
             <div className="flex-1 flex flex-col justify-center items-center h-full opacity-60">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <Megaphone className="text-slate-400" size={32} />
                 </div>
                 <p className="text-slate-500 font-bold text-lg">No hay comunicados enviados</p>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  , document.body);
};
