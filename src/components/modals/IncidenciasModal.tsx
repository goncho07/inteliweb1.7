import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronDown } from 'lucide-react';
import { COMMON_MODAL_CLASSES } from '@/components/modals/ComunicadosModal';

export const IncidenciasModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [incidenciaClase, setIncidenciaClase] = useState('4° A');
  const [incidenciaStudent, setIncidenciaStudent] = useState('');

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={COMMON_MODAL_CLASSES}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 shrink-0">
              <h3 className="text-[22px] font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-3">
                <AlertTriangle size={26} strokeWidth={2.5} /> Registrar Incidencia
              </h3>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-rose-600 hover:bg-white transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
               <div className="mb-2">
                  <label className="block text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-3">SELECCIONA EL AULA</label>
                  <div className="relative">
                    <select 
                      value={incidenciaClase}
                      onChange={(e) => setIncidenciaClase(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold text-[15px] focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                      <option>3° A</option>
                      <option>3° B</option>
                      <option>4° A</option>
                      <option>4° B</option>
                      <option>5° A</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
               </div>

               <div className="mb-4">
                  <label className="block text-[12px] font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-3">ESTUDIANTE INVOLUCRADO</label>
                  <div className="relative">
                    <select 
                      value={incidenciaStudent}
                      onChange={(e) => setIncidenciaStudent(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold text-[15px] focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                      <option value="">Seleccionar estudiante...</option>
                      <option value="Luis Ramos">Luis Ramos</option>
                      <option value="Andrés Castro">Andrés Castro</option>
                      <option value="Matias Campos">Matias Campos</option>
                      <option value="Valery Perez">Valery Perez</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
               </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
               <button 
                 onClick={() => {
                     alert("Incidencia enviada y guardada en el historial.");
                     onClose();
                 }} 
                 disabled={!incidenciaStudent}
                 className="w-full bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-500/30 active:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-[15px] shadow-sm transition-all"
               >
                 Continuar Registro
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
