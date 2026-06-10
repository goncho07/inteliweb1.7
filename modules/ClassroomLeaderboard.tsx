import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserItem } from '../types';
import { AlertTriangle, Clock, Trophy, FileText, Activity, Users, ShieldAlert, FolderOpen, Star, Sparkles } from 'lucide-react';
import { MOCK_USERS, getStudentAvatarUrl } from '../constants';

export const ClassroomLeaderboard = ({ classroom, onReportClick }: { classroom: { level: string; grade: string; section: string }, onReportClick?: () => void }) => {
  const [activeTab, setActiveTab] = useState<"incidents" | "absences" | "tardies">("incidents");

  const studentsWithStats = useMemo(() => {
    const base = MOCK_USERS.filter(
      (u) =>
        u.role === "Estudiante" &&
        u.level === classroom.level &&
        u.grade === classroom.grade &&
        u.section === classroom.section,
    );
    return base.map(s => {
       const hash1 = s.name.charCodeAt(0) || 0;
       const hash2 = s.name.charCodeAt(s.name.length - 1) || 0;
       const hash = hash1 + hash2 + (s.id ? parseInt(s.id.slice(-2), 16) || 0 : 0);
       return {
         ...s,
         incidentsCount: hash % 6,
         absencesCount: hash % 4,
         tardiesCount: hash % 5,
         avatar: getStudentAvatarUrl(s)
       }
    })
  }, [classroom]);

  const sortedStudents = useMemo(() => {
     let sorted = [...studentsWithStats];
     if (activeTab === "incidents") {
        sorted.sort((a,b) => b.incidentsCount - a.incidentsCount);
     } else if (activeTab === "absences") {
        sorted.sort((a,b) => b.absencesCount - a.absencesCount);
     } else if (activeTab === "tardies") {
        sorted.sort((a,b) => b.tardiesCount - a.tardiesCount);
     }
     return sorted.filter(s => {
         if (activeTab === "incidents") return s.incidentsCount > 0;
         if (activeTab === "absences") return s.absencesCount > 0;
         if (activeTab === "tardies") return s.tardiesCount > 0;
         return false;
     });
  }, [studentsWithStats, activeTab]);

  const top3 = sortedStudents.slice(0, 3);
  const others = sortedStudents.slice(3);

  const getMetricLabel = () => {
     if (activeTab === "incidents") return "Incidencias";
     if (activeTab === "absences") return "Faltas";
     return "Tardanzas";
  };

  const getMetricValue = (student: any) => {
     if (activeTab === "incidents") return student.incidentsCount;
     if (activeTab === "absences") return student.absencesCount;
     return student.tardiesCount;
  };

  const recentIncidents = useMemo(() => [
    { id: 1, student: sortedStudents[0]?.name || "Ana Gómez", reason: "Falta de respeto a compañero", date: "Hoy, 10:30 AM", type: 'grave' },
    { id: 2, student: sortedStudents[1]?.name || "Luis Perez", reason: "No trajo el material", date: "Ayer, 08:15 AM", type: 'leve' },
    { id: 3, student: sortedStudents[2]?.name || "Carlos Silva", reason: "Llegada tardía", date: "Lun, 07:45 AM", type: 'tardanza' },
  ], [sortedStudents]);

  const reports = [
    { title: "Reporte de Asistencia Abril", color: "bg-blue-100 text-blue-600", icon: Clock },
    { title: "Reporte Disciplinario General", color: "bg-rose-100 text-rose-600", icon: ShieldAlert },
    { title: "Consolidado I Bimestre", color: "bg-emerald-100 text-emerald-600", icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] overflow-hidden custom-scrollbar overflow-y-auto pb-8">
      {/* Header */}
      <div className="p-6 md:p-8 shrink-0 relative bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-500" />
         </div>
         <div className="flex items-center gap-4 mb-2">
           <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                Vista General del Aula 
             </h2>
             <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-bold">{classroom.grade.replace("° Grado", "°")} {classroom.section}</span> 
                {classroom.level}
             </p>
           </div>
         </div>
      </div>

      <div className="px-6 md:px-8 pt-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
               <Users className="w-6 h-6" />
             </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Estudiantes</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{studentsWithStats.length}</p>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shrink-0">
               <ShieldAlert className="w-6 h-6" />
             </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Incidencias Activas</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{studentsWithStats.reduce((a,b)=>a+b.incidentsCount,0)}</p>
             </div>
          </div>
          <button onClick={onReportClick} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group">
             <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
               <FolderOpen className="w-6 h-6" />
             </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Módulo de</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">Reportes</p>
             </div>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           
           {/* Section 1: Ranking Visually (Spans 2 columns on XL) */}
           <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-700/30">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-indigo-500" />
                    Ranking de Atención
                 </h3>
                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setActiveTab("incidents")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "incidents" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                       Incidencias
                    </button>
                    <button onClick={() => setActiveTab("absences")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "absences" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                       Faltas
                    </button>
                    <button onClick={() => setActiveTab("tardies")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "tardies" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                       Tardanzas
                    </button>
                 </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                 {sortedStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full opacity-60">
                       <Trophy className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
                       <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">¡Aula modelo!</h4>
                       <p className="text-sm text-slate-500">No hay {getMetricLabel().toLowerCase()} registradas.</p>
                    </div>
                 ) : (
                    <AnimatePresence mode="wait">
                       <motion.div 
                         key={activeTab}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         transition={{ duration: 0.2 }}
                         className="flex flex-col items-center w-full"
                       >
                          {/* Podium */}
                          <div className="flex items-end justify-center w-full min-h-[220px] gap-2 sm:gap-6 pt-6">
                             {top3[1] && <PodiumItem student={top3[1]} rank={2} value={getMetricValue(top3[1])} metric={getMetricLabel()} color="bg-slate-200 dark:bg-slate-700" height="h-[120px]" delay={0.2} />}
                             {top3[0] && <PodiumItem student={top3[0]} rank={1} value={getMetricValue(top3[0])} metric={getMetricLabel()} color="bg-amber-100 border-2 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700" height="h-[160px]" delay={0} />}
                             {top3[2] && <PodiumItem student={top3[2]} rank={3} value={getMetricValue(top3[2])} metric={getMetricLabel()} color="bg-orange-100/50 dark:bg-orange-900/20" height="h-[90px]" delay={0.4} />}
                          </div>
                       </motion.div>
                    </AnimatePresence>
                 )}
              </div>
           </div>

           {/* Section 2: Historial & Reportes (Spans 1 col on XL, stacked) */}
           <div className="xl:col-span-1 flex flex-col gap-6">
              
              {/* Historial Corto */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 flex-1 flex flex-col min-h-[300px]">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Últimas Incidencias
                 </h3>
                 <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                    {recentIncidents.map(inc => (
                       <div key={inc.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${inc.type === 'grave' ? 'bg-rose-500' : inc.type === 'leve' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <div>
                             <p className="font-bold text-slate-800 dark:text-white text-sm">{inc.student}</p>
                             <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">{inc.reason}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{inc.date}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Reportes Cortos */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Reportes y Carpetas
                 </h3>
                 <div className="flex flex-col gap-3">
                    {reports.map((rep, idx) => (
                       <button key={idx} onClick={onReportClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-600 group">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${rep.color}`}>
                             <rep.icon className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors bg-blend-darken">{rep.title}</p>
                       </button>
                    ))}
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

const PodiumItem = ({ student, rank, value, metric, color, height, delay }: any) => {
   return (
      <motion.div 
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay, type: "spring", stiffness: 100, damping: 15 }}
         className="flex flex-col items-center w-[90px] sm:w-[120px] relative"
      >
         {/* Avatar */}
         <div className="relative mb-2 z-10 w-full flex justify-center">
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: delay + 0.3, type: "spring" }}
               className={`absolute -top-3 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm z-20 ${rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-400' : 'bg-orange-400'}`}
            >
               #{rank}
            </motion.div>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] bg-white dark:bg-slate-800 p-1.5 shadow-md border-2 object-cover overflow-hidden ${rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-slate-300' : 'border-orange-300'}`}>
               <img src={student.avatar} alt={student.name} className="w-full h-full object-contain" />
            </div>
         </div>
         
         <div className="text-center mb-2 px-1 w-full">
            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-tight truncate">
               {student.name.split(' ')[0]} {/* Short name */}
            </h4>
         </div>

         {/* Pillar */}
         <motion.div 
            initial={{ height: 0 }}
            animate={{ height: height.replace('h-', '') }} 
            className={`w-full rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-start pt-3 shadow-inner ${color}`}
            style={{ height: height.replace('h-[', '').replace('px]', '') + 'px' }}
         >
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-800/80 mb-0.5">{value}</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-800/60 uppercase tracking-wider">{metric}</span>
         </motion.div>
      </motion.div>
   )
}
