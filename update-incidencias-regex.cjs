const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const regex = /<div className="bg-\[\#f0f4f8\] dark:bg-slate-800\/50 p-6 sm:p-10 shrink-0">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const match = content.match(regex);
if (match) {
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
  content = content.replace(regex, replacement);
  fs.writeFileSync('modules/ClassroomsModule.tsx', content);
  console.log('Replaced incidencias header!');
} else {
  console.log('No match for regex');
}
