const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// The main view wrapper
content = content.replace(
  /className="flex flex-col overflow-hidden h-full relative animate-in fade-in slide-in-from-right-4 duration-500 rounded-\[2rem\] border border-slate-100 dark:border-slate-800 shadow-inner"/g,
  'className="flex flex-col overflow-hidden h-full relative animate-in fade-in slide-in-from-right-4 duration-500 bg-[#EFEAE2] dark:bg-[#0b141a]"'
);

// We need to also remove pt-1 from the parent of that wrapper
content = content.replace(
  /className="flex-1 overflow-hidden min-h-0 flex flex-col pt-1"/g,
  'className="flex-1 overflow-hidden min-h-0 flex flex-col"'
);

// We should also replace the large header background if it is `bg-[#f0f4f8]`
// Wait, `DashboardModule` has a small header. Let's make `ClassroomsModule` headers match `DashboardModule` header (h-[59px] flex items-center)
// Wait, replacing the big headers might be tricky with regex. Let's just fix the container background for now and see.
fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('Fixed main container!');
