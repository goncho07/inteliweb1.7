import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { itemVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type KPIVariant = 'blue' | 'emerald' | 'orange' | 'rose' | 'purple' | 'cyan';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: KPIVariant;
  /** Fila compacta para cabeceras densas; por defecto se usa la tarjeta grande. */
  compact?: boolean;
}

/** Paleta pastel plana de las tarjetas grandes. */
const STYLES: Record<KPIVariant, { container: string; iconBg: string; text: string; label: string; shadow: string }> = {
  emerald: {
    container: 'bg-[#E6F7EF] border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50',
    iconBg: 'bg-[#A3E3C7] text-emerald-800 dark:bg-emerald-900 dark:text-emerald-400',
    text: 'text-emerald-950 dark:text-emerald-50',
    label: 'text-emerald-800 dark:text-emerald-200',
    shadow: 'shadow-emerald-100 dark:shadow-none',
  },
  rose: {
    container: 'bg-[#FEECEC] border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50',
    iconBg: 'bg-[#FFB5B5] text-rose-800 dark:bg-rose-900 dark:text-rose-400',
    text: 'text-rose-950 dark:text-rose-50',
    label: 'text-rose-800 dark:text-rose-200',
    shadow: 'shadow-rose-100 dark:shadow-none',
  },
  orange: {
    container: 'bg-[#FFF4E5] border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50',
    iconBg: 'bg-[#FFD6A5] text-orange-800 dark:bg-orange-900 dark:text-orange-400',
    text: 'text-orange-950 dark:text-orange-50',
    label: 'text-orange-800 dark:text-orange-200',
    shadow: 'shadow-orange-100 dark:shadow-none',
  },
  // El cian se muestra con la escala azul (usado para porcentajes).
  cyan: {
    container: 'bg-[#E0F2FE] border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50',
    iconBg: 'bg-[#BAE6FD] text-blue-800 dark:bg-blue-900 dark:text-blue-400',
    text: 'text-blue-950 dark:text-blue-50',
    label: 'text-blue-800 dark:text-blue-200',
    shadow: 'shadow-blue-100 dark:shadow-none',
  },
  blue: {
    container: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20',
    iconBg: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-300',
    text: 'text-blue-900 dark:text-white',
    label: 'text-blue-700 dark:text-blue-300',
    shadow: 'shadow-blue-100 dark:shadow-none',
  },
  purple: {
    container: 'bg-purple-50 border-purple-100 dark:bg-purple-900/20',
    iconBg: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-300',
    text: 'text-purple-900 dark:text-white',
    label: 'text-purple-700 dark:text-purple-300',
    shadow: 'shadow-purple-100 dark:shadow-none',
  },
};

const COMPACT_STYLES: Record<KPIVariant, string> = {
  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
  orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
  rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800',
  purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
  cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800',
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, variant, compact }) => {
  if (compact) {
    return (
      <motion.div
        variants={itemVariants}
        className="flex min-h-[100px] items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className={cn('rounded-xl border p-3', COMPACT_STYLES[variant])}>
          <Icon size={24} />
        </div>
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold leading-none text-gray-900 dark:text-white">{value}</h3>
        </div>
      </motion.div>
    );
  }

  const style = STYLES[variant] ?? STYLES.blue;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'flex min-h-[140px] items-center justify-between rounded-2xl border p-5',
        style.container,
        style.shadow,
      )}
    >
      <div className="flex flex-col justify-center">
        <p className={cn('mb-2 text-sm font-bold opacity-80', style.label)}>{title}</p>
        <h3 className={cn('text-4xl font-black leading-none tracking-tight', style.text)}>{value}</h3>
      </div>

      <div
        className={cn(
          'ml-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-sm',
          style.iconBg,
        )}
      >
        <Icon size={32} strokeWidth={2.5} />
      </div>
    </motion.div>
  );
};
