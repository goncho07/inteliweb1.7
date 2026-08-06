import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Bot, Moon, Sun, HelpCircle, CalendarDays, Menu } from 'lucide-react';

import { ModuleFallback } from '@/components/common/ModuleFallback';
import { AIChatPanel, HelpCenterModal } from '@/components/modals';
import { SidebarItem } from '@/components/layout/SidebarItem';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { APP_CONFIG } from '@/config/app';
import { MENU_CONFIG, preloadModules } from '@/config/menu';
import { LoginModule } from '@/features/auth/LoginModule';
import { ROLE_LABEL, buildSession, type Session } from '@/features/auth/session';
import { SessionProvider } from '@/features/auth/SessionContext';
import { forgetRememberedUser, getRememberedUserId, rememberUser } from '@/features/auth/sessionStorage';
import { MOCK_USERS } from '@/data/users';
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { ProfileIdentityProvider } from '@/features/profile/ProfileIdentityContext';
import { ThemeProvider } from '@/features/theme/ThemeContext';
import type { AppRole, ModuleId, UserItem } from '@/types';

/** Herramientas del riel que no son un módulo de `MENU_CONFIG` (no tienen componente propio). */
const TOOL_ROLES: Record<'calendar' | 'assistant' | 'help', AppRole[]> = {
  calendar: ['directivo', 'docente', 'auxiliar', 'apoderado'],
  assistant: ['directivo', 'docente', 'auxiliar'],
  help: ['directivo', 'docente', 'auxiliar', 'apoderado'],
};

/**
 * Sesión con la que arranca la app cuando el DNI recordado (`getRememberedUserId`)
 * sigue teniendo acceso al sistema. `useState(() => …)` la resuelve una sola
 * vez, antes del primer render, para que la pantalla de acceso ni se llegue a
 * dibujar cuando hay una sesión que restaurar.
 */
const resolveRememberedSession = (): Session | null => {
  const rememberedId = getRememberedUserId();
  if (!rememberedId) return null;

  const user = MOCK_USERS.find((u) => u.id === rememberedId && !!u.appRole);
  if (!user) {
    forgetRememberedUser();
    return null;
  }
  return buildSession(user);
};

export default function App() {
  const [session, setSession] = useState<Session | null>(resolveRememberedSession);
  const [currentView, setCurrentView] = useState<ModuleId>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalDate, setGlobalDate] = useState<Date>(new Date(2026, 2, 18));

  // Estado Global
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"azul" | "rojo">("azul");
  // Rail compacto por defecto: el sidebar interno de cada módulo ya ocupa su
  // propio ancho, así que el rail principal arranca angosto y solo se
  // expande si el docente lo pide.
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Identidad visible del usuario (foto y nombre a mostrar). Vive aquí y no en
  // `ProfileModule` porque el riel también la enseña: si el estado viviera
  // dentro del módulo, subir una foto no la aplicaría a esta tarjeta.
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');

  // Manejo del Modo Oscuro y Tema Rojo
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Theme Rojo Override
    if (themeMode === "rojo") {
      document.documentElement.setAttribute("data-theme", "rojo");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDarkMode, themeMode]);

  // Precarga en segundo plano de los módulos accesibles para este rol,
  // apenas el usuario entra, para que cambiar de sección se sienta instantáneo.
  useEffect(() => {
    if (session) {
      preloadModules(session.role);
    }
  }, [session]);

  // Evento global para abrir ayuda
  useEffect(() => {
    const handleOpenHelpEvent = () => setIsHelpModalOpen(true);

    window.addEventListener("openHelp", handleOpenHelpEvent);
    return () => {
      window.removeEventListener("openHelp", handleOpenHelpEvent);
    };
  }, []);

  // Ítems del riel visibles para el rol actual (respeta `hidden` y `roles`).
  const visibleMenuItems = useMemo(
    () => (session ? MENU_CONFIG.filter((item) => !item.hidden && item.roles.includes(session.role)) : []),
    [session],
  );

  // Dynamic View Resolver: si `currentView` no es accesible para el rol (p.ej. tras un cambio de
  // sesión), cae al primer módulo permitido en vez de renderizar algo fuera de alcance.
  const ActiveComponent = useMemo(() => {
    if (!session) return MENU_CONFIG[0].component;
    const allowed = MENU_CONFIG.filter((item) => item.roles.includes(session.role));
    return allowed.find((m) => m.id === currentView)?.component ?? allowed[0]?.component ?? MENU_CONFIG[0].component;
  }, [session, currentView]);

  const handleLogin = (user: UserItem, remember: boolean) => {
    const newSession = buildSession(user);
    setSession(newSession);
    setProfileName(user.name);
    setProfilePhoto(null);
    const firstAllowed = MENU_CONFIG.find((item) => !item.hidden && item.roles.includes(newSession.role));
    setCurrentView(firstAllowed?.id ?? "dashboard");
    if (remember) {
      rememberUser(user.id);
    } else {
      forgetRememberedUser();
    }
  };

  const handleLogout = () => {
    setSession(null);
    setCurrentView("dashboard");
    setProfileName("");
    setProfilePhoto(null);
    forgetRememberedUser();
  };

  // Nombre a mostrar: el editado en Mi Perfil, o el de la sesión si aún no se tocó.
  const displayName = profileName || session?.user.name || "";

  return (
    <>
      {!session ? (
        <LoginModule onLogin={handleLogin} />
      ) : (
        <SessionProvider session={session}>
        <ThemeProvider value={{ themeMode, setThemeMode, isDarkMode, setIsDarkMode }}>
        <ProfileIdentityProvider
          value={{
            name: displayName,
            setName: setProfileName,
            photo: profilePhoto,
            setPhoto: setProfilePhoto,
          }}
        >
        <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex relative text-gray-800 dark:text-gray-200 font-poppins">
          {/* SIDEBAR */}
          <motion.div
              animate={{ width: isSidebarExpanded ? 320 : 100 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`flex flex-col items-center bg-transparent z-20 shrink-0 h-full relative ${isSidebarExpanded ? "py-6" : "py-3"}`}
            >
              <div
                className={`flex items-center w-full ${isSidebarExpanded ? "px-6 justify-between pb-3 mb-3 pt-2" : "flex-col justify-center px-4 pb-2 mb-2"} gap-3`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    layout
                    className={`rounded-2xl overflow-hidden shadow-sm p-1 bg-white shrink-0 border border-slate-100 dark:border-slate-800 ${isSidebarExpanded ? "w-16 h-16" : "w-11 h-11"}`}
                  >
                    <img
                      src={APP_CONFIG.sidebarLogo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {isSidebarExpanded && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex flex-col overflow-hidden whitespace-nowrap"
                      >
                        <span className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                          I.E 6049
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wide">
                          Ricardo Palma
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                      aria-label={isSidebarExpanded ? "Contraer menú lateral" : "Expandir menú lateral"}
                      className="h-10 w-10 shrink-0 rounded-xl text-slate-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 [&_svg]:size-6"
                    >
                      <Menu size={24} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSidebarExpanded ? "Contraer menú lateral" : "Expandir menú lateral"}
                  </TooltipContent>
                </Tooltip>
              </div>

              <motion.nav
                layout
                className={`hidden-scrollbar flex flex-col gap-1 w-full flex-1 ${isSidebarExpanded ? "px-4" : "px-2"} overflow-y-auto pb-4`}
              >
                <div className={isSidebarExpanded ? "mb-3" : "mb-3"}>
                  {isSidebarExpanded && (
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-widest">
                      Gestión Académica
                    </p>
                  )}
                  <div className={isSidebarExpanded ? "flex flex-col gap-1" : "flex flex-col gap-1.5"}>
                    {visibleMenuItems.map((item) => (
                      <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={currentView === item.id}
                        onClick={() => setCurrentView(item.id)}
                        expanded={isSidebarExpanded}
                      />
                    ))}
                  </div>
                </div>

                <div className={isSidebarExpanded ? "mb-3" : "mb-3"}>
                  {isSidebarExpanded && (
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-widest">
                      Herramientas
                    </p>
                  )}
                  <div className={isSidebarExpanded ? "flex flex-col gap-1" : "flex flex-col gap-1.5"}>
                    {TOOL_ROLES.calendar.includes(session.role) && (
                      <SidebarItem
                        icon={CalendarDays}
                        label="Calendario"
                        active={currentView === "calendar"}
                        onClick={() => setCurrentView("calendar")}
                        expanded={isSidebarExpanded}
                      />
                    )}
                    {TOOL_ROLES.assistant.includes(session.role) && (
                      <SidebarItem
                        icon={Bot}
                        label="Asistente IA"
                        active={chatOpen}
                        onClick={() => setChatOpen(true)}
                        expanded={isSidebarExpanded}
                      />
                    )}
                    {TOOL_ROLES.help.includes(session.role) && (
                      <SidebarItem
                        icon={HelpCircle}
                        label="Ayuda"
                        active={false}
                        onClick={() => {
                          const evt = new CustomEvent("openHelp");
                          window.dispatchEvent(evt);
                        }}
                        expanded={isSidebarExpanded}
                      />
                    )}
                  </div>
                </div>
              </motion.nav>

              {/* Sidebar Bottom (Profile & Dark Mode) */}
              <div
                className={`mt-auto w-full flex flex-col gap-2 border-t border-gray-100 dark:border-slate-800 ${isSidebarExpanded ? "p-3" : "p-2 pt-4 items-center"} shrink-0`}
              >
                {/* Profile Card */}
                {isSidebarExpanded ? (
                  <div className="flex items-center justify-between gap-3 w-full p-2 pr-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                    <div
                      className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                      onClick={() => setCurrentView("profile")}
                      title="Ir a mi perfil"
                    >
                      {/* Mismo `ProfileAvatar` que Mi Perfil: si el usuario sube una
                          foto ahí, aparece aquí sin ninguna lógica duplicada. */}
                      <ProfileAvatar
                        name={displayName}
                        photo={profilePhoto}
                        className="h-10 w-10 shadow-sm"
                        textClassName="text-sm"
                      />
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {displayName}
                        </span>
                        <span className="text-xs text-gray-500 truncate font-medium">
                          {ROLE_LABEL[session.role]}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentView("profile")}
                        aria-label="Ir a mi perfil"
                        className="h-11 w-11 shrink-0 rounded-full p-0 shadow-sm hover:bg-transparent"
                      >
                        <ProfileAvatar
                          name={displayName}
                          photo={profilePhoto}
                          className="h-11 w-11"
                          textClassName="text-sm"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mi perfil</TooltipContent>
                  </Tooltip>
                )}

                {/* Switch Tema Oscuro & Log Out: en fila cuando el riel está expandido; apilados cuando
                    está compacto, para que cada botón conserve los 40px mínimos de ancho de objetivo. */}
                <div className={`flex w-full gap-2 ${isSidebarExpanded ? "flex-row" : "flex-col"}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        className="h-11 w-full flex-1 rounded-2xl border border-slate-100 bg-slate-50 text-gray-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-gray-300 dark:hover:bg-slate-700/80"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isDarkMode ? "sun" : "moon"}
                            initial={{ opacity: 0, rotate: -45 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.2 }}
                          >
                            {isDarkMode ? (
                              <Sun size={20} className="text-amber-500" />
                            ) : (
                              <Moon
                                size={20}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleLogout}
                        aria-label="Cerrar sesión"
                        className="h-11 w-full flex-1 gap-2 rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 hover:ring-2 hover:ring-rose-500 hover:ring-offset-2 dark:border-rose-900/50 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:ring-offset-slate-900"
                      >
                        {isSidebarExpanded ? (
                          <>
                            <LogOut size={18} strokeWidth={2.5} />
                            <span className="text-sm font-bold whitespace-nowrap">
                              Salir
                            </span>
                          </>
                        ) : (
                          <LogOut size={20} strokeWidth={2.5} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cerrar Sesión</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </motion.div>

          {/* MAIN CONTENT */}
          {/* Único margen contra el fondo: 16px iguales en los cuatro lados. `main`
              ya no es una tarjeta — las tarjetas son las del propio módulo, así que
              aquí no se repite borde ni fondo (sería un marco dentro de otro). */}
          <div className="flex-1 flex h-full overflow-hidden relative bg-transparent p-4 gap-4">
            <main className="relative z-0 flex flex-1 h-full w-full flex-col overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <Suspense fallback={<ModuleFallback />}>
                  <ActiveComponent
                    key={currentView}
                    onNavigate={setCurrentView}
                    globalDate={globalDate}
                    setGlobalDate={setGlobalDate}
                  />
                </Suspense>
              </AnimatePresence>
            </main>
          </div>

          {/* MODALS */}
          <HelpCenterModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />
          <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
        </ProfileIdentityProvider>
        </ThemeProvider>
        </SessionProvider>
      )}
      <Toaster />
    </>
  );
}
