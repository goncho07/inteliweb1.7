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
          ? 'border-primary/20 bg-primary/10 text-primary shadow-sm dark:border-slate-700 dark:bg-slate-800'
          : 'border-transparent text-slate-500 hover:border-gray-200 hover:bg-gray-50/80 hover:text-primary dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/80',
      )
    }
  >
    {expanded && active && !className && (
      <motion.div
        layout
        className="absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-primary"
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
