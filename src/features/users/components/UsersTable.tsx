import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, SquarePen, User } from 'lucide-react';

import { DropdownFilter } from '@/features/users/components/DropdownFilter';
import { HierarchicalDropdownFilter } from '@/features/users/components/HierarchicalDropdownFilter';
import { downloadUserQRCarnets } from '@/features/users/utils';
import { UserItem } from '@/types';

/** Tabla de usuarios con filtros de aula/estado en cabecera, acciones por fila y paginación. */
export const UsersTable: React.FC<{
  paginatedUsers: UserItem[];
  selectedRole: UserItem['role'];
  selectedLevel: string;
  changeLevel: (value: string) => void;
  selectedGrade: string;
  changeGrade: (value: string) => void;
  selectedSection: string;
  changeSection: (value: string) => void;
  gradeOptions: string[];
  sectionOptions: string[];
  selectedStatus: string;
  changeStatus: (value: string) => void;
  openDropdown: string | null;
  setOpenDropdown: (value: string | null) => void;
  setSelectedUser: (user: UserItem) => void;
  setInitialModalTab: (tab: 'personal' | 'academic' | 'family' | 'account') => void;
  setSelectedTeacherForSchedule: (user: UserItem) => void;
  setIsScheduleModalOpen: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}> = ({
  paginatedUsers,
  selectedRole,
  selectedLevel,
  changeLevel,
  selectedGrade,
  changeGrade,
  selectedSection,
  changeSection,
  gradeOptions,
  sectionOptions,
  selectedStatus,
  changeStatus,
  openDropdown,
  setOpenDropdown,
  setSelectedUser,
  setInitialModalTab,
  setSelectedTeacherForSchedule,
  setIsScheduleModalOpen,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
        <div className="col-span-1 lg:col-span-4 w-full overflow-hidden flex flex-col bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800">
           <div className="overflow-x-auto flex-1 p-0 rounded-[28px]">
             {/* Solo vista de lista */}
             <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                 <thead>
                   <tr className="bg-blue-50/40 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
                     <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-[40%]">Usuario</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <HierarchicalDropdownFilter
                            selectedLevel={selectedLevel} setSelectedLevel={changeLevel}
                            selectedGrade={selectedGrade} setSelectedGrade={changeGrade}
                            selectedSection={selectedSection} setSelectedSection={changeSection}
                            gradeOptions={gradeOptions} sectionOptions={sectionOptions}
                            isOpen={openDropdown === 'hierarchy'}
                            onToggle={() => setOpenDropdown(openDropdown === 'hierarchy' ? null : 'hierarchy')}
                          />
                        </div>
                     </th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <DropdownFilter
                            label="Estado"
                            value={selectedStatus}
                            options={selectedRole === 'Estudiante' ? ['Matriculado', 'Retirado', 'Trasladado', 'Egresado'] : ['Activo', 'Inactivo', 'Suspendido']}
                            isOpen={openDropdown === 'status'}
                            onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                            onChange={changeStatus}
                          />
                        </div>
                     </th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right w-[15%]">Acciones</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                   {paginatedUsers.length > 0 ? paginatedUsers.map((user, index) => (
                     <tr key={user.id} onClick={() => setSelectedUser(user)} className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-100 dark:bg-slate-800/80'} hover:bg-blue-50/50 dark:hover:bg-slate-700 transition-colors cursor-pointer group`}>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-full border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-slate-800`}>
                               <User size={20} />
                             </div>
                             <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight">{user.name}</p>
                                {user.code && <p className="text-xs text-gray-400 font-medium mt-0.5">{user.code}</p>}
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">{user.level || '-'}</span>
                             {user.grade ? (
                               <span className="text-sm text-gray-500 font-black mt-1">{user.grade.replace(' Grado', '')} {user.section}</span>
                             ) : (
                               <span className="text-[11px] text-gray-400 mt-0.5">-</span>
                             )}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            user.status === 'Matriculado' || user.status === 'Activo' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            user.status === 'Retirado' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            user.status === 'Trasladado' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                            user.status === 'Egresado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {user.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {selectedRole === 'Estudiante' ? (
                               <>
                                 <button
                                   onClick={(e) => { e.stopPropagation(); downloadUserQRCarnets(user); }}
                                   className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                   title="Descargar Carnets QR"
                                 >
                                    <Download size={18} />
                                 </button>

                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setInitialModalTab('family');
                                     setSelectedUser(user);
                                   }}
                                   className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                   title="Editar Familia"
                                 >
                                    <SquarePen size={18} />
                                 </button>
                               </>
                             ) : selectedRole === 'Docente' ? (
                               <>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedTeacherForSchedule(user);
                                     setIsScheduleModalOpen(true);
                                   }}
                                   className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                   title="Ver Horario"
                                 >
                                    <Calendar size={18} />
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setInitialModalTab('account');
                                     setSelectedUser(user);
                                   }}
                                   className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                   title="Editar Cuenta"
                                  >
                                    <SquarePen size={18} />
                                  </button>
                               </>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInitialModalTab('account');
                                      setSelectedUser(user);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                    title="Editar Cuenta"
                                  >
                                     <SquarePen size={18} />
                                  </button>
                                </>
                              )}
                          </div>
                       </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={4} className="py-12 text-center text-gray-400">
                         <Filter size={32} className="mx-auto mb-2 opacity-20"/>
                         No se encontraron resultados.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
           </div>

           {/* Paginación */}
           <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-b-[28px]">
              <button
                 disabled={currentPage === 1}
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs font-bold text-gray-500">
                 Página {currentPage} de {totalPages || 1}
              </span>
              <button
                 disabled={currentPage === totalPages || totalPages === 0}
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
  );
};
