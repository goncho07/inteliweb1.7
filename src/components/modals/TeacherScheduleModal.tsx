import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { modalVariants } from '@/lib/motion';
import type { UserItem } from '@/types';

export const TeacherScheduleModal: React.FC<{ teacher: UserItem; onClose: () => void }> = ({ teacher, onClose }) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = ['08:00 - 09:30', '09:30 - 11:00', '11:00 - 11:30', '11:30 - 13:00', '13:00 - 14:30'];
  
  const scheduleData = [
    ['Matemática', 'Física', 'RECREO', 'Matemática', 'Tutoría'],
    ['Raz. Mat.', 'Matemática', 'RECREO', 'Física', 'Raz. Mat.'],
    ['Matemática', 'Raz. Mat.', 'RECREO', 'Matemática', 'Libre'],
    ['Física', 'Matemática', 'RECREO', 'Raz. Mat.', 'Matemática'],
    ['Matemática', 'Física', 'RECREO', 'Matemática', 'Raz. Mat.']
  ];

  const downloadSchedulePDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('HORARIO ESCOLAR 2025', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`DOCENTE: ${teacher.name.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });
        
        const tableBody = hours.map((hour, i) => [hour, ...scheduleData.map(day => day[i])]);

        autoTable(doc, {
          startY: 30,
          head: [['HORA', ...days]],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], halign: 'center' },
          bodyStyles: { halign: 'center', fontSize: 10 },
          columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
        });

        doc.save(`Horario_${teacher.name.replace(/\s+/g, '_')}.pdf`);
      });
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <motion.div 
        variants={modalVariants} 
        initial="hidden" 
        animate="visible" 
        exit="exit" 
        className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-sm">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Horario del Docente</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{teacher.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={downloadSchedulePDF}
              className="h-10 gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 [&_svg]:size-4"
            >
              <Download size={16} /> Descargar PDF
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Cerrar horario del docente"
                    className="h-10 w-10 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 [&_svg]:size-6"
                  >
                    <X size={24}/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cerrar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                {days.map(day => (
                  <th key={day} className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, i) => (
                <tr key={hour}>
                  <td className="p-3 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-slate-900/50">{hour}</td>
                  {scheduleData.map((day, j) => (
                    <td key={j} className={`p-3 border border-gray-200 dark:border-slate-800 text-xs font-medium text-center ${day[i] === 'RECREO' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                      {day[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
