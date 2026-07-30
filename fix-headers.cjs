const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const regexes = [
  // Fix 1: IncidenciasView
  {
    target: /<div className="bg-\[\#f0f4f8\] dark:bg-slate-800\/50 p-6 sm:p-10 shrink-0">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="flex-1/g,
    replace: (match, inner) => {
      // Find the title (h2)
      const titleMatch = inner.match(/<h2[^>]*>(.*?)<\/h2>/s);
      const title = titleMatch ? titleMatch[1].trim() : '';
      return `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
          <button onClick={onBack} className="text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-slate-500 dark:text-slate-300" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] flex-1 truncate">${title}</h2>
        </div>
        <div className="flex-1`
    }
  },
  // Fix 2: StudentView (Wait, StudentView might not have bg-[#f0f4f8])
];

// Wait, doing this with regex might be risky. Let me just find exactly where `bg-[#f0f4f8]` is.
