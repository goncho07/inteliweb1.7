import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartCard } from '@/components/charts/ChartCard';
import { ChartToggleGroup } from '@/components/charts/ChartToggleGroup';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { CHART_AXIS_TICK_STYLE, CHART_COLORS, CHART_CURSOR_FILL, CHART_DATA_LABEL_STYLE, CHART_GRID_STROKE, CHART_HEIGHT } from '@/components/charts/chartTheme';
import { ATTENDANCE_GOAL, type WeeklyAttendancePoint } from '../dashboard.constants';

const SERIES = [
  { key: 'presente' as const, label: 'Presente', color: CHART_COLORS.emerald500 },
  { key: 'tardanza' as const, label: 'Tardanza', color: CHART_COLORS.amber500 },
  { key: 'ausente' as const, label: 'Ausente', color: CHART_COLORS.rose500 },
];

type AttendanceView = 'bimestre' | 'semana';

interface WeeklyAttendanceChartProps {
  /** Patrón de la semana en curso — dato "en vivo", no cambia con el bimestre elegido. */
  weekData: WeeklyAttendancePoint[];
  /** Patrón semanal consolidado del bimestre elegido en el panel lateral. */
  bimestreData: WeeklyAttendancePoint[];
  bimestreLabel: string;
  /** Fecha activa del sistema (`globalDate`), para ubicar la semana mostrada. */
  today: Date;
}

const formatDayMonth = (date: Date) =>
  new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date).replace(/\.$/, '');

/** Lunes y domingo de la semana que contiene `reference`. */
const getWeekRange = (reference: Date) => {
  const weekday = reference.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
};

const renderTooltip = ({ active, payload, label }: TooltipContentProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const rows = SERIES.map((series) => {
    const entry = payload.find((point) => point.dataKey === series.key);
    return { key: series.key, label: series.label, value: `${entry?.value ?? 0}%`, color: series.color };
  });
  return <ChartTooltip title={label} rows={rows} />;
};

/**
 * "Asistencia": barras verticales apiladas por día (Lun-Vie) con las 3
 * series Presente/Tardanza/Ausente — misma orientación que las demás
 * tarjetas del panel Inicio (decisión del responsable de producto, ver
 * DESIGN_SYSTEM.md § C2). Apiladas, no agrupadas: al sumar siempre 100, la
 * pila se lee como "un día completo repartido en 3 estados" y evita que
 * Tardanza/Ausente (2-9%) queden como segmentos casi invisibles junto a
 * Presente (85-96%) en la misma escala de 0 a 100.
 *
 * Selector Bimestre/Semana: lo que un director revisa es el consolidado del
 * bimestre elegido en el panel lateral, no necesariamente la semana en
 * curso — pero ambas vistas son útiles, así que conviven en la misma
 * tarjeta en vez de forzar una sola.
 */
export const WeeklyAttendanceChart: React.FC<WeeklyAttendanceChartProps> = ({
  weekData,
  bimestreData,
  bimestreLabel,
  today,
}) => {
  const [view, setView] = useState<AttendanceView>('bimestre');
  const { start, end } = getWeekRange(today);
  const weekRangeLabel = `${formatDayMonth(start)} – ${formatDayMonth(end)}`;

  const data = view === 'bimestre' ? bimestreData : weekData;
  const rangeLabel = view === 'bimestre' ? bimestreLabel : weekRangeLabel;

  return (
    <ChartCard
      title="Asistencia"
      className="h-full min-h-0"
      bodyClassName="flex flex-col"
      action={
        <ChartToggleGroup<AttendanceView>
          value={view}
          onChange={setView}
          ariaLabel="Elegir periodo de asistencia"
          options={[
            { value: 'bimestre' as const, label: 'Bimestre' },
            { value: 'semana' as const, label: 'Semana' },
          ]}
        />
      }
    >
      <div className="min-h-0 flex-1" style={{ minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
            <ReferenceLine y={ATTENDANCE_GOAL} stroke={CHART_GRID_STROKE} strokeDasharray="4 4" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: CHART_GRID_STROKE }}
              tick={CHART_AXIS_TICK_STYLE}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tickLine={false}
              axisLine={false}
              tick={CHART_AXIS_TICK_STYLE}
              width={40}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: CHART_CURSOR_FILL, opacity: 0.5 }} />
            <Bar dataKey="ausente" stackId="asistencia" name="Ausente" fill={CHART_COLORS.rose500} />
            <Bar dataKey="tardanza" stackId="asistencia" name="Tardanza" fill={CHART_COLORS.amber500} />
            <Bar dataKey="presente" stackId="asistencia" name="Presente" fill={CHART_COLORS.emerald500} radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="presente"
                position="top"
                formatter={(value) => `${value}%`}
                style={CHART_DATA_LABEL_STYLE}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex shrink-0 flex-col items-center gap-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <p className="whitespace-nowrap text-xs font-semibold text-slate-400 dark:text-slate-500">{rangeLabel}</p>
      </div>
    </ChartCard>
  );
};
