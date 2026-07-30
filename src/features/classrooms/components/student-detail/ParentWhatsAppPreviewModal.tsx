import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, ChevronLeft } from 'lucide-react';

import { APP_CONFIG } from '@/config/app';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';

/**
 * Simulación de la vista de WhatsApp del apoderado para una incidencia,
 * junto con la terminal de simulación del webhook de confirmación.
 */
export const ParentWhatsAppPreviewModal: React.FC<{
  incident: PersonalIncidentEntry | null;
  studentName: string;
  onClose: () => void;
  incidentSignatures: Record<
    string,
    { status: "pending" | "signed"; date?: string; ip?: string }
  >;
  showWebhookSimulation: boolean;
  webhookTimestamp: number;
  onConfirmSignature: () => void;
}> = ({
  incident: parentViewIncident,
  studentName,
  onClose,
  incidentSignatures,
  showWebhookSimulation,
  webhookTimestamp,
  onConfirmSignature,
}) => {
  return (
    <AnimatePresence>
      {parentViewIncident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <div className="relative flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-4xl pointer-events-none">
            {/* Phone Simulation */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm h-[80vh] max-h-[700px] bg-[#efeae2] rounded-[40px] shadow-2xl border-[12px] border-slate-900 overflow-hidden flex flex-col pointer-events-auto"
              style={{
                backgroundImage:
                  'url("https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")',
                backgroundSize: "cover",
                backgroundBlendMode: "overlay",
                backgroundColor: "rgba(239, 234, 226, 0.9)",
              }}
            >
              {/* Mobile Status Bar Simulation */}
              <div className="h-7 bg-[#075e54] w-full flex justify-between items-center px-5 shrink-0 text-white/90 text-[10px] font-medium">
                <span>18:47</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-white/50"></div>
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="bg-[#005c4b] dark:bg-[#202C33] py-2.5 px-3 flex items-center gap-3 shrink-0 shadow-sm relative z-10">
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors -ml-1 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-white/50">
                  <img
                    src={APP_CONFIG.schoolLogo}
                    alt="Logo"
                    className="w-full h-full object-cover scale-[1.7]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col text-white">
                  <span className="font-bold text-[15px] leading-tight flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                    Asistencia Ricardo Palma Secundaria
                  </span>
                  <span className="text-[12px] text-white/80 leading-tight">
                    Cuenta Oficial de Empresa
                  </span>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative custom-scrollbar">
                {/* Fake WhatsApp Background Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.4] dark:opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                    backgroundSize: "cover",
                  }}
                ></div>

                <div className="self-center bg-[#E1F3FB] dark:bg-[#182229] text-slate-700 dark:text-slate-300 text-[11px] font-medium px-3 py-1 rounded-lg uppercase tracking-wider relative z-10 shadow-sm">
                  HOY
                </div>

                {/* Message Bubble */}
                <div className="bg-white dark:bg-[#202C33] rounded-xl rounded-tl-[0px] p-3 shadow-sm max-w-[90%] relative z-10 text-left">
                  <div className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 font-medium space-y-3">
                    <p className="font-bold flex items-center gap-2">
                      🚨 Notificación de Incidencia
                    </p>
                    <p>
                      Estimado padre de familia, se ha registrado una
                      incidencia conductual del estudiante{" "}
                      <span className="font-semibold text-[#005c4b] dark:text-emerald-400">
                        {studentName}
                      </span>
                      .
                    </p>
                    <p className="font-bold">
                      Detalle: {parentViewIncident.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 text-[14px]">
                      <p>📝 *Registrado por:*</p>
                      <p className="font-bold mt-1">
                        {parentViewIncident.teacher ||
                          parentViewIncident.registrar ||
                          "Carlos Mendoza"}
                      </p>
                      <p className="italic opacity-80 text-[13px] mt-0.5">
                        Docente del curso de DPCC
                      </p>
                    </div>

                    <p className="italic text-[13px] opacity-80 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                      Por favor, confirme que ha recibido este aviso
                      digital.
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      ID:{" "}
                      {parentViewIncident.id?.toUpperCase() ||
                        "INC-2026-001"}
                    </p>
                  </div>
                  {/* Bubble arrow */}
                  <div
                    className="absolute left-[-8px] top-0 w-3 h-4 bg-white dark:bg-[#202C33]"
                    style={{
                      clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                    }}
                  ></div>
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-slate-400">
                      18:47
                    </span>
                  </div>

                  {/* Interactive Buttons */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                    {incidentSignatures[parentViewIncident.id]
                      ?.status === "signed" ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-[#075e54] font-medium text-sm">
                        <Check className="w-4 h-4" /> Confirmado por el
                        padre
                      </div>
                    ) : (
                      <button
                        onClick={onConfirmSignature}
                        className="flex items-center justify-center gap-2 py-2 text-[#00a884] font-medium text-sm hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Confirmar
                        de Enterado
                      </button>
                    )}
                  </div>
                </div>

                {/* Parent Reply (if signed) */}
                {incidentSignatures[parentViewIncident.id]?.status ===
                  "signed" && (
                  <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 shadow-sm max-w-[80%] self-end relative">
                    <p className="text-sm text-slate-800">
                      ✅ Conforme
                    </p>
                    <div className="text-right mt-1 flex items-center justify-end gap-1">
                      <span className="text-[10px] text-slate-500">
                        18:48
                      </span>
                      <Check className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Webhook Simulation Terminal */}
            <AnimatePresence>
              {showWebhookSimulation && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full max-w-md bg-[#1e1e1e] rounded-xl shadow-2xl border border-slate-700 overflow-hidden font-mono text-sm pointer-events-auto"
                >
                  <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-slate-700">
                    <span className="text-emerald-400 font-bold text-xs">
                      SIMULACIÓN WEBHOOK WAHA
                    </span>
                    <span className="bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      RECIBIDO
                    </span>
                  </div>
                  <div className="p-4 text-slate-300 space-y-1">
                    <p>{"{"}</p>
                    <p className="pl-4">
                      <span className="text-blue-400">"event"</span>:{" "}
                      <span className="text-amber-300">
                        "message.create"
                      </span>
                      ,
                    </p>
                    <p className="pl-4">
                      <span className="text-blue-400">"payload"</span>:{" "}
                      {"{"}
                    </p>
                    <p className="pl-8">
                      <span className="text-blue-400">"from"</span>:{" "}
                      <span className="text-amber-300">
                        "51900000000@c.us"
                      </span>
                      ,
                    </p>
                    <p className="pl-8">
                      <span className="text-blue-400">"body"</span>:{" "}
                      <span className="text-amber-300">
                        "✅ Conforme"
                      </span>
                      ,
                    </p>
                    <p className="pl-8">
                      <span className="text-blue-400">
                        "selectedButtonId"
                      </span>
                      :{" "}
                      <span className="text-amber-300">
                        "CONFORME_LECTURA"
                      </span>
                      ,
                    </p>
                    <p className="pl-8">
                      <span className="text-blue-400">"timestamp"</span>
                      :{" "}
                      <span className="text-blue-400">{webhookTimestamp}</span>
                    </p>
                    <p className="pl-4">{"}"}</p>
                    <p>{"}"}</p>

                    {incidentSignatures[parentViewIncident.id]
                      ?.status === "signed" && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-4 border-t border-slate-700 text-emerald-400 font-bold"
                      >
                        Acción: Guardando firma digital en Base de Datos
                        para auditoría UGEL...
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
