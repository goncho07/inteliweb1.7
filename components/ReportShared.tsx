import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { BarChart3, Filter, ChevronDown, Users, GraduationCap, AlertCircle, Calendar, Search, FileDown, FileText, Eye, Download, SearchX, Folder, ChevronRight, ArrowLeft, Home, X, CheckCircle2, XCircle, Clock, Info, CalendarDays, CalendarRange, Layers, AlertTriangle, MoreVertical } from 'lucide-react';
import { PageHeader, containerVariants } from '../components/UI';
import { CustomCalendar } from '../src/components/CustomCalendar';
import { MOCK_USERS, EDUCATIONAL_STRUCTURE } from '../constants';
import { ModuleProps } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportCardItem } from '../src/components/ReportCardItem';

export const ScrollableReportList = ({ items, type, historyPath, onPreview }: any) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };
  
  const isFourCols = historyPath[0] === 'Semanal' || historyPath[0] === 'Bimestral';
  const showArrow = isFourCols ? items.length > 4 : items.length > 5;

  return (
    <div className="relative group/carousel">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-5 pb-2 scrollbar-hide snap-x items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((report: any) => (
          <div 
            key={report.id + '-' + type}
            className={`shrink-0 snap-start flex flex-col ${isFourCols ? 'w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]' : 'w-full sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] xl:w-[calc((100%-5rem)/5)]'}`}
          >
            <ReportCardItem 
              report={report} 
              type={type} 
              onPreview={() => onPreview(report)} 
            />
          </div>
        ))}
      </div>
      {showArrow && (
        <button 
          onClick={scrollRight}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-full p-2 text-indigo-500 hover:text-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-700 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
};

export interface ReportHistoryItem {
  id: number;
  type: string;
  title: string;
  date: string;
  level: string;
  grade: string;
  section: string;
  size: string;
  progress: number;
  status?: 'generated' | 'pending';
  targetDate?: Date;
}

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const REPORT_TYPES = ['Diario', 'Semanal', 'Mensual', 'Bimestral'];

const MOCK_REPORTS_HISTORY: ReportHistoryItem[] = (() => {
  const reports: ReportHistoryItem[] = [];
  let id = 1;
  
  REPORT_TYPES.forEach(type => {
    Object.entries(EDUCATIONAL_STRUCTURE).forEach(([level, grades]) => {
      Object.entries(grades).forEach(([grade, sections]) => {
        sections.forEach(section => {
          if (type === 'Diario') {
            const days = [];
            const d = new Date();
            const realNow = new Date();
            const dayOfWeek = d.getDay();
            const diffToMonday = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);

            for (let i = 0; i < 5; i++) {
               const currentDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
               
               const dayName = currentDate.toLocaleDateString('es-ES', { weekday: 'long' });
               const dayNum = currentDate.getDate();
               const topDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
               const month = monthNames[currentDate.getMonth()].substring(0, 3).toLowerCase();
               const year = currentDate.getFullYear();
               const isFuture = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) > new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate());
               
               days.push({
                 day: `${topDay} ${dayNum}`,
                 date: `${dayNum} ${month} ${year}`,
                 isFuture
               });
            }
            days.forEach(({ day, date, isFuture }) => {
              reports.push({
                id: id++,
                type,
                title: day,
                date,
                level,
                grade,
                section,
                size: isFuture ? '-' : `${(Math.random() * 1 + 0.5).toFixed(1)} MB`,
                progress: isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: isFuture ? 'pending' : 'generated'
              });
            });
          } else if (type === 'Semanal') {
            const weeks = [];
            const d = new Date();
            const realNow = new Date();
            const year = d.getFullYear();
            const currentMonth = d.getMonth();
            const monthNameStr = monthNames[currentMonth].charAt(0).toUpperCase() + monthNames[currentMonth].slice(1).toLowerCase();
            
            for(let i=1; i<=4; i++) {
               const startDay = (i - 1) * 7 + 1;
               const endDay = i * 7;
               const weekStartDate = new Date(year, currentMonth, startDay);
               const isFuture = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate()) > new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate());
               
               weeks.push({
                 title: `Semana ${i}`,
                 date: `${startDay} - ${endDay} de ${monthNameStr}`,
                 isFuture
               });
            }
            weeks.forEach(week => {
              reports.push({
                id: id++,
                type,
                title: week.title,
                date: week.date,
                level,
                grade,
                section,
                size: week.isFuture ? '-' : `${(Math.random() * 2 + 1).toFixed(1)} MB`,
                progress: week.isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: week.isFuture ? 'pending' : 'generated'
              });
            });
          } else if (type === 'Mensual') {
            const currentYear = new Date().getFullYear();
            const realNow = new Date();
            const monthsList = [
              { name: 'Marzo', index: 2 },
              { name: 'Abril', index: 3 },
              { name: 'Mayo', index: 4 },
              { name: 'Junio', index: 5 },
              { name: 'Julio', index: 6 },
              { name: 'Agosto', index: 7 },
              { name: 'Septiembre', index: 8 },
              { name: 'Octubre', index: 9 },
              { name: 'Noviembre', index: 10 },
              { name: 'Diciembre', index: 11 }
            ];
            
            monthsList.forEach(m => {
              const monthStartDate = new Date(currentYear, m.index, 1);
              const isFuture = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), 1) > new Date(realNow.getFullYear(), realNow.getMonth(), 1);
              reports.push({
                id: id++,
                type,
                title: m.name,
                date: `${m.name} ${currentYear}`,
                level,
                grade,
                section,
                size: isFuture ? '-' : `${(Math.random() * 3 + 2).toFixed(1)} MB`,
                progress: isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: isFuture ? 'pending' : 'generated'
              });
            });
          } else if (type === 'Bimestral') {
            const currentYear = new Date().getFullYear();
            const realNow = new Date();
            const bimesters = [
              { title: 'I Bimestre', dateStr: '16-03-2026 al 15-05-2026', monthIndex: 2 },
              { title: 'II Bimestre', dateStr: '25-05-2026 al 24-07-2026', monthIndex: 4 },
              { title: 'III Bimestre', dateStr: '10-08-2026 al 09-10-2026', monthIndex: 7 },
              { title: 'IV Bimestre', dateStr: '19-10-2026 al 18-12-2026', monthIndex: 9 }
            ];
            bimesters.forEach(b => {
              const bimStartDate = new Date(currentYear, b.monthIndex, 1);
              const isFuture = new Date(bimStartDate.getFullYear(), bimStartDate.getMonth(), 1) > new Date(realNow.getFullYear(), realNow.getMonth(), 1);
              
              reports.push({
                id: id++,
                type,
                title: b.title,
                date: b.dateStr.replace(/2026/g, currentYear.toString()),
                level,
                grade,
                section,
                size: isFuture ? '-' : `${(Math.random() * 5 + 3).toFixed(1)} MB`,
                progress: isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: isFuture ? 'pending' : 'generated'
              });
            });
          }
        });
      });
    });
  });
  return reports;
})();

