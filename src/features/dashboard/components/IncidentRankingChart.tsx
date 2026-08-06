import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartCard } from '@/components/charts/ChartCard';
import { ChartToggleGroup } from '@/components/charts/ChartToggleGroup';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { CHART_AXIS_TICK_STYLE, CHART_CURSOR_FILL, CHART_DATA_LABEL_STYLE, CHART_GRID_STROKE, CHART_HEIGHT } from '@/components/charts/chartTheme';
import type { RankingPoint } from '../dashboard.constants';

/** Ninguna tarjeta de ranking del panel Inicio muestra más de 5 filas — es "lo urgente", no el listado completo (ese vive en Reportes). */
const TOP_N = 5;

export interface RankingVariant {
  key: string;
  toggleLabel: string;
  title: string;
  /** Icono del estado vacío — no se muestra en la cabecera de la tarjeta. */
  icon: LucideIcon;
  emptyLabel: string;
  data: RankingPoint[];
  /** Color de la barra — marca el dominio de la tarjeta (incidencias = rose, faltas = blue). */
  barColor: string;
  /**
   * Las etiquetas de aula no repiten el nivel ("4°B", no "4° B Sec") para no
   * alargar el eje — en su lugar se muestra el nivel como leyenda debajo del
   * gráfico. Solo aplica a variantes de aulas: las de estudiante no tienen
   * ese sufijo que compensar.
   */
  showLevelLegend?: boolean;
}

interface IncidentRankingChartProps {
  variants: RankingVariant[];
}

/**
 * Ranking vertical (Recharts) reutilizado por las tarjetas "Aulas con Más
 * Incidencias" / "Estudiantes con Reincidencias" y "Aulas con Más Faltas" /
 * "Estudiantes con Mayor Faltas" — cada par vive en una sola tarjeta con un
 * selector para alternar en vez de dos tarjetas separadas (decisión del
 * responsable de producto: así el panel queda en 2 tarjetas de asistencia
 * arriba y 2 de incidencias abajo, cada una con su propio toggle). Nombres
 * cortos (aulas, iniciales de alumnos), así que caben en el eje sin rotar.
 */
export const IncidentRankingChart: React.FC<IncidentRankingChartProps> = ({ variants }) => {
  const [activeKey, setActiveKey] = useState(variants[0].key);
  const active = variants.find((variant) => variant.key === activeKey) ?? variants[0];
  const data = active.data.slice(0, TOP_N);
  const levelLegend =
    active.showLevelLegend && data.length > 0 ? Array.from(new Set(data.map((point) => point.level))).join(' · ') : null;

  const renderTooltip = ({ active: isActive, payload }: TooltipContentProps<number, string>) => {
    if (!isActive || !payload?.length) return null;
    const point = payload[0].payload as RankingPoint;
    return (
      <ChartTooltip
        title={point.label}
        rows={[{ key: point.label, label: 'Casos', value: point.score, color: active.barColor }]}
      />
    );
  };

  return (
    <ChartCard
      title={active.title}
      className="h-full min-h-0"
      bodyClassName="flex flex-col"
      action={
        // Con una sola variante no hay nada que elegir: el selector sería un
        // control de una sola opción, siempre marcada.
        variants.length > 1 ? (
          <ChartToggleGroup
            value={activeKey}
            onChange={setActiveKey}
            ariaLabel="Elegir ranking"
            options={variants.map((variant) => ({ value: variant.key, label: variant.toggleLabel }))}
          />
        ) : undefined
      }
    >
      {data.length === 0 ? (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground"
          style={{ minHeight: CHART_HEIGHT }}
        >
          <active.icon size={20} strokeWidth={2} />
          <p className="text-sm">{active.emptyLabel}</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1" style={{ minHeight: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 8, left: -8, bottom: 0 }} barCategoryGap="24%">
              <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_STROKE }}
                tick={CHART_AXIS_TICK_STYLE}
              />
              <YAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={CHART_AXIS_TICK_STYLE}
                width={32}
              />
              <Tooltip content={renderTooltip} cursor={{ fill: CHART_CURSOR_FILL, opacity: 0.5 }} />
              <Bar dataKey="score" name="Casos" fill={active.barColor} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="score" position="top" style={CHART_DATA_LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {levelLegend && (
        <div className="mt-2 flex shrink-0 items-center justify-center">
          <span className="whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300">
            {levelLegend}
          </span>
        </div>
      )}
    </ChartCard>
  );
};
