import React from 'react';
import { ChevronLeft, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

/** Cabecera estándar de módulo: título, subtítulo, icono y acciones. */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
  onBack,
}) => (
  <div
    className={cn(
      'flex w-full shrink-0 flex-col gap-4 rounded-t-[20px] border-b border-slate-200 bg-white px-4 pb-4 pt-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:px-8 sm:pb-4 sm:pt-6',
      className,
    )}
  >
    <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            aria-label="Volver"
            className="group h-12 w-12 shrink-0 rounded-full border-[3px] border-slate-300 bg-white text-slate-500 shadow-sm hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ChevronLeft
              className="h-6 w-6 transition-transform group-hover:-translate-x-1"
              strokeWidth={2.5}
            />
          </Button>
        )}

        {Icon && (
          <div className="shrink-0 rounded-2xl bg-blue-50 p-3 text-blue-600 shadow-sm dark:bg-blue-900/20 dark:text-blue-400">
            <Icon size={28} strokeWidth={2.5} />
          </div>
        )}

        <div className="flex flex-col text-left">
          <h3 className="text-3xl font-black leading-none tracking-tight text-[#0a2540] dark:text-white sm:text-4xl">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1.5 text-sm font-bold text-[#0a2540]/80 dark:text-slate-300">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  </div>
);
