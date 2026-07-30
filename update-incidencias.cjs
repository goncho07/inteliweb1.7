const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const target = `<div className="bg-[#f0f4f8] dark:bg-slate-800/50 p-6 sm:p-10 shrink-0">
          <div className="flex items-start sm:items-center w-full">
            <button
              onClick={onBack}
              className="flex-shrink-0 mr-4 sm:mr-6 w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 dark:hover:text-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
            >
              <ArrowLeft
                className="w-6 h-6 transition-transform group-hover:-translate-x-1"
                strokeWidth={3}
              />
            </button>
            <div className="flex-1 flex items-center gap-6 min-w-0">
              <div className="relative w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hidden sm:flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400">
                <Mail className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Incidencias
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-2">
                  Bandeja de gestión y notificaciones para padres de familia
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button
                onClick={onRegisterIncident}
                className="flex items-center gap-2 px-6 py-3 bg-[#c2e7ff] hover:bg-[#b5dfff] text-[#041e49] font-bold rounded-[14px] transition-all shadow-sm hover:shadow dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className="hidden xl:inline">Nueva Incidencia</span>
              </button>
            </div>
          </div>
        </div>`;

const replacement = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
          <button onClick={onBack} className="text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <AlertTriangle className="w-4 h-4 text-slate-500 dark:text-slate-300" />
             </div>
             <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] truncate">Incidencias</h2>
          </div>
          <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
             <button onClick={onRegisterIncident} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
               <Plus className="w-5 h-5" />
             </button>
             <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
             <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
          </div>
        </div>`;

if (content.includes('Incidencias\n                </h2>')) {
  content = content.replace(target, replacement);
  fs.writeFileSync('modules/ClassroomsModule.tsx', content);
  console.log('Replaced incidencias header!');
} else {
  console.log('Could not find exact text');
}
