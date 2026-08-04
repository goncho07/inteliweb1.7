import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Bell, Key, Camera, Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { containerVariants } from '@/lib/motion';
import { useSession } from '@/features/auth/SessionContext';
import { ROLE_LABEL } from '@/features/auth/session';
import { ModuleProps } from '@/types';

export const ProfileModule: React.FC<ModuleProps> = () => {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'notifications' | 'appearance'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const themeMode = (window as any).currentGlobalThemeMode || 'azul';
  const setThemeMode = (window as any).setGlobalThemeMode || (() => {});

  const [userData, setUserData] = useState({
    name: session.user.name,
    role: ROLE_LABEL[session.role],
    email: session.user.email,
    phone: session.user.phone ?? '',
    address: session.user.address ?? '',
    bio: '',
  });

  const initials = userData.name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="h-full flex flex-col font-poppins bg-[#f4f6fa] dark:bg-slate-950 overflow-hidden"
    >
      <div className="flex-none">
        <PageHeader
          title="Mi Perfil"
          icon={User}
          className="!pb-2 sm:!pb-4 !rounded-none shadow-sm z-10 relative"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4 flex flex-col w-full max-w-[1700px] mx-auto min-h-0 hidden-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-full">
        
        {/* Columna Izquierda: Tarjeta de Perfil */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-max">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            {/* Header de la tarjeta */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500 relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Cambiar foto de portada"
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 hover:text-white"
                  >
                    <Camera size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cambiar foto de portada</TooltipContent>
              </Tooltip>
            </div>

            {/* Avatar y Datos Básicos */}
            <div className="px-6 pb-6 relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 p-1.5 -mt-12 relative z-10">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                  {initials}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Cambiar foto de perfil"
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full border-2 border-white bg-blue-600 p-0 text-white hover:bg-blue-700 hover:text-white dark:border-slate-900"
                    >
                      <Camera size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cambiar foto de perfil</TooltipContent>
                </Tooltip>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">{userData.name}</h3>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{userData.role}</p>
              
              <div className="w-full h-px bg-gray-100 dark:bg-slate-800 my-5"></div>
              
              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 truncate font-medium">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 shrink-0">
                    <Phone size={16} />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{userData.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{userData.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de la cuenta */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8">
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-emerald-500" /> Estado de la Cuenta
            </h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Verificación de Email</span>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-black tracking-wide uppercase rounded-lg flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={14} /> Verificado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Autenticación 2FA</span>
                <span className="px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-black tracking-wide uppercase rounded-lg border border-transparent shadow-sm">
                  Inactivo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Último acceso</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">Hoy, 08:30 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Contenido de Pestañas */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full overflow-hidden">
            
            {/* Navegación de Pestañas */}
            <div className="flex p-2 gap-1 overflow-x-auto scrollbar-hide shrink-0 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveTab('info')}
                aria-pressed={activeTab === 'info'}
                className={cn(
                  'h-auto min-w-[140px] flex-1 gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                  activeTab === 'info'
                    ? 'bg-white text-base text-blue-600 shadow-sm hover:bg-white hover:text-blue-600 dark:bg-slate-900 dark:hover:bg-slate-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-300',
                )}
              >
                <User size={18} /> Personal
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveTab('security')}
                aria-pressed={activeTab === 'security'}
                className={cn(
                  'h-auto min-w-[140px] flex-1 gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                  activeTab === 'security'
                    ? 'bg-white text-base text-blue-600 shadow-sm hover:bg-white hover:text-blue-600 dark:bg-slate-900 dark:hover:bg-slate-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-300',
                )}
              >
                <Key size={18} /> Seguridad
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveTab('notifications')}
                aria-pressed={activeTab === 'notifications'}
                className={cn(
                  'h-auto min-w-[140px] flex-1 gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                  activeTab === 'notifications'
                    ? 'bg-white text-base text-blue-600 shadow-sm hover:bg-white hover:text-blue-600 dark:bg-slate-900 dark:hover:bg-slate-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-300',
                )}
              >
                <Bell size={18} /> Alertas
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveTab('appearance')}
                aria-pressed={activeTab === 'appearance'}
                className={cn(
                  'h-auto min-w-[140px] flex-1 gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition-all',
                  activeTab === 'appearance'
                    ? 'bg-white text-base text-blue-600 shadow-sm hover:bg-white hover:text-blue-600 dark:bg-slate-900 dark:hover:bg-slate-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-gray-300',
                )}
              >
                <Shield size={18} /> Apariencia
              </Button>
            </div>

            {/* Contenido de la Pestaña */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto scrollbar-hide">
              {activeTab === 'info' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Datos Personales</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nombres Completos</label>
                      <input 
                        type="text" 
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        className="w-full px-5 py-3 h-[52px] bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl text-base font-bold text-gray-900 dark:text-white outline-none hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Cargo / Rol</label>
                      <input 
                        type="text" 
                        value={userData.role}
                        disabled
                        className="w-full px-5 py-3 h-[52px] bg-gray-100 dark:bg-slate-800/80 border border-transparent rounded-xl text-base font-bold text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Correo Electrónico</label>
                      <input 
                        type="email" 
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="w-full px-5 py-3 h-[52px] bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl text-base font-bold text-gray-900 dark:text-white outline-none hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Teléfono</label>
                      <input 
                        type="tel" 
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="w-full px-5 py-3 h-[52px] bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl text-base font-bold text-gray-900 dark:text-white outline-none hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Dirección</label>
                      <input 
                        type="text" 
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        className="w-full px-5 py-3 h-[52px] bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl text-base font-bold text-gray-900 dark:text-white outline-none hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Biografía / Notas</label>
                      <textarea 
                        rows={4}
                        value={userData.bio}
                        onChange={(e) => setUserData({...userData, bio: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl text-base font-medium text-gray-900 dark:text-white outline-none hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-sm"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cambiar Contraseña</h3>
                  
                  <div className="max-w-md space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Contraseña Actual</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nueva Contraseña</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirmar Nueva Contraseña</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Requisitos de la contraseña:</h4>
                      <ul className="space-y-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Mínimo 8 caracteres</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Al menos una letra mayúscula</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Al menos un número</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-gray-300 dark:text-slate-600"/> Al menos un carácter especial (!@#$%^&*)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preferencias de Notificación</h3>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'Notificaciones Push', desc: 'Recibir alertas en el navegador mientras usas la aplicación.', active: true },
                      { title: 'Correos de Resumen Semanal', desc: 'Recibir un resumen de la actividad de la semana cada lunes.', active: true },
                      { title: 'Alertas de Incidencias', desc: 'Notificarme inmediatamente cuando se registre una incidencia grave.', active: true },
                      { title: 'Actualizaciones del Sistema', desc: 'Recibir correos sobre nuevas funcionalidades y mantenimientos.', active: false },
                      { title: 'Mensajes Directos', desc: 'Notificarme cuando reciba un mensaje de otro usuario.', active: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="pr-4">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Temas del Sistema</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setThemeMode('azul')}
                      aria-pressed={themeMode === 'azul'}
                      className={cn(
                        'relative h-auto flex-col items-start whitespace-normal rounded-2xl border p-6 text-left font-normal transition-all [&_svg]:size-4',
                        themeMode === 'azul'
                          ? 'border-blue-600 bg-blue-50/50 hover:bg-blue-50/50 dark:bg-blue-900/40 dark:hover:bg-blue-900/40'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-transparent dark:border-slate-700',
                      )}
                    >
                      {themeMode === 'azul' && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 shadow-sm"></div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Azul (Por defecto)</span>
                      </div>
                      <p className="text-base text-gray-500 dark:text-gray-400 font-medium">Tema estándar con el color azul principal y acentos celestes, ideal para alta usabilidad y legibilidad.</p>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setThemeMode('rojo')}
                      aria-pressed={themeMode === 'rojo'}
                      className={cn(
                        'relative h-auto flex-col items-start whitespace-normal rounded-2xl border p-6 text-left font-normal transition-all [&_svg]:size-4',
                        themeMode === 'rojo'
                          ? 'border-rose-600 bg-rose-50/50 hover:bg-rose-50/50 dark:bg-rose-900/40 dark:hover:bg-rose-900/40'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-transparent dark:border-slate-700',
                      )}
                    >
                      {themeMode === 'rojo' && (
                        <div className="absolute top-4 right-4 bg-rose-600 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-rose-600 shadow-sm"></div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Institucional (Rojo)</span>
                      </div>
                      <p className="text-base text-gray-500 dark:text-gray-400 font-medium">Tema que utiliza los colores institucionales (Rojo Ugel) para mantener una consistencia visual unificada y estandar.</p>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con Botón de Guardar */}
            <div className="px-6 py-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end gap-4 shrink-0 rounded-b-2xl">
              {showSuccess && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={18} /> Cambios guardados
                </span>
              )}
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-auto gap-2 rounded-xl bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Save size={18} /> Guardar Cambios</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};
