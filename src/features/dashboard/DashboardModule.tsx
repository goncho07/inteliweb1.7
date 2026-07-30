import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CalendarDays, AlertTriangle, Clock, FileText, X, Search, MoreVertical, Server } from 'lucide-react';
import { ModuleProps } from '@/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
, LabelList } from 'recharts';

import siagieLogo from '@/assets/images/regenerated_image_1778334918585.png';
import simonLogo from '@/assets/images/regenerated_image_1778307486323.png';

const MundoIELogo = () => (
  <svg viewBox="0 0 350 80" className="h-[36px] md:h-[42px] w-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 10)">
      <rect x="0" y="0" width="16" height="16" rx="5" fill="#2CB9FF" />
      <rect x="22" y="0" width="16" height="16" rx="5" fill="#2CB9FF" />
      <rect x="44" y="0" width="16" height="16" rx="5" fill="#2CB9FF" />
      <rect x="0" y="22" width="16" height="16" rx="5" fill="#3182FF" />
      <rect x="22" y="22" width="16" height="16" rx="5" fill="#3182FF" />
      <rect x="44" y="22" width="16" height="16" rx="5" fill="#3182FF" />
      <rect x="0" y="44" width="16" height="16" rx="5" fill="#405CFF" />
      <rect x="22" y="44" width="16" height="16" rx="5" fill="#405CFF" />
      <rect x="44" y="44" width="16" height="16" rx="5" fill="#405CFF" />
    </g>
    <text x="75" y="60" fontFamily="Inter, system-ui, sans-serif" fontWeight="200" fontSize="56" className="fill-slate-800 dark:fill-white" letterSpacing="-1.5">mundoIE</text>
  </svg>
);

const ClassroomLogo = () => (
  <svg viewBox="0 0 700 120" className="h-[34px] md:h-[38px] w-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10, 10)">
      <rect x="0" y="0" width="120" height="100" rx="10" fill="#fbbc04" />
      <rect x="10" y="10" width="100" height="80" rx="4" fill="#1e8e3e" />
      <circle cx="35" cy="45" r="10" fill="#81c995" />
      <path d="M15 75 C15 65 25 60 35 60 C40 60 45 61 48 64 C42 67 40 70 40 75 Z" fill="#81c995" />
      <circle cx="85" cy="45" r="10" fill="#81c995" />
      <path d="M105 75 C105 65 95 60 85 60 C80 60 75 61 72 64 C78 67 80 70 80 75 Z" fill="#81c995" />
      <circle cx="60" cy="40" r="14" fill="#ffffff" />
      <path d="M35 75 C35 60 45 55 60 55 C75 55 85 60 85 75 Z" fill="#ffffff" />
      <rect x="80" y="75" width="20" height="5" rx="2" fill="#ffffff" />
    </g>
    <text x="145" y="78" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="70" fill="#5f6368" className="dark:fill-slate-200" letterSpacing="-1">Google Classroom</text>
  </svg>
);

const SiseveLogo = () => (
  <svg viewBox="0 0 500 120" className="h-[36px] md:h-[42px] w-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
     <g transform="translate(10, 10)">
       <path d="M0 0 L100 0 L80 100 L20 100 Z" fill="#f43f5e" />
       <circle cx="50" cy="40" r="15" fill="white" />
       <path d="M30 80 Q50 60 70 80" stroke="white" strokeWidth="8" strokeLinecap="round" />
     </g>
     <text x="120" y="80" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="75" className="fill-slate-800 dark:fill-white" letterSpacing="-2">SíseVe</text>
  </svg>
);

