import { Check, ChevronDown } from 'lucide-react';

/** Dropdown simple de selección única, usado en las columnas filtrables de la tabla de usuarios. */
export const DropdownFilter = ({ label, options, value, onChange, isOpen, onToggle }: any) => {
  return (
    <div className="relative inline-block text-left font-poppins">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors w-40 shadow-sm border border-gray-200 dark:border-slate-700 ${
          value !== 'Todos' && value !== ''
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
        }`}
      >
        <span className="truncate">{value !== 'Todos' && value !== '' ? value.toUpperCase() : label.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle}></div>
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-20 py-1">
            {options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(value === opt ? 'Todos' : opt);
                  onToggle();
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors ${
                  value === opt
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                {opt}
                {value === opt && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
