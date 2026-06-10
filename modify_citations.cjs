const fs = require('fs');

let content = fs.readFileSync('modules/CitationsModule.tsx', 'utf8');

// The replacement logic.
const layoutA = content.split('<div className="flex-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">');

if (layoutA.length === 2) {
  const layoutB = layoutA[1].split('{/* BARRA DE BÚSQUEDA Y ACCIONES */}');
  if (layoutB.length === 2) {
    const leftSidebar = `
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <button
            onClick={() => {
              setModalType('new_citation');
              setIsModalOpen(true);
            }}
            className="w-full py-4 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={20} />
            Generar Citación
          </button>
          
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Bandejas</p>
            
            <button
              onClick={() => setSidebarTab('Pendientes')}
              className={\`flex items-center justify-between p-4 rounded-xl transition-all border \${sidebarTab === 'Pendientes' ? 'bg-[#FFF4E5] border-orange-200 text-orange-800 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300'}\`}
            >
              <div className="flex items-center gap-3">
                <div className={\`p-2 rounded-lg \${sidebarTab === 'Pendientes' ? 'bg-[#FFD6A5] text-orange-800' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}\`}>
                  <Inbox size={18} />
                </div>
                <span className="font-bold text-sm">Pendientes</span>
              </div>
              <span className={\`font-black text-sm \${sidebarTab === 'Pendientes' ? 'text-orange-900' : 'text-slate-500'}\`}>{stats.pendientes}</span>
            </button>

            <button
              onClick={() => setSidebarTab('Confirmadas')}
              className={\`flex items-center justify-between p-4 rounded-xl transition-all border \${sidebarTab === 'Confirmadas' ? 'bg-[#E6F7EF] border-emerald-200 text-emerald-800 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300'}\`}
            >
              <div className="flex items-center gap-3">
                <div className={\`p-2 rounded-lg \${sidebarTab === 'Confirmadas' ? 'bg-[#A3E3C7] text-emerald-800' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}\`}>
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-bold text-sm">Confirmadas</span>
              </div>
              <span className={\`font-black text-sm \${sidebarTab === 'Confirmadas' ? 'text-emerald-900' : 'text-slate-500'}\`}>{stats.confirmadas}</span>
            </button>

            <button
              onClick={() => setSidebarTab('Realizadas')}
              className={\`flex items-center justify-between p-4 rounded-xl transition-all border \${sidebarTab === 'Realizadas' ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300'}\`}
            >
              <div className="flex items-center gap-3">
                <div className={\`p-2 rounded-lg \${sidebarTab === 'Realizadas' ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}\`}>
                  <Check size={18} />
                </div>
                <span className="font-bold text-sm">Realizadas</span>
              </div>
              <span className={\`font-black text-sm \${sidebarTab === 'Realizadas' ? 'text-blue-900' : 'text-slate-500'}\`}>{stats.realizadas}</span>
            </button>

            <button
              onClick={() => setSidebarTab('Canceladas')}
              className={\`flex items-center justify-between p-4 rounded-xl transition-all border \${sidebarTab === 'Canceladas' ? 'bg-[#FEECEC] border-rose-200 text-rose-800 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300'}\`}
            >
              <div className="flex items-center gap-3">
                <div className={\`p-2 rounded-lg \${sidebarTab === 'Canceladas' ? 'bg-[#FFB5B5] text-rose-800' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}\`}>
                  <XCircle size={18} />
                </div>
                <span className="font-bold text-sm">Canceladas</span>
              </div>
              <span className={\`font-black text-sm \${sidebarTab === 'Canceladas' ? 'text-rose-900' : 'text-slate-500'}\`}>{stats.canceladas}</span>
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-6 py-4">
          {/* BARRA DE BÚSQUEDA Y ACCIONES */}
    `;
    let newFullContent = layoutA[0] + leftSidebar + layoutB[1];
    
    // add closing divs
    newFullContent = newFullContent.replace(
      /<\/div>\n\s*<\/AnimatePresence>\n\s*<\/div>\n\s*<\/motion.div>/,
      `    </div>
          </div>
        </div>
      </AnimatePresence>
      </div>
    </motion.div>`
    );
    
    // Remove old header button
    newFullContent = newFullContent.replace(
      /action=\{\s*<button[\s\S]*?onClick=\{\(\) => \{\s*setModalType\('new_citation'\);\s*setIsModalOpen\(true\);\s*\}\}[\s\S]*?<\/button>\s*\}/g,
      `action={<div/>}`
    );

    fs.writeFileSync('modules/CitationsModule.tsx', newFullContent);
    console.log("Success");
  }
}
