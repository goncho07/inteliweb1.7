const fs = require('fs');

let content = fs.readFileSync('modules/DashboardModule.tsx', 'utf-8');

// The charts block that belongs in the right column
const chartsBlock = `
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-white dark:bg-[#111b21] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-md text-2xl font-bold">
                   CC
                </div>
                <div className="flex-1 z-10">
                   <h2 className="text-xl font-bold text-[#111b21] dark:text-white">Bienvenido, Carlos Cerquera</h2>
                   <p className="text-[14px] text-[#667781] dark:text-[#8696a0] mt-1">Aquí tienes el resumen del estado actual de la Institución Educativa.</p>
                </div>
              </div>

              {/* KPI Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Asistencia Chart */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0"><CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div> Asistencia Semanal
                  </h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="presente" name="Presentes" fill="#00a884" radius={[4,4,0,0]} barSize={12} />
                        <Bar dataKey="tardanza" name="Tardanzas" fill="#f59e0b" radius={[4,4,0,0]} barSize={12}>
                          <LabelList dataKey="tardanza" position="top" style={{ fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                        <Bar dataKey="ausente" name="Ausentes" fill="#ef4444" radius={[4,4,0,0]} barSize={12}>
                          <LabelList dataKey="ausente" position="top" style={{ fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Incidencias Chart */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div> Tipos de Incidencias
                  </h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incidentsData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="count" name="Casos" radius={[4,4,0,0]} barSize={30}>
                          {incidentsData.map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ranking Aulas */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div> Aulas con más incidencias
                  </h3>
                  <div className="flex-1 w-full min-h-0 relative -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classroomRankingData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis type="category" dataKey="classroom" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={90} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ranking Estudiantes */}
                <div className="bg-white dark:bg-[#111b21] rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6 h-[300px] flex flex-col">
                  <h3 className="font-bold text-[#111b21] dark:text-white mb-4 text-[15px] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div> Estudiantes incidentes
                  </h3>
                  <div className="flex-1 w-full min-h-0 relative -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentRankingData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={140} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#000' }} />
                        <Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          </div>
`;

// 1. Remove the incorrectly placed charts from the left sidebar
// It starts with <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0 custom-scrollbar">
// and goes all the way to </div> </div> </div> right before <div className="flex-1 overflow-y-auto hidden-scrollbar p-3 space-y-3">
const wrongChartsRegex = /<div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0 custom-scrollbar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div className="flex-1 overflow-y-auto hidden-scrollbar p-3 space-y-3">/;
content = content.replace(wrongChartsRegex, '<div className="flex-1 overflow-y-auto hidden-scrollbar p-3 space-y-3">');

// 2. Fix the first header back to "Inicio"
const firstHeaderRegex = /<div className="flex items-center gap-3">\s*<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900\/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">\s*<Server className="w-4 h-4" \/>\s*<\/div>\s*<h2 className="font-semibold text-slate-800 dark:text-slate-200 text-\[16px\]">Panel de Rendimiento Global<\/h2>\s*<\/div>/;

const inicioHeader = `<div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-slate-600 dark:text-slate-300">
                CC
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Inicio</h1>
            </div>`;

content = content.replace(firstHeaderRegex, inicioHeader);

// 3. Put the charts back into the second column (after the second header)
// The second column has:
//           <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
//             ...
//           </div>
//           </div> 
//         </div>
//       </section>
// Let's replace the empty closing divs with the charts.

const rightSectionRegex = /<div className="bg-\[\#f0f2f5\] dark:bg-\[\#202c33\] h-\[59px\] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800\/60 z-20">\s*<div className="flex items-center gap-3">\s*<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900\/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">\s*<Server className="w-4 h-4" \/>\s*<\/div>\s*<h2 className="font-semibold text-slate-800 dark:text-slate-200 text-\[16px\]">Panel de Rendimiento Global<\/h2>\s*<\/div>\s*<div className="flex items-center gap-4 text-\[\#54656f\] dark:text-\[\#aebac1\]">\s*<Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" \/>\s*<MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" \/>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;

const rightSectionFixed = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Panel de Rendimiento Global</h2>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>
${chartsBlock}
        </section>`;

content = content.replace(rightSectionRegex, rightSectionFixed);

fs.writeFileSync('modules/DashboardModule.tsx', content);
console.log("Fixed dashboard layout!");

