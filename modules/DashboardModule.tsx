import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CalendarDays, AlertTriangle, CheckCircle2, 
  Clock, ArrowRight, BookOpen, Mail, FileText, CheckSquare,
  Home, Edit2, Play, Megaphone, Monitor, X, ChevronDown, ChevronLeft, ChevronRight, Info, Search, ShieldCheck,
  ClipboardList, LayoutDashboard, Briefcase, Wallet, Zap, Shield, CreditCard, Bell, Calendar
} from 'lucide-react';
import { ModuleProps } from '../types';
import { PageHeader, KPICard } from '../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

// @ts-ignore
import siagieLogo from '../src/assets/images/regenerated_image_1778334918585.png';
// @ts-ignore
import simonLogo from '../src/assets/images/regenerated_image_1778307486323.png';

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
  <svg viewBox="0 0 520 140" className="h-[40px] md:h-[46px] w-auto drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10, 20)">
      <path d="M10 40 C40 10 90 10 120 40" stroke="#0284c7" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M10 60 C40 90 90 90 120 60" stroke="#0284c7" strokeWidth="12" fill="none" strokeLinecap="round" />
      <circle cx="65" cy="50" r="16" fill="#0284c7" />
      <circle cx="58" cy="46" r="3" fill="#ffffff" />
      <circle cx="72" cy="46" r="3" fill="#ffffff" />
      <path d="M57 53 C60 58 70 58 73 53" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x="0" y="110" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="48" fill="#0284c7">SíseVe</text>
    </g>
    <line x1="180" y1="20" x2="180" y2="120" stroke="#94a3b8" strokeWidth="3" />
    <text x="195" y="75" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="34" fill="#64748b" className="dark:fill-slate-400" letterSpacing="-1">Contra la</text>
    <text x="195" y="110" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="34" fill="#64748b" className="dark:fill-slate-400" letterSpacing="-1">Violencia Escolar</text>
  </svg>
);

