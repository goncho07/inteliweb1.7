import { CalendarDays, Folder } from 'lucide-react';

/** Estilos e iconos de las carpetas del historial de reportes (Diario, Semanal, Mensual, Bimestral). */
export const getFolderStyle = (folderName: string, isReportsModule: boolean = false) => {
  const renderIcon = (IconComponent: any) => (
    <IconComponent size={32} strokeWidth={2.5} />
  );

  switch (folderName) {
    case 'Diario':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-blue-600 dark:text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        borderClass: 'hover:border-blue-200 dark:hover:border-blue-800',
        cardBorderClass: 'border-blue-400 dark:border-blue-500',
        topBgClass: 'bg-[#e0f0ff] dark:bg-blue-900/40',
        bottomBgClass: 'bg-[#f0f8ff] dark:bg-blue-900/20',
        subtitle: 'Reportes por día'
      };
    case 'Semanal':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderClass: 'hover:border-emerald-200 dark:hover:border-emerald-800',
        cardBorderClass: 'border-emerald-400 dark:border-emerald-500',
        topBgClass: 'bg-[#e0f5e8] dark:bg-emerald-900/40',
        bottomBgClass: 'bg-[#f0fdf4] dark:bg-emerald-900/20',
        subtitle: 'Reportes por semana'
      };
    case 'Mensual':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-purple-600 dark:text-purple-400',
        bgClass: 'bg-purple-50 dark:bg-purple-900/20',
        borderClass: 'hover:border-purple-200 dark:hover:border-purple-800',
        cardBorderClass: 'border-purple-400 dark:border-purple-500',
        topBgClass: 'bg-[#ede9fe] dark:bg-purple-900/40',
        bottomBgClass: 'bg-[#f5f3ff] dark:bg-purple-900/20',
        subtitle: 'Reportes por mes'
      };
    case 'Bimestral':
      return {
        icon: renderIcon(CalendarDays),
        colorClass: 'text-orange-600 dark:text-orange-400',
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        borderClass: 'hover:border-orange-200 dark:hover:border-orange-800',
        cardBorderClass: 'border-orange-400 dark:border-orange-500',
        topBgClass: 'bg-[#ffedd5] dark:bg-orange-900/40',
        bottomBgClass: 'bg-[#fff7ed] dark:bg-orange-900/20',
        subtitle: 'Reportes por bimestre'
      };
    default:
      return {
        icon: renderIcon(Folder),
        colorClass: 'text-gray-600 dark:text-gray-400',
        bgClass: 'bg-gray-50 dark:bg-gray-800',
        borderClass: 'hover:border-gray-200 dark:hover:border-gray-700',
        cardBorderClass: 'border-gray-300 dark:border-gray-600',
        topBgClass: 'bg-gray-100 dark:bg-gray-800',
        bottomBgClass: 'bg-gray-50 dark:bg-gray-900',
        subtitle: 'Carpeta'
      };
  }
};
