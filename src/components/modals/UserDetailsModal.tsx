import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Phone,
  Settings,
  School,
  HeartHandshake,
  Calendar,
  User,
  Hash,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Shield,
  CreditCard,
  Save,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataField, FamilyRow } from '@/components/modals/UserDetailFields';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MOCK_USERS } from '@/data/users';
import { getClassroomLabel } from '@/features/classrooms/overview.format';
import { modalVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ClassroomRef, UserItem } from '@/types';

type UserDetailTab = 'personal' | 'academic' | 'family' | 'account';

interface TabDefinition {
  id: UserDetailTab;
  label: string;
  icon: LucideIcon;
}

/** Mapeo semántico del estado del usuario, mismo criterio que `UsersTable.STATUS_STYLES`. */
const STATUS_BADGE_STYLES: Record<UserItem['status'], string> = {
  Activo: 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Matriculado: 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Inactivo: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
  Suspendido: 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Retirado: 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  Trasladado: 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Egresado: 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export const UserDetailsModal: React.FC<{ user: UserItem; onClose: () => void; initialTab?: UserDetailTab }> = ({ user, onClose, initialTab = 'personal' }) => {
  const isTeacher = user.role === 'Docente';
  const isAdmin = user.role === 'Administrativo';
  const [activeTab, setActiveTab] = useState<UserDetailTab>(initialTab);

  // Simulamos datos de la cuenta
  const [username, setUsername] = useState(user.dni);
  const [password, setPassword] = useState('********');

  // Apoderados reales del alumno (`guardianIds`, vinculados en `data/users.ts`).
  const guardians = useMemo(
    () =>
      (user.guardianIds ?? [])
        .map((id) => MOCK_USERS.find((u) => u.id === id))
        .filter((guardian): guardian is UserItem => !!guardian),
    [user.guardianIds],
  );
  const [notifiedGuardianId, setNotifiedGuardianId] = useState<string | null>(guardians[0]?.id ?? null);

  // Aula que tutela el docente (si tiene una asignada) y las aulas donde dicta clase.
  const tutorClassroom: ClassroomRef | null =
    user.level && user.grade && user.section ? { level: user.level, grade: user.grade, section: user.section } : null;
  const teachingClassrooms = user.classrooms ?? [];

  const isPositiveStatus = user.status === 'Activo' || user.status === 'Matriculado';

  const tabs = useMemo<TabDefinition[]>(() => {
    if (user.role === 'Estudiante') {
      return [
        { id: 'personal', label: 'Datos Personales', icon: User },
        { id: 'academic', label: 'Académico', icon: GraduationCap },
        { id: 'family', label: 'Familia', icon: HeartHandshake }
      ];
    }
    if (user.role === 'Docente') {
      return [
        { id: 'personal', label: 'Datos Personales', icon: User },
        { id: 'academic', label: 'Académico', icon: GraduationCap },
        { id: 'account', label: 'Cuenta', icon: Settings }
      ];
    }
    if (user.role === 'Administrativo') {
      return [
        { id: 'personal', label: 'Datos Personales', icon: User },
        { id: 'account', label: 'Cuenta', icon: Settings }
      ];
    }
    return [{ id: 'personal', label: 'Datos Personales', icon: User }];
  }, [user.role]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-3xl bg-white dark:bg-slate-950 rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Detalles del {user.role}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label={`Cerrar detalles de ${user.role.toLowerCase()}`}
                  className="h-10 w-10 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20}/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cerrar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* --- PROFILE CARD --- */}
        <div className="p-4 shrink-0 pb-0">
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-xl ${user.avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-sm shrink-0`}>
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              
              {/* Info Principal */}
              <div className="flex flex-col justify-center">
                 <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight" title={user.name}>
                    {user.name}
                 </h2>
                 <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-gray-200 bg-gray-100 text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300"
                    >
                      {user.role === 'Estudiante' && <Briefcase size={16} />}
                      {user.role === 'Docente' && <Briefcase size={16} />}
                      {user.role === 'Administrativo' && <Shield size={16} />}
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className={cn('gap-1.5', STATUS_BADGE_STYLES[user.status])}>
                      <span className={cn('h-1 w-1 rounded-full', isPositiveStatus ? 'bg-emerald-500' : 'bg-gray-400')} />
                      {user.status}
                    </Badge>
                 </div>
              </div>
            </div>
            
            {/* Faint Background Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-100 dark:text-slate-800/50 pointer-events-none">
              <User size={80} strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as UserDetailTab)}
          className="flex flex-1 flex-col min-h-0"
        >
          <TabsList className="mt-4 flex h-auto w-full items-stretch justify-start gap-0 rounded-none border-b border-gray-200 bg-transparent p-0 px-4 dark:border-slate-800 shrink-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'group relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-none shadow-none transition-all',
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800/50',
                  'data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:shadow-none dark:data-[state=active]:bg-blue-900/10 dark:data-[state=active]:text-blue-400',
                )}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className="absolute bottom-0 left-0 right-0 hidden h-0.5 bg-blue-600 group-data-[state=active]:block dark:bg-blue-400" />
              </TabsTrigger>
            ))}
          </TabsList>

          {/* --- CONTENT AREA --- */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-white dark:bg-slate-950 scrollbar-hide">
            {/* PESTAÑA PERSONAL */}
            <TabsContent value="personal" className="mt-0 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                    <CreditCard size={20} className="text-gray-900 dark:text-white" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Información de Identidad</h3>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <DataField label="DNI / Documento" value={user.dni} icon={CreditCard} />
                      <DataField label="Fecha Nacimiento" value="09/06/2017" subValue="(8 Años)" icon={Calendar} />
                      {isTeacher ? (
                        <DataField label="Teléfono" value={user.phone || '+51 987 654 321'} icon={Phone} />
                      ) : (
                        <DataField label="Código Modular" value="00000090275274" icon={Hash} />
                      )}
                      <DataField label="Género" value="F" icon={User} />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* PESTAÑA ACADÉMICA */}
            <TabsContent value="academic" className="mt-0 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <School size={20} className="text-gray-900 dark:text-white" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {isTeacher ? 'Información Académica' : 'Situación Académica'}
                      </h3>
                    </div>
                    <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      Año Escolar 2025
                    </Badge>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-slate-800/50">
                    {isTeacher ? (
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Curso que enseña</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">Matemáticas y Razonamiento</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Tutor de</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {tutorClassroom ? `${getClassroomLabel(tutorClassroom)} - ${tutorClassroom.level}` : 'No es tutor de aula'}
                              </p>
                            </div>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Grados y Secciones que imparte</p>
                            <div className="flex flex-wrap gap-2">
                               {teachingClassrooms.length === 0 ? (
                                 <span className="text-sm text-gray-500 dark:text-gray-400">Sin aulas asignadas.</span>
                               ) : (
                                 teachingClassrooms.map((classroom) => (
                                   <span
                                     key={`${classroom.level}-${classroom.grade}-${classroom.section}`}
                                     className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
                                   >
                                     {getClassroomLabel(classroom)}
                                   </span>
                                 ))
                               )}
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nivel Educativo</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{user.level || 'No Asignado'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Grado</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{user.grade || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Sección</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">"{user.section || '-'}"</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {isTeacher ? 'Estado de Docente: Activo' : 'Matrícula Regular'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {isTeacher ? 'El docente se encuentra habilitado para el dictado de clases.' : 'Estudiante sin observaciones académicas pendientes.'}
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* PESTAÑA FAMILIA */}
            <TabsContent value="family" className="mt-0 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                    <HeartHandshake size={20} className="text-gray-900 dark:text-white" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Apoderados Registrados</h3>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    {guardians.length === 0 ? (
                      <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay apoderados vinculados a este alumno.
                      </p>
                    ) : (
                      guardians.map((guardian) => (
                        <FamilyRow
                          key={guardian.id}
                          role={guardian.gender === 'M' ? 'Padre' : 'Madre'}
                          name={guardian.name}
                          dni={guardian.dni}
                          phone={guardian.phone ?? ''}
                          color={guardian.gender === 'M' ? 'blue' : 'pink'}
                          isNotified={notifiedGuardianId === guardian.id}
                          onSetNotified={() => setNotifiedGuardianId(guardian.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* PESTAÑA CUENTA */}
            <TabsContent value="account" className="mt-0 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                 <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                   <Settings size={20} className="text-gray-900 dark:text-white" />
                   <h3 className="text-base font-bold text-gray-900 dark:text-white">Credenciales de Acceso</h3>
                 </div>
                 <div className="p-6 bg-gray-50 dark:bg-slate-800/50 space-y-4">
                     <div className="flex flex-col gap-2">
                       <Label htmlFor="account-username" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</Label>
                       <Input
                         id="account-username"
                         type="text"
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         className="h-12 rounded-xl bg-white text-sm font-bold dark:bg-slate-900"
                       />
                     </div>
                     <div className="flex flex-col gap-2">
                       <Label htmlFor="account-password" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contraseña</Label>
                       <Input
                         id="account-password"
                         type="password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="h-12 rounded-xl bg-white text-sm font-bold dark:bg-slate-900"
                       />
                     </div>
                 </div>
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 rounded-xl px-6 text-xs font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="h-10 gap-2 rounded-xl px-6 text-xs font-bold shadow-lg shadow-blue-500/20 [&_svg]:size-4"
          >
            <Save size={16} /> Guardar Cambios
          </Button>
        </div>

      </motion.div>
    </motion.div>
  );
};
