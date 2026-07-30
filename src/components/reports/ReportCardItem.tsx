import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Eye, FileDown, FileSpreadsheet, MoreVertical, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReportCardItem = ({ report, onPreview, type }: any) => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0 as number | 'auto', y: 0 as number | 'auto' });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (contextMenuOpen) {
        setContextMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenuOpen]);

  const handleDownloadPDF = (e: any) => {
    e.stopPropagation();
    const doc = new jsPDF();
    doc.setFontSize(18);
    const title = type === 'incidencias' ? `Anexo de Incidencias` : report.title;
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`${report.date} | ${report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}${report.level === 'Inicial' ? '' : report.section} - ${report.level.substring(0, 3).toUpperCase()}`, 14, 30);
    
    if (type === 'incidencias') {
      autoTable(doc, {
        startY: 40,
        head: [['Fecha', 'Estudiante', 'Tipo', 'Descripción']],
        body: [
          ['05/03/2026', 'Juan Pérez', 'Leve', 'Llegó tarde'],
          ['12/03/2026', 'María Gómez', 'Grave', 'Falta de respeto'],
        ],
      });
    } else {
      autoTable(doc, {
        startY: 40,
        head: [['Estudiante', 'Estado', 'Hora Ingreso', 'Hora Salida']],
        body: Array.from({ length: 15 }).map((_, i) => [`Estudiante ${i + 1}`, 'Asistió', '07:45 AM', '02:00 PM']),
      });
    }
    
    doc.save(`${title.replace(/\s+/g, '_')}_${report.date}.pdf`);
    setContextMenuOpen(false);
  };

  const handleDownloadExcel = (e: any) => {
    e.stopPropagation();
    alert(`Descargando Excel para ${report.title}`);
    setContextMenuOpen(false);
  };

  const openContextMenu = (e: any, isContextMenu = false) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isContextMenu && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setMenuPos({ x: 'auto', y: 'auto' });
    }
    setContextMenuOpen(true);
  };
  
   if (report.status === 'pending') {
     return type === 'incidencias' ? (
       <div className="bg-rose-50/20 dark:bg-rose-900/10 border border-dashed border-rose-200 dark:border-rose-900/50 rounded-xl flex flex-col items-center justify-center p-4 w-full h-[184px] shrink-0 opacity-70 overflow-hidden">
          <Clock className="w-8 h-8 text-rose-300 dark:text-rose-800 mb-3 shrink-0" />
          <span className="text-[16px] font-bold text-rose-400 dark:text-rose-700 text-center shrink-0">
            Anexo Incidencias
          </span>
          <span className="text-[13px] font-medium text-rose-300 dark:text-rose-800 mt-1 uppercase text-center shrink-0">{report.date}</span>
          <span className="text-[12px] font-bold text-rose-400 dark:text-rose-800 mt-3 px-3 py-1 bg-rose-100/50 dark:bg-rose-900/30 rounded-full shrink-0">Próximamente</span>
       </div>
     ) : (
       <div className="bg-gray-50/50 dark:bg-slate-800/30 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 w-full h-[184px] shrink-0 opacity-70 overflow-hidden">
          <Clock className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-3 shrink-0" />
          <span className="text-[16px] font-bold text-gray-500 dark:text-slate-400 text-center shrink-0">
            {report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}{report.level === 'Inicial' ? '' : report.section} - {report.level.substring(0, 3).toUpperCase()}
          </span>
          <span className="text-[13px] font-medium text-gray-400 dark:text-slate-500 mt-1 uppercase text-center shrink-0">{report.date}</span>
          <span className="text-[12px] font-bold text-gray-400 dark:text-slate-600 mt-3 px-3 py-1 bg-gray-200/50 dark:bg-slate-800 rounded-full shrink-0">Próximamente</span>
       </div>
     );
   }

  return (
    <div 
      ref={cardRef}
      onContextMenu={(e) => openContextMenu(e, true)}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col w-full h-[184px] shrink-0 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
    >
      <div 
        onClick={() => report.status !== 'pending' && onPreview(report)} 
        className={`h-[120px] shrink-0 rounded-t-xl ${report.status === 'pending' ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60' : type === 'incidencias' ? 'bg-rose-50/30 dark:bg-rose-900/10 border-rose-200 dark:border-slate-700 hover:bg-rose-50/80 dark:hover:bg-rose-900/20 cursor-pointer' : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800/80 cursor-pointer'} border-b flex items-center justify-center p-4 relative overflow-hidden transition-colors`}
      >
        <div className={`w-[100px] h-[135px] bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${type === 'incidencias' ? 'border-rose-200 dark:border-rose-800/50' : 'border-gray-200 dark:border-slate-600'} border rounded flex flex-col p-3 gap-2 translate-y-6 group-hover:translate-y-4 transition-transform duration-300`}>
          <div className={`w-full h-2.5 ${type === 'incidencias' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'} rounded-sm`}></div>
          <div className="w-3/4 h-2 bg-gray-100 dark:bg-slate-700 rounded-sm"></div>
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-sm mt-1"></div>
          <div className="w-5/6 h-2 bg-gray-100 dark:bg-slate-700 rounded-sm"></div>
          <div className={`w-full h-2 ${type === 'incidencias' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-gray-100 dark:bg-slate-700'} rounded-sm`}></div>
          <div className={`w-4/5 h-2 ${type === 'incidencias' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-gray-100 dark:bg-slate-700'} rounded-sm`}></div>
          <div className="w-full mt-auto flex gap-1">
            <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-sm"></div>
            <div className={`flex-1 h-3 ${type === 'incidencias' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'} rounded-sm`}></div>
          </div>
        </div>
        {report.status !== 'pending' && (
          <div className="absolute inset-0 bg-black/5 dark:bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 p-3.5 rounded-full shadow-md text-white transform scale-90 group-hover:scale-100 transition-transform">
              <Eye size={24} />
            </div>
          </div>
        )}
      </div>

      <div className="px-3.5 py-3 bg-white dark:bg-slate-800 flex items-center justify-between rounded-b-xl border-t border-gray-100 dark:border-slate-800/50 flex-1">
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] leading-tight font-bold text-gray-800 dark:text-gray-100 truncate">
            {report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}{report.level === 'Inicial' ? '' : report.section} - {report.level.substring(0, 3).toUpperCase()}
          </span>
          <span className="text-[12px] font-medium text-gray-500 uppercase mt-0.5">{report.date}</span>
        </div>
        
        <div className="relative shrink-0 ml-2">
          <button 
            onClick={(e) => openContextMenu(e, false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {contextMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              ...(menuPos.x === 'auto' ? { top: 'calc(100% - 40px)', right: 10 } : { left: menuPos.x, top: menuPos.y })
            }}
            className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden"
            onClick={(e: any) => e.stopPropagation()}
          >
            <div className="py-1">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                Descargar {type === 'incidencias' ? 'Anexo' : 'Asistencia'}
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-[#fff1f0] dark:hover:bg-rose-900/20 hover:text-[#cf1322] dark:hover:text-rose-400 transition-colors"
              >
                <FileDown size={16} />
                PDF
              </button>
              <button 
                onClick={handleDownloadExcel}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-[#f6ffed] dark:hover:bg-emerald-900/20 hover:text-[#389e0d] dark:hover:text-emerald-400 transition-colors"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