export const DashboardModule: React.FC<ModuleProps> = ({ onNavigate }) => {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  // Data for charts
  const attendanceData = [
    { day: 'Lun', presente: 90, tardanza: 5, ausente: 5 },
    { day: 'Mar', presente: 92, tardanza: 2, ausente: 6 },
    { day: 'Mié', presente: 85, tardanza: 8, ausente: 7 },
    { day: 'Jue', presente: 95, tardanza: 3, ausente: 2 },
    { day: 'Vie', presente: 80, tardanza: 10, ausente: 10 },
  ];

  const incidentsData = [
    { type: 'Leves', count: 12, fill: '#facc15' }, // Amarillo
    { type: 'Moderadas', count: 5, fill: '#fb923c' }, // Naranja
    { type: 'Graves', count: 2, fill: '#f87171' }, // Rojo
  ];

  const classroomRankingData = [
    { classroom: '3° A Sec.', score: 28 },
    { classroom: '4° B Sec.', score: 22 },
    { classroom: '1° C Sec.', score: 18 },
    { classroom: '5° A Sec.', score: 15 },
    { classroom: '2° B Sec.', score: 12 },
  ];

  const studentRankingData = [
    { name: 'Mateo Q. (3°A)', score: 9 },
    { name: 'Sebastián V. (4°B)', score: 7 },
    { name: 'Luciana M. (1°C)', score: 6 },
    { name: 'Alvaro L. (5°A)', score: 5 },
    { name: 'María R. (2°B)', score: 4 },
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="h-full flex flex-col font-poppins relative">
      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
        <PageHeader 
          title="Vista Directiva" 
          icon={LayoutDashboard} 
          className="bg-white"
        />
        <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4 gap-6 max-w-[1700px] mx-auto w-full min-h-0 overflow-hidden h-full">
          <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 flex flex-col h-[600px] lg:h-full bg-slate-50/80 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 shadow-inner relative overflow-hidden group z-10 animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4">
                <div className="flex items-center justify-between">
                   <h2 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1 tracking-wider uppercase">
                     <Zap className="w-5 h-5 text-indigo-600" /> PLATAFORMAS DIRECTIVAS
                   </h2>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col gap-4 pr-1 pb-4">
                
                <a href="https://siagie.minedu.gob.pe/inicio/" target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 rounded-2xl border-2 transition-all shadow-sm bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md group text-left cursor-pointer">
                  <div className="flex items-center justify-between mb-3 w-full">
                    <img src={siagieLogo} alt="SIAGIE" className="w-full h-auto max-h-[50px] object-contain object-left mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Matrícula oficial, nóminas, asistencia diaria y actas.
                  </div>
                </a>

                <a href="https://mundoie.drelm.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 rounded-2xl border-2 transition-all shadow-sm bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md group text-left cursor-pointer">
                  <div className="flex items-center justify-between mb-3 w-full">
                    <MundoIELogo />
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Gestión educativa y recursos institucionales.
                  </div>
                </a>

                <a href="https://simon.minedu.gob.pe/" target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 rounded-2xl border-2 transition-all shadow-sm bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md group text-left cursor-pointer">
                  <div className="flex items-center justify-between mb-3 w-full">
                    <img src={simonLogo} alt="SIMON" className="w-full h-auto max-h-[50px] object-contain object-left mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Monitoreo, evaluación y registro de visitas pedagógicas.
                  </div>
                </a>

                <a href="https://www.siseve.pe/web/" target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 rounded-2xl border-2 transition-all shadow-sm bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md group text-left cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <SiseveLogo />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Sistema contra la violencia escolar y bullying.
                  </div>
                </a>

                <a href="https://classroom.google.com/" target="_blank" rel="noopener noreferrer" className="flex flex-col p-4 rounded-2xl border-2 transition-all shadow-sm bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/50 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md group text-left cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ClassroomLogo />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Aulas virtuales y gestión de tareas académicas.
                  </div>
                </a>

             </div>
          </div>

          {/* ======== DERECHA (Contenido Principal Flexible) ======== */}
          <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden h-full bg-slate-50/80 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 lg:p-6 shadow-inner animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col pr-1 pb-6 w-full">
                
                {/* Welcome Back Card for Director */}
                <div className="w-full shrink-0">
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-800/30 p-6 xl:p-8 flex flex-col md:flex-row items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] gap-6 xl:gap-8 min-h-[160px]">
                    <div className="flex items-center gap-6 xl:gap-8 flex-1 w-full justify-between md:justify-start">
                      <div className="flex items-center gap-5 xl:gap-8">
                        <div className="w-[80px] h-[80px] xl:w-[100px] xl:h-[100px] rounded-[24px] xl:rounded-[32px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 overflow-hidden relative shadow-md">
                          <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20office%20worker/Medium-Light/3D/man_office_worker_3d_medium-light.png" alt="Director" className="h-[65px] xl:h-[80px] object-contain drop-shadow-md absolute bottom-0" />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-slate-500 dark:text-slate-400 text-[16px] xl:text-[18px] font-bold tracking-tight mb-1">Panel de Control:</h2>
                          <h1 className="text-[#0D082C] dark:text-white text-[28px] xl:text-[36px] font-black mt-[-4px] md:mt-0 tracking-tight flex items-center gap-2 leading-none">
                            Roberto (Director) 
                            <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/3D/briefcase_3d.png" alt="Briefcase" className="w-[32px] xl:w-[40px] drop-shadow-sm inline-block animate-bounce mb-1" />
                          </h1>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                             <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 xl:px-4 xl:py-1.5 rounded-lg text-[12px] xl:text-[13px] font-extrabold shadow-sm border border-blue-100 dark:border-blue-800">DIRECTIVO</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Charts Row 1: Bar charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                  
                  {/* Asistencia Semanal */}
                  <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm p-6 h-[280px] flex flex-col">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4 text-[16px] flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-indigo-500" />
                      Asistencia de la Semana (%)
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 'bold', fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                          <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="presente" name="Presentes" fill="#10b981" radius={[4,4,0,0]} barSize={12} />
                          <Bar dataKey="tardanza" name="Tardanzas" fill="#fbbf24" radius={[4,4,0,0]} barSize={12} />
                          <Bar dataKey="ausente" name="Ausentes" fill="#ef4444" radius={[4,4,0,0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Incidencias Chart */}
                  <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm p-6 h-[280px] flex flex-col">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4 text-[16px] flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Incidencias Semanales
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incidentsData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                          <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 'bold', fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                          <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="count" name="Casos" radius={[4,4,0,0]} barSize={40}>
                            {incidentsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* KPI Charts Row 2: Ranking charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                  
                  {/* Ranking Aulas */}
                  <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm p-6 h-[320px] flex flex-col">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4 text-[16px] flex items-center gap-2">
                       <AlertTriangle className="w-5 h-5 text-rose-500" />
                       Aulas con más Incidencias (Mes)
                    </h3>
                    <div className="flex-1 w-full min-h-0 relative -ml-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classroomRankingData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.3} />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                          <YAxis type="category" dataKey="classroom" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 'bold', fill: '#64748b' }} width={90} />
                          <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Ranking Estudiantes */}
                  <div className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm p-6 h-[320px] flex flex-col">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 mb-4 text-[16px] flex items-center gap-2">
                       <Users className="w-5 h-5 text-orange-500" />
                       Estudiantes más incidentes (Mes)
                    </h3>
                    <div className="flex-1 w-full min-h-0 relative -ml-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studentRankingData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.3} />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 'bold', fill: '#64748b' }} width={140} />
                          <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="score" name="Incidencias" fill="#f59e0b" radius={[0,4,4,0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

             </div>
          </div>

        </div>
      </div>
      
      {activePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {activePopup === 'asistencia' && <><Users className="h-5 w-5 text-indigo-500" /> Asistencia Docentes</>}
                    {activePopup === 'notas' && <><FileText className="h-5 w-5 text-emerald-500" /> Estado de Notas</>}
                    {activePopup === 'reportes' && <><AlertTriangle className="h-5 w-5 text-rose-500" /> Reportes Disciplinarios</>}
                    {activePopup === 'reuniones' && <><Briefcase className="h-5 w-5 text-blue-500" /> Reuniones de Área</>}
                 </h3>
                 <button onClick={() => setActivePopup(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6">
                 <div className="flex flex-col gap-4 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Clock className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Este módulo se encuentra en proceso de sincronización con la base de datos principal.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vuelva a intentarlo más tarde o consulte con soporte técnico.</p>
                 </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                 <button onClick={() => setActivePopup(null)} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm">
                    Entendido
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

