import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CalendarDays, CheckCircle2, X, BookOpen, Clock, Users, AlertCircle, Printer, MessageSquare, MoreVertical } from 'lucide-react';


import { containerVariants } from '@/lib/motion';
import { ModuleProps } from '@/types';
import { APP_CONFIG } from '@/config/app';
import { getStudentAvatarUrl } from '@/lib/avatar';


const STUDENT_PHOTOS: Record<string, string> = {
  'Mateo Rojas': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'Valentina Sol': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'Lucas Vega': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'Camila Paz': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'Juan Pérez': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'Luciana Delgado': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Nicolas Salas': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'Valeria Quispe': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
};

const getAvatarForStudent = (studentName: string, id?: number) => {
  if (STUDENT_PHOTOS[studentName]) {
    return STUDENT_PHOTOS[studentName];
  }
  return getStudentAvatarUrl({ name: studentName, id });
};

export const CitationsModule: React.FC<ModuleProps> = ({ globalDate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCitationId, setSelectedCitationId] = useState<number | null>(null);
  
  // Filters state
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('Todas');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedGrade, setSelectedGrade] = useState<string>('Todos');
  const [selectedSection, setSelectedSection] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [rescheduleModal, setRescheduleModal] = useState<{isOpen: boolean; citation: any | null}>({isOpen: false, citation: null});
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [reschedReason, setReschedReason] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock Data
  const initialCitations = [
    { id: 1, student: 'Valentina Sol', parent: 'Roberto Sol', relationship: 'Padre', grade: '1° A', level: 'Secundaria', reason: 'Bajo rendimiento en Matemáticas', description: 'La alumna presenta dificultades continuas con las ecuaciones de primer grado y no completa las tareas en casa.', category: 'Académico', date: '06/04/2026', time: '08:00 AM', status: 'Pendiente', teacher: 'Luis Gomez', subject: 'Matemática' },
    { id: 2, student: 'Mateo Rojas', parent: 'Elena Rojas', relationship: 'Madre', grade: '2° A', level: 'Secundaria', reason: 'Entrega de libreta', description: 'Reunión presencial para la entrega de notas del primer bimestre general.', category: 'Académico', date: '06/04/2026', time: '08:45 AM', status: 'Confirmada', teacher: 'María Suarez', subject: 'Tutoría' },
    { id: 3, student: 'Lucas Vega', parent: 'María Vega', relationship: 'Madre', grade: '3° B', level: 'Secundaria', reason: 'Problemas de conducta continuos', description: 'Mucha distracción en clase y actitud desafiante al recibir indicaciones.', category: 'Incidencias', date: '07/04/2026', time: '08:00 AM', status: 'Pendiente', teacher: 'Carlos Mendoza', subject: 'DPCC' },
    { id: 4, student: 'Camila Paz', parent: 'Andrés Paz', relationship: 'Padre', grade: '4° B', level: 'Secundaria', reason: 'Mejora reportada en su desempeño', description: 'Citación para felicitar el progreso de la estudiante y establecer metas para el próximo trimestre.', category: 'Académico', date: '08/04/2026', time: '09:30 AM', status: 'Pendiente', teacher: 'Ana Lopez', subject: 'Comunicación' },
    { id: 5, student: 'Luciana Delgado', parent: 'Ana Ramos', relationship: 'Madre', grade: '3° A', level: 'Primaria', reason: 'Faltas injustificadas', description: 'Se necesita justificación de las inasistencias de la última semana de marzo.', category: 'Otros', date: '09/04/2026', time: '11:15 AM', status: 'Cancelada', teacher: 'Carla Ruiz', subject: 'Tutoría' },
    { id: 6, student: 'Nicolas Salas', parent: 'Victor Salas', relationship: 'Padre', grade: '4° B', level: 'Secundaria', reason: 'Matrícula condicional', description: 'Explicación de las condiciones de matrícula para el presente año escolar.', category: 'Gestión', date: '10/04/2026', time: '09:30 AM', status: 'Confirmada', teacher: 'Roberto Carlos', subject: 'Dirección' },
    { id: 7, student: 'Valeria Quispe', parent: 'Jorge Quispe', relationship: 'Padre', grade: '3° C', level: 'Primaria', reason: 'Problemas de Integración', description: 'Dificultad para trabajar en equipo y aislamiento en los recesos.', category: 'Otros', date: '10/04/2026', time: '12:00 PM', status: 'Completada', teacher: 'Miguel Santos', subject: 'Psicología' },
    { id: 8, student: 'Valery Mamani', parent: 'Martha Campos', relationship: 'Madre', grade: '3° A', level: 'Secundaria', reason: 'Acumulación de incidencias', description: 'Varias incidencias reportadas en el sistema que requieren atención inmediata.', category: 'Incidencias', date: '06/04/2026', time: '11:15 AM', status: 'Pendiente', incidents: [{ type: "Evasión de clase de matemáticas (Reincidencia)", date: "04/04/2026" }, { type: "Uso de celular en horario no permitido", date: "01/04/2026" }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
    { id: 9, student: 'Juan Pérez', parent: 'Ana L.', relationship: 'Madre', grade: '3° C', level: 'Primaria', reason: 'Agresión en aula', description: 'Altercado físico durante la clase de educación física. Se requiere asisntencia obligatoria.', category: 'Incidencias', date: '07/04/2026', time: '08:45 AM', status: 'Confirmada', incidents: [{ type: "Golpe a compañero durante clase", date: "07/04/2026" }], teacher: 'José Pinto', subject: 'Educación Física' },
    { id: 10, student: 'Luis Silva', parent: 'Alberto Silva', relationship: 'Padre', grade: '4° A', level: 'Secundaria', reason: 'Apoyo en Lenguaje', description: 'Bajo rendimiento en comprensión lectora. Coordinación para reforzamiento.', category: 'Académico', date: '08/04/2026', time: '10:15 AM', status: 'Completada', teacher: 'Ana Lopez', subject: 'Comunicación' },
    { id: 11, student: 'Sofia Luna', parent: 'Andres Luna', relationship: 'Padre', grade: '5° D', level: 'Secundaria', reason: 'Bullying a compañero', description: 'Ciberbullying reportado con pruebas, aplicación del reglamento interno.', category: 'Incidencias', date: '09/04/2026', time: '11:15 AM', status: 'Confirmada', incidents: [{ type: "Ciberbullying reportado por tutores", date: "10/03/2026" }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
    { id: 12, student: 'Diego Castro', parent: 'Juan Castro', relationship: 'Padre', grade: '5° C', level: 'Secundaria', reason: 'Reunión de coordinación', description: 'Revisión de actividades extracurriculares del alumno.', category: 'Otros', date: '10/04/2026', time: '13:15 PM', status: 'Pendiente', teacher: 'Roberto Carlos', subject: 'Dirección' },
    { id: 13, student: 'Ximena Torres', parent: 'Diana Torres', relationship: 'Madre', grade: '1° B', level: 'Secundaria', reason: 'Falta de respeto', description: 'Incidente de indisciplina en el que se faltó el respeto al docente dictando clases.', category: 'Incidencias', date: '06/04/2026', time: '16:00 PM', status: 'Cancelada', incidents: [{ type: "Falta de respeto a autoridad", date: "22/03/2026" }], teacher: 'Luis Gomez', subject: 'Matemática' },
    { id: 14, student: 'Fernando Arce', parent: 'Gloria Arce', relationship: 'Madre', grade: '2° D', level: 'Secundaria', reason: 'Falsificación de firma', description: 'El alumno intentó asentar una calificación baja con firma falsa.', category: 'Incidencias', date: '08/04/2026', time: '13:15 PM', status: 'Pendiente', incidents: [{ type: "Firma falsificada en examen", date: "20/04/2026" }], teacher: 'Ana Lopez', subject: 'Comunicación' },
    { id: 15, student: 'Sebastián Reyes', parent: 'Mónica Reyes', relationship: 'Madre', grade: '3° C', level: 'Secundaria', reason: 'Reforzamiento de inglés', description: 'Se agendó tutoría individual para lograr las competencias del área de inglés.', category: 'Académico', date: '10/04/2026', time: '15:30 PM', status: 'Completada', teacher: 'Diana Smith', subject: 'Inglés' },
    { id: 16, student: 'Ariana Vega', parent: 'Esteban Vega', relationship: 'Padre', grade: '3° A', level: 'Secundaria', reason: 'Uso de celular', description: 'Por tercera vez se le retuvo el celular en horas de clase de DPCC.', category: 'Incidencias', date: '07/04/2026', time: '09:30 AM', status: 'Reprogramada', incidents: [{ type: "Uso de celular (Reincidencia 3)", date: "27/04/2026" }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
  ];

  const [citationsList, setCitationsList] = useState(initialCitations);

  const filteredCitations = useMemo(() => {
    return citationsList.filter(c => {
      // Search term
      if (searchTerm && !c.student.toLowerCase().includes(searchTerm.toLowerCase()) && !c.parent.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Category filter
      if (selectedCategory !== 'Todos' && c.category !== selectedCategory) return false;

      // Status filter
      if (selectedStatusTab !== 'Todas' && c.status !== selectedStatusTab) return false;

      // Level filter
      if (selectedLevel !== 'Todos' && c.level !== selectedLevel) return false;

      // Grade & Section
      if (selectedGrade !== "Todos" || selectedSection !== "Todos") {
        const gradeMatch = c.grade.match(/(\d+°)\s+([A-Z])/);
        if (gradeMatch) {
            const [, g, s] = gradeMatch;
            if (selectedGrade !== "Todos" && g !== selectedGrade) return false;
            if (selectedSection !== "Todos" && s !== selectedSection) return false;
        } else {
            return false;
        }
      }

      return true;
    });
  }, [citationsList, searchTerm, selectedStatusTab, selectedLevel, selectedGrade, selectedSection, selectedCategory]);

  // Si no hay ninguna citación elegida, se muestra la primera de la lista.
  // Se deriva en el render en lugar de sincronizarlo con un efecto, así se
  // evita el render intermedio con la vista de detalle vacía.
  const activeCitationId = selectedCitationId ?? filteredCitations[0]?.id ?? null;

  const activeCitation = useMemo(() => {
    return citationsList.find(c => c.id === activeCitationId) || null;
  }, [activeCitationId, citationsList]);

  const updateCitationStatus = (id: number, newStatus: string) => {
    setCitationsList(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    showToast(`Citación ${newStatus.toLowerCase()} correctamente.`);
  };

  const handleReschedule = () => {
    if (rescheduleModal.citation) {
      setCitationsList(prev => prev.map(c => 
        c.id === rescheduleModal.citation.id 
          ? { ...c, status: "Reprogramada", date: reschedDate, time: reschedTime, reason: reschedReason || c.reason }
          : c
      ));
      showToast("Citación reprogramada correctamente.");
      setRescheduleModal({isOpen: false, citation: null});
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full font-poppins overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-white" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL 2 COLUMNAS (WHATSAPP WEB CLONE) */}
      <div className="flex-1 overflow-hidden flex w-full">
        
        {/* COLUMNA 1: SIDEBAR IZQUIERDO (Lista de citaciones) */}
        <section className="w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10">
          
          {/* HEADER SIDEBAR (Perfil y acciones) */}
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                <img src={APP_CONFIG.schoolLogo} alt="Perfil" className="w-full h-full object-contain scale-75" referrerPolicy="no-referrer" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Citaciones I.E</h1>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <button><CalendarDays className="w-5 h-5" /></button>
              <button><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* SEARCH BAR & FILTERS */}
          <div className="bg-white dark:bg-[#111b21] p-2 flex flex-col gap-2 shrink-0 border-b border-slate-100 dark:border-slate-800/30">
            <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 mx-2">
              <Search className="w-4 h-4 text-[#54656f] dark:text-[#aebac1] shrink-0" />
              <input
                type="text"
                placeholder="Busca por alumno o apoderado"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none pl-4 pr-2 text-sm text-[#111b21] dark:text-white outline-none placeholder:text-[#54656f] dark:placeholder:text-[#aebac1]"
              />
            </div>

            {/* STATUS FILTER */}
            <div className="grid grid-cols-6 gap-1 px-2 pb-1 w-full">
              {[
                { label: 'Todas', value: 'Todas' },
                { label: 'Pendiente', value: 'Pendiente' },
                { label: 'Confirmada', value: 'Confirmada' },
                { label: 'Reprog.', value: 'Reprogramada' },
                { label: 'Completada', value: 'Completada' },
                { label: 'Cancelada', value: 'Cancelada' },
              ].map(st => (
                <button
                  key={st.value}
                  onClick={() => setSelectedStatusTab(st.value)}
                  title={st.value}
                  className={`px-1 py-1.5 text-[11px] font-semibold rounded-full transition-colors text-center truncate ${
                    selectedStatusTab === st.value
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                      : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] hover:bg-[#e9edef] dark:hover:bg-[#2a3942]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* EDUCATIONAL & CATEGORY FILTERS */}
            <div className="grid grid-cols-4 gap-1 px-2 pb-1 w-full">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Nivel</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Grado</option>
                <option value="1°">1°</option>
                <option value="2°">2°</option>
                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
                <option value="6°">6°</option>
              </select>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Sec.</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Motivo</option>
                <option value="Académico">Académico</option>
                <option value="Incidencias">Incidencias</option>
                <option value="Gestión">Gestión</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          {/* LISTA DE CITACIONES */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/10 hidden-scrollbar">
            {filteredCitations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                <MessageSquare className="w-8 h-8 stroke-1" />
                <p className="text-xs font-bold">No hay citaciones</p>
              </div>
            ) : (
              filteredCitations.map(c => {
                const isSelected = c.id === activeCitation?.id;
                
                // Color badges depending on status
                const getStatusColor = (status: string) => {
                  switch(status) {
                    case 'Pendiente': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
                    case 'Confirmada': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
                    case 'Reprogramada': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
                    case 'Completada': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
                    case 'Cancelada': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800';
                    default: return 'text-gray-600 bg-gray-50';
                  }
                };

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCitationId(c.id)}
                    className={`px-3 py-3 flex gap-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
                        : 'bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'
                    }`}
                  >
                    {/* Avatar del estudiante (Letra inicial) */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                        <img
                          src={getAvatarForStudent(c.student, c.id)}
                          alt={c.student}
                          className="w-full h-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Contenido info */}
                    <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-[15px] font-normal text-[#111b21] dark:text-[#e9edef] truncate">
                          {c.student}
                        </h4>
                        <span className="text-[12px] shrink-0 text-[#667781] dark:text-[#8696a0]">
                          {c.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[13px] text-[#667781] dark:text-[#8696a0] truncate mb-0.5">
                          {c.reason}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">{c.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* COLUMNA 2: ÁREA PRINCIPAL (Detalles de citación) */}
        <section className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] relative h-[650px] lg:h-auto z-0 overflow-hidden">
          
          {/* PATTERN DE FONDO */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")', backgroundSize: '400px' }}></div>

          {activeCitation ? (
            <>
              {/* HEADER DE LA CITACIÓN */}
              <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 shadow-sm relative z-10 border-b border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                    <img
                      src={getAvatarForStudent(activeCitation.student, activeCitation.id)}
                      alt={activeCitation.student}
                      className="w-full h-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#111b21] dark:text-[#e9edef] text-[15px] leading-tight">
                      {activeCitation.student}
                    </h2>
                    <p className="text-[12px] text-[#667781] dark:text-[#8696a0]">
                      {activeCitation.grade} - {activeCitation.level}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="Imprimir citación"><Printer className="w-5 h-5" /></button>
                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="Más opciones"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* CONTENIDO DE LA CITACIÓN (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0 custom-scrollbar">
                <div className="max-w-2xl mx-auto space-y-6">
                  
                  {/* Date Bubble */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/90 dark:bg-[#111b21]/90 shadow-sm backdrop-blur-sm text-[12px] font-medium text-[#54656f] dark:text-[#aebac1] px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      Citación programada para el {activeCitation.date}
                    </div>
                  </div>

                  {/* Main Ticket */}
                  <div className="bg-white dark:bg-[#202c33] rounded-lg shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden relative">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      activeCitation.status === 'Confirmada' ? 'bg-[#00a884]' : 
                      activeCitation.status === 'Pendiente' ? 'bg-amber-500' :
                      activeCitation.status === 'Reprogramada' ? 'bg-blue-500' :
                      activeCitation.status === 'Completada' ? 'bg-purple-500' : 'bg-rose-500'
                    }`}></div>
                    
                    <div className="p-6 sm:p-8 flex flex-col gap-6">
                      
                      {/* Reason & Status */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Motivo de citación</p>
                          <h3 className="text-xl sm:text-2xl font-bold text-[#111b21] dark:text-[#e9edef] leading-tight">
                            {activeCitation.reason}
                          </h3>
                        </div>
                        <div className="shrink-0">
                          <span className={`text-[13px] font-bold px-3 py-1.5 rounded-full border ${
                             activeCitation.status === 'Confirmada' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800' : 
                             activeCitation.status === 'Pendiente' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800' :
                             activeCitation.status === 'Reprogramada' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800' :
                             activeCitation.status === 'Completada' ? 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800' :
                             'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800'
                          }`}>
                            {activeCitation.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-[15px] text-[#3b4a54] dark:text-[#d1d7db] leading-relaxed bg-[#f0f2f5] dark:bg-[#111b21] p-4 rounded-lg border border-slate-100 dark:border-slate-800/60">
                        {activeCitation.description || 'Sin descripción adicional reportada por el docente.'}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                        <div>
                          <p className="text-[12px] font-bold text-[#667781] dark:text-[#8696a0] mb-0.5">Fecha y Hora</p>
                          <p className="text-[14px] font-medium text-[#111b21] dark:text-[#e9edef] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            {activeCitation.date} a las {activeCitation.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-[#667781] dark:text-[#8696a0] mb-0.5">Docente Cargo</p>
                          <p className="text-[14px] font-medium text-[#111b21] dark:text-[#e9edef]">
                            {activeCitation.teacher} <span className="text-[#667781] dark:text-[#8696a0]">({activeCitation.subject})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-[#667781] dark:text-[#8696a0] mb-0.5">Apoderado</p>
                          <p className="text-[14px] font-medium text-[#111b21] dark:text-[#e9edef] flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" />
                            {activeCitation.parent} <span className="text-[#667781] dark:text-[#8696a0]">({activeCitation.relationship})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-[#667781] dark:text-[#8696a0] mb-0.5">Categoría</p>
                          <p className="text-[14px] font-medium text-[#111b21] dark:text-[#e9edef]">
                            {activeCitation.category}
                          </p>
                        </div>
                      </div>

                      {/* Associated Incidents */}
                      {activeCitation.category === 'Incidencias' && activeCitation.incidents && (
                        <div className="mt-2 pt-5 border-t border-slate-100 dark:border-slate-800/60">
                           <h4 className="text-[13px] font-bold text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" /> Incidencias vinculadas
                           </h4>
                           <div className="flex flex-col gap-2">
                             {activeCitation.incidents.map((inc: any, i: number) => (
                               <div key={i} className="bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
                                 <span className="text-[13px] font-medium text-rose-800 dark:text-rose-200">{inc.type}</span>
                                 <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{inc.date}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                      
                    </div>
                    
                    {/* Action Footer */}
                    <div className="bg-[#f0f2f5] dark:bg-[#111b21] p-4 sm:px-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-3 items-center justify-end">
                      {activeCitation.status === 'Pendiente' && (
                        <>
                          <button 
                            onClick={() => {
                              setReschedDate(""); setReschedTime(""); setReschedReason("");
                              setRescheduleModal({isOpen: true, citation: activeCitation});
                            }}
                            className="px-4 py-2 text-[13px] font-bold text-[#111b21] dark:text-white bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            Reprogramar
                          </button>
                          <button 
                            onClick={() => updateCitationStatus(activeCitation.id, 'Confirmada')}
                            className="px-4 py-2 text-[13px] font-bold text-white bg-[#00a884] hover:bg-[#008f6f] rounded-lg transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Aprobar Cita
                          </button>
                        </>
                      )}
                      {activeCitation.status === 'Confirmada' && (
                        <button 
                            onClick={() => updateCitationStatus(activeCitation.id, 'Completada')}
                            className="px-4 py-2 text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Marcar Completada
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f0f2f5] dark:bg-[#222e35]">
               <div className="w-80 max-w-full">
                 <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Calendar.png" alt="Calendar" className="w-32 h-32 mx-auto mb-6 opacity-80" />
                 <h2 className="text-[#41525d] dark:text-[#e9edef] text-3xl font-light mb-4">Citaciones Web</h2>
                 <p className="text-[#667781] dark:text-[#8696a0] text-sm leading-relaxed mb-8">
                   Selecciona una citación del panel izquierdo para ver los detalles, o utiliza los filtros para encontrar citaciones específicas.
                 </p>
                 <div className="flex items-center justify-center gap-2 text-[12px] text-[#8696a0] dark:text-[#667781]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Sistema de gestión cifrado</span>
                 </div>
               </div>
            </div>
          )}
        </section>
      </div>

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
              className="bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden w-full max-w-[440px] flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-[16px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" /> Reprogramar Citación
                  </h3>
                  <button onClick={() => setRescheduleModal({isOpen: false, citation: null})} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                     <X size={20} />
                  </button>
              </div>
              <div className="p-6 flex flex-col gap-5">
                  <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Nueva Fecha</label>
                      <input 
                         type="date" 
                         value={reschedDate}
                         onChange={(e) => setReschedDate(e.target.value)}
                         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3 font-medium text-[14px] outline-none focus:border-indigo-500 transition-colors"
                      />
                  </div>
                  <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Nueva Hora</label>
                      <input 
                         type="time" 
                         value={reschedTime}
                         onChange={(e) => setReschedTime(e.target.value)}
                         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3 font-medium text-[14px] outline-none focus:border-indigo-500 transition-colors"
                      />
                  </div>
                  <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Motivo de Reprogramación (Opcional)</label>
                      <textarea 
                         value={reschedReason}
                         onChange={(e) => setReschedReason(e.target.value)}
                         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-3 font-medium text-[14px] outline-none focus:border-indigo-500 transition-colors h-[80px] resize-none"
                         placeholder="Ej: Cruce de horarios con padre de familia..."
                      ></textarea>
                  </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                  <button 
                     onClick={() => setRescheduleModal({isOpen: false, citation: null})}
                     className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[14px]"
                  >
                      Cancelar
                  </button>
                  <button 
                     onClick={handleReschedule}
                     disabled={!reschedDate || !reschedTime}
                     className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[14px]"
                  >
                      Guardar Cambios
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};
