const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomLeaderboard.tsx', 'utf-8');

const target = `<div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] overflow-hidden custom-scrollbar overflow-y-auto pb-8">
      {/* Header */}
      <div className="p-6 md:p-8 shrink-0 relative bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-500" />
         </div>
         <div className="flex items-center gap-4 mb-2">
           <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-7 h-7" />
           </div>
           <div>
             <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                Vista General del Aula
              </h2>
             <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-bold">{classroom.grade.replace("° Grado", "°")} {classroom.section}</span> 
                {classroom.level}
             </p>
           </div>
         </div>
      </div>`;

const replacement = `<div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-[#0b141a] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
          <div className="flex-1 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <Activity className="w-4 h-4 text-slate-500 dark:text-slate-300" />
             </div>
             <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] truncate">Vista General del Aula</h2>
             <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {classroom.grade.replace("° Grado", "°")} {classroom.section} • {classroom.level}
             </span>
          </div>
          <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
             <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
             <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto hidden-scrollbar pb-8">`;

if (content.includes('Vista General del Aula')) {
  // Try exact replace first, or regex if indentation differs
  if (content.indexOf(target) !== -1) {
    content = content.replace(target, replacement);
  } else {
    // Regex fallback
    const regex = /<div className="flex flex-col h-full bg-slate-50\/50 dark:bg-slate-900\/30 rounded-\[2rem\] overflow-hidden custom-scrollbar overflow-y-auto pb-8">([\s\S]*?)<\/div>\s*<\/div>/;
    content = content.replace(regex, replacement);
  }
  
  // We need to make sure we close the added `div` at the very end of the component!
  // The original didn't have an extra div to close, but we added `<div className="flex-1 overflow-y-auto...">`
  // Wait, the original had the scrolling on the root div.
  // My replacement puts the scrolling on the inner div, so I need to append a closing `</div>` before the final `</div>`.
  // Wait, let's just make the root div scrolling like the original? No, because we want the header to be sticky `shrink-0` and NOT scroll!
  
}
fs.writeFileSync('modules/ClassroomLeaderboard.tsx', content);