export const getFolderStyle = (folderName: string, isReportsModule: boolean = false) => {
  const renderIcon = (IconComponent: any) => (
    <IconComponent size={32} strokeWidth={2.5} />
  );

  switch (folderName) {
    case 'Diario':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        borderClass: 'hover:border-blue-200 dark:hover:border-blue-800',
        cardBorderClass: 'border-blue-400 dark:border-blue-500',
        topBgClass: 'bg-[#e0f0ff] dark:bg-blue-900/40',
        bottomBgClass: 'bg-[#f0f8ff] dark:bg-blue-900/20',
        subtitle: 'Reportes por día'
      };
    case 'Semanal':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderClass: 'hover:border-emerald-200 dark:hover:border-emerald-800',
        cardBorderClass: 'border-emerald-400 dark:border-emerald-500',
        topBgClass: 'bg-[#e0f5e8] dark:bg-emerald-900/40',
        bottomBgClass: 'bg-[#f0fdf4] dark:bg-emerald-900/20',
        subtitle: 'Reportes por semana'
      };
    case 'Mensual':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-purple-600 dark:text-purple-400',
        bgClass: 'bg-purple-50 dark:bg-purple-900/20',
        borderClass: 'hover:border-purple-200 dark:hover:border-purple-800',
        cardBorderClass: 'border-purple-400 dark:border-purple-500',
        topBgClass: 'bg-[#ede9fe] dark:bg-purple-900/40',
        bottomBgClass: 'bg-[#f5f3ff] dark:bg-purple-900/20',
        subtitle: 'Reportes por mes'
      };
    case 'Bimestral':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-orange-600 dark:text-orange-400',
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        borderClass: 'hover:border-orange-200 dark:hover:border-orange-800',
        cardBorderClass: 'border-orange-400 dark:border-orange-500',
        topBgClass: 'bg-[#ffedd5] dark:bg-orange-900/40',
        bottomBgClass: 'bg-[#fff7ed] dark:bg-orange-900/20',
        subtitle: 'Reportes por bimestre'
      };
    default:
      return {
        icon: renderIcon(Folder),
        colorClass: 'text-gray-600 dark:text-gray-400',
        bgClass: 'bg-gray-50 dark:bg-gray-800',
        borderClass: 'hover:border-gray-200 dark:hover:border-gray-700',
        cardBorderClass: 'border-gray-300 dark:border-gray-600',
        topBgClass: 'bg-gray-100 dark:bg-gray-800',
        bottomBgClass: 'bg-gray-50 dark:bg-gray-900',
        subtitle: 'Carpeta'
      };
  }
};

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

