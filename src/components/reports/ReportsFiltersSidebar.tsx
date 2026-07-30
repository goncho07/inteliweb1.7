import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

import { EDUCATIONAL_STRUCTURE } from '@/data/education';

/** Panel lateral de filtros (Nivel/Grado/Sección) del módulo de reportes de asistencia. */
export const ReportsFiltersSidebar: React.FC<{
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  selectedGrade: string;
  onGradeChange: (value: string) => void;
  gradeOptions: string[];
  selectedSection: string;
  onSectionChange: (value: string) => void;
  sectionOptions: string[];
  isApplying: boolean;
  onApply: () => void;
}> = ({
  selectedLevel,
  onLevelChange,
  selectedGrade,
  onGradeChange,
  gradeOptions,
  selectedSection,
  onSectionChange,
  sectionOptions,
  isApplying,
  onApply,
}) => {
  return (
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
                            onChange={(e) => onLevelChange(e.target.value)}
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
                            onChange={(e) => onGradeChange(e.target.value)}
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
                            onChange={(e) => onSectionChange(e.target.value)}
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
                  onClick={onApply}
                  className={`w-full mt-auto py-3 font-bold rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isApplying ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]'}`}
                >
                  {isApplying ? (
                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Aplicando...</>
                  ) : 'Aplicar Filtros'}
                </button>
              </div>
            </div>
  );
};
