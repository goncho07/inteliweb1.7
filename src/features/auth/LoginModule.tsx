import React, { useState } from 'react';
import { Lock, ArrowRightCircle, IdCard, Phone, MessageSquare, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserItem } from '@/types';

import { DEMO_ACCOUNTS, DEMO_GUARDIAN, findAccountByDni, findAnyUserByDni, findGuardianByDni } from './accounts';

interface LoginModuleProps {
  onLogin: (user: UserItem) => void;
  config: any;
}

/**
 * Todos los accesos entran por DNI: el personal (directivo/docente/auxiliar)
 * lo escribe junto a una clave (no validada, no hay backend); el apoderado
 * pasa por el flujo de 3 pasos "Vista Apoderado" (DNI → teléfono → código).
 * En ambos casos el DNI se busca en `MOCK_USERS` — no hay una lista de
 * usuarios y contraseñas aparte del padrón simulado.
 */
export const LoginModule: React.FC<LoginModuleProps> = ({ onLogin, config }) => {
  const [view, setView] = useState<'login' | 'parent-dni' | 'parent-phone' | 'parent-code'>('login');

  // Login de personal (Directivo/Docente/Auxiliar)
  const [staffDni, setStaffDni] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState<string | null>(null);

  // Flujo Apoderado
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [parentError, setParentError] = useState<string | null>(null);
  const [guardian, setGuardian] = useState<UserItem | null>(null);

  const handleStaffSubmit = () => {
    const trimmedDni = staffDni.trim();
    const account = findAccountByDni(trimmedDni);
    if (account) {
      setStaffError(null);
      onLogin(account);
      return;
    }
    const existing = findAnyUserByDni(trimmedDni);
    setStaffError(existing ? 'Este DNI no tiene acceso al sistema.' : 'DNI no encontrado.');
  };

  const handleDniSubmit = () => {
    const found = findGuardianByDni(dni);
    if (found) {
      setParentError(null);
      setGuardian(found);
      setTimeout(() => {
        setView('parent-phone');
      }, 1500);
    } else {
      setParentError('DNI no encontrado entre los apoderados registrados.');
    }
  };

  const handlePhoneSubmit = () => {
    if (phone.length >= 9) {
      setView('parent-code');
    }
  };

  const handleCodeSubmit = () => {
    if (code.length >= 4 && guardian) {
      onLogin(guardian);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950">
      <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">
        <img
          src={config.loginBg}
          alt="Fondo"
          className="w-full h-full object-cover object-bottom"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-indigo-900/60 to-transparent backdrop-blur-[2px] flex flex-col items-start justify-end p-12 text-white">
            {/* Texto eliminado por solicitud */}
        </div>
      </div>
      <div className="w-full lg:w-[40%] flex items-center justify-center p-12 bg-gray-50 dark:bg-slate-900 overflow-y-auto">
        <div className="w-full max-w-lg space-y-10">
           <div className="text-center">
              {/* Logo Modo Claro */}
              <img
                src="https://media.discordapp.net/attachments/1383264716536680462/1455043534494367827/Diseno_sin_titulo_45.png?ex=696e5124&is=696cffa4&hm=83585ffcd7a01b2e8091a34fd0aa1c3f472c1f985fe0e32e05f8ac225af32f0a&=&format=webp&quality=lossless&width=1407&height=791"
                alt="Logo"
                className="mx-auto h-64 mb-8 object-contain dark:hidden"
                referrerPolicy="no-referrer"
              />
              {/* Logo Modo Oscuro (Mantiene el original) */}
              <img
                src={config.schoolLogo}
                alt="Logo"
                className="mx-auto h-64 mb-8 object-contain hidden dark:block"
                referrerPolicy="no-referrer"
              />

              {view === 'login' && (
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Bienvenido</h2>
              )}
              {view !== 'login' && (
                <div className="flex items-center justify-center gap-3 mb-2 relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setView('login')}
                        aria-label="Volver"
                        className="absolute left-0 h-10 w-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 [&_svg]:size-6"
                      >
                        <ArrowLeft size={24} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Volver</TooltipContent>
                  </Tooltip>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vista Apoderado</h2>
                </div>
              )}
           </div>

           {view === 'login' && (
             <>
               <div className="space-y-5">
                  <div>
                    <div className="relative">
                      <IdCard size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="DNI"
                        value={staffDni}
                        onChange={(e) => {
                          setStaffDni(e.target.value);
                          setStaffError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleStaffSubmit()}
                        className="h-auto w-full pl-14 pr-6 py-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:text-white text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <Lock size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <Input
                        type="password"
                        placeholder="Clave"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStaffSubmit()}
                        className="h-auto w-full pl-14 pr-6 py-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:text-white text-lg"
                      />
                    </div>
                    <p className="mt-2 ml-1 text-sm text-slate-400 dark:text-slate-500">
                      Datos simulados: cualquier clave es válida.
                    </p>
                  </div>
                  {staffError && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-400">
                      <AlertCircle size={18} className="shrink-0" />
                      {staffError}
                    </div>
                  )}
               </div>
               <div className="space-y-4">
                 <Button
                   type="button"
                   onClick={handleStaffSubmit}
                   className="h-auto w-full gap-3 rounded-xl bg-blue-600 py-6 text-xl font-bold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] [&_svg]:size-7"
                 >
                   Ingresar <ArrowRightCircle size={28}/>
                 </Button>
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => {
                     setParentError(null);
                     setView('parent-dni');
                   }}
                   className="h-auto w-full gap-3 rounded-xl border-slate-200 bg-white py-6 text-xl font-bold text-slate-700 shadow-sm transition-transform hover:scale-[1.02] hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 [&_svg]:size-7"
                 >
                   <Phone size={28}/> Vista Apoderado
                 </Button>
               </div>

               {DEMO_ACCOUNTS.length > 0 && (
                 <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
                   <p className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                     Cuentas de demostración
                   </p>
                   <div className="flex flex-wrap gap-2">
                     {DEMO_ACCOUNTS.map((account) => (
                       <Button
                         key={account.role}
                         type="button"
                         variant="secondary"
                         onClick={() => {
                           setStaffDni(account.user.dni);
                           setStaffError(null);
                         }}
                         className="h-10 rounded-lg text-sm font-semibold"
                       >
                         {account.label}: {account.user.dni}
                       </Button>
                     ))}
                   </div>
                 </div>
               )}
             </>
           )}

           {view === 'parent-dni' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <p className="text-slate-500 dark:text-slate-400">Ingrese su DNI para verificar su identidad en la base de datos del colegio.</p>
                </div>
                {guardian ? (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl flex flex-col items-center justify-center gap-3 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Apoderado Verificado</p>
                      <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{guardian.name}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <IdCard size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Número de DNI"
                        value={dni}
                        onChange={(e) => {
                          setDni(e.target.value);
                          setParentError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleDniSubmit()}
                        className="h-auto w-full pl-14 pr-6 py-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:text-white text-lg"
                      />
                    </div>
                    {parentError && (
                      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-400">
                        <AlertCircle size={18} className="shrink-0" />
                        {parentError}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={handleDniSubmit}
                      className="h-auto w-full gap-3 rounded-xl bg-blue-600 py-6 text-xl font-bold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] [&_svg]:size-7"
                    >
                      Verificar DNI <ArrowRightCircle size={28}/>
                    </Button>
                    {DEMO_GUARDIAN && (
                      <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                        DNI de demostración: {DEMO_GUARDIAN.dni}
                      </p>
                    )}
                  </>
                )}
             </div>
           )}

           {view === 'parent-phone' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <p className="text-slate-500 dark:text-slate-400">Hola, <span className="font-bold text-slate-800 dark:text-slate-200">{guardian?.name}</span>. Ingrese su número de celular para enviarle un código de seguridad por WhatsApp.</p>
                </div>
                <div className="relative">
                  <Phone size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <Input
                    type="tel"
                    placeholder="Número de Celular"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                    className="h-auto w-full pl-14 pr-6 py-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:text-white text-lg"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handlePhoneSubmit}
                  className="h-auto w-full gap-3 rounded-xl bg-[#25D366] py-6 text-xl font-bold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-[#128C7E] active:scale-[0.98] [&_svg]:size-7"
                >
                  Enviar Código <MessageSquare size={28}/>
                </Button>
             </div>
           )}

           {view === 'parent-code' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <p className="text-slate-500 dark:text-slate-400">Hemos enviado un código por WhatsApp al <span className="font-bold text-slate-800 dark:text-slate-200">{phone}</span>.</p>
                </div>
                <div className="relative">
                  <Lock size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <Input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                    className="h-auto w-full pl-14 pr-6 py-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100 dark:text-white text-lg text-center tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleCodeSubmit}
                  className="h-auto w-full gap-3 rounded-xl bg-blue-600 py-6 text-xl font-bold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98] [&_svg]:size-7"
                >
                  Acceder a la Vista <ArrowRightCircle size={28}/>
                </Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
