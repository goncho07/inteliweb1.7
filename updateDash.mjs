import fs from 'fs';

const path = './modules/DashboardModule.tsx';
let content = fs.readFileSync(path, 'utf8');

const regexLeft = /\{\/\* ======== IZQUIERDA.*?\{\/\* ======== DERECHA/s;
content = content.replace(regexLeft, `<div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col h-[500px] lg:h-full bg-white dark:bg-slate-950 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group z-10 animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/20">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                   <CalendarDays className="w-5 h-5 text-indigo-500" />
                   Horario de Clases
                 </h3>
               </div>
               <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm mt-3">
                 {Object.keys(SCHEDULE_DATA).map((day) => (
                   <button
                     key={day}
                     onClick={() => setSelectedDay(day as any)}
                     className={\`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all \${
                       selectedDay === day 
                         ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                         : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                     } cursor-pointer\`}
                   >
                     {day.slice(0, 3)}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto hidden-scrollbar p-5">
               <div className="relative">
                 <div className="absolute left-10 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800"></div>
                 <div className="space-y-4">
                   {SCHEDULE_DATA[selectedDay].map((lesson, idx) => (
                     <div key={idx} className="relative flex items-start gap-4 group/lesson">
                       <div className="w-16 shrink-0 text-right pt-1">
                         <span className="text-[10px] font-bold text-slate-500">{lesson.start}</span>
                       </div>
                       <div className="absolute left-10 w-2 h-2 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-600 mt-1.5 -ml-1 ring-4 ring-white dark:ring-slate-950"></div>
                       <div className="flex-1">
                         {lesson.type === 'break' ? (
                           <div className="py-1 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2">
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{lesson.title}</span>
                             <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                           </div>
                         ) : lesson.type === 'free' ? (
                           <div className="py-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.01)] opacity-60">
                             <p className="text-xs font-semibold text-slate-400">{lesson.title}</p>
                           </div>
                         ) : (
                           <div className={\`p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-transform hover:-translate-y-0.5 relative overflow-hidden \${lesson.color}\`}>
                             <div className={\`absolute left-0 top-0 bottom-0 w-1 \${lesson.explicitColor}\`}></div>
                             <p className="text-xs font-bold mb-1 pl-1">{lesson.title}</p>
                             <div className="flex items-center gap-3 text-[10px] font-semibold opacity-80 pl-1">
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.start} - {lesson.end}</span>
                               <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {lesson.location}</span>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>

          {/* ======== DERECHA`);

const regexRightContent = /<div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col gap-8 pr-1 pb-6">.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s;

const newRightContent = `<div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col pr-1 pb-6 w-full">
                {/* Banner Bienvenida */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[28px] p-8 sm:p-10 text-white shadow-lg shrink-0 flex justify-between items-center bg-[#2940D3]">
                  <div className="z-10 max-w-[60%]">
                    <h2 className="text-[32px] font-extrabold mb-3 tracking-tight">¡Buenos días Valeria!</h2>
                    <p className="text-blue-100 text-[15px] font-medium leading-relaxed opacity-90 max-w-[480px]">"La educación es el arma más poderosa que puedes usar para cambiar el mundo."</p>
                  </div>
                  <div className="absolute right-0 bottom-0 top-0 w-[40%] flex items-end justify-end pointer-events-none pb-4">
                     <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Woman%20Teacher%20Medium-Light%20Skin%20Tone.png" alt="Teacher illustration" className="h-[220px] object-contain drop-shadow-2xl mr-4" />
                  </div>
                </div>

                {/* Acciones Rápidas Horizontal */}
                <div className="mt-8 mb-6">
                  <h3 className="font-extrabold text-[17px] mb-4 text-slate-800 dark:text-slate-100">Acciones Rápidas</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Asistencia */}
                    <button onClick={() => setIsAsistenciaModalOpen(true)} className="flex items-start flex-col gap-3 p-5 rounded-[24px] bg-[#eefcf4] hover:bg-[#e1f5eb] border border-[#d1f0df] hover:shadow-md transition-shadow text-left group cursor-pointer w-full shadow-sm relative overflow-hidden">
                       <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-sm shrink-0 relative z-10 transition-transform group-hover:scale-110">
                          <span className="text-2xl drop-shadow-sm flex">📝</span>
                       </div>
                       <div className="relative z-10 mt-1">
                          <h4 className="font-extrabold text-slate-900 text-[15px]">Asistencia</h4>
                          <p className="text-[12px] font-semibold text-emerald-600/80">Pendiente</p>
                       </div>
                    </button>
                    {/* Comunicado */}
                    <button onClick={() => setIsComunicadoModalOpen(true)} className="flex items-start flex-col gap-3 p-5 rounded-[24px] bg-[#fffcf0] hover:bg-[#fff9e0] border border-[#ffeed0] hover:shadow-md transition-shadow text-left group cursor-pointer w-full shadow-sm relative overflow-hidden">
                       <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-sm shrink-0 relative z-10 transition-transform group-hover:scale-110">
                          <span className="text-2xl drop-shadow-sm flex">📣</span>
                       </div>
                       <div className="relative z-10 mt-1">
                          <h4 className="font-extrabold text-slate-900 text-[15px]">Comunicado</h4>
                          <p className="text-[12px] font-semibold text-orange-600/80">Enviar aviso general</p>
                       </div>
                    </button>
                    {/* Incidencia */}
                    <button onClick={() => setIsIncidenciaModalOpen(true)} className="flex items-start flex-col gap-3 p-5 rounded-[24px] bg-[#fff5f5] hover:bg-[#ffeaea] border border-[#ffdede] hover:shadow-md transition-shadow text-left group cursor-pointer w-full shadow-sm relative overflow-hidden">
                       <div className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-sm shrink-0 relative z-10 transition-transform group-hover:scale-110">
                          <span className="text-2xl drop-shadow-sm flex">⚠️</span>
                       </div>
                       <div className="relative z-10 mt-1">
                          <h4 className="font-extrabold text-slate-900 text-[15px]">Incidencia</h4>
                          <p className="text-[12px] font-semibold text-rose-600/80">Reportar conducta</p>
                       </div>
                    </button>
                    {/* Citación */}
                    <button onClick={() => setIsComposeModalOpen(true)} className="flex items-start flex-col gap-3 p-5 rounded-[24px] bg-[#f0f7ff] hover:bg-[#e0f0ff] border border-[#d0e9ff] hover:shadow-md transition-shadow text-left group cursor-pointer w-full shadow-sm relative overflow-hidden">
                       <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-sm shrink-0 relative z-10 transition-transform group-hover:scale-110">
                          <span className="text-2xl drop-shadow-sm flex">📅</span>
                       </div>
                       <div className="relative z-10 mt-1">
                          <h4 className="font-extrabold text-slate-900 text-[15px]">Citación</h4>
                          <p className="text-[12px] font-semibold text-blue-600/80">Programar reunión</p>
                       </div>
                    </button>
                  </div>
                </div>

                {/* Citas e Incidencias (Side by Side) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                   
                   {/* CITAS PRÓXIMAS */}
                   <div className="bg-white dark:bg-slate-950 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden group h-full">
                     <div className="flex items-center justify-between mb-4 mt-1 relative z-10">
                       <h3 className="font-extrabold text-[16px] text-slate-800 dark:text-white">
                         Citas Próximas
                       </h3>
                       <button onClick={() => onNavigate?.('citations')} className="text-slate-400 hover:text-slate-600 transition-colors">
                         <ArrowRight className="w-5 h-5" />
                       </button>
                     </div>
                     <div className="space-y-3 relative z-10">
                       {[
                         { name: 'Ana García', type: 'Reunión', time: 'Hoy 09:30', grade: '3° A', colorBg: 'bg-blue-100 text-blue-700' },
                         { name: 'Familia Vega', type: 'Entrevista', time: 'Mañana', grade: '4° B', colorBg: 'bg-emerald-100 text-emerald-700' }
                       ].map((cita, i) => (
                         <div key={i} className="flex justify-between items-center p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100/50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                           <div>
                             <p className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200 mb-1">{cita.name}</p>
                             <p className="text-[12px] text-slate-500 font-medium">{cita.type}</p>
                           </div>
                           <div className="text-right flex flex-col items-end gap-1.5">
                             <span className={\`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold \${cita.colorBg}\`}>
                               {cita.time}
                             </span>
                             <span className="text-[12px] font-bold text-slate-400">{cita.grade}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* INCIDENCIAS RECIENTES */}
                   <div className="bg-white dark:bg-slate-950 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden group h-full">
                     <div className="flex items-center justify-between mb-4 mt-1 relative z-10">
                       <h3 className="font-extrabold text-[16px] text-slate-800 dark:text-white">
                         Incidencias Recientes
                       </h3>
                       <button onClick={() => onNavigate?.('incidents')} className="text-slate-400 hover:text-slate-600 transition-colors">
                         <ArrowRight className="w-5 h-5" />
                       </button>
                     </div>
                     <div className="space-y-3 relative z-10">
                       {[
                         { name: 'Luis Ramos', text: 'Falta de respeto', error: true },
                         { name: 'Andrés Castro', text: 'Uso de celular', error: false },
                         { name: 'María Paz', text: 'Tardanza recurrente', error: false }
                       ].map((inc, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100/50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                           <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${inc.error ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}\`}>
                             {inc.error ? <AlertTriangle className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                           </div>
                           <div className="flex-1">
                             <p className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200 mb-0.5">{inc.name}</p>
                             <p className="text-[12px] text-slate-500 font-medium">{inc.text}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                </div>
             </div>
          </div>
        </div>
      </div>`;

content = content.replace(regexRightContent, newRightContent);

fs.writeFileSync(path, content);
