const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const target = `<div className="flex-1 flex flex-col min-w-0 relative h-[650px] lg:h-auto border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 rounded-[2rem] overflow-hidden p-4 sm:p-5 lg:p-6 shadow-inner animate-in fade-in slide-in-from-right-4 duration-500">`;

const replacement = `<div className="flex-1 flex flex-col min-w-0 relative h-[650px] lg:h-auto bg-[#EFEAE2] dark:bg-[#0b141a] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 shadow-sm z-20">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Detalle de Reportes</h2>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
        </div>`;

content = content.replace(target, replacement);

// And we might need to fix the `<div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto custom-scrollbar">` right below it.
// Actually let's just leave it as is, but it's fine.
fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('Fixed ClassroomDetail main!');
