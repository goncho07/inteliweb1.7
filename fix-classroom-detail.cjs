const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// Fix ClassroomDetail sidebar wrapper to not use rounded corners, matching StudentsSidebar
content = content.replace(
  /<div className=\{\`w-full lg:w-\[320px\] xl:w-\[340px\] shrink-0 flex flex-col h-\[600px\] lg:h-full bg-slate-50\/80 dark:bg-slate-900\/50 rounded-\[2rem\] border border-slate-100 dark:border-slate-800 p-4 shadow-inner relative overflow-hidden z-10 animate-in fade-in slide-in-from-left-4 duration-500 flex\`\}>/g,
  '<div className={`w-full lg:w-[320px] xl:w-[340px] shrink-0 flex flex-col h-[600px] lg:h-full bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-slate-800/60 z-10 animate-in fade-in slide-in-from-left-4 duration-500`}>'
);

// Fix ClassroomDetail sidebar header
const targetHeader = `<div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4">
              <h2 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1 tracking-wider uppercase">
                <FileText className="w-5 h-5 text-blue-600" /> CARPETAS DE REPORTES
              </h2>
          </div>`;
          
const replacementHeader = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Reportes</h1>
            </div>
          </div>`;

content = content.replace(targetHeader, replacementHeader);

// Fix padding for the scrolling container
content = content.replace(
  /<div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col hidden-scrollbar pr-1 pb-4">/g,
  '<div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col hidden-scrollbar px-4 pt-4 pb-4">'
);

fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('Fixed ClassroomDetail!');
