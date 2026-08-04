import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IdCard, Plus, Search, Users, X } from 'lucide-react';

import { ModuleBody, ModulePane, ModulePaneHeader, ModuleShell, ModuleSidebar } from '@/components/layout/ModuleShell';
import { CreateUserModal, TeacherScheduleModal, UserDetailsModal } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GenerateCarnetsModal } from '@/features/users/components/GenerateCarnetsModal';
import { RoleFilterPanel } from '@/features/users/components/RoleFilterPanel';
import { UsersTable } from '@/features/users/components/UsersTable';
import { EDUCATIONAL_STRUCTURE } from '@/data/education';
import { MOCK_USERS } from '@/data/users';
import { ModuleProps, UserItem } from '@/types';

const ROLE_PLURAL: Record<UserItem['role'], string> = {
  Estudiante: 'Estudiantes',
  Apoderado: 'Apoderados',
  Docente: 'Docentes',
  Administrativo: 'Administrativos',
};

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
    <ModuleShell>
      <ModuleSidebar title="Usuarios" icon={Users}>
        <div className="hidden-scrollbar flex-1 space-y-6 overflow-y-auto p-3">
          <div>
            <div className="px-2 pb-1 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de usuario</h3>
            </div>
            <RoleFilterPanel selectedRole={selectedRole} onSelectRole={changeRole} stats={stats} />
          </div>
        </div>
      </ModuleSidebar>

      <ModulePane>
        <ModulePaneHeader>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
              <IdCard size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-800 dark:text-white">
                {ROLE_PLURAL[selectedRole]}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'registrado' : 'registrados'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCarnetModalOpen(true)}
              className="h-10 rounded-xl px-4 font-bold shadow-sm"
            >
              <IdCard size={18} /> Descargar carnets
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="h-10 rounded-xl px-4 font-bold shadow-sm">
              <Plus size={18} /> Crear usuario
            </Button>
          </div>
        </ModulePaneHeader>

        <ModuleBody centered>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="h-12 rounded-xl pl-12 text-base shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 px-2">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Mostrando {paginatedUsers.length} de {filteredUsers.length} {ROLE_PLURAL[selectedRole].toLowerCase()}
            </span>
            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="h-10 gap-2 px-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <X size={16} /> Limpiar filtros
              </Button>
            )}
          </div>

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
        </ModuleBody>
      </ModulePane>

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
    </ModuleShell>
  );
};
