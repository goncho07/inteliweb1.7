import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Search, Filter, CalendarDays, Edit2, AlertTriangle, CheckCircle2, Check, ExternalLink, Inbox, XCircle, ChevronDown, Eye, X, BookOpen, Clock, Users, ArrowRight, Megaphone, AlertCircle, Info, Send, Printer, MessageCircle, PieChartIcon, ArrowLeft, MessageSquare, LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, containerVariants, KPICard } from '../components/UI';
import { ModuleProps } from '../types';
import { APP_CONFIG } from '../constants';
import { CustomCalendar } from '../src/components/CustomCalendar';

export const CitationsModule: React.FC<ModuleProps> = ({ globalDate }) => {
  const [focusedStatus, setFocusedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCitationId, setSelectedCitationId] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("Secundaria");
  const [selectedGrade, setSelectedGrade] = useState("Todos");
  const [selectedSection, setSelectedSection] = useState("Todos");

  // Helper for Folder Cards
  const getFolderStyle = (folderName: string) => {
    switch (folderName) {
      case 'Pendientes':
        return {
          imgSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Hourglass%20Not%20Done.png",
          colorClass: 'text-amber-600 dark:text-amber-400',
          bgClass: 'bg-amber-50 dark:bg-amber-900/20',
          borderClass: 'hover:border-amber-200 dark:hover:border-amber-800',
          subtitle: 'Citaciones sin confirmar'
        };
      case 'Confirmadas':
        return {
          imgSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png",
          colorClass: 'text-emerald-600 dark:text-emerald-400',
          bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderClass: 'hover:border-emerald-200 dark:hover:border-emerald-800',
          subtitle: 'Citaciones aprobadas'
        };
      case 'Canceladas':
        return {
          imgSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Cross%20Mark.png",
          colorClass: 'text-rose-600 dark:text-rose-400',
          bgClass: 'bg-rose-50 dark:bg-rose-900/20',
          borderClass: 'hover:border-rose-200 dark:hover:border-rose-800',
          subtitle: 'Citaciones rechazadas'
        };
      case 'Historial':
        return {
          imgSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Card%20Index%20Dividers.png",
          colorClass: 'text-blue-600 dark:text-blue-400',
          bgClass: 'bg-blue-50 dark:bg-blue-900/20',
          borderClass: 'hover:border-blue-200 dark:hover:border-blue-800',
          subtitle: 'Registro general'
        };
      default:
        return {
          imgSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/File%20Folder.png",
          colorClass: 'text-gray-600 dark:text-gray-400',
          bgClass: 'bg-gray-50 dark:bg-gray-800',
          borderClass: 'hover:border-gray-200 dark:hover:border-gray-700',
          subtitle: 'Carpeta'
        };
    }
  };

  const folderOptions = ["Pendientes", "Confirmadas", "Canceladas"];

  // Mock Data
  const initialCitations = [
    { id: 1, student: 'Valentina Sol', parent: 'Roberto Sol', relationship: 'Padre', grade: '1° A', reason: 'Bajo rendimiento en Matemáticas', description: 'La alumna presenta dificultades continuas con las ecuaciones de primer grado y no completa las tareas en casa.', category: 'Académico', date: '06/04/2026', time: '08:00 AM', status: 'Pendiente', teacher: 'Luis Gomez', subject: 'Matemática' },
    { id: 2, student: 'Mateo Rojas', parent: 'Elena Rojas', relationship: 'Madre', grade: '2° A', reason: 'Entrega de libreta', description: 'Reunión presencial para la entrega de notas del primer bimestre general.', category: 'Académico', date: '06/04/2026', time: '08:45 AM', status: 'Confirmada', teacher: 'María Suarez', subject: 'Tutoría' },
    { id: 3, student: 'Lucas Vega', parent: 'María Vega', relationship: 'Madre', grade: '3° B', reason: 'Problemas de conducta continuos', description: 'Mucha distracción en clase y actitud desafiante al recibir indicaciones.', category: 'Incidencias', date: '07/04/2026', time: '08:00 AM', status: 'Pendiente', teacher: 'Carlos Mendoza', subject: 'DPCC' },
    { id: 4, student: 'Camila Paz', parent: 'Andrés Paz', relationship: 'Padre', grade: '4° B', reason: 'Mejora reportada en su desempeño', description: 'Citación para felicitar el progreso de la estudiante y establecer metas para el próximo trimestre.', category: 'Académico', date: '08/04/2026', time: '09:30 AM', status: 'Pendiente', teacher: 'Ana Lopez', subject: 'Comunicación' },
    { id: 5, student: 'Luciana Delgado', parent: 'Ana Ramos', relationship: 'Madre', grade: '3° A', reason: 'Faltas injustificadas', description: 'Se necesita justificación de las inasistencias de la última semana de marzo.', category: 'Otros', date: '09/04/2026', time: '11:15 AM', status: 'Cancelada', teacher: 'Carla Ruiz', subject: 'Tutoría' },
    { id: 6, student: 'Nicolas Salas', parent: 'Victor Salas', relationship: 'Padre', grade: '4° B', reason: 'Matrícula condicional', description: 'Explicación de las condiciones de matrícula para el presente año escolar.', category: 'Gestión', date: '10/04/2026', time: '09:30 AM', status: 'Confirmada', teacher: 'Roberto Carlos', subject: 'Dirección' },
    { id: 7, student: 'Valeria Quispe', parent: 'Jorge Quispe', relationship: 'Padre', grade: '3° C', reason: 'Problemas de Integración', description: 'Dificultad para trabajar en equipo y aislamiento en los recesos.', category: 'Otros', date: '10/04/2026', time: '12:00 PM', status: 'Completada', teacher: 'Miguel Santos', subject: 'Psicología' },
    { id: 8, student: 'Valery Mamani', parent: 'Martha Campos', relationship: 'Madre', grade: '3° A', reason: 'Acumulación de incidencias', description: 'Varias incidencias reportadas en el sistema que requieren atención inmediata.', category: 'Incidencias', date: '06/04/2026', time: '11:15 AM', status: 'Pendiente', incidents: [{ type: "Evasión de clase de matemáticas (Reincidencia)", date: "04/04/2026" }, { type: "Uso de celular en horario no permitido", date: "01/04/2026" }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
    { id: 9, student: 'Juan Pérez', parent: 'Ana L.', relationship: 'Madre', grade: '3° C', reason: 'Agresión en aula', description: 'Altercado físico durante la clase de educación física. Se requiere asisntencia obligatoria.', category: 'Incidencias', date: '07/04/2026', time: '08:45 AM', status: 'Confirmada', incidents: [{ type: "Golpe a compañero durante clase", date: "07/04/2026" }], teacher: 'José Pinto', subject: 'Educación Física' },
    { id: 10, student: 'Luis Silva', parent: 'Alberto Silva', relationship: 'Padre', grade: '4° A', reason: 'Apoyo en Lenguaje', description: 'Bajo rendimiento en comprensión lectora. Coordinación para reforzamiento.', category: 'Académico', date: '08/04/2026', time: '10:15 AM', status: 'Completada', teacher: 'Ana Lopez', subject: 'Comunicación' },
    { id: 11, student: 'Sofia Luna', parent: 'Andres Luna', relationship: 'Padre', grade: '5° D', reason: 'Bullying a compañero', description: 'Ciberbullying reportado con pruebas, aplicación del reglamento interno.', category: 'Incidencias', date: '09/04/2026', time: '11:15 AM', status: 'Confirmada', incidents: [{ type: "Ciberbullying reportado por tutores", date: "10/03/2026" }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
    { id: 12, student: 'Diego Castro', parent: 'Juan Castro', relationship: 'Padre', grade: '5° C', reason: 'Reunión de coordinación', description: 'Revisión de actividades extracurriculares del alumno.', category: 'Otros', date: '10/04/2026', time: '13:15 PM', status: 'Pendiente', teacher: 'Roberto Carlos', subject: 'Dirección' },
    { id: 13, student: 'Ximena Torres', parent: 'Diana Torres', relationship: 'Madre', grade: '1° B', reason: 'Falta de respeto', description: 'Incidente de indisciplina en el que se faltó el respeto al docente dictando clases.', category: 'Incidencias', date: '06/04/2026', time: '16:00 PM', status: 'Cancelada', incidents: [{ type: "Falta de respeto a autoridad", date: "22/03/2026" }], teacher: 'Luis Gomez', subject: 'Matemática' },
    { id: 14, student: 'Fernando Arce', parent: 'Gloria Arce', relationship: 'Madre', grade: '2° D', reason: 'Falsificación de firma', description: 'El alumno intentó asentar una calificación baja con firma falsa.', category: 'Incidencias', date: '08/04/2026', time: '13:15 PM', status: 'Pendiente', incidents: [{ type: "Firma falsificada en examen", date: "20/04/2026" }], teacher: 'Ana Lopez', subject: 'Comunicación' },
    { id: 15, student: 'Sebastián Reyes', parent: 'Mónica Reyes', relationship: 'Madre', grade: '3° C', reason: 'Reforzamiento de inglés', description: 'Se agendó tutoría individual para lograr las competencias del área de inglés.', category: 'Académico', date: '10/04/2026', time: '15:30 PM', status: 'Completada', teacher: 'Diana Smith', subject: 'Inglés' },
    { id: 16, student: 'Ariana Vega', parent: 'Esteban Vega', relationship: 'Padre', grade: '3° A', reason: 'Uso de celular', description: 'Por tercera vez se le retuvo el celular en horas de clase de DPCC.', category: 'Incidencias', date: '07/04/2026', time: '09:30 AM', status: 'Reprogramada', incidents: [{ type: "Uso de celular (Reincidencia 3)", date: "27/04/2026" }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
  ];

  const [citationsList, setCitationsList] = useState(initialCitations);

  useEffect(() => {
    // If selected citation is no longer in the filtered list, deselect
    if (selectedCitationId !== null && !filteredCitations.find(c => c.id === selectedCitationId)) {
      setSelectedCitationId(null);
    }
  }, [citationsList]);

  const filteredCitations = citationsList.filter(c => {
    // No status filtering as requested
    
    // Grade and Section filtering
    if (selectedGrade !== "Todos" || selectedSection !== "Todos") {
        const gradeMatch = c.grade.match(/(\d+°)\s+([A-Z])/);
        if (gradeMatch) {
            const [, g, s] = gradeMatch;
            if (selectedGrade !== "Todos" && g !== selectedGrade) return false;
            if (selectedSection !== "Todos" && s !== selectedSection) return false;
        } else {
            return false; // if it doesn't match the format and we selected a specific filter
        }
    }

    return true;
  });

  const availableGrades = useMemo(() => {
     return Array.from(new Set(citationsList.map(c => c.grade))).sort();
  }, [citationsList]);

  const [viewCitationModal, setViewCitationModal] = useState<{isOpen: boolean; citation: any | null}>({isOpen: false, citation: null});

  // Reschedule & Realizado Modals State
  const [rescheduleModal, setRescheduleModal] = useState<{isOpen: boolean; citation: any | null}>({isOpen: false, citation: null});
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [reschedReason, setReschedReason] = useState("");
  const [reschedDateError, setReschedDateError] = useState("");

  const [realizadoModal, setRealizadoModal] = useState<{isOpen: boolean; citationId: number | null}>({isOpen: false, citationId: null});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Definimos el inicio de la primera semana de abril como ejemplo
    const d = new Date(2026, 3, 6); // 6 de Abril de 2026 es lunes
    return d;
  });

  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 4); // Friday

  const parseDateAndTimeToDateObj = (dateStr: string, timeStr: string) => {
    // dateStr: "18/03/2026"
    // timeStr: "10:00 AM"
    const [d, m, y] = dateStr.split('/');
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), hours, minutes);
  };

  const citationsForWeek = useMemo(() => {
    return filteredCitations.filter(c => {
        const cDateObj = parseDateAndTimeToDateObj(c.date, c.time);
        const start = new Date(currentWeekStart);
        start.setHours(0,0,0,0);
        const end = new Date(endOfWeek);
        end.setHours(23,59,59,999);
        return cDateObj >= start && cDateObj <= end;
    });
  }, [filteredCitations, currentWeekStart]);

  const totalItems = filteredCitations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCitations = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredCitations.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCitations, currentPage, itemsPerPage]);

  const updateCitationStatus = (id: number, newStatus: string) => {
      setCitationsList(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleRescheduleDateChange = (value: string) => {
    setReschedDate(value);
    const selectedDate = new Date(value);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Saturday or Sunday in 0-indexed JS date, actually Sat=6, Sun=0. Wait, JS getDay() 0=Sun, 6=Sat
      setReschedDateError("No se pueden agendar citaciones los fines de semana.");
    } else {
      setReschedDateError("");
    }
  };

  const handleReschedule = () => {
    if (rescheduleModal.citation) {
      setCitationsList(prev => prev.map(c => 
        c.id === rescheduleModal.citation.id 
          ? { ...c, status: "Reprogramada", date: reschedDate, time: reschedTime, reason: reschedReason || c.reason }
          : c
      ));
      setRescheduleModal({isOpen: false, citation: null});
    }
  };

  // === Calendario Semanal Logic ===
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const TIME_SLOTS = [
    { start: "8:00", end: "8:45" },
    { start: "8:45", end: "9:30" },
    { start: "9:30", end: "10:15" },
    { start: "10:15", end: "11:00" },
    { start: "11:00", end: "11:15", isRecreo: true, label: "recreo" },
    { start: "11:15", end: "12:00" },
    { start: "12:00", end: "12:45" },
    { start: "12:45", end: "13:15", isRecreo: true, label: "recreo" },
    { start: "13:15", end: "14:00" },
    { start: "14:00", end: "14:45" },
    { start: "14:45", end: "15:30" },
  ];

  const getDayIndex = (date: Date) => {
    // 0 is Sunday. We want Monday=0, Friday=4
    const day = date.getDay();
    if (day === 0 || day === 6) return -1; // weekend
    return day - 1;
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };
  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const formatWeekRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 4);
    const startStr = currentWeekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const renderCalendarCell = (dayIndex: number, slot: typeof TIME_SLOTS[0]) => {
    // Find citations in filteredCitations that match this day and hour in the currently viewed week
    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    
    const [slotH, slotM] = slot.start.split(':').map(Number);
    const slotStartMins24 = slotH * 60 + slotM;
    const [endH, endM] = slot.end.split(':').map(Number);
    const slotEndMins24 = endH * 60 + endM;

    // Convert current targetDate to match format "dd/mm/yyyy" for easy string comparison or parse citations
    const citationsInSlot = filteredCitations.filter(c => {
       const cDateObj = parseDateAndTimeToDateObj(c.date, c.time);
       // Check if date matches targetDate (ignoring time)
       if (cDateObj.getFullYear() === targetDate.getFullYear() &&
           cDateObj.getMonth() === targetDate.getMonth() &&
           cDateObj.getDate() === targetDate.getDate()) {
             const cTimeMins = cDateObj.getHours() * 60 + cDateObj.getMinutes();
             return cTimeMins >= slotStartMins24 && cTimeMins < slotEndMins24;
       }
       return false;
    });

    let cellBg = 'bg-white dark:bg-slate-900';
    let isClickable = false;
    let clickHandler = undefined;
    let title = undefined;

    if (citationsInSlot.length > 0) {
        const c = citationsInSlot[0];
        const styleMap = {
            'Pendiente': 'bg-amber-50 dark:bg-amber-900/30 border-l-[3px] border-l-amber-500 text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer active:scale-[0.98] transition-transform',
            'Confirmada': 'bg-emerald-50 dark:bg-emerald-900/30 border-l-[3px] border-l-emerald-500 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer active:scale-[0.98] transition-transform',
            'Reprogramada': 'bg-blue-50 dark:bg-blue-900/30 border-l-[3px] border-l-blue-500 text-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer active:scale-[0.98] transition-transform',
            'Completada': 'bg-purple-50 dark:bg-purple-900/30 border-l-[3px] border-l-purple-500 text-purple-800 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 cursor-pointer active:scale-[0.98] transition-transform',
            'Cancelada': 'bg-rose-50 dark:bg-rose-900/30 border-l-[3px] border-l-rose-500 text-rose-600 dark:text-rose-400 line-through opacity-80 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-[0.98] transition-transform'
        };
        cellBg = styleMap[c.status] || 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer';
        isClickable = true;
        clickHandler = () => setViewCitationModal({isOpen: true, citation: c});
        title = `${c.student} - ${c.reason} (${c.time})`;
    }

    return (
      <div 
         key={`${dayIndex}-${slot.start}`} 
         className={`p-1 border-r border-b border-gray-100 dark:border-slate-800/50 ${cellBg} relative z-10 flex flex-col items-center justify-center h-full min-h-[85px] overflow-hidden`}
         onClick={clickHandler}
         title={title}
      >
         {citationsInSlot.map((c, i) => i === 0 && ( /* Solamente mostramos 1 citación por celda si rellenamos todo el fondo de ella */
            <React.Fragment key={c.id}>
                 <span className="text-[10px] font-black tracking-wider leading-tight text-center uppercase opacity-90 truncate max-w-full">
                   {c.status === 'Cancelada' ? 'CANCELADO' : c.status.toUpperCase()}
                 </span>
                 <span className="text-[12px] font-extrabold leading-tight w-full mt-1 break-words text-center px-1 max-w-[120px] line-clamp-2">
                   {c.student}
                 </span>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 px-1 truncate w-full text-center">
                   {c.teacher} ({c.subject})
                 </span>
                 <span className="text-[10px] font-semibold leading-tight opacity-90 mt-0.5 text-center">
                   {c.grade}
                 </span>
            </React.Fragment>
         ))}
      </div>
    );
  };

  const selectedCitationInfo = citationsList.find(c => c.id === selectedCitationId);

  return (
    <>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="h-full flex flex-col font-poppins relative"
    >
      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-950">
        <PageHeader 
          title="Citaciones"
          icon={MessageSquare}
        />
        
        <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4 gap-6 max-w-[1700px] mx-auto w-full min-h-0 overflow-hidden h-full">
           <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 flex flex-col h-[600px] lg:h-full bg-slate-50/80 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 shadow-inner relative overflow-hidden z-10 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4">
                  <div className="flex items-center justify-between px-1">
              <h2 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-wider uppercase">
                <Filter className="w-5 h-5 text-blue-600" /> FILTROS
              </h2>
          </div>
      </div>
      
      <div className="flex flex-col gap-3 mb-6 relative z-20">
         <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Nivel</label>
             <select
                value={selectedLevel}
                onChange={(e) => {
                   setSelectedLevel(e.target.value);
                   setSelectedGrade("Todos");
                   setSelectedSection("Todos");
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-[12px] px-3 py-2 font-bold text-[13px] hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
             >
                <option value="Secundaria">Secundaria</option>
                <option value="Primaria">Primaria</option>
             </select>
         </div>
         <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Grado</label>
             <select
                value={selectedGrade}
                onChange={(e) => {
                   setSelectedGrade(e.target.value);
                   setSelectedSection("Todos");
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-[12px] px-3 py-2 font-bold text-[13px] hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
             >
                <option value="Todos">Todos los grados</option>
                <option value="1°">1°</option>
                <option value="2°">2°</option>
                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
             </select>
         </div>
         <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Sección</label>
             <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-[12px] px-3 py-2 font-bold text-[13px] hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
             >
                <option value="Todos">Todas las secciones</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
             </select>
         </div>
      </div>

      <div className="flex items-center justify-between px-1 mb-4">
          <h2 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-wider uppercase">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> INDICADORES DE ESTADO
          </h2>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar pr-1 pb-4">
                  {[
                      {id: 'Pendiente', label: 'Pendientes', color: 'text-amber-600 dark:text-amber-400', bgColorItem: "bg-white dark:bg-slate-800", borderColorItem: "border-slate-100 dark:border-slate-700/50", bgIcon: 'bg-white/50 dark:bg-slate-900/50', borderHover: 'hover:border-amber-400', img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Warning.png'},
                      {id: 'Confirmada', label: 'Confirmadas', color: 'text-emerald-600 dark:text-emerald-400', bgColorItem: "bg-white dark:bg-slate-800", borderColorItem: "border-slate-100 dark:border-slate-700/50", bgIcon: 'bg-white/50 dark:bg-slate-900/50', borderHover: 'hover:border-emerald-400', img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png'},
                      {id: 'Reprogramada', label: 'Reprogramadas', color: 'text-blue-600 dark:text-blue-400', bgColorItem: "bg-white dark:bg-slate-800", borderColorItem: "border-slate-100 dark:border-slate-700/50", bgIcon: 'bg-white/50 dark:bg-slate-900/50', borderHover: 'hover:border-blue-400', img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Spiral%20Calendar.png'},
                      {id: 'Completada', label: 'Completadas', color: 'text-purple-600 dark:text-purple-400', bgColorItem: "bg-white dark:bg-slate-800", borderColorItem: "border-slate-100 dark:border-slate-700/50", bgIcon: 'bg-white/50 dark:bg-slate-900/50', borderHover: 'hover:border-purple-400', img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Party%20Popper.png'},
                      {id: 'Cancelada', label: 'Canceladas', color: 'text-rose-600 dark:text-rose-400', bgColorItem: "bg-white dark:bg-slate-800", borderColorItem: "border-slate-100 dark:border-slate-700/50", bgIcon: 'bg-white/50 dark:bg-slate-900/50', borderHover: 'hover:border-rose-400', img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Cross%20Mark.png'}
                  ].map(f => {
                      const isActive = focusedStatus === f.id;
                      const isFaded = focusedStatus !== null && !isActive;
                      return (
                          <button 
                              key={f.id}
                              onClick={() => {
                                  if(isActive) setFocusedStatus(null);
                                  else setFocusedStatus(f.id);
                              }}
                              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left shadow-sm group ${
                                  isActive 
                                    ? `shadow-md bg-white dark:bg-slate-800 border-${f.color.split('-')[1]}-400 ring-2 ring-${f.color.split('-')[1]}-500/20 transform scale-[1.02]` 
                                    : isFaded
                                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-60 grayscale'
                                      : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                              }`}
                          >
                              <div className={`w-16 h-16 shrink-0 transition-transform flex items-center justify-center rounded-[16px] ${f.bgIcon} ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                  <img src={f.img} alt={f.label} className={`w-[40px] h-[40px] drop-shadow-sm transition-all ${isFaded ? 'opacity-50 grayscale' : 'opacity-100'}`} />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0 justify-center">
                                  <h4 className={`font-extrabold text-[18px] mb-1 leading-tight transition-colors ${
                                      isFaded ? 'text-slate-400 dark:text-slate-500' : 'text-[#1A2642] dark:text-slate-100'
                                  }`}>{f.label}</h4>
                                  <p className={`text-[14px] font-bold transition-colors ${
                                      isFaded ? 'text-slate-400 dark:text-slate-500' : f.color
                                  }`}>
                                    {citationsList.filter(c => c.status === f.id).length} Citaciones
                                  </p>
                              </div>
                          </button>
                      )
                  })}
              </div>
           </div>

            {/* Principal area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-[650px] lg:h-auto border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 rounded-[2rem] overflow-hidden p-4 sm:p-5 lg:p-6 shadow-inner">
            <div className="flex flex-col h-full min-h-0">
               <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 gap-4 mb-4">
                  <div className="flex items-center gap-4 mx-auto xl:mx-0">
                     <button onClick={prevWeek} className="p-2 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors border-2 border-slate-100 dark:border-slate-700 shadow-sm"><ChevronLeft className="w-5 h-5"/></button>
                     <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[16px] uppercase tracking-wide">{formatWeekRange()}</span>
                     <button onClick={nextWeek} className="p-2 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors border-2 border-slate-100 dark:border-slate-700 shadow-sm"><ChevronRight className="w-5 h-5"/></button>
                  </div>
               </div>

             <div className="flex flex-col flex-1 min-h-0 w-full relative">
                  <div className="flex flex-1 min-h-0 overflow-x-auto overflow-y-auto custom-scrollbar pb-1 rounded-[20px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm p-2 overflow-hidden">
                    <div 
                       className="grid grid-cols-[70px_repeat(5,minmax(180px,1fr))] lg:grid-cols-[70px_repeat(5,1fr)] bg-white dark:bg-slate-900 rounded-[14px] min-w-[900px] overflow-hidden lg:min-w-0 w-full h-full border border-gray-100 dark:border-slate-800/50"
                       style={{ gridTemplateRows: `max-content ${TIME_SLOTS.map(t => t.isRecreo ? 'max-content' : 'minmax(40px, 1fr)').join(' ')}` }}
                    >
                       {/* Header Row */}
                       <div className="bg-white dark:bg-slate-900 border-r border-b border-gray-100 dark:border-slate-800/50 p-1 lg:p-2 sticky top-0 z-30"></div>
                       {daysOfWeek.map((day, i) => (
                           <div key={day} className="bg-white dark:bg-slate-900 border-r border-b border-gray-100 dark:border-slate-800/50 py-1 lg:py-2 px-1 text-center sticky top-0 z-30 flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap overflow-hidden">
                               <span className="font-extrabold text-[11px] lg:text-[13px] text-slate-800 dark:text-gray-100">{day.substring(0, 3)}.</span>
                               <span className="text-[10px] lg:text-[12px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
                                    {(() => {
                                         const d = new Date(currentWeekStart);
                                         d.setDate(d.getDate() + i);
                                         const dayStr = d.getDate().toString().padStart(2, '0');
                                         const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
                                         return `${dayStr}/${monthStr}`;
                                    })()}
                               </span>
                           </div>
                       ))}
                       {/* Grid cells */}
                       {TIME_SLOTS.map((slot, sIndex) => (
                           <React.Fragment key={sIndex}>
                               {slot.isRecreo ? (
                               <>
                                     <div className="border-r border-b border-gray-300 dark:border-slate-600 bg-gray-200 dark:bg-slate-700 relative z-20 flex items-center justify-center py-2 opacity-95">
                                        <span className="text-[10px] text-gray-600 dark:text-gray-300 font-black uppercase tracking-widest">{slot.start} - {slot.end}</span>
                                     </div>
                                     <div className="col-span-5 border-b border-gray-300 dark:border-slate-600 bg-gray-200/90 dark:bg-slate-700/80 flex items-center justify-center py-2 shadow-inner" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)' }}>
                                         <span className="font-extrabold text-[12px] lg:text-[14px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">{slot.label}</span>
                                     </div>
                                  </>
                               ) : (
                                  <>
                                     <div className="border-r border-b border-gray-100 dark:border-slate-800/50 flex flex-col justify-center items-center py-2 bg-white dark:bg-slate-900 relative z-20 min-h-[85px]">
                                         <span className="text-[12px] lg:text-[13px] font-extrabold text-teal-700 dark:text-teal-500">{slot.start}</span>
                                         <span className="text-[11px] lg:text-[12px] font-bold text-teal-600/70 dark:text-teal-500/70">{slot.end}</span>
                                     </div>
                                     {daysOfWeek.map((_, dayIndex) => renderCalendarCell(dayIndex, slot))}
                                  </>
                               )}
                           </React.Fragment>
                       ))}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

      {/* View Citation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {viewCitationModal.isOpen && viewCitationModal.citation && (
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewCitationModal({isOpen: false, citation: null})}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl w-full max-w-[480px] overflow-hidden border-2 ${
                  {
                     'Pendiente': 'border-orange-500',
                     'Confirmada': 'border-emerald-500',
                     'Reprogramada': 'border-blue-500',
                     'Cancelada': 'border-rose-400'
                  }[viewCitationModal.citation.status as string] || 'border-slate-200 dark:border-slate-800'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 sm:p-10 flex flex-col gap-8 relative">
                <button 
                  onClick={() => setViewCitationModal({isOpen: false, citation: null})}
                  className="absolute top-6 right-6 w-10 h-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex gap-4 items-center pr-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-3xl bg-blue-600 shadow-sm shrink-0">
                    {viewCitationModal.citation.student.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight truncate w-full">{viewCitationModal.citation.student}</h2>
                    <p className="text-slate-500 font-bold text-[15px] mt-0.5">{viewCitationModal.citation.grade}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-5 bg-white dark:bg-slate-900 pt-2">
                   <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[100px_1fr] gap-y-6 gap-x-4 items-center">
                       <span className="text-slate-500 font-extrabold text-[15px]">Motivo:</span>
                       <div className="flex flex-col gap-1">
                         <span className="text-[14.5px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3.5 py-1.5 rounded-xl w-max shadow-sm border border-blue-100/50 dark:border-blue-800/30 max-w-full truncate">
                            {viewCitationModal.citation.reason}
                         </span>
                       </div>

                       <span className="text-slate-500 font-extrabold text-[15px]">Descripción:</span>
                       <div className="text-[14px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                          {viewCitationModal.citation.description || 'Sin descripción adicional reportada por el docente.'}
                       </div>

                       <span className="text-slate-500 font-extrabold text-[15px]">Fecha:</span>
                       <span className="text-[15px] font-black text-slate-800 dark:text-slate-200">
                          {viewCitationModal.citation.date} a las {viewCitationModal.citation.time.replace(' AM', ':00').replace(' PM', ':00')}
                       </span>

                       <span className="text-slate-500 font-extrabold text-[15px]">Hora:</span>
                       <span className="text-[15px] font-black text-slate-800 dark:text-slate-200">
                          {viewCitationModal.citation.time}
                       </span>

                       <span className="text-slate-500 font-extrabold text-[15px]">Docente:</span>
                       <span className="text-[15px] font-black text-slate-800 dark:text-slate-200">
                          {viewCitationModal.citation.teacher} - {viewCitationModal.citation.subject}
                       </span>
                   </div>
                </div>

                {viewCitationModal.citation.category === 'Incidencias' && viewCitationModal.citation.incidents && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-200 mb-4 sticky top-0">Incidencias Vinculadas ({viewCitationModal.citation.incidents.length})</h3>
                    <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {viewCitationModal.citation.incidents.map((inc: any, i: number) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                           <span className="font-bold text-[14px] text-slate-800 dark:text-slate-200">{inc.type}</span>
                           <span className="text-[13px] font-bold text-slate-500">{inc.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 flex-wrap">
                    {viewCitationModal.citation.status === 'Pendiente' && (
                        <>
                            <button 
                                onClick={() => {
                                    setReschedDate(""); setReschedTime(""); setReschedReason("");
                                    setRescheduleModal({isOpen: true, citation: viewCitationModal.citation});
                                    setViewCitationModal({isOpen: false, citation: null});
                                }}
                                className="px-6 py-3.5 text-[15px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors border-2 border-indigo-100 dark:border-indigo-500/20"
                            >
                                Reprogramar
                            </button>
                            <button 
                                onClick={() => {
                                    updateCitationStatus(viewCitationModal.citation.id, 'Confirmada');
                                    setViewCitationModal({isOpen: false, citation: null});
                                }}
                                className="px-6 py-3.5 text-[15px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-2xl transition-colors border-2 border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} className="text-emerald-500" />
                                Aprobar Cita
                            </button>
                        </>
                    )}
                    {viewCitationModal.citation.status === 'Confirmada' && (
                        <>
                            <button 
                                onClick={() => {
                                    setRealizadoModal({isOpen: true, citationId: viewCitationModal.citation.id});
                                    setViewCitationModal({isOpen: false, citation: null});
                                }}
                                className="px-6 py-3.5 text-[15px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center w-full gap-2"
                            >
                                <BookOpen size={16} className="text-slate-500" />
                                Completar
                            </button>
                        </>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Reschedule Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {rescheduleModal.isOpen && rescheduleModal.citation && (
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden w-full max-w-[480px] h-auto max-h-[95vh] flex flex-col relative my-auto border border-slate-200 dark:border-slate-800 transition-all duration-300"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" /> Reagendar Citación
                  </h3>
                  <button onClick={() => setRescheduleModal({ isOpen: false, citation: null })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Nueva Fecha <span className="text-rose-500">*</span>
                    </label>
                    <input 
                        type="date"
                        min="2026-04-16"
                        value={reschedDate}
                        onChange={(e) => handleRescheduleDateChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                    {reschedDateError && <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {reschedDateError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Nueva Hora <span className="text-rose-500">*</span>
                    </label>
                    <input 
                        type="time" 
                        value={reschedTime}
                        onChange={(e) => setReschedTime(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Motivo de reprogramación (Opcional)
                    </label>
                    <textarea 
                        value={reschedReason}
                        onChange={(e) => setReschedReason(e.target.value)}
                        placeholder="Ej: El apoderado no puede asistir por motivos de trabajo..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none h-24"
                    />
                  </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                  <button 
                    onClick={() => setRescheduleModal({ isOpen: false, citation: null })}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReschedule}
                    disabled={!reschedDate || !reschedTime || !!reschedDateError}
                    className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Reprogramación
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Realizado Confirmation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {realizadoModal.isOpen && (
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden w-full max-w-[480px] h-auto max-h-[95vh] flex flex-col relative my-auto border border-slate-200 dark:border-slate-800 transition-all duration-300"
            >
              <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">¿Marcar como realizada?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                Confirmas que esta citación ha sido completada satisfactoriamente con el apoderado.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRealizadoModal({isOpen: false, citationId: null})}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    const updatedCitations = citationsList.map(c => 
                      c.id === realizadoModal.citationId ? { ...c, status: 'Completada' as any } : c 
                    );
                    setCitationsList(updatedCitations);
                    setRealizadoModal({isOpen: false, citationId: null});
                  }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  Confirmar
                </button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
