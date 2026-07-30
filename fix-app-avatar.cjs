const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

const regex = /<div className="w-12 h-12 bg-blue-50 dark:bg-blue-900\/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">\s*<User size=\{24\} \/>\s*<\/div>/;

const replacement = `<div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                PV
              </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('App.tsx', content);
console.log("App avatar fixed.");
