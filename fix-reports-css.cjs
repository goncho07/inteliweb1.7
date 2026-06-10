const fs = require('fs');

function injectOrder(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Inject the subtitles before the mapping
    content = content.replace(
        /(currentFolderContent\.items as [^)]+\)\.map\(\(?(report(?:,\s*\w+)?)\)? => \{)/,
        `<div className="col-span-full order-1 mb-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" /> Reportes de Asistencia
            </h3>
         </div>
         <div className="col-span-full order-3 mt-6 mb-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-500" /> Anexo de Incidencias
            </h3>
         </div>
         $1`
    );

    // 2. Pending Asistencia
    content = content.replace(
        /<div className="bg-gray-50\/50([^>]+opacity-70[^>]*)>/g,
        '<div className="bg-gray-50/50$1 order-2">'
    );

    // 3. Pending Incidencias
    content = content.replace(
        /<div className="bg-rose-50\/20([^>]+opacity-70[^>]*)>/g,
        '<div className="bg-rose-50/20$1 order-4">'
    );

    // 4. Asistencia Generated Card
    // Look for: {/* Reporte de Asistencia */} right before the card or just the first occurence. Wait, we don't have the comment in ClassroomsModule.tsx for Asistencia!
    // But we know Asistencia is the first `<div className="bg-white dark:bg-slate-800...` inside the React.Fragment.
    // Incidencias is preceded by `{/* Reporte de Incidencias */}`
    
    // Instead of regex, let's just do a specific replace per occurrence if parsing is tricky.
    // ACTUALLY, we can use a callback in regex for `<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all group relative">`
    const cardClass = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all group relative';
    
    // We can replace `{/* Reporte de Incidencias */}\n\s*<div className="bg-white...` to add `order-4`
    content = content.replace(
        /\{\/\*\s*Reporte de Incidencias\s*\*\/\}\s*<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0\.5 transition-all group relative">/g,
        '{/* Reporte de Incidencias */}\n                                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all group relative order-4">'
    );

    // Now Asistencia is the only one left without `order-4`, we can optionally add `order-2` to the remaining ones, but `order-2` or default order? Wait, if they don't have an order class, they are `order-0`, meaning they'd appear BEFORE the subtitles (`order-1` and `order-3`).
    // So we MUST add `order-2` to Asistencia.
    // Luckily, now only Asistencia corresponds to `cardClass` EXACTLY.
    content = content.replace(
        new RegExp(`<div className="${cardClass}">`, 'g'),
        `<div className="${cardClass} order-2">`
    );

    fs.writeFileSync(filePath, content);
    console.log("Processed", filePath);
}

// ensure FileText and AlertTriangle are imported
function ensureImports(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');
   if (!content.includes('FileText')) {
       content = content.replace('import {', 'import { FileText,');
   }
   if (!content.includes('AlertTriangle')) {
       content = content.replace('import {', 'import { AlertTriangle,');
   }
   fs.writeFileSync(filePath, content);
}

injectOrder('modules/ClassroomsModule.tsx');
injectOrder('components/ReportShared.tsx');
ensureImports('modules/ClassroomsModule.tsx');
ensureImports('components/ReportShared.tsx');