export const DashboardModule: React.FC<ModuleProps> = () => {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  // Mock data for charts
  const attendanceData = [
    { day: 'Lun', presente: 95, tardanza: 3, ausente: 2 },
    { day: 'Mar', presente: 92, tardanza: 5, ausente: 3 },
    { day: 'Mié', presente: 96, tardanza: 2, ausente: 2 },
    { day: 'Jue', presente: 90, tardanza: 6, ausente: 4 },
    { day: 'Vie', presente: 94, tardanza: 4, ausente: 2 },
  ];

  const incidentsData = [
    { type: 'Atrasos', count: 45, fill: '#f59e0b' },
    { type: 'Indisciplina', count: 28, fill: '#ef4444' },
    { type: 'No Tareas', count: 65, fill: '#6366f1' },
    { type: 'Materiales', count: 18, fill: '#10b981' },
  ];

  const classroomRankingData = [
    { classroom: '4° B Sec', score: 12 },
    { classroom: '3° A Sec', score: 9 },
    { classroom: '5° C Sec', score: 8 },
    { classroom: '2° A Pri', score: 6 },
    { classroom: '1° B Sec', score: 5 },
  ];

  const studentRankingData = [
    { name: 'M. Rojas', score: 7 },
    { name: 'L. Vega', score: 5 },
    { name: 'J. Pérez', score: 4 },
    { name: 'A. Silva', score: 4 },
    { name: 'C. Paz', score: 3 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full w-full font-poppins overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a]"
    >
      <div className="flex-1 overflow-hidden flex w-full">
        
        {/* COLUMNA 1: SIDEBAR IZQUIERDO */}
        <section className="w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10">
          
          {/* HEADER SIDEBAR (Perfil y acciones) */}
          
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-slate-600 dark:text-slate-300">
                CC
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Inicio</h1>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto hidden-scrollbar p-3 space-y-3">
             <div className="px-2 pt-2 pb-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enlaces Rápidos</h3>
             </div>

             <a href="https://siagie.minedu.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                  <img src={siagieLogo} alt="SIAGIE" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">SIAGIE MinEdu</div>
                  <div className="text-[12px] text-slate-500 line-clamp-1">Registro oficial de matrículas y notas.</div>
                </div>
             </a>

             <a href="https://mundoie.drelm.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                  <div className="scale-[0.25]"><MundoIELogo /></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Mundo IE</div>
                  <div className="text-[12px] text-slate-500 line-clamp-1">Gestión directiva y reportes DRELM.</div>
                </div>
             </a>

             <a href="https://simon.minedu.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                  <img src={simonLogo} alt="SIMON" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">SIMON</div>
                  <div className="text-[12px] text-slate-500 line-clamp-1">Monitoreo y visitas pedagógicas.</div>
                </div>
             </a>

             <a href="https://www.siseve.pe/web/" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                  <div className="scale-[0.25]"><SiseveLogo /></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">SíseVe</div>
                  <div className="text-[12px] text-slate-500 line-clamp-1">Reportes de violencia escolar.</div>
                </div>
             </a>
             
             <a href="https://classroom.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                  <div className="scale-[0.2]"><ClassroomLogo /></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Google Classroom</div>
                  <div className="text-[12px] text-slate-500 line-clamp-1">Aulas virtuales y tareas.</div>
                </div>
             </a>
             
             <div className="px-2 pt-4 pb-1 mt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones Rápidas</h3>
             </div>
             
             <button onClick={() => setActivePopup('asistencia')} className="w-full flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group text-left">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Asistencia Docente</div>
                </div>
             </button>
             <button onClick={() => setActivePopup('notas')} className="w-full flex items-center p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group text-left">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Estado de Notas</div>
                </div>
             </button>
          </div>
        </section>

        {/* COLUMNA 2: ÁREA PRINCIPAL */}
        <section className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] relative h-[650px] lg:h-auto z-0 overflow-hidden">
          
          {/* PATTERN DE FONDO */}

          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Panel de Rendimiento Global</h2>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-white dark:bg-[#111b21] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-md text-2xl font-bold">
                   CC
                </div>
                <div className="flex-1 z-10">
                   <h2 className="text-xl font-bold text-[#111b21] dark:text-white">Bienvenido, Peepo Vega</h2>
                   <p className="text-[14px] text-[#667781] dark:text-[#8696a0] mt-1">Aquí tienes el resumen del estado actual de la Institución Educativa.</p>
                </div>
              </div>

              {/* KPI Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Asistencia Chart */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0"><CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div> Asistencia Semanal
                  </h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="presente" name="Presentes" fill="#00a884" radius={[4,4,0,0]} barSize={12} />
                        <Bar dataKey="tardanza" name="Tardanzas" fill="#f59e0b" radius={[4,4,0,0]} barSize={12}>
                          <LabelList dataKey="tardanza" position="top" style={{ fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                        <Bar dataKey="ausente" name="Ausentes" fill="#ef4444" radius={[4,4,0,0]} barSize={12}>
                          <LabelList dataKey="ausente" position="top" style={{ fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Incidencias Chart */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div> Tipos de Incidencias
                  </h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incidentsData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="count" name="Casos" radius={[4,4,0,0]} barSize={30}>
                          {incidentsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ranking Aulas */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div> Aulas con más incidencias
                  </h3>
                  <div className="flex-1 w-full min-h-0 relative -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classroomRankingData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis type="category" dataKey="classroom" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={90} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ranking Estudiantes */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div> Estudiantes incidentes
                  </h3>
                  <div className="flex-1 w-full min-h-0 relative -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentRankingData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={140} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>
      </div>

      <AnimatePresence>
      {activePopup && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
           <motion.div 
             initial={{ scale: 0.95 }}
             animate={{ scale: 1 }}
             exit={{ scale: 0.95 }}
             className="bg-white dark:bg-[#111b21] rounded-[20px] shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800/60"
           >
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800/60">
                 <h3 className="font-bold text-[15px] text-[#111b21] dark:text-[#e9edef] flex items-center gap-2">
                    {activePopup === 'asistencia' && <><Users className="h-5 w-5 text-indigo-500" /> Asistencia Docentes</>}
                    {activePopup === 'notas' && <><FileText className="h-5 w-5 text-emerald-500" /> Estado de Notas</>}
                 </h3>
                 <button onClick={() => setActivePopup(null)} className="text-[#54656f] hover:text-[#111b21] dark:hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 text-center">
                 <div className="w-16 h-16 bg-[#f0f2f5] dark:bg-[#202c33] rounded-full flex items-center justify-center mx-auto mb-4 text-[#54656f] dark:text-[#aebac1]">
                   <Clock className="w-8 h-8" />
                 </div>
                 <p className="font-semibold text-[15px] text-[#111b21] dark:text-[#e9edef] mb-2">Sincronizando datos</p>
                 <p className="text-[13px] text-[#667781] dark:text-[#8696a0]">Este módulo se encuentra en proceso de sincronización. Vuelva a intentarlo más tarde.</p>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-[#f0f2f5] dark:bg-[#202c33]">
                 <button onClick={() => setActivePopup(null)} className="w-full py-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-xl font-bold transition-colors text-[14px]">
                    Entendido
                 </button>
              </div>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};
