import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, School } from 'lucide-react';
import { EDUCATIONAL_STRUCTURE } from '@/data/education';

export const ClassroomSidebar: React.FC<{
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedClassroom: any;
  onSelectClassroom: (c: { level: string; grade: string; section: string } | null) => void;
  onActionReportes?: () => void;
  onActionIncidencias?: () => void;
  onActionComunicados?: () => void;
}> = ({ selectedLevel, setSelectedLevel, selectedGrade, setSelectedGrade, selectedClassroom, onSelectClassroom, onActionReportes, onActionIncidencias, onActionComunicados }) => {
  const [contextMenu, setContextMenu] = useState<{ section: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`w-full sm:w-[350px] md:w-[400px] bg-white dark:bg-[#111b21] flex flex-col shrink-0 overflow-hidden border-r border-slate-200 dark:border-slate-800/60 z-10 ${selectedClassroom ? 'hidden lg:flex' : 'flex'}`}>
      {selectedLevel === "Todos" ? (
        <>
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <School className="w-5 h-5" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Niveles Educativos</h1>
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">
            {/* Primaria (Proximamente) */}
            <button
               disabled
               className="bg-slate-100 dark:bg-slate-800/40 opacity-70 cursor-not-allowed rounded-[24px] border-2 border-slate-200 dark:border-slate-700/50 p-5 flex flex-row items-center gap-5 text-left shadow-sm transition-all group relative"
            >
               <div className="absolute top-3 right-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Próximamente
               </div>
               <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[16px] grayscale">
                  <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Backpack.png"
                    alt="primaria"
                    className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                  />
               </div>
               <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <h4 className="font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1">
                    Primaria
                  </h4>
                  
               </div>
            </button>
            {/* Secundaria */}
            <button
              onClick={() => setSelectedLevel("Secundaria")}
              className="bg-blue-50/80 dark:bg-blue-900/20 rounded-[24px] border-2 border-blue-100/50 dark:border-blue-800/30 p-5 flex flex-row items-center gap-5 text-left shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-16 h-16 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[16px]">
                  <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Graduation%20Cap.png"
                    alt="secundaria"
                    className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                  />
              </div>
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <h4 className="font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Secundaria
                  </h4>
                  <div className="flex flex-col text-[14px] text-blue-600/80 dark:text-blue-400 font-bold leading-tight mt-0.5 space-y-0.5">
                    <span className="flex items-center">5 Grados</span>
                    <span className="flex items-center">34 Secciones</span>
                  </div>
              </div>
            </button>
          </div>
        </>
      ) : selectedGrade === "Todos" ? (
        <>
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60">
            <button
              onClick={() => setSelectedLevel("Todos")}
              className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
            >
              <ChevronLeft className="w-5 h-5" /> Niveles Educativos
            </button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">
            {Object.keys(EDUCATIONAL_STRUCTURE[selectedLevel] || {}).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className="bg-blue-50/80 dark:bg-blue-900/20 rounded-[24px] border-2 border-blue-100/50 dark:border-blue-800/30 p-5 flex flex-row items-center gap-5 text-left shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[16px]">
                  <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png"
                    alt="books"
                    className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <h4 className="font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {grade}
                  </h4>
                  <div className="flex flex-col text-[14px] text-blue-600/80 dark:text-blue-400 font-bold leading-tight mt-0.5 space-y-0.5">
                    <span className="flex items-center">Alumnos: {((EDUCATIONAL_STRUCTURE[selectedLevel][grade]?.length || 0) * 30)}</span>
                    <span className="flex items-center">Docentes: 7 • Aux: 2</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedGrade("Todos");
                onSelectClassroom(null);
              }}
              className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[15px]"
            >
              <ChevronLeft className="w-5 h-5" /> {selectedGrade}
            </button>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">
            {Array.isArray(EDUCATIONAL_STRUCTURE[selectedLevel]?.[selectedGrade]) && EDUCATIONAL_STRUCTURE[selectedLevel][selectedGrade].map((section, idx) => {
              const isSelected =
                selectedClassroom?.section === section && selectedClassroom?.grade === selectedGrade && selectedClassroom?.level === selectedLevel;
              return (
                <div key={section} className="flex flex-col gap-2 relative">
                  <button
                    onClick={() =>
                      onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section })
                    }
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ section, x: e.clientX, y: e.clientY });
                    }}
                    className={`rounded-[24px] border-2 p-5 flex flex-row items-center gap-5 text-left shadow-sm transition-all group ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/20"
                        : "bg-blue-50/80 dark:bg-blue-900/20 border-blue-100/50 dark:border-blue-800/30 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    <div className={`w-16 h-16 shrink-0 transition-transform group-hover:scale-110 flex items-center justify-center rounded-[16px] bg-white/50 dark:bg-slate-900/50`}>
                      <img
                        src={`https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/${["Blue%20Book.png", "Green%20Book.png", "Orange%20Book.png", "Closed%20Book.png"][idx % 4]}`}
                        alt="book"
                        className="w-[40px] h-[40px] object-contain drop-shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <h4
                        className={`font-extrabold text-[#1A2642] dark:text-white text-[18px] mb-1 transition-colors ${
                          isSelected ? "text-blue-700 dark:text-blue-400" : "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}
                      >
                        {selectedGrade.replace("° Grado", "°")} {section}
                      </h4>
                      <div className="flex flex-col text-[14px] text-blue-600/80 dark:text-blue-400 font-bold leading-tight mt-0.5 space-y-0.5">
                        <span className="flex items-center w-full">Alumnos: 30</span>
                        <span className="flex items-center w-full truncate w-[100%] leading-tight text-[13px]">Tutor: Asignado</span>
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {contextMenu?.section === section && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-[80%] left-10 z-50 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section });
                            if (onActionReportes) onActionReportes();
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/File%20Folder.png" alt="Reportes" className="w-[16px] h-[16px]" /> Reportes
                        </button>
                        <button
                          onClick={() => {
                            onSelectClassroom({ level: selectedLevel, grade: selectedGrade, section });
                            if (onActionIncidencias) onActionIncidencias();
                            setContextMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Open%20Mailbox%20with%20Raised%20Flag.png" alt="Incidencias" className="w-[16px] h-[16px]" /> Incidencias
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
