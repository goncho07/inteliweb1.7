import React from 'react';
import { motion } from 'framer-motion';

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export const PageHeader: React.FC<{ 
  title: React.ReactNode; 
  subtitle?: React.ReactNode; 
  icon?: any; 
  action?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}> = ({ title, subtitle, icon: Icon, action, className = "", onBack }) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 px-4 pt-4 pb-4 sm:px-8 sm:pt-6 sm:pb-4 shrink-0 w-full bg-white dark:bg-slate-900 rounded-t-[20px] border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="w-12 h-12 flex items-center justify-center rounded-full border-[3px] border-slate-300 text-slate-500 dark:text-slate-400 dark:border-slate-700 shadow-sm transition-all focus:outline-none hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 bg-white dark:bg-slate-800 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          {Icon && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm shrink-0">
              <Icon size={28} strokeWidth={2.5} />
            </div>
          )}
          <div className="flex flex-col text-left">
            <h3 className="text-[28px] sm:text-4xl font-black text-[#0a2540] dark:text-white tracking-tight leading-none">{title}</h3>
            {subtitle && <p className="text-[#0a2540]/80 dark:text-slate-300 font-bold text-[13px] sm:text-[14px] mt-1.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
};

export const KPICard: React.FC<{ 
  title: string; 
  value: string; 
  icon: any; 
  variant: 'blue' | 'emerald' | 'orange' | 'rose' | 'purple' | 'cyan';
  compact?: boolean;
}> = ({ title, value, icon: Icon, variant, compact }) => {
  
  // Nueva paleta de colores pastel planos
  const styles = {
    emerald: {
      container: "bg-[#E6F7EF] border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50",
      iconBg: "bg-[#A3E3C7] text-emerald-800 dark:bg-emerald-900 dark:text-emerald-400",
      text: "text-emerald-950 dark:text-emerald-50",
      label: "text-emerald-800 dark:text-emerald-200",
      shadow: "shadow-emerald-100 dark:shadow-none"
    },
    rose: {
      container: "bg-[#FEECEC] border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50",
      iconBg: "bg-[#FFB5B5] text-rose-800 dark:bg-rose-900 dark:text-rose-400",
      text: "text-rose-950 dark:text-rose-50",
      label: "text-rose-800 dark:text-rose-200",
      shadow: "shadow-rose-100 dark:shadow-none"
    },
    orange: {
      container: "bg-[#FFF4E5] border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50",
      iconBg: "bg-[#FFD6A5] text-orange-800 dark:bg-orange-900 dark:text-orange-400",
      text: "text-orange-950 dark:text-orange-50",
      label: "text-orange-800 dark:text-orange-200",
      shadow: "shadow-orange-100 dark:shadow-none"
    },
    cyan: { // Mapeado al estilo Azul (Porcentaje)
      container: "bg-[#E0F2FE] border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50",
      iconBg: "bg-[#BAE6FD] text-blue-800 dark:bg-blue-900 dark:text-blue-400",
      text: "text-blue-950 dark:text-blue-50",
      label: "text-blue-800 dark:text-blue-200",
      shadow: "shadow-blue-100 dark:shadow-none"
    },
    // Fallbacks
    blue: {
      container: "bg-blue-50 border-blue-100 dark:bg-blue-900/20",
      iconBg: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-300",
      text: "text-blue-900 dark:text-white",
      label: "text-blue-700 dark:text-blue-300",
      shadow: "shadow-blue-100 dark:shadow-none"
    },
    purple: {
      container: "bg-purple-50 border-purple-100 dark:bg-purple-900/20",
      iconBg: "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-300",
      text: "text-purple-900 dark:text-white",
      label: "text-purple-700 dark:text-purple-300",
      shadow: "shadow-purple-100 dark:shadow-none"
    }
  };

  const style = styles[variant] || styles.blue;

  const compactStyles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
    cyan: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800"
  };

  if (compact) {
    return (
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 min-h-[100px]"
      >
        <div className={`p-3 rounded-xl ${compactStyles[variant]} border`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants} 
      className={`${style.container} p-5 rounded-2xl border ${style.shadow} flex items-center justify-between min-h-[140px]`}
    >
       <div className="flex flex-col justify-center">
          <p className={`text-sm font-bold opacity-80 mb-2 ${style.label}`}>{title}</p>
          <h3 className={`text-4xl font-black tracking-tight leading-none ${style.text}`}>{value}</h3>
       </div>
       
       <div className={`w-16 h-16 rounded-full ${style.iconBg} flex items-center justify-center shrink-0 shadow-sm ml-4`}>
          <Icon size={32} strokeWidth={2.5} />
       </div>
    </motion.div>
  );
};

export const SidebarItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void; expanded?: boolean; className?: string; iconClassName?: string }> = ({ icon: Icon, label, active, onClick, expanded = false, className, iconClassName }) => (
  <motion.div 
    layout
    onClick={onClick} 
    className={className || `flex ${expanded ? 'flex-row items-center justify-start px-4' : 'flex-col items-center justify-center'} gap-3 py-4 rounded-2xl cursor-pointer group relative transition-all w-full overflow-hidden border ${active ? 'bg-blue-50/80 dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border-blue-200/50 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50/80 dark:hover:bg-slate-800/80 border-transparent hover:border-gray-200 dark:hover:border-slate-700'}`}
  >
    {expanded && active && !className && (
      <motion.div layout className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
    )}
    <motion.div layout className={expanded ? 'shrink-0' : ''}>
      <Icon size={expanded ? 24 : 28} strokeWidth={active ? 2.5 : 2} className={iconClassName} />
    </motion.div>
    <motion.span layout className={`${expanded ? 'text-[15px] font-bold' : 'text-[11px] font-bold text-center px-1 w-full truncate'} tracking-tight whitespace-nowrap`}>
      {label}
    </motion.span>
  </motion.div>
);