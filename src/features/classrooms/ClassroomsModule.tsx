import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronDown, Info, Megaphone, MoreVertical, School, Search, Send, X } from 'lucide-react';
import { APP_CONFIG } from '@/config/app';
import { MOCK_USERS } from '@/data/users';
import { ClassroomDetail } from '@/features/classrooms/components/ClassroomDetail';
import { ClassroomLeaderboard } from '@/features/classrooms/components/ClassroomLeaderboard';
import { ClassroomSidebar } from '@/features/classrooms/components/ClassroomSidebar';
import { StudentDetail } from '@/features/classrooms/components/StudentDetail';
import { StudentsSidebar } from '@/features/classrooms/components/StudentsSidebar';

import { containerVariants } from '@/lib/motion';
import { ModuleProps, UserItem } from '@/types';

export const ClassroomsModule: React.FC<ModuleProps> = ({
  onNavigate,
  onRegisterIncident,
  parentViewStudentId,
  globalDate,
}) => {
  const [selectedClassroom, setSelectedClassroom] = useState<{
    level: string;
    grade: string;
    section: string;
  } | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<string>("Todos");
  const [selectedGrade, setSelectedGrade] = useState<string>("Todos");

  const [selectedStudent, setSelectedStudent] = useState<UserItem | null>(
    () => {
      if (parentViewStudentId) {
        return MOCK_USERS.find((u) => u.id === parentViewStudentId) || null;
      }
      return null;
    },
  );
  const [showHistoryDirectly, setShowHistoryDirectly] = useState(false);
  const [showCitationsDirectly, setShowCitationsDirectly] = useState(false);
  const [showIncidentsDirectly, setShowIncidentsDirectly] = useState(false);
  const [showLeaderboardDirectly, setShowLeaderboardDirectly] = useState(false);

  // Form states for comunicado
  const [isComunicadoModalOpen, setIsComunicadoModalOpen] = useState(false);
  const [comunicadoDestino, setComunicadoDestino] = useState("");
  const [comunicadoMotivo, setComunicadoMotivo] = useState<
    "Urgente" | "Informativo" | "Recordatorio" | ""
  >("");
  const [comunicadoMensaje, setComunicadoMensaje] = useState("");
  const [hideTeacherNameComunicado, setHideTeacherNameComunicado] =
    useState(false);
  const [headerData, setHeaderData] = useState<{
    title?: string;
    subtitle?: string;
    icon?: any;
    onBack?: () => void;
  } | null>(null);

  const handleOpenComunicado = (
    level: string,
    grade: string,
    section: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setComunicadoDestino(`${grade} ${section}`);
    setIsComunicadoModalOpen(true);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full font-poppins overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a]"
    >
      {/* We make the main wrapper handle the scroll to match DashboardModule */}
      <div className="flex-1 overflow-hidden flex w-full">
        {!parentViewStudentId && null}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 w-full min-h-0 overflow-hidden h-full">
            {!headerData && (
              selectedClassroom ? (
                <StudentsSidebar
                    classroom={selectedClassroom}
                    selectedStudent={selectedStudent!}
                    onSelectStudent={(s) => {
                       setSelectedStudent(s);
                       setShowLeaderboardDirectly(false);
                    }}
                    onBack={() => {
                        setSelectedClassroom(null);
                        setSelectedStudent(null);
                        setShowHistoryDirectly(false);
                        setShowCitationsDirectly(false);
                        setShowIncidentsDirectly(false);
                        setShowLeaderboardDirectly(false);
                    }}
                    isLeaderboardOpen={showLeaderboardDirectly || showHistoryDirectly || showIncidentsDirectly || showCitationsDirectly}
                    onToggleLeaderboard={() => {
                       setShowLeaderboardDirectly(true);
                       setSelectedStudent(null);
                    }}
                />
              ) : (
                <ClassroomSidebar
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedGrade={selectedGrade}
                  setSelectedGrade={setSelectedGrade}
                  selectedClassroom={selectedClassroom}
                  onSelectClassroom={(c) => {
                    setSelectedClassroom(c);
                    setShowHistoryDirectly(false);
                    setShowCitationsDirectly(false);
                    setShowIncidentsDirectly(false);
                    setShowLeaderboardDirectly(true);
                  }}
                  onActionReportes={() => setShowHistoryDirectly(true)}
                  onActionIncidencias={() => setShowIncidentsDirectly(true)}
                />
              )
            )}
            {(showHistoryDirectly || showIncidentsDirectly || showCitationsDirectly) && selectedClassroom ? (
                 <ClassroomDetail
                    classroom={selectedClassroom}
                    globalDate={globalDate}
                    onBack={() => {
                      setShowHistoryDirectly(false);
                      setShowIncidentsDirectly(false);
                      setShowCitationsDirectly(false);
                      setShowLeaderboardDirectly(true);
                    }}
                    onLevelClick={() => {
                      setSelectedClassroom(null);
                      setShowHistoryDirectly(false);
                      setShowIncidentsDirectly(false);
                      setSelectedGrade("Todos");
                      setSelectedLevel("Todos");
                    }}
                    onGradeClick={() => {
                      setSelectedClassroom(null);
                      setShowHistoryDirectly(false);
                      setShowIncidentsDirectly(false);
                      setShowCitationsDirectly(false);
                    }}
                    onSelectStudent={setSelectedStudent}
                    initialShowHistory={showHistoryDirectly}
                    initialShowCitations={showCitationsDirectly}
                    initialShowIncidents={showIncidentsDirectly}
                    setHeaderData={setHeaderData}
                 />
            ) : (
                <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] relative h-[650px] lg:h-auto z-0 overflow-hidden">
                  {showLeaderboardDirectly && selectedClassroom ? (
                     <ClassroomLeaderboard classroom={selectedClassroom} onReportClick={() => { setSelectedStudent(null); setShowLeaderboardDirectly(false); setShowHistoryDirectly(true); }} />
                  ) : (selectedStudent && selectedClassroom) ? (
                     <StudentDetail
                       student={selectedStudent}
                       onBack={() => {
                           setSelectedStudent(null);
                       }}
                       isParentView={!!parentViewStudentId}
                     />
                  ) : !selectedClassroom ? (
                 <div className="flex-1 flex flex-col overflow-hidden h-full w-full bg-slate-50 dark:bg-[#0b141a]">
                   <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                         <School className="w-4 h-4" />
                       </div>
                       <div>
                         <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Detalles del Aula</h2>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Gestión de secciones e información del alumnado</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
                       <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                       <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                     </div>
                   </div>
                   <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                       <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-200/80 dark:border-slate-800/60 p-10 max-w-md w-full shadow-sm flex flex-col items-center">
                           <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5 shadow-sm">
                              <School className="w-8 h-8" />
                           </div>
                           <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                              {selectedGrade === "Todos" ? "Selecciona un Grado" : "Selecciona una Sección"}
                           </h2>
                           <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                              {selectedGrade === "Todos"
                                  ? "Navega por los niveles educativos y elige una sección para ver los detalles."
                                 : "Elige una sección en el panel lateral para empezar a visualizar el detalle de los alumnos."}
                           </p>
                       </div>
                   </div>
                 </div>
              ) : (
                 <div className="flex-1 flex justify-center items-center h-full w-full opacity-60">
                   <p className="text-slate-500 font-bold">Cargando detalles...</p>
                 </div>
              )}
            </div>
          )}
          </div>
        </div>

        <AnimatePresence>
          {isComunicadoModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#f8fafd] dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-3 text-[#041e49] dark:text-white">
                    <Megaphone
                      size={24}
                      className="fill-current text-blue-500"
                    />
                    <h3 className="text-xl font-bold">Enviar Comunicado</h3>
                  </div>
                  <button
                    onClick={() => setIsComunicadoModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                  {/* Destinatario */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <label className="block text-[12px] font-black text-[#041e49] dark:text-blue-300 uppercase tracking-widest mb-4">
                      Destinatario
                    </label>
                    <div className="relative">
                      <select
                        value={comunicadoDestino}
                        onChange={(e) => setComunicadoDestino(e.target.value)}
                        className="w-full pl-5 pr-12 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 hover:border-orange-400 dark:focus:border-orange-500 rounded-xl text-[15px] font-bold text-slate-800 dark:text-slate-200 appearance-none focus:ring-0 outline-none transition-colors cursor-pointer"
                      >
                        <option value="" disabled>
                          Seleccione un aula...
                        </option>
                        <option value={comunicadoDestino}>
                          {comunicadoDestino}
                        </option>
                        <option value="Todas las Aulas">Todas las Aulas</option>
                        <option value="3° Grado">3° Grado</option>
                        <option value="4° Grado">4° Grado</option>
                        <option value="5° Grado">5° Grado</option>
                      </select>
                      <ChevronDown
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
                    <label className="block text-[12px] font-black text-[#041e49] dark:text-blue-300 uppercase tracking-widest">
                      Motivo del Comunicado
                    </label>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setComunicadoMotivo("Urgente")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${comunicadoMotivo === "Urgente" ? "border-rose-500/50 bg-rose-50/50 dark:bg-rose-900/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-700/50 dark:bg-slate-800/30"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${comunicadoMotivo === "Urgente" ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-white border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600"}`}
                        >
                          <AlertTriangle size={20} />
                        </div>
                        <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">
                          Urgente
                        </span>
                      </button>

                      <button
                        onClick={() => setComunicadoMotivo("Informativo")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${comunicadoMotivo === "Informativo" ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-700/50 dark:bg-slate-800/30"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${comunicadoMotivo === "Informativo" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-white border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600"}`}
                        >
                          <Info size={20} />
                        </div>
                        <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">
                          Informativo
                        </span>
                      </button>

                      <button
                        onClick={() => setComunicadoMotivo("Recordatorio")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${comunicadoMotivo === "Recordatorio" ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-700/50 dark:bg-slate-800/30"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${comunicadoMotivo === "Recordatorio" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-white border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-600"}`}
                        >
                          <Megaphone size={20} />
                        </div>
                        <span className="font-bold text-[15px] text-slate-700 dark:text-slate-200">
                          Recordatorio
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo y Preview */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
                    <label className="block text-[12px] font-black text-[#041e49] dark:text-blue-300 uppercase tracking-widest">
                      Cuerpo del Mensaje
                    </label>
                    <textarea
                      value={comunicadoMensaje}
                      onChange={(e) => setComunicadoMensaje(e.target.value)}
                      placeholder="Estimados apoderados, les comunicamos que..."
                      className="w-full p-5 bg-[#f8fafd] dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none min-h-[140px]"
                    />

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          setHideTeacherNameComunicado(
                            !hideTeacherNameComunicado,
                          )
                        }
                        className={`w-11 h-6 rounded-full flex items-center transition-colors relative shrink-0 ${hideTeacherNameComunicado ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute ${hideTeacherNameComunicado ? "translate-x-6" : "translate-x-[4px]"}`}
                        />
                      </button>
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                        Ocultar nombre del docente en el mensaje
                      </span>
                    </div>

                    <div className="w-full bg-[#efeae2] dark:bg-[#0b141a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shrink-0 relative overflow-hidden mt-6 shadow-sm">
                      <div className="bg-[#075e54] dark:bg-[#202c33] px-3 py-2 flex items-center gap-3 z-20 shrink-0 shadow-md">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white/50">
                          <img
                            src={APP_CONFIG.schoolLogo}
                            alt="Logo"
                            className="w-full h-full object-cover scale-[1.7]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-[14px] leading-tight flex items-center gap-1">
                            Asistencia Ricardo Palma Secundaria
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-[#53bdeb] ml-0.5"
                              strokeWidth={3}
                            />
                          </span>
                          <span className="text-white/80 text-[11px] leading-tight mt-0.5">
                            Chatbot
                          </span>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.06] pointer-events-none mt-[54px] z-0"
                        style={{
                          backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                          backgroundSize: "400px",
                        }}
                      ></div>

                      <div className="p-4 flex flex-col gap-3 relative z-10 custom-scrollbar pb-6 max-h-[350px] overflow-y-auto w-full">
                        <div className="self-center bg-[#E1F3FB] dark:bg-[#182229] text-slate-500 dark:text-slate-400 text-[11px] font-medium px-3 py-1 rounded-md shadow-sm mb-2 uppercase tracking-wide">
                          Hoy
                        </div>

                        <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none p-2 shadow-sm max-w-[92%] relative z-10 text-left self-start">
                          <svg
                            viewBox="0 0 8 13"
                            width="8"
                            height="13"
                            className="absolute -left-[8px] top-0 text-white dark:text-[#202c33]"
                          >
                            <path
                              fill="currentColor"
                              d="M1.533,3.568L8,12.193V1H2.812C1.042,1,0.474,2.156,1.533,3.568z"
                            ></path>
                          </svg>

                          <div className="text-[14px] leading-[1.35] whitespace-pre-wrap break-words text-[#111b21] dark:text-[#e9edef] p-1 pb-4 relative">
                            {comunicadoMotivo && (
                              <p className="font-bold flex items-center gap-2 mb-2">
                                {comunicadoMotivo === "Urgente"
                                  ? "⚠️"
                                  : comunicadoMotivo === "Informativo"
                                    ? "ℹ️"
                                    : "🔔"}{" "}
                                Comunicado {comunicadoMotivo}
                              </p>
                            )}
                            <p
                              className={`${comunicadoMensaje ? "text-[#111b21] dark:text-[#e9edef]" : "text-slate-400 dark:text-slate-500 italic"}`}
                            >
                              {comunicadoMensaje ||
                                "Redacte su mensaje en el campo superior..."}
                            </p>

                            {comunicadoMensaje && (
                              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[13.5px]">
                                <p>Atentamente,</p>
                                {!hideTeacherNameComunicado && (
                                  <p className="font-bold mt-1">
                                    Carlos Mendoza
                                  </p>
                                )}
                                <p
                                  className={`${hideTeacherNameComunicado ? "font-bold mt-1" : "italic opacity-80 text-[12.5px]"}`}
                                >
                                  Docente del curso de DPCC
                                </p>
                              </div>
                            )}
                            <div className="absolute bottom-0 right-0 text-[11px] text-[#667781] dark:text-[#8696a0] font-medium mt-1.5 flex justify-end items-center gap-1 pb-0.5">
                              {new Date().toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
                  <button
                    onClick={() => setIsComunicadoModalOpen(false)}
                    className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all ${comunicadoDestino && comunicadoMotivo && comunicadoMensaje ? "bg-[#c2e7ff] text-[#041e49] hover:bg-[#b5dfff] hover:shadow-md dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500" : "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"}`}
                    disabled={
                      !comunicadoDestino ||
                      !comunicadoMotivo ||
                      !comunicadoMensaje
                    }
                  >
                    <Send size={18} />
                    <span>Enviar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export { INITIAL_CITATIONS } from '@/features/classrooms/data';
export type { CitationItem, CitationStatus } from '@/features/classrooms/types';
