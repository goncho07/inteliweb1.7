import { EDUCATIONAL_STRUCTURE } from '@/data/education';

import { ReportHistoryItem } from '@/components/reports/types';

/** Datos simulados del módulo de reportes de asistencia (`ReportsModule`). */

export const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const REPORT_TYPES = ['Diario', 'Semanal', 'Mensual', 'Bimestral'];

export const MOCK_REPORTS_HISTORY: ReportHistoryItem[] = (() => {
  const reports: ReportHistoryItem[] = [];
  let id = 1;

  REPORT_TYPES.forEach(type => {
    Object.entries(EDUCATIONAL_STRUCTURE).forEach(([level, grades]) => {
      Object.entries(grades).forEach(([grade, sections]) => {
        sections.forEach(section => {
          if (type === 'Diario') {
            const days = [];
            const d = new Date();
            const realNow = new Date();
            const dayOfWeek = d.getDay();
            const diffToMonday = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);

            for (let i = 0; i < 5; i++) {
               const currentDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);

               const dayName = currentDate.toLocaleDateString('es-ES', { weekday: 'long' });
               const dayNum = currentDate.getDate();
               const topDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
               const month = monthNames[currentDate.getMonth()].substring(0, 3).toLowerCase();
               const year = currentDate.getFullYear();
               const isFuture = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) > new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate());

               days.push({
                 day: `${topDay} ${dayNum}`,
                 date: `${dayNum} ${month} ${year}`,
                 isFuture
               });
            }
            days.forEach(({ day, date, isFuture }) => {
              reports.push({
                id: id++,
                type,
                title: day,
                date,
                level,
                grade,
                section,
                size: isFuture ? '-' : `${(Math.random() * 1 + 0.5).toFixed(1)} MB`,
                progress: isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: isFuture ? 'pending' : 'generated'
              });
            });
          } else if (type === 'Semanal') {
            const weeks = [];
            const d = new Date();
            const realNow = new Date();
            const year = d.getFullYear();
            const currentMonth = d.getMonth();
            const monthNameStr = monthNames[currentMonth].charAt(0).toUpperCase() + monthNames[currentMonth].slice(1).toLowerCase();

            for(let i=1; i<=4; i++) {
               const startDay = (i - 1) * 7 + 1;
               const endDay = i * 7;
               const weekStartDate = new Date(year, currentMonth, startDay);
               const isFuture = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate()) > new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate());

               weeks.push({
                 title: `Semana ${i}`,
                 date: `${startDay} - ${endDay} de ${monthNameStr}`,
                 isFuture
               });
            }
            weeks.forEach(week => {
              reports.push({
                id: id++,
                type,
                title: week.title,
                date: week.date,
                level,
                grade,
                section,
                size: week.isFuture ? '-' : `${(Math.random() * 2 + 1).toFixed(1)} MB`,
                progress: week.isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: week.isFuture ? 'pending' : 'generated'
              });
            });
          } else if (type === 'Mensual') {
            const currentYear = new Date().getFullYear();
            const realNow = new Date();
            const monthsList = [
              { name: 'Marzo', index: 2 },
              { name: 'Abril', index: 3 },
              { name: 'Mayo', index: 4 },
              { name: 'Junio', index: 5 },
              { name: 'Julio', index: 6 },
              { name: 'Agosto', index: 7 },
              { name: 'Septiembre', index: 8 },
              { name: 'Octubre', index: 9 },
              { name: 'Noviembre', index: 10 },
              { name: 'Diciembre', index: 11 }
            ];

            monthsList.forEach(m => {
              const monthStartDate = new Date(currentYear, m.index, 1);
              const isFuture = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), 1) > new Date(realNow.getFullYear(), realNow.getMonth(), 1);
              reports.push({
                id: id++,
                type,
                title: m.name,
                date: `${m.name} ${currentYear}`,
                level,
                grade,
                section,
                size: isFuture ? '-' : `${(Math.random() * 3 + 2).toFixed(1)} MB`,
                progress: isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: isFuture ? 'pending' : 'generated'
              });
            });
          } else if (type === 'Bimestral') {
            const currentYear = new Date().getFullYear();
            const realNow = new Date();
            const bimesters = [
              { title: 'I Bimestre', dateStr: '16-03-2026 al 15-05-2026', monthIndex: 2 },
              { title: 'II Bimestre', dateStr: '25-05-2026 al 24-07-2026', monthIndex: 4 },
              { title: 'III Bimestre', dateStr: '10-08-2026 al 09-10-2026', monthIndex: 7 },
              { title: 'IV Bimestre', dateStr: '19-10-2026 al 18-12-2026', monthIndex: 9 }
            ];
            bimesters.forEach(b => {
              const bimStartDate = new Date(currentYear, b.monthIndex, 1);
              const isFuture = new Date(bimStartDate.getFullYear(), bimStartDate.getMonth(), 1) > new Date(realNow.getFullYear(), realNow.getMonth(), 1);

              reports.push({
                id: id++,
                type,
                title: b.title,
                date: b.dateStr.replace(/2026/g, currentYear.toString()),
                level,
                grade,
                section,
                size: isFuture ? '-' : `${(Math.random() * 5 + 3).toFixed(1)} MB`,
                progress: isFuture ? 0 : Math.floor(Math.random() * 30) + 70,
                status: isFuture ? 'pending' : 'generated'
              });
            });
          }
        });
      });
    });
  });
  return reports;
})();
