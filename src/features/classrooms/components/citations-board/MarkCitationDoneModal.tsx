import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

/** Modal de confirmación para archivar una citación como realizada. */
export const MarkCitationDoneModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden w-full max-w-[420px] flex flex-col items-center text-center p-8 pb-10"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-[#dcfce7] flex items-center justify-center mb-5">
              <div className="w-10 h-10 rounded-full border-[2.5px] border-[#0ea5e9] flex items-center justify-center border-emerald-600">
                <Check
                  className="w-5 h-5 text-emerald-600"
                  strokeWidth={3}
                />
              </div>
            </div>
            <h3 className="text-[22px] font-extrabold text-[#041e49] dark:text-white mb-2 leading-tight">
              ¿Marcar como realizado?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium px-4 mb-8">
              Esta acción archivará la citación en el historial
              permanentemente.
            </p>

            <div className="flex gap-4 w-full px-2">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-extrabold text-[#041e49] dark:text-slate-300 bg-[#f4f6fa] dark:bg-slate-800 hover:bg-[#e2e8f0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 rounded-xl font-extrabold text-white bg-[#059669] hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
