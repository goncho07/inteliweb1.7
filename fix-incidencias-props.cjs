const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// I will just remove the `onClick={onRegisterIncident}` button from IncidenciasPanel because it wasn't there maybe?
// Wait, my replacement had:
/*
          <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
             <button onClick={onRegisterIncident} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
               <Plus className="w-5 h-5" />
             </button>
*/
// The original probably used `setIsComposeModalOpen(true)` or didn't have it?
// Let's replace `onRegisterIncident` with `() => setIsComposeModalOpen(true)`.

content = content.replace('onClick={onRegisterIncident}', 'onClick={() => setIsComposeModalOpen(true)}');

fs.writeFileSync('modules/ClassroomsModule.tsx', content);
