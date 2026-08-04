import React from 'react';

export interface ChartTooltipRow {
  key: string;
  label: string;
  value: React.ReactNode;
  color: string;
}

interface ChartTooltipProps {
  /** Encabezado del tooltip (ej. el día o la categoría del punto activo). */
  title?: React.ReactNode;
  rows: ChartTooltipRow[];
}

/**
 * Tooltip compartido por todos los gráficos Recharts de la app: mismo
 * fondo/borde/tipografía que el resto de popups del sistema (tokens
 * `popover`/`border`/`muted-foreground`, no grises fijos) para que se lea
 * igual en claro y oscuro. El hover es descubrimiento — los datos que
 * importan ya están en las etiquetas visibles del gráfico, nunca solo aquí.
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({ title, rows }) => {
  if (rows.length === 0) return null;

  return (
    <div className="min-w-[160px] rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
      {title && <p className="mb-1 text-sm font-semibold text-popover-foreground">{title}</p>}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
            <span className="text-muted-foreground">{row.label}</span>
            <span className="ml-auto font-semibold text-popover-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
