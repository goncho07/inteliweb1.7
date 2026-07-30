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
        'group relative flex w-full cursor-pointer gap-3 overflow-hidden rounded-2xl border py-4 transition-all',
        expanded ? 'flex-row items-center justify-start px-4' : 'flex-col items-center justify-center',
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
      <Icon size={expanded ? 24 : 28} strokeWidth={active ? 2.5 : 2} className={iconClassName} />
    </motion.div>

    <motion.span
      layout
      className={cn(
        'whitespace-nowrap tracking-tight',
        expanded ? 'text-[15px] font-bold' : 'w-full truncate px-1 text-center text-[11px] font-bold',
      )}
    >
      {label}
    </motion.span>
  </motion.div>
);
