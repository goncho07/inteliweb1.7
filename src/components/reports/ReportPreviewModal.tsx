import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Calendar, Download, FileText, Users, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ReportHistoryItem } from '@/components/reports/types';

/** Modal de vista previa de un reporte de asistencia con descarga en PDF. */
export const ReportPreviewModal = ({ report, onClose }: { report: ReportHistoryItem, onClose: () => void }) => {
  // Generate some mock data based on the report
  const totalStudents = 26;
  const asistieron = 21;
  const faltaron = 2;
  const tardanzas = 1;
  const justificadas = 2;
  const pctAsistencia = Math.round((asistieron / totalStudents) * 100);

  // Mock students list
  const students = Array.from({ length: 15 }).map((_, i) => {
    let state = 'Asistió';
    let color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    let dot = 'bg-emerald-500';

    if (i === 3 || i === 7) {
      state = 'Faltó';
      color = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      dot = 'bg-rose-500';
    } else if (i === 5) {
      state = 'Tardanza';
      color = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      dot = 'bg-orange-500';
    } else if (i === 9 || i === 12) {
      state = 'Justificada';
      color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      dot = 'bg-blue-500';
    }

    return {
      id: i,
      name: `Estudiante ${i + 1}`,
      state,
      color,
      dot,
      ingreso: state === 'Faltó' || state === 'Justificada' ? '-' : (state === 'Tardanza' ? '08:15 AM' : '07:45 AM'),
      salida: state === 'Faltó' || state === 'Justificada' ? '-' : '02:00 PM'
    };
  });

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(report.title, 14, 22);
    doc.setFontSize(11);
    doc.text(`${report.date} | ${report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}${report.level === 'Inicial' ? '' : report.section} - ${report.level.substring(0, 3).toUpperCase()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Estudiante', 'Estado', 'Hora Ingreso', 'Hora Salida']],
      body: students.map(s => [s.name, s.state, s.ingreso, s.salida]),
    });

    doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{report.title}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Calendar size={14} /> {report.date}</span>
                <span className="text-gray-300 dark:text-slate-700">|</span>
                <span className="flex items-center gap-1"><Users size={14} /> {report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}{report.level === 'Inicial' ? '' : report.section} - {report.level.substring(0, 3).toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors tooltip-trigger" title="Descargar PDF">
              <Download size={20} />
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Chart Section */}
          <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="relative w-48 h-48">
              {/* SVG Donut Chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="12" />
                {/* Asistieron */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray={`${(asistieron/totalStudents)*251.2} 251.2`} />
                {/* Faltaron */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="12" strokeDasharray={`${(faltaron/totalStudents)*251.2} 251.2`} strokeDashoffset={`-${(asistieron/totalStudents)*251.2}`} />
                {/* Tardanzas */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray={`${(tardanzas/totalStudents)*251.2} 251.2`} strokeDashoffset={`-${((asistieron+faltaron)/totalStudents)*251.2}`} />
                {/* Justificadas */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray={`${(justificadas/totalStudents)*251.2} 251.2`} strokeDashoffset={`-${((asistieron+faltaron+tardanzas)/totalStudents)*251.2}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{pctAsistencia}%</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-widest">ASISTENCIA</span>
              </div>
            </div>

            <div className="space-y-4 min-w-[200px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">ASISTIÓ</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{asistieron}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">FALTAS</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{faltaron}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">TARDANZAS</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{tardanzas}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">JUSTIFICADAS</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{justificadas}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wider">
                <tr>
                  <th className="p-4">ESTUDIANTE</th>
                  <th className="p-4">ESTADO</th>
                  <th className="p-4">HORA DE INGRESO</th>
                  <th className="p-4">HORA DE SALIDA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{student.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${student.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.dot}`}></span>
                        {student.state}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{student.ingreso}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{student.salida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
