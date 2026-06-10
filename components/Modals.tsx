import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, Mail, Phone, MapPin, Settings, Bot, Loader2, Send, School, BookOpen, HeartHandshake, Calendar, User, Hash, Baby, Clock, CheckCircle2, BadgeCheck, GraduationCap, Briefcase, Shield, CreditCard, IdCard, Pencil, Bell, SquarePen, Save, Download, ChevronDown, HelpCircle } from 'lucide-react';
import { UserItem, ChatMessage } from '../types';
import { sendMessageToAI } from '../services/geminiService';

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

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

export const TeacherScheduleModal: React.FC<{ teacher: UserItem; onClose: () => void }> = ({ teacher, onClose }) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = ['08:00 - 09:30', '09:30 - 11:00', '11:00 - 11:30', '11:30 - 13:00', '13:00 - 14:30'];
  
  const scheduleData = [
    ['Matemática', 'Física', 'RECREO', 'Matemática', 'Tutoría'],
    ['Raz. Mat.', 'Matemática', 'RECREO', 'Física', 'Raz. Mat.'],
    ['Matemática', 'Raz. Mat.', 'RECREO', 'Matemática', 'Libre'],
    ['Física', 'Matemática', 'RECREO', 'Raz. Mat.', 'Matemática'],
    ['Matemática', 'Física', 'RECREO', 'Matemática', 'Raz. Mat.']
  ];

  const downloadSchedulePDF = () => {
    // @ts-ignore
    import('jspdf').then(({ default: jsPDF }) => {
      // @ts-ignore
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('HORARIO ESCOLAR 2025', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`DOCENTE: ${teacher.name.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });
        
        const tableBody = hours.map((hour, i) => [hour, ...scheduleData.map(day => day[i])]);

        autoTable(doc, {
          startY: 30,
          head: [['HORA', ...days]],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], halign: 'center' },
          bodyStyles: { halign: 'center', fontSize: 10 },
          columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
        });

        doc.save(`Horario_${teacher.name.replace(/\s+/g, '_')}.pdf`);
      });
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <motion.div 
        variants={modalVariants} 
        initial="hidden" 
        animate="visible" 
        exit="exit" 
        className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-sm">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Horario del Docente</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{teacher.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadSchedulePDF}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Download size={16} /> Descargar PDF
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <X size={24}/>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                {days.map(day => (
                  <th key={day} className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, i) => (
                <tr key={hour}>
                  <td className="p-3 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-slate-900/50">{hour}</td>
                  {scheduleData.map((day, j) => (
                    <td key={j} className={`p-3 border border-gray-200 dark:border-slate-800 text-xs font-medium text-center ${day[i] === 'RECREO' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                      {day[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- SUB-COMPONENTES TRADICIONALES ---

const DataField = ({ label, value, subValue, icon: Icon }: any) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0">
            <Icon size={18}/>
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <div className="flex items-center gap-2">
               <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                   {value} {subValue && <span className="text-xs font-medium text-gray-500 ml-1">{subValue}</span>}
               </p>
            </div>
        </div>
    </div>
);

const FamilyRow = ({ role, name, dni, phone, color, isNotified, onSetNotified }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPhone, setEditedPhone] = useState(phone);
    const [editedName, setEditedName] = useState(name);
    const [editedDni, setEditedDni] = useState(dni);

    const isPink = color === 'pink';
    const textClass = isPink ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400';
    const bgClass = isPink ? 'bg-pink-50 dark:bg-pink-900/20' : 'bg-blue-50 dark:bg-blue-900/20';
    const borderClass = isPink ? 'border-pink-100 dark:border-pink-800' : 'border-blue-100 dark:border-blue-800';
        
    return (
        <div className={`p-6 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all flex flex-col gap-6 ${isNotified ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-sm border ${bgClass} ${textClass} ${borderClass}`}>
                        {role[0]}
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nombre Completo</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={editedName} 
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">DNI / Documento</label>
                                    <div className="relative">
                                        <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={editedDni} 
                                            onChange={(e) => setEditedDni(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="DNI"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Teléfono de Contacto</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={editedPhone} 
                                            onChange={(e) => setEditedPhone(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="Teléfono"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-1.5">
                                    <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">{editedName}</p>
                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${bgClass} ${textClass} ${borderClass}`}>
                                        {role}
                                    </span>
                                    {isNotified && (
                                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800 uppercase">
                                            <Bell size={10} /> Apoderado
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                        <IdCard size={14} className="text-gray-400"/> 
                                        <span className="text-gray-900 dark:text-gray-200">{editedDni}</span>
                                    </span>
                                    <span className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                                        <Phone size={14} className="text-gray-400"/> 
                                        <span className="text-gray-900 dark:text-gray-200">+51 {editedPhone}</span>
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
                            >
                                Guardar
                            </button>
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedName(name);
                                    setEditedPhone(phone);
                                    setEditedDni(dni);
                                }}
                                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs font-black rounded-xl transition-all uppercase tracking-wider"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-wider"
                        >
                            <Pencil size={14}/>
                            Editar
                        </button>
                    )}
                </div>
            </div>

            {/* APODERADO TOGGLE SECTION */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isNotified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Recibir Notificaciones</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Designar como apoderado principal para avisos y alertas.</p>
                    </div>
                </div>
                
                <button 
                    onClick={onSetNotified}
                    disabled={isNotified}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${isNotified ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${isNotified ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    );
};

export const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [type, setType] = useState('Estudiante');
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center items-center p-4" onClick={onClose}>
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 p-8 flex justify-between items-center text-white"><h2 className="text-2xl font-bold">Nuevo Registro</h2><button onClick={onClose}><X/></button></div>
        <div className="p-8 space-y-6">
           <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none"><option>Estudiante</option><option>Docente</option><option>Administrativo</option></select>
           <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none" placeholder="Nombre Completo"/>
           <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none" placeholder="DNI"/>
           <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl">Registrar</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const AIChatPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', text: "Bienvenida Lisha. Soy Peepos AI. ¿Deseas generar un reporte financiero o inscribir un nuevo alumno?" }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!input.trim()) return;
    
    const userMsg = input; 
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]); 
    setInput(''); 
    setLoading(true);
    
    try {
      const responseText = await sendMessageToAI(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch { 
      setMessages(prev => [...prev, { role: 'ai', text: "Error de red." }]); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <AnimatePresence>{isOpen && (
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="absolute bottom-8 right-8 w-[350px] bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col h-[520px]">
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white shrink-0 shadow-lg relative"><div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Bot size={22}/></div><div><p className="font-bold text-sm leading-none">Peepos AI</p><p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest mt-1">Inteligencia Administrativa</p></div></div><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-slate-800/50 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 text-xs font-medium leading-relaxed rounded-xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-tl-none'}`}>{m.text}</div></div>
          ))}
          {loading && <Loader2 size={18} className="animate-spin text-blue-600 mx-auto" />}<div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-3 shrink-0"><input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-xl px-5 py-4 text-xs font-semibold outline-none" placeholder="Hazme una pregunta..." /><button type="submit" className="p-4 bg-blue-600 text-white rounded-xl"><Send size={20}/></button></form>
      </motion.div>
    )}</AnimatePresence>
  );
};

export const HelpCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex justify-center items-center p-4" onClick={onClose}>
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-y-auto border border-gray-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                <HelpCircle size={24} />
              </span>
              Ayuda y Soporte
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <X size={24}/>
            </button>
          </div>
          
          <div className="p-8 space-y-12">
            
            {/* Soporte y Emergencias */}
            <div className="text-center bg-gray-50 dark:bg-slate-900/50 rounded-xl p-8 border border-gray-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Soporte y Emergencias:</h3>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6">
                Para cualquier duda o problema con el módulo o App, comunicarse al:
              </p>
              <div className="flex flex-col items-center gap-2 mb-8">
                <a href="tel:+51960960752" className="text-3xl font-black text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 transition-colors">
                  +51 960 960 752
                </a>
                <a href="tel:+51934973356" className="text-3xl font-black text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 transition-colors">
                  +51 934 973 356
                </a>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 dark:text-white mb-2">Horario de Atención:</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  Lunes a Viernes: 7:00 am - 16:00 pm
                </p>
              </div>
            </div>

            {/* Manuales y Tutoriales */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-800 pb-2">
                Manuales y Videos Tutoriales
              </h3>
              <div className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-xl transition-colors border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Manual del Docente (PDF)</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toda la información necesaria paso a paso.</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-xl transition-colors border border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Video Tutorial: Creación de Citaciones</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mira cómo mandar un aviso a los padres de familia.</p>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};