import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, GraduationCap, IdCard, Plus, Search, ShieldCheck, User, Users, X } from 'lucide-react';

import { KPICard } from '@/components/common/KPICard';
import { PageHeader } from '@/components/common/PageHeader';
import { CreateUserModal, TeacherScheduleModal, UserDetailsModal } from '@/components/modals';
import { GenerateCarnetsModal } from '@/features/users/components/GenerateCarnetsModal';
import { UsersTable } from '@/features/users/components/UsersTable';
import { containerVariants } from '@/lib/motion';
import { EDUCATIONAL_STRUCTURE } from '@/data/education';
import { MOCK_USERS } from '@/data/users';
import { ModuleProps, UserItem } from '@/types';

export const UsersModule: React.FC<ModuleProps> = () => {
  // Estado Principal
  const [selectedRole, setSelectedRole] = useState<UserItem['role']>('Estudiante');

  // Filtros
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLevel !== 'Todos') count++;
    if (selectedGrade !== 'Todos') count++;
    if (selectedSection !== 'Todos') count++;
    if (selectedStatus !== 'Todos') count++;
    return count;
  }, [selectedLevel, selectedGrade, selectedSection, selectedStatus]);

  const clearFilters = () => {
    setSelectedLevel('Todos');
    setSelectedGrade('Todos');
    setSelectedSection('Todos');
    setSelectedStatus('Todos');
    setSearch('');
  };

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarnetModalOpen, setIsCarnetModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedTeacherForSchedule, setSelectedTeacherForSchedule] = useState<UserItem | null>(null);
  const [initialModalTab, setInitialModalTab] = useState<'personal' | 'academic' | 'family' | 'account'>('personal');

  // --- LÓGICA DE DATOS ---

  // Filtros en cascada. Al cambiar un filtro se reinician los que dependen de
  // él y se vuelve a la primera página. Se resuelve en los manejadores y no en
  // efectos: así el cambio ocurre en un único render, sin estados intermedios
  // inconsistentes (p. ej. un grado que no pertenece al nivel recién elegido).
  const changeRole = (role: typeof selectedRole) => {
    setSelectedRole(role);
    clearFilters();
    setCurrentPage(1);
  };

  const changeLevel = (level: string) => {
    setSelectedLevel(level);
    setSelectedGrade('Todos');
    setSelectedSection('Todos');
    setCurrentPage(1);
  };

  const changeGrade = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSection('Todos');
    setCurrentPage(1);
  };

  const changeSection = (section: string) => {
    setSelectedSection(section);
    setCurrentPage(1);
  };

  const changeStatus = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Opciones Dinámicas
  const gradeOptions = useMemo(() => {
    if (selectedLevel === 'Todos' || !EDUCATIONAL_STRUCTURE[selectedLevel]) return [];
    return Object.keys(EDUCATIONAL_STRUCTURE[selectedLevel]);
  }, [selectedLevel]);

  const sectionOptions = useMemo(() => {
    if (selectedLevel === 'Todos' || selectedGrade === 'Todos') return [];
    return EDUCATIONAL_STRUCTURE[selectedLevel][selectedGrade] || [];
  }, [selectedLevel, selectedGrade]);

  // Cálculo de Estadísticas (Contadores)
  const stats = useMemo(() => {
    return {
      estudiantes: MOCK_USERS.filter(u => u.role === 'Estudiante').length,
      docentes: MOCK_USERS.filter(u => u.role === 'Docente').length,
      apoderados: MOCK_USERS.filter(u => u.role === 'Apoderado').length,
      administrativos: MOCK_USERS.filter(u => u.role === 'Administrativo').length,
    };
  }, []);

  // Filtrado de Usuarios
  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(u => {
      const matchesRole = u.role === selectedRole;
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.dni.includes(search);
      const matchesLevel = selectedLevel === 'Todos' || u.level === selectedLevel;
      const matchesGrade = selectedGrade === 'Todos' || u.grade === selectedGrade;
      const matchesSection = selectedSection === 'Todos' || u.section === selectedSection;
      const matchesStatus = selectedStatus === 'Todos' || u.status === selectedStatus;

      return matchesRole && matchesSearch && matchesLevel && matchesGrade && matchesSection && matchesStatus;
    });
  }, [search, selectedRole, selectedLevel, selectedGrade, selectedSection, selectedStatus]);

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full flex flex-col font-poppins bg-[#f4f6fa] dark:bg-slate-950 overflow-hidden">
      <div className="flex-none">
      {/* Header Estandarizado */}
      <PageHeader
        title="Usuarios"
        icon={Users}
        className="!pb-2 sm:!pb-4 !rounded-none shadow-sm z-10 relative"
      />
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4 max-w-[1700px] mx-auto w-full min-h-0 overflow-y-auto hidden-scrollbar gap-6">
        {/* Grid Principal Layout Unificado */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch shrink-0">

          {/* FILA 1: Tarjetas KPI */}
          <div className="lg:col-span-1">
            <button
              onClick={() => changeRole('Estudiante')}
              className={`w-full text-left rounded-xl transition-all ${selectedRole === 'Estudiante' ? 'ring-4 ring-blue-500/50' : ''}`}
            >
              <KPICard
                title="Estudiantes"
                value={stats.estudiantes.toString()}
                icon={GraduationCap}
                variant="blue"
              />
            </button>
          </div>
          <div className="lg:col-span-1">
            <button
              onClick={() => changeRole('Apoderado')}
              className={`w-full text-left rounded-xl transition-all ${selectedRole === 'Apoderado' ? 'ring-4 ring-rose-500/50' : ''}`}
            >
              <KPICard
                title="Apoderados"
                value={stats.apoderados.toString()}
                icon={User}
                variant="rose"
              />
            </button>
          </div>
          <div className="lg:col-span-1">
            <button
              onClick={() => changeRole('Docente')}
              className={`w-full text-left rounded-xl transition-all ${selectedRole === 'Docente' ? 'ring-4 ring-emerald-500/50' : ''}`}
            >
              <KPICard
                title="Docentes"
                value={stats.docentes.toString()}
                icon={Briefcase}
                variant="emerald"
              />
            </button>
          </div>
          <div className="lg:col-span-1">
            <button
              onClick={() => changeRole('Administrativo')}
              className={`w-full text-left rounded-xl transition-all ${selectedRole === 'Administrativo' ? 'ring-4 ring-orange-500/50' : ''}`}
            >
              <KPICard
                title="Administrativos"
                value={stats.administrativos.toString()}
                icon={ShieldCheck}
                variant="orange"
              />
            </button>
          </div>

        {/* BARRA DE BÚSQUEDA Y ACCIONES (Columna 1-4) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o documento..."
                      value={search}
                      onChange={(e) => changeSearch(e.target.value)}
                      className="w-full h-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-sm text-base"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                      onClick={() => setIsCarnetModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"
                    >
                      <IdCard size={20} /> Descargar Carnets
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Plus size={20} /> Crear Usuario
                    </button>
                </div>
            </div>

            {/* Info de resultados debajo del buscador */}
            <div className="px-2 mt-1">
                <span className="text-xs font-bold text-gray-500">
                    Mostrando {paginatedUsers.length} de {filteredUsers.length} {selectedRole.toLowerCase()}s
                </span>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 ml-4 px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                    >
                        <X size={12} /> Limpiar filtros
                    </button>
                )}
            </div>
        </div>

        {/* PANEL DERECHO: TABLA (Columna 1-4) */}
        <UsersTable
          paginatedUsers={paginatedUsers}
          selectedRole={selectedRole}
          selectedLevel={selectedLevel}
          changeLevel={changeLevel}
          selectedGrade={selectedGrade}
          changeGrade={changeGrade}
          selectedSection={selectedSection}
          changeSection={changeSection}
          gradeOptions={gradeOptions}
          sectionOptions={sectionOptions}
          selectedStatus={selectedStatus}
          changeStatus={changeStatus}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          setSelectedUser={setSelectedUser}
          setInitialModalTab={setInitialModalTab}
          setSelectedTeacherForSchedule={setSelectedTeacherForSchedule}
          setIsScheduleModalOpen={setIsScheduleModalOpen}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      <AnimatePresence>
        {isModalOpen && <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setSelectedUser(null);
              setInitialModalTab('personal');
            }}
            initialTab={initialModalTab}
          />
        )}
        {isScheduleModalOpen && selectedTeacherForSchedule && (
          <TeacherScheduleModal
            teacher={selectedTeacherForSchedule}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setSelectedTeacherForSchedule(null);
            }}
          />
        )}
        {isCarnetModalOpen && (
          <GenerateCarnetsModal
            onClose={() => setIsCarnetModalOpen(false)}
            selectedLevel={selectedLevel}
            changeLevel={changeLevel}
            selectedGrade={selectedGrade}
            changeGrade={changeGrade}
            selectedSection={selectedSection}
            changeSection={changeSection}
            gradeOptions={gradeOptions}
            sectionOptions={sectionOptions}
          />
        )}
      </AnimatePresence>
      </div>
      </div>
    </motion.div>
  );
};
