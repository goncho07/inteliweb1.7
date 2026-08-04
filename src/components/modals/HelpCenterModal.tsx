import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { modalVariants } from '@/lib/motion';

export const HelpCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex justify-center items-center p-4" onClick={onClose}>
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-xl shadow-lg overflow-y-auto border border-gray-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                <HelpCircle size={24} />
              </span>
              Ayuda y Soporte
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Cerrar ayuda y soporte"
                    className="h-10 w-10 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 [&_svg]:size-6"
                  >
                    <X size={24}/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cerrar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="p-8 space-y-12">
            
            {/* Soporte y Emergencias */}
            <div className="text-center bg-gray-50 dark:bg-slate-900/50 rounded-xl p-8 border border-gray-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Soporte y Emergencias:</h3>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6">
                Para cualquier duda o problema con el módulo o App, comunicarse al:
              </p>
              <div className="flex flex-col items-center gap-2 mb-8">
                <a href="tel:+51960960752" className="text-3xl font-black text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 transition-colors">
                  +51 960 960 752
                </a>
                <a href="tel:+51934973356" className="text-3xl font-black text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 transition-colors">
                  +51 934 973 356
                </a>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white mb-2">Horario de Atención:</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  Lunes a Viernes: 7:00 am - 16:00 pm
                </p>
              </div>
            </div>

            {/* Manuales y Tutoriales */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-800 pb-2">
                Manuales y Videos Tutoriales
              </h3>
              <div className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-xl transition-colors border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Manual del Docente (PDF)</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toda la información necesaria paso a paso.</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-xl transition-colors border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Video Tutorial: Creación de Citaciones</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mira cómo mandar un aviso a los padres de familia.</p>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
