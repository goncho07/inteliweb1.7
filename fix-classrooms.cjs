const fs = require('fs');
let code = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// 1. Remove Primaria numbers
const primariaOld = `<div className="flex flex-col text-[14px] text-slate-500 dark:text-slate-400 font-bold leading-tight mt-0.5 space-y-0.5">\n                    <span className="flex items-center">6 Grados</span>\n                    <span className="flex items-center">18 Secciones</span>\n                  </div>`;
code = code.replace(primariaOld, '');

// 2. Change purple to blue in Level (Secundaria) and Grades
code = code.replaceAll('bg-purple-50/80', 'bg-blue-50/80');
code = code.replaceAll('dark:bg-purple-900/20', 'dark:bg-blue-900/20');
code = code.replaceAll('border-purple-100/50', 'border-blue-100/50');
code = code.replaceAll('dark:border-purple-800/30', 'dark:border-blue-800/30');
code = code.replaceAll('hover:border-purple-400', 'hover:border-blue-400');
code = code.replaceAll('dark:hover:border-purple-500', 'dark:hover:border-blue-500');
code = code.replaceAll('group-hover:text-purple-600', 'group-hover:text-blue-600');
code = code.replaceAll('dark:group-hover:text-purple-400', 'dark:group-hover:text-blue-400');
code = code.replaceAll('text-purple-600/80', 'text-blue-600/80');
code = code.replaceAll('text-purple-400', 'text-blue-400');

// 3. Update empty state and header in right panel when !selectedClassroom
const emptyStateRegex = /:\s*!selectedClassroom\s*\?\s*\(\s*<div className="flex-1 flex flex-col overflow-hidden h-full w-full justify-center items-center bg-transparent"[\s\S]*?<\/div>\s*\)\s*:\s*\(/;

const newEmptyState = `: !selectedClassroom ? (
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
              ) : (`;

if (emptyStateRegex.test(code)) {
  code = code.replace(emptyStateRegex, newEmptyState);
  console.log("Empty state replaced successfully.");
} else {
  console.log("Regex for empty state did not match.");
}

fs.writeFileSync('modules/ClassroomsModule.tsx', code);
console.log("ClassroomsModule updated.");
