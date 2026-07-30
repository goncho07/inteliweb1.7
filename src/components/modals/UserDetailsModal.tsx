import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Settings, School, HeartHandshake, Calendar, User, Hash, CheckCircle2, GraduationCap, Briefcase, Shield, CreditCard, Save } from 'lucide-react';
import { DataField, FamilyRow } from '@/components/modals/UserDetailFields';
import { modalVariants } from '@/lib/motion';
import type { UserItem } from '@/types';

export const UserDetailsModal: React.FC<{ user: UserItem; onClose: () => void; initialTab?: 'personal' | 'academic' | 'family' | 'account' }> = ({ user, onClose, initialTab = 'personal' }) => {
  const isTeacher = user.role === 'Docente';
  const isAdmin = user.role === 'Administrativo';
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'family' | 'account'>(initialTab);
  const [notifiedParent, setNotifiedParent] = useState<'Padre' | 'Madre'>('Padre');
  
  // Simulamos datos de la cuenta
  const [username, setUsername] = useState(user.dni);
  const [password, setPassword] = useState('********');

  // Simulamos datos de los padres basados en el apellido del estudiante
  const apellidos = user.name.split(' ').slice(1);
  const fatherName = `${apellidos[0] || 'Padre'} ${apellidos[1] || ''}`;
  const motherName = `${apellidos[1] || 'Madre'} de ${apellidos[0] || ''}`;

  const tabs = useMemo(() => {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <motion.div 
        variants={modalVariants} 
        initial="hidden" 
        animate="visible" 
        exit="exit" 
        className="w-full max-w-3xl bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Detalles del {user.role}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20}/>
          </button>
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-[9px] font-bold uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                      {user.role === 'Estudiante' && <Briefcase size={10}/>}
                      {user.role === 'Docente' && <Briefcase size={10}/>}
                      {user.role === 'Administrativo' && <Shield size={10}/>}
                      {user.role}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${user.status === 'Activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700'}`}>
                      <span className={`w-1 h-1 rounded-full ${user.status === 'Activo' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {user.status === 'Activo' ? (isTeacher ? 'ACTIVO' : 'MATRICULADO') : user.status.toUpperCase()}
                    </span>
                 </div>
              </div>
            </div>
            
            {/* Faint Background Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-100 dark:text-slate-800/50 pointer-events-none">
              <User size={80} strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div className="px-4 mt-4 flex border-b border-gray-200 dark:border-slate-800 shrink-0">
           {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all relative rounded-t-lg ${isActive ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800/50'}`}
               >
                 <tab.icon size={14} />
                 {tab.label}
                 
                 {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400" />}
               </button>
             );
           })}
        </div>
        
        {/* --- CONTENT AREA --- */}
        <div className="h-[380px] overflow-y-auto p-4 bg-white dark:bg-slate-950 scrollbar-hide">
           <AnimatePresence mode="wait">
             
             {/* PESTAÑA PERSONAL */}
             {activeTab === 'personal' && (
               <motion.div 
                 key="personal"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-6"
               >
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
             )}

             {/* PESTAÑA ACADÉMICA */}
             {activeTab === 'academic' && (
               <motion.div 
                 key="academic"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-6"
               >
                  <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <School size={20} className="text-gray-900 dark:text-white" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {isTeacher ? 'Información Académica' : 'Situación Académica'}
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-800">Año Escolar 2025</span>
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
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">5to de Secundaria - A</p>
                              </div>
                           </div>
                           <div>
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Grados y Secciones que imparte</p>
                              <div className="flex flex-wrap gap-2">
                                 {['1ro A', '1ro B', '2do A', '3ro C', '4to B', '5to A'].map(aula => (
                                   <span key={aula} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300">
                                     {aula}
                                   </span>
                                 ))}
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
             )}

             {/* PESTAÑA FAMILIA */}
             {activeTab === 'family' && (
               <motion.div 
                 key="family"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-6"
               >
                  <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                      <HeartHandshake size={20} className="text-gray-900 dark:text-white" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Apoderados Registrados</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <FamilyRow 
                        role="Padre" 
                        name={fatherName} 
                        dni="10293847" 
                        phone="987 654 321" 
                        color="blue"
                        isNotified={notifiedParent === 'Padre'}
                        onSetNotified={() => setNotifiedParent('Padre')}
                      />
                      <FamilyRow 
                        role="Madre" 
                        name={motherName} 
                        dni="09876543" 
                        phone="912 345 678" 
                        color="pink"
                        isNotified={notifiedParent === 'Madre'}
                        onSetNotified={() => setNotifiedParent('Madre')}
                      />
                    </div>
                  </div>
               </motion.div>
             )}

             {/* PESTAÑA CUENTA */}
             {activeTab === 'account' && (
               <motion.div 
                 key="account"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
                 className="space-y-6"
               >
                 <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                   <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                     <Settings size={20} className="text-gray-900 dark:text-white" />
                     <h3 className="text-base font-bold text-gray-900 dark:text-white">Credenciales de Acceso</h3>
                   </div>
                   <div className="p-6 bg-gray-50 dark:bg-slate-800/50 space-y-4">
                       <div className="flex flex-col gap-2">
                         <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</label>
                         <input 
                           type="text" 
                           value={username} 
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                         />
                       </div>
                       <div className="flex flex-col gap-2">
                         <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contraseña</label>
                         <input 
                           type="password" 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                         />
                       </div>
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Save size={14} /> Guardar Cambios
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
