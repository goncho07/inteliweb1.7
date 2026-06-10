import fs from 'fs';
let code = fs.readFileSync('modules/CitationsModule.tsx', 'utf8');

code = code.replace(
`                           </label>
                       ))}               <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">`,
`                           </label>
                       ))}
                   </div>
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5">`
);

code = code.replace(
`                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                   </div>
               </div>   />
                  </div>
               </div>
            </div>`,
`                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                   </div>
               </div>
            </div>`
);

fs.writeFileSync('modules/CitationsModule.tsx', code);
