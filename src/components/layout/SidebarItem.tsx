import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  /** Barra lateral desplegada: icono y texto en fila. */
  expanded?: boolean;
  /** Si se pasa, reemplaza por completo las clases por defecto. */
  className?: string;
  iconClassName?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
  expanded = false,
  className,
  iconClassName,
}) => (
  <motion.div
    layout
    onClick={onClick}
    className={
      className ||
      cn(
        'group relative flex w-full cursor-pointer overflow-hidden rounded-2xl border transition-all',
        expanded ? 'flex-row items-center justify-start gap-3 px-4 py-2.5' : 'flex-col items-center justify-center gap-1 px-1 py-2.5',
        active
          ? 'border-blue-200/50 bg-blue-50/80 text-blue-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400'
          : 'border-transparent text-slate-500 hover:border-gray-200 hover:bg-gray-50/80 hover:text-blue-600 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/80 dark:hover:text-blue-300',
      )
    }
  >
    {expanded && active && !className && (
      <motion.div
        layout
        className="absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-blue-600 dark:bg-blue-400"
      />
    )}

    <motion.div layout className={expanded ? 'shrink-0' : undefined}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} className={iconClassName} />
    </motion.div>

    <motion.span
      layout
      className={cn(
        'tracking-tight',
        expanded
          ? 'whitespace-nowrap text-base font-bold'
          : 'w-full break-words text-center text-xs font-bold leading-tight',
      )}
    >
      {label}
    </motion.span>
  </motion.div>
);
