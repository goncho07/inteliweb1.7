/** Grupo de chips seleccionables usado en el modal de generación de carnets por lote. */
export const FilterChipGroup = ({ label, value, onChange, options, disabled = false, defaultColor = 'blue' }: any) => {
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'amber': return 'bg-amber-500 text-white shadow-md shadow-amber-500/20';
      case 'indigo': return 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20';
      case 'pink': return 'bg-pink-500 text-white shadow-md shadow-pink-500/20';
      case 'emerald': return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
      case 'purple': return 'bg-purple-500 text-white shadow-md shadow-purple-500/20';
      case 'blue':
      default: return 'bg-blue-600 text-white shadow-md shadow-blue-500/20';
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {label && (
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt: any) => {
          const isSelected = value === opt.value;
          const activeClass = getColorClasses(opt.color || defaultColor);
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? activeClass
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
