import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, ChevronLeft, Clock, Search, Trophy } from 'lucide-react';
import { MOCK_USERS } from '@/data/users';
import { getStudentAvatarUrl } from '@/lib/avatar';
import { UserItem } from '@/types';

export const StudentsSidebar = ({
  classroom,
  selectedStudent,
  onSelectStudent,
  onBack,
  isLeaderboardOpen,
  onToggleLeaderboard
}: {
  classroom: { level: string; grade: string; section: string };
  selectedStudent: UserItem | null;
  onSelectStudent: (s: UserItem) => void;
  onBack: () => void;
  isLeaderboardOpen?: boolean;
  onToggleLeaderboard?: () => void;
}) => {
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
         tardiesCount: hash % 5
       }
    })
  }, [classroom]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"name" | "incidents" | "absences" | "tardies">("name");

  const filteredStudents = useMemo(() => {
     const filtered = studentsWithStats.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
     if (sortMode === "name") {
        return filtered.sort((a,b) => a.name.localeCompare(b.name));
     } else if (sortMode === "incidents") {
        return filtered.sort((a,b) => b.incidentsCount - a.incidentsCount || a.name.localeCompare(b.name));
     } else if (sortMode === "absences") {
        return filtered.sort((a,b) => b.absencesCount - a.absencesCount || a.name.localeCompare(b.name));
     } else if (sortMode === "tardies") {
        return filtered.sort((a,b) => b.tardiesCount - a.tardiesCount || a.name.localeCompare(b.name));
     }
     return filtered;
  }, [studentsWithStats, searchQuery, sortMode]);

  useEffect(() => {
     if (!selectedStudent && filteredStudents.length > 0 && !isLeaderboardOpen) {
        onSelectStudent(filteredStudents[0]);
     }
  }, [selectedStudent, filteredStudents, onSelectStudent, isLeaderboardOpen]);

  return (
    <div className={`w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10`}>
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
        >
          <ChevronLeft className="w-5 h-5" /> {classroom.grade} {classroom.section}
        </button>
      </div>
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 bg-white dark:bg-[#111b21]">

        <div className="relative w-full border-b-[1.5px] border-slate-300 dark:border-slate-600 focus-within:border-slate-900 dark:focus-within:border-slate-300 transition-colors pb-1.5 flex items-center">
          <Search className="w-[18px] h-[18px] text-slate-700 dark:text-slate-300 mr-2" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Buscar alumno"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-[15px] font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-2 mt-1 py-1 overflow-x-auto hidden-scrollbar pb-1">
           <button onClick={() => setSortMode("name")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${sortMode === "name" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}>A-Z</button>
           <button onClick={() => setSortMode("incidents")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${sortMode === "incidents" ? "bg-rose-100 text-rose-700 border-2 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}><AlertTriangle className="w-3.5 h-3.5" /> Incidencias</button>
           <button onClick={() => setSortMode("absences")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${sortMode === "absences" ? "bg-rose-100 text-rose-700 border-2 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}><AlertTriangle className="w-3.5 h-3.5" /> Faltas</button>
           <button onClick={() => setSortMode("tardies")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${sortMode === "tardies" ? "bg-amber-100 text-amber-700 border-2 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}><Clock className="w-3.5 h-3.5" /> Tardanzas</button>
        </div>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto hidden-scrollbar px-4 pt-2 pb-4 bg-white dark:bg-[#111b21] h-full">
         <button
            onClick={onToggleLeaderboard}
            className={`rounded-[20px] p-3 flex items-center gap-3 text-left transition-all group border-2 ${
               isLeaderboardOpen ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-700 ring-1 ring-amber-400/20" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-300 shadow-sm"
            }`}
         >
           <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border transition-colors ${
               isLeaderboardOpen ? "bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-800/80 dark:border-amber-700 dark:text-amber-400" : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:text-amber-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400"
            }`}>
              <Trophy className="w-6 h-6" />
           </div>
           <div className="flex flex-col min-w-0 flex-1">
              <h4 className={`font-extrabold text-[14px] leading-snug truncate ${
                  isLeaderboardOpen ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-100 group-hover:text-amber-600"
               }`}>
                 Vista General
              </h4>
           </div>
         </button>
         {filteredStudents.map(student => {
             const isSelected = selectedStudent?.id === student.id && !isLeaderboardOpen;
             const avatar = getStudentAvatarUrl(student);
             return (
               <button
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className={`rounded-[20px] p-3 flex items-center gap-3 text-left transition-all group border-2 ${
                    isSelected ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/20" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-300 shadow-sm"
                  }`}
               >
                 <div className="w-12 h-12 rounded-[14px] bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                    <img src={avatar} alt={student.name} className="w-[90%] h-[90%] object-contain scale-[1.2]" />
                 </div>
                 <div className="flex flex-col min-w-0 flex-1">
                    <h4 className={`font-extrabold text-[14px] leading-snug truncate ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-100 group-hover:text-blue-600"}`}>
                       {student.name}
                    </h4>
                    {sortMode !== "name" && (
                       <div className="mt-1 flex items-center gap-2">
                           {sortMode === "incidents" && student.incidentsCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-900/30 dark:text-rose-400">
                                 {student.incidentsCount} incidencias
                              </span>
                           )}
                           {sortMode === "absences" && student.absencesCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full dark:bg-rose-900/30 dark:text-rose-400">
                                 {student.absencesCount} faltas
                              </span>
                           )}
                           {sortMode === "tardies" && student.tardiesCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                                 {student.tardiesCount} tardanzas
                              </span>
                           )}
                           {((sortMode === "incidents" && student.incidentsCount === 0) || (sortMode === "absences" && student.absencesCount === 0) || (sortMode === "tardies" && student.tardiesCount === 0)) && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                                 Sin registro
                              </span>
                           )}
                       </div>
                    )}
                 </div>
                 {sortMode !== "name" && (
                    <div className="shrink-0 text-slate-300 dark:text-slate-600 font-bold text-lg opacity-50 px-1">
                       #{filteredStudents.findIndex(s => s.id === student.id) + 1}
                    </div>
                 )}
               </button>
             )
         })}
      </div>
    </div>
  )
}
