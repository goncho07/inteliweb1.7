const fs = require('fs');
let content = fs.readFileSync('modules/DashboardModule.tsx', 'utf-8');

// Replace left header
const leftHeaderRegex = /<div className="bg-\[\#f0f2f5\] dark:bg-\[\#202c33\] h-\[59px\] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800\/60">([\s\S]*?)<\/div>\s*<\/div>/;

const newLeftHeader = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-slate-600 dark:text-slate-300">
                CC
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Inicio</h1>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>`;

content = content.replace(leftHeaderRegex, newLeftHeader);

const rightHeaderRegex = /<div className="bg-\[\#f0f2f5\] dark:bg-\[\#202c33\] h-\[59px\] px-4 flex items-center justify-between shrink-0 shadow-sm relative z-10 border-b border-slate-200 dark:border-slate-800\/60">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/;

const newRightHeader = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Panel de Rendimiento Global</h2>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>`;

content = content.replace(rightHeaderRegex, newRightHeader);

// Fix banner
const bannerRegex = /<div className="bg-white dark:bg-\[\#111b21\] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800\/60 p-6 flex items-center gap-6 relative overflow-hidden">([\s\S]*?)<\/div>\s*<\/div>/;
const newBanner = `<div className="bg-white dark:bg-[#111b21] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex items-center gap-6 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-md text-2xl font-bold">
                   CC
                </div>
                <div className="flex-1 z-10">
                   <h2 className="text-xl font-bold text-[#111b21] dark:text-white">Bienvenido, Carlos Cerquera</h2>
                   <p className="text-[14px] text-[#667781] dark:text-[#8696a0] mt-1">Aquí tienes el resumen del estado actual de la Institución Educativa.</p>
                </div>
              </div>`;
content = content.replace(bannerRegex, newBanner);

// Remove the WhatsApp pattern
content = content.replace(/<div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.02\] pointer-events-none"[^>]*><\/div>/, '');

fs.writeFileSync('modules/DashboardModule.tsx', content);
console.log('Headers and banner updated');
