const fs = require('fs');

const file = 'modules/ClassroomsModule.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports if they don't exist
if (!content.includes('ListFilter')) {
  content = content.replace('import {', 'import { ListFilter, ArrowDown, ');
}

// 2. Replace the upper search section
const searchStartStr = '<div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">';
const searchEndStr = '<div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30 dark:bg-slate-900/30">';

const searchStartIdx = content.indexOf(searchStartStr);
const searchEndIdx = content.indexOf(searchEndStr);

if (searchStartIdx === -1 || searchEndIdx === -1) {
    console.log("Could not find search block");
} else {
    const newSearchBlock = `
                <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative w-full sm:w-[500px] border-b-[1.5px] border-slate-300 dark:border-slate-600 focus-within:border-slate-900 dark:focus-within:border-slate-300 transition-colors pb-1.5 flex items-center">
                    <Search className="w-[18px] h-[18px] text-slate-700 dark:text-slate-300 mr-2" strokeWidth={2.5} />
                    <input
                      type="text"
                      placeholder="Buscar"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-[15px] font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-5 ml-auto text-slate-700 dark:text-slate-300">
                    <button className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Filtros">
                      <ListFilter className="w-5 h-5" />
                    </button>
                    <button className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center" title="Ordenar">
                      <span className="font-extrabold text-[15px] tracking-tight mr-[1px]">Az</span>
                      <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                    <button className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Más opciones">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setStudentViewMode(studentViewMode === "grid" ? "list" : "grid")}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center ml-2"
                      title="Vista"
                    >
                      {studentViewMode === "grid" ? <ListFilter className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                `;
                
    content = content.slice(0, searchStartIdx) + newSearchBlock + content.slice(searchEndIdx);
}

// 3. Replace the student grid layout
const gridStartStr = '{filteredStudents.length > 0 ? (';
const gridEndStr = '<div className="col-span-full py-20 text-center text-slate-500">';

const gridStartIdx = content.indexOf(gridStartStr);
const gridEndIdx = content.indexOf(gridEndStr);

if (gridStartIdx === -1 || gridEndIdx === -1) {
    console.log("Could not find grid block");
} else {
    const newGridBlock = `{filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => {
                          const studentIcons = [
                            "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Boy.png",
                            "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Girl.png",
                            "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Student.png",
                            "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Student.png",
                            "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20with%20Skullcap.png",
                            "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20Blond%20Hair.png",
                          ];
                          const avatar = studentIcons[index % studentIcons.length];
                          
                          const firstName = student.name.split(' ')[0] || '';
                          const lastName = student.name.split(' ').slice(1).join(' ') || '';

                          return (
                            <div key={student.id} onClick={() => { onSelectStudent(student); setActionMenuId(null); }} className="flex flex-col items-center justify-start cursor-pointer group">
                              <div className="w-[100px] h-[100px] bg-slate-100 dark:bg-slate-800 rounded-[30px] mb-2.5 flex items-center justify-center shadow-none group-hover:scale-105 group-hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-all duration-300 relative border border-slate-200 dark:border-slate-700">
                                <img src={avatar} alt={student.name} className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                <div className="absolute bottom-2 left-2 bg-white dark:bg-slate-700 flex items-center justify-center w-[22px] h-[22px] rounded-full shadow-sm text-[10px] z-20 border border-slate-200 dark:border-slate-600">
                                  <div className="w-1.5 h-1.5 bg-slate-800 dark:bg-slate-300 rounded-full opacity-60"></div>
                                </div>
                              </div>
                              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-[14px] leading-tight text-center max-w-[110px] truncate">{firstName}</h3>
                              <p className="font-semibold text-slate-500 dark:text-slate-400 text-[14px] leading-tight text-center max-w-[110px] truncate">{lastName}</p>
                            </div>
                          );
                        })
                      ) : (
                        `;
    content = content.slice(0, gridStartIdx) + newGridBlock + content.slice(gridEndIdx);
}

fs.writeFileSync(file, content);
console.log("File updated");