export const ReportsModule: React.FC<ModuleProps> = () => {
  const [activeTab, setActiveTab] = useState<'generar' | 'historial'>('generar');
  const [historyPath, setHistoryPath] = useState<string[]>([]);
  const [previewReport, setPreviewReport] = useState<ReportHistoryItem | null>(null);
  
  // --- Estados de Filtros ---
  const [periodo, setPeriodo] = useState('Mensual');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const week = Math.ceil(Math.floor((d.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000)) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  });
  const [selectedBimestre, setSelectedBimestre] = useState('1');
  const [userType, setUserType] = useState<'Estudiante' | 'Docente'>('Estudiante');
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // Filtros de Aula (Cascada)
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Actualizar filtros en cascada
  useEffect(() => {
    if (selectedLevel === 'Todos') {
      setSelectedGrade('Todos');
      setSelectedSection('Todos');
      return;
    }
    const grades = Object.keys(EDUCATIONAL_STRUCTURE[selectedLevel] || {});
    if (grades.length > 0 && selectedGrade !== 'Todos') {
      // No forzar si ya es algo válido o si queremos mantener 'Todos'
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedGrade === 'Todos') {
      setSelectedSection('Todos');
      return;
    }
    // @ts-ignore
    const sections = EDUCATIONAL_STRUCTURE[selectedLevel]?.[selectedGrade] || [];
    if (sections.length > 0 && selectedSection !== 'Todos') {
      // No forzar
    }
  }, [selectedGrade, selectedLevel]);

  const gradeOptions = useMemo(() => {
    if (selectedLevel === 'Todos') return ['Todos'];
    return ['Todos', ...Object.keys(EDUCATIONAL_STRUCTURE[selectedLevel] || {})];
  }, [selectedLevel]);

  const sectionOptions = useMemo(() => {
    if (selectedLevel === 'Todos' || selectedGrade === 'Todos') return ['Todos'];
    // @ts-ignore
    return ['Todos', ...(EDUCATIONAL_STRUCTURE[selectedLevel]?.[selectedGrade] || [])];
  }, [selectedLevel, selectedGrade]);

  // --- Generación de Datos de Asistencia (Simulación) ---
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayLabel = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = date.getDay(); // 0 = Dom, 1 = Lun, etc.
    const labels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return labels[dayOfWeek];
  };

  const filteredUsers = useMemo(() => {
    if (userType === 'Estudiante' && selectedLevel === '') return [];
    return MOCK_USERS.filter(u => 
      u.role === userType &&
      (userType === 'Docente' ? true : ( 
        (selectedLevel === 'Todos' || u.level === selectedLevel) &&
        (selectedGrade === 'Todos' || u.grade === selectedGrade) &&
        (selectedSection === 'Todos' || u.section === selectedSection)
      )) &&
      (search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.dni.includes(search))
    );
  }, [userType, selectedLevel, selectedGrade, selectedSection, search]);

  const attendanceData = useMemo(() => {
    return filteredUsers.map(user => {
      const statuses: string[] = [];
      let tardanzas = 0;
      let faltas = 0;
      let asistencias = 0;
      let justificadas = 0;

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(selectedYear, selectedMonth, i);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (isWeekend) {
          statuses.push(''); 
        } else {
          const rand = Math.random();
          if (rand > 0.92) { statuses.push('F'); faltas++; }
          else if (rand > 0.85) { statuses.push('T'); tardanzas++; }
          else if (rand > 0.80) { statuses.push('J'); justificadas++; } 
          else { statuses.push('A'); asistencias++; }
        }
      }
      return { ...user, statuses, stats: { tardanzas, faltas, asistencias, justificadas } };
    });
  }, [filteredUsers, selectedMonth, selectedYear, daysInMonth]);

  // Estadísticas Globales para el Gráfico
  const stats = useMemo(() => {
    let t = 0, f = 0, a = 0, j = 0;
    attendanceData.forEach(d => {
      t += d.stats.tardanzas;
      f += d.stats.faltas;
      a += d.stats.asistencias;
      j += d.stats.justificadas;
    });
    const total = t + f + a + j || 1; 
    
    return { 
      tardanzas: t, 
      faltas: f, 
      asistencias: a, 
      justificadas: j,
      total 
    };
  }, [attendanceData]);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Función para dibujar una tabla para un grupo específico
    const drawTableForGroup = (users: any[], level: string, grade: string, section: string, startY: number) => {
      // Header de la tabla de grupo
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Dibujar cuadro de info
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(margin, startY, pageWidth - (margin * 2), 15);
      
      doc.text(`TIPO: ${userType.toUpperCase()}S`, margin + 5, startY + 10);
      doc.text(`NIVEL: ${level.toUpperCase()}`, margin + 60, startY + 10);
      doc.text(`GRADO: ${grade.toUpperCase()}`, margin + 110, startY + 10);
      doc.text(`SECCIÓN: ${section.toUpperCase()}`, margin + 160, startY + 10);
      doc.text(`MES: ${monthNames[selectedMonth].toUpperCase()} ${selectedYear}`, margin + 220, startY + 10);

      const tableHeaders = [
        { content: 'N°', rowSpan: 2, styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'APELLIDOS Y NOMBRES', rowSpan: 2, styles: { halign: 'left' as const, valign: 'middle' as const } },
        ...daysArray.map(d => ({ content: d.toString(), styles: { halign: 'center' as const } }))
      ];

      const dayLabels = daysArray.map(d => getDayLabel(d));
      const subHeader = dayLabels.map(l => ({ content: l, styles: { halign: 'center' as const, fontSize: 7 } }));

      const tableData = users.map((u, i) => [
        (i + 1).toString(),
        u.name.toUpperCase(),
        ...u.statuses.map((s: string) => s === 'A' ? '' : s) // Según la imagen, 'A' no se muestra, solo un punto o vacío. En la imagen parece vacío para asistencias.
      ]);

      autoTable(doc, {
        startY: startY + 18,
        head: [tableHeaders, subHeader],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 1,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.2
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 60 },
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index > 1) {
            const val = data.cell.text[0];
            if (val === 'F') data.cell.styles.textColor = [244, 63, 94];
            if (val === 'T') data.cell.styles.textColor = [249, 115, 22];
            if (val === 'J') data.cell.styles.textColor = [59, 130, 246];
          }
        }
      });

      return (doc as any).lastAutoTable.finalY;
    };

    // Título Principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('REGISTRO DE ASISTENCIA', pageWidth / 2, 22, { align: 'center' });

    let currentY = 30;

    if (selectedLevel === 'Todos' || selectedGrade === 'Todos' || selectedSection === 'Todos') {
      // Agrupar datos
      const groups: { [key: string]: any[] } = {};
      attendanceData.forEach(u => {
        const key = `${u.level} - ${u.grade} - ${u.section}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(u);
      });

      Object.entries(groups).forEach(([key, users], index) => {
        const [level, grade, section] = key.split(' - ');
        if (index > 0) {
          doc.addPage();
          currentY = 15; // Reset Y on new page
          // Re-dibujar títulos en cada página si es necesario, o solo el de grupo
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
          doc.setFontSize(12);
          doc.text('REGISTRO DE ASISTENCIA', pageWidth / 2, 22, { align: 'center' });
          currentY = 30;
        }
        currentY = drawTableForGroup(users, level, grade, section, currentY);
      });
    } else {
      drawTableForGroup(attendanceData, selectedLevel, selectedGrade, selectedSection, currentY);
    }

    // Footer (en la última página o en todas?)
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('. Asistió  F Faltó  T Tardanza  J Falta justificada', margin, footerY);
      
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} p. m.`;
      doc.text(`Impreso: ${dateStr}`, pageWidth - margin, footerY, { align: 'right' });
    }

    doc.save(`Reporte_Asistencia_${monthNames[selectedMonth]}_${selectedYear}.pdf`);
  };

  // Configuración del Donut Chart Multi-segmento
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  // Calcular offsets para apilar los segmentos
  // Orden: Asistencia (Verde) -> Justificada (Azul) -> Tardanza (Naranja) -> Falta (Rojo)
  const pctA = stats.asistencias / stats.total;
  const pctJ = stats.justificadas / stats.total;
  const pctT = stats.tardanzas / stats.total;
  const pctF = stats.faltas / stats.total;

  const dashA = pctA * circumference;
  const dashJ = pctJ * circumference;
  const dashT = pctT * circumference;
  const dashF = pctF * circumference;

  // Rotation offsets (cumulative degrees)
  // Start at -90deg (top)
  const rotA = -90;
  const rotJ = rotA + (pctA * 360);
  const rotT = rotJ + (pctJ * 360);
  const rotF = rotT + (pctT * 360);

  const currentFolderContent = useMemo(() => {
    if (historyPath.length === 0) {
      return { type: 'folders', items: REPORT_TYPES };
    }
    
    const freq = historyPath[0];
    
    let filteredReports = MOCK_REPORTS_HISTORY.filter(r => r.type === freq);
    
    if (selectedLevel && selectedLevel !== 'Todos') {
      filteredReports = filteredReports.filter(r => r.level === selectedLevel);
    }
    if (selectedGrade && selectedGrade !== 'Todos') {
      filteredReports = filteredReports.filter(r => r.grade === selectedGrade);
    }
    if (selectedSection && selectedSection !== 'Todos') {
      filteredReports = filteredReports.filter(r => r.section === selectedSection);
    }

    // Filtro por fecha o semana si aplica
    if (freq === 'Diario' && selectedDate) {
      const [y, m, d] = selectedDate.split('-');
      const day = parseInt(d, 10);
      const monthStr = monthNames[parseInt(m, 10) - 1]?.substring(0, 3).toLowerCase();
      const formattedDate = `${day} ${monthStr}`;
      
      filteredReports = filteredReports.filter(r => r.date.toLowerCase().includes(formattedDate) || r.title.toLowerCase().includes(formattedDate));
    }

    if (freq === 'Semanal' && selectedWeek) {
      // Simulamos filtro por semana
      const weekNum = selectedWeek.split('-W')[1];
      filteredReports = filteredReports.filter(r => r.title.includes(`Semana ${parseInt(weekNum || '0')}`));
    }

    if (freq === 'Mensual') {
      const monthName = monthNames[selectedMonth];
      filteredReports = filteredReports.filter(r => r.date.includes(monthName) && r.date.includes(selectedYear.toString()));
    }

    if (freq === 'Bimestral') {
      const bimesterMap: Record<string, string> = {
        '1': 'I Bimestre',
        '2': 'II Bimestre',
        '3': 'III Bimestre',
        '4': 'IV Bimestre'
      };
      const bimesterStr = bimesterMap[selectedBimestre];
      if (bimesterStr) {
        filteredReports = filteredReports.filter(r => r.title.includes(bimesterStr) && r.date.includes(selectedYear.toString()));
      }
    }
    
    if (search) {
      filteredReports = filteredReports.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.date.toLowerCase().includes(search.toLowerCase()));
    }
    
    return { type: 'files', items: filteredReports };
  }, [historyPath, selectedLevel, selectedGrade, selectedSection, selectedDate, selectedWeek, selectedMonth, selectedYear, selectedBimestre, search]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full flex flex-col font-poppins relative">
      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
        <PageHeader 
          title="Reportes de Asistencia" 
          subtitle="Monitoreo detallado de asistencia y puntualidad." 
          icon={BarChart3}
          className="bg-white"
        />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4 gap-6 max-w-[1700px] mx-auto w-full min-h-0 overflow-hidden h-full">
            {/* Side Filters */}
            <div className={`w-full lg:w-[280px] xl:w-[320px] shrink-0 flex-col gap-4 border border-slate-200 dark:border-slate-800 bg-[#f4f6fa] dark:bg-slate-900 rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-[fit-content] lg:h-full z-10 animate-in fade-in slide-in-from-left-4 duration-500 max-h-[60vh] lg:max-h-none flex`}>
              <h3 className="font-extrabold text-[15px] mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1 tracking-wider uppercase">
                <Filter size={18} className="text-blue-600" />
                Filtros de Búsqueda
              </h3>
              
              <div className="flex flex-col gap-3 overflow-y-auto hidden-scrollbar pr-1 pb-4 flex-1">
                      <div className="bg-white dark:bg-slate-800/40 rounded-[20px] border border-slate-100 dark:border-slate-800 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Nivel</label>
                        <div className="relative">
                          <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full appearance-none bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10 transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
                          >
                            <option value="">Todos los niveles</option>
                            {Object.keys(EDUCATIONAL_STRUCTURE).map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 rounded-[20px] border border-slate-100 dark:border-slate-800 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Grado</label>
                        <div className="relative">
                          <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            disabled={!selectedLevel}
                            className="w-full appearance-none bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10 transition-all hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            <option value="">Todos los grados</option>
                            {gradeOptions.map(grade => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 rounded-[20px] border border-slate-100 dark:border-slate-800 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Sección</label>
                        <div className="relative">
                          <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            disabled={!selectedGrade}
                            className="w-full appearance-none bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10 transition-all hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            <option value="">Todas las secciones</option>
                            {sectionOptions.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>

                {/* Botón Aplicar Filtros */}
                <button 
                  onClick={() => {
                    setIsApplying(true);
                    setTimeout(() => setIsApplying(false), 1500);
                  }}
                  className={`w-full mt-auto py-3 font-bold rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isApplying ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]'}`}
                >
                  {isApplying ? (
                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Aplicando...</>
                  ) : 'Aplicar Filtros'}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden h-full border border-slate-200 dark:border-slate-800 bg-[#f4f6fa] dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-t-[28px] overflow-x-auto">
            {historyPath.length > 0 && (
              <button
                onClick={() => setHistoryPath(historyPath.slice(0, -1))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mr-2 border border-gray-200 dark:border-slate-700 shrink-0"
                title="Retroceder"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
            )}
            <button 
              onClick={() => setHistoryPath([])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shrink-0 ${historyPath.length === 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Home size={16} />
              Inicio
            </button>
            
            {historyPath.map((path, index) => (
              <React.Fragment key={path}>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
                <button 
                  onClick={() => setHistoryPath(historyPath.slice(0, index + 1))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shrink-0 whitespace-nowrap ${index === historyPath.length - 1 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  {path}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentFolderContent.type === 'folders' ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-2">
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5 flex gap-4 items-start">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Distribución de Reportes</h4>
                      <p className="text-sm font-medium text-blue-800/80 dark:text-blue-200/70 mb-2">
                        Ahora el sistema de reportes genera las cantidades exactas requeridas:
                      </p>
                      <ul className="text-sm text-blue-800/80 dark:text-blue-200/70 space-y-1 list-disc list-inside">
                        <li><strong>Diarios:</strong> 5 reportes (Lunes a Viernes).</li>
                        <li><strong>Semanales:</strong> 4 reportes (de las semanas del mes actual).</li>
                        <li><strong>Mensuales:</strong> 5 reportes (de los meses del año escolar).</li>
                        <li><strong>Bimestrales:</strong> 4 reportes.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-5 flex gap-4 items-start">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">Reportes Figurados pero Deshabilitados</h4>
                      <p className="text-sm text-amber-800/80 dark:text-amber-200/70 leading-relaxed font-medium">
                        Se implementó una lógica de "futuro" basado en el tiempo actual para los reportes por semana (y los demás tiempos también). Si estás en las semanas 1 o 2 del mes actual, los reportes correspondientes a la semana 3 y 4 saldrán figurados pero en un tono más atenuado/gris, con la etiqueta de <span className="font-bold px-1.5 py-0.5 rounded-md bg-amber-200/50 dark:bg-amber-800/50">Próximamente</span> y sin opciones disponibles para su descarga.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(currentFolderContent.items as string[]).map(folderName => {
                    const style = getFolderStyle(folderName);
                    return (
                      <button 
                        key={folderName}
                        onClick={() => setHistoryPath([...historyPath, folderName])}
                        className={`group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${style.borderClass}`}
                      >
                      {/* Background subtle glow on hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${style.bgClass}`}></div>
                      
                      <div className="relative w-28 h-28 mb-5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <img 
                          src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/file-folder.svg" 
                          alt="Folder" 
                          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 opacity-100 group-hover:opacity-0" 
                        />
                        <img 
                          src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-file-folder.svg" 
                          alt="Open Folder" 
                          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 opacity-0 group-hover:opacity-100" 
                        />
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <h4 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{folderName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{style.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Cabecera de la carpeta con selector de fecha */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Reportes {historyPath[0] === 'Diario' ? 'Diarios' : historyPath[0] === 'Semanal' ? 'Semanales' : historyPath[0] === 'Mensual' ? 'Mensuales' : 'Bimestrales'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {historyPath[0] === 'Diario' ? 'Selecciona una fecha para ver los reportes de ese día.' : historyPath[0] === 'Semanal' ? 'Selecciona una semana para ver los reportes.' : 'Visualiza los reportes generados.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {historyPath[0] === 'Diario' && (
                    <div className="shrink-0 w-full sm:w-auto">
                      <CustomCalendar 
                        mode="date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Seleccionar Fecha"
                        align="left"
                      />
                    </div>
                  )}
                  {historyPath[0] === 'Semanal' && (
                    <div className="shrink-0 w-full sm:w-auto">
                      <CustomCalendar 
                        mode="week"
                        value={selectedWeek}
                        onChange={setSelectedWeek}
                        placeholder="Seleccionar Semana"
                        align="left"
                      />
                    </div>
                  )}
                  {historyPath[0] === 'Mensual' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                      <div className="relative">
                        <select 
                          value={selectedMonth} 
                          onChange={(e) => setSelectedMonth(Number(e.target.value))}
                          className="w-full sm:w-auto min-w-[180px] h-[52px] appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-3 pr-10 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                        >
                          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                      <div className="relative w-28">
                        <input 
                          type="number" 
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full h-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-center transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  {historyPath[0] === 'Bimestral' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                      <div className="relative">
                        <select 
                          value={selectedBimestre} 
                          onChange={(e) => setSelectedBimestre(e.target.value)}
                          className="w-full sm:w-auto min-w-[180px] h-[52px] appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-3 pr-10 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                        >
                          <option value="1">I Bimestre</option>
                          <option value="2">II Bimestre</option>
                          <option value="3">III Bimestre</option>
                          <option value="4">IV Bimestre</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                      <div className="relative w-28">
                        <input 
                          type="number" 
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full h-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-center transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                <div className="flex flex-col gap-8 w-full">
                  {currentFolderContent.items.length > 0 ? (
                    <>
                      <div className="bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-5 sm:p-6 w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" alt="Excel" className="w-5 h-5 object-contain" /> Reportes de Asistencia
                        </h3>
                        <ScrollableReportList 
                          items={currentFolderContent.items} 
                          type="asistencia" 
                          historyPath={historyPath} 
                          onPreview={setPreviewReport} 
                        />
                      </div>

                      <div className="bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-2xl p-5 sm:p-6 w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" alt="Word" className="w-5 h-5 object-contain" /> Reporte de Incidencias
                        </h3>
                        <ScrollableReportList 
                          items={currentFolderContent.items} 
                          type="incidencias" 
                          historyPath={historyPath} 
                          onPreview={() => alert('Vista previa del anexo')} 
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1">
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <SearchX size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Carpeta vacía</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                          Aún no se han generado reportes para esta sección en el periodo actual.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
            </div>
            )}
          </div>
        </div>
        </div>
        </div>
      </div>

      {previewReport && (
        <ReportPreviewModal 
          report={previewReport} 
          onClose={() => setPreviewReport(null)} 
        />
      )}
    </motion.div>
  );
};