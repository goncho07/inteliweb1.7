import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Bot, Moon, Sun, ChevronDown, HelpCircle, CalendarDays, X, Bell, Menu } from 'lucide-react';

import { RightSidebarCalendar } from '@/components/calendar/RightSidebarCalendar';
import { ModuleFallback } from '@/components/common/ModuleFallback';
import { AIChatPanel, HelpCenterModal } from '@/components/modals';
import { SidebarItem } from '@/components/layout/SidebarItem';
import { APP_CONFIG } from '@/config/app';
import { MENU_CONFIG } from '@/config/menu';
import { LoginModule } from '@/features/auth/LoginModule';
import type { ModuleId } from '@/types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "parent" | null>(null);
  const [parentStudentId, setParentStudentId] = useState<string | undefined>(
    undefined,
  );
  const [currentView, setCurrentView] = useState<ModuleId>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalDate, setGlobalDate] = useState<Date>(new Date(2026, 2, 18));

  // Estados para los menús desplegables
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Estado Global
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"azul" | "rojo">("azul");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Referencias para detectar clics fuera
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Expose theme setting function globally for ProfileModule
  useEffect(() => {
    (window as any).setGlobalThemeMode = setThemeMode;
    (window as any).currentGlobalThemeMode = themeMode;
    return () => {
      delete (window as any).setGlobalThemeMode;
      delete (window as any).currentGlobalThemeMode;
    };
  }, [themeMode]);

  // Manejo de Clic Fuera de los Menús
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Evento global para abrir ayuda
  useEffect(() => {
    const handleOpenHelpEvent = () => setIsHelpModalOpen(true);

    window.addEventListener("openHelp", handleOpenHelpEvent);
    return () => {
      window.removeEventListener("openHelp", handleOpenHelpEvent);
    };
  }, []);

  // Dynamic View Resolver
  const ActiveComponent =
    MENU_CONFIG.find((m) => m.id === currentView)?.component ||
    MENU_CONFIG[0].component;

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) setHasUnread(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        <LoginModule
          onLogin={(role = "admin", studentId) => {
            setUserRole(role);
            setParentStudentId(studentId);
            setIsAuthenticated(true);
            if (role === "parent") {
              setCurrentView("classrooms");
            }
          }}
          config={APP_CONFIG}
        />
      ) : userRole === "parent" ? (
        <div className="h-screen w-screen bg-gray-50/50 dark:bg-slate-950 overflow-y-auto font-poppins flex flex-col">
          {/* Simple header with logout */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                PV
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Portal del Apoderado
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  Vista detallada del estudiante
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center overflow-hidden relative"
                title="Notificaciones"
              >
                <Bell size={18} strokeWidth={2.5} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800"></span>
              </button>
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                title="Ver Calendario"
              >
                <CalendarDays size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-500 dark:hover:text-yellow-400 shadow-sm border border-gray-100 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                title={
                  isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"
                }
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDarkMode ? "sun" : "moon"}
                    initial={{ y: -20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDarkMode ? (
                      <Sun size={18} strokeWidth={2.5} />
                    ) : (
                      <Moon size={18} strokeWidth={2.5} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
              <div
                className="flex items-center gap-3 pl-2 pr-4 h-10 rounded-full shadow-sm border bg-white border-gray-100 dark:bg-slate-800 dark:border-slate-700 relative cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  PV
                </div>
                <div className="hidden md:block text-left mr-1">
                  <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                    Peepo Vega
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Apoderado
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-2 z-50"
                    >
                      <button
                        onClick={() => {
                          setIsAuthenticated(false);
                          setUserRole(null);
                          setParentStudentId(undefined);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 text-xs font-bold text-rose-600 transition-colors"
                      >
                        <LogOut size={18} /> Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-8 w-full flex-1">
            <Suspense fallback={<ModuleFallback />}>
              <ActiveComponent
                key="parent-view"
                onNavigate={setCurrentView}
                parentViewStudentId={parentStudentId}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex relative text-gray-800 dark:text-gray-200 font-poppins">
          {/* SIDEBAR */}
          {userRole === "admin" && (
            <motion.div
              animate={{ width: isSidebarExpanded ? 320 : 112 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="flex flex-col items-center py-6 bg-transparent z-20 shrink-0 h-full relative"
            >
              <div
                className={`pb-6 mb-6 flex items-center w-full ${isSidebarExpanded ? "px-6 justify-between" : "flex-col justify-center px-4"} gap-3 pt-2`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    layout
                    className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm p-1 bg-white shrink-0 border border-slate-100 dark:border-slate-800"
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
                <button
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Menu size={24} />
                </button>
              </div>

              <motion.nav
                layout
                className={`flex flex-col gap-1 w-full flex-1 ${isSidebarExpanded ? "px-4" : "px-2"} overflow-y-auto pb-4 scrollbar-hide`}
              >
                <div className="mb-6">
                  {isSidebarExpanded && (
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-widest">
                      Gestión Académica
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    {MENU_CONFIG.filter((item) => !item.hidden).map((item) => (
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

                <div className="mb-6">
                  {isSidebarExpanded && (
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-widest">
                      Herramientas
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    <SidebarItem
                      icon={CalendarDays}
                      label="Calendario"
                      active={isCalendarModalOpen}
                      onClick={() => setIsCalendarModalOpen(true)}
                      expanded={isSidebarExpanded}
                    />
                    <SidebarItem
                      icon={Bot}
                      label="Asistente IA"
                      active={chatOpen}
                      onClick={() => setChatOpen(true)}
                      expanded={isSidebarExpanded}
                    />
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
                  </div>
                </div>
              </motion.nav>

              {/* Sidebar Bottom (Profile & Dark Mode) */}
              <div
                className={`mt-auto w-full flex flex-col gap-2 border-t border-gray-100 dark:border-slate-800 ${isSidebarExpanded ? "p-4" : "p-2 pt-4 items-center"} shrink-0`}
              >
                {/* Profile Card */}
                {isSidebarExpanded ? (
                  <div className="flex items-center justify-between gap-3 w-full p-2 pr-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/80 border border-transparent dark:border-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm border border-gray-100">
                    <div
                      className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                      onClick={() => setCurrentView("profile")}
                      title="Ir a mi perfil"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        AD
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          Carlos Cerquera
                        </span>
                        <span className="text-xs text-gray-500 truncate font-medium">
                          Docente
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentView("profile")}
                    className="w-12 h-12 mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all dark:ring-offset-slate-900"
                    title="Mi Perfil"
                  >
                    AD
                  </button>
                )}

                {/* Switch Tema Oscuro & Log Out grouped together for coherence */}
                <div
                  className={`flex ${isSidebarExpanded ? "flex-row gap-2" : "flex-col gap-2"} w-full`}
                >
                  <div
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`flex items-center justify-center ${isSidebarExpanded ? "flex-1 py-3" : "w-12 h-12"} bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-2xl transition-colors cursor-pointer text-gray-700 dark:text-gray-300 border border-slate-100 dark:border-slate-700`}
                    title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
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
                          <Sun size={18} className="text-amber-500" />
                        ) : (
                          <Moon
                            size={18}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div
                    onClick={() => setIsAuthenticated(false)}
                    className={`flex items-center justify-center ${isSidebarExpanded ? "flex-1 py-3" : "w-12 h-12"} bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-2xl transition-colors cursor-pointer text-rose-500 border border-rose-100 dark:border-rose-900/50`}
                    title="Cerrar Sesión"
                  >
                    {isSidebarExpanded ? (
                      <div className="flex items-center gap-2">
                        <LogOut size={18} strokeWidth={2.5} />
                        <span className="text-sm font-bold whitespace-nowrap">
                          Salir
                        </span>
                      </div>
                    ) : (
                      <LogOut size={20} strokeWidth={2.5} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MAIN CONTENT */}
          <div className="flex-1 flex h-full overflow-hidden relative bg-transparent p-4 pl-0 gap-4">
            <main className="flex-1 overflow-y-auto flex flex-col relative w-full h-full bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden relative z-0">
              <AnimatePresence mode="wait">
                <Suspense fallback={<ModuleFallback />}>
                  <ActiveComponent
                    key={currentView}
                    onNavigate={setCurrentView}
                    globalDate={globalDate}
                  />
                </Suspense>
              </AnimatePresence>
            </main>
          </div>

          {/* MODALS */}
          {isCalendarModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-6xl xl:max-w-7xl h-auto min-h-[600px] max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                <button
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  <X size={16} />
                </button>
                <RightSidebarCalendar
                  currentView={currentView}
                  globalDate={globalDate}
                  setGlobalDate={setGlobalDate}
                />
              </div>
            </div>
          )}
          <HelpCenterModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />
          <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      )}
    </>
  );
}
