import React, { useMemo, useState } from 'react';
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
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { CHART_AXIS_TICK_STYLE, CHART_COLORS, CHART_CURSOR_FILL, CHART_DATA_LABEL_STYLE, CHART_GRID_STROKE, CHART_HEIGHT } from '@/components/charts/chartTheme';
import { ATTENDANCE_GOAL, type WeeklyAttendancePoint } from '../dashboard.constants';
import { buildWeekAttendance, getDefaultWeekId, type DashboardDayAttendance, type DashboardWeek } from '../dashboard.weeks';
import { DashboardWeekSelect } from './DashboardWeekSelect';

const SERIES = [
  { key: 'presente' as const, label: 'Presente', color: CHART_COLORS.emerald500 },
  { key: 'tardanza' as const, label: 'Tardanza', color: CHART_COLORS.amber500 },
  { key: 'ausente' as const, label: 'Ausente', color: CHART_COLORS.rose500 },
];

interface WeeklyAttendanceChartProps {
  /** Patrón semanal (Lun-Vie) del bimestre elegido, del que se deriva cada día real. */
  pattern: WeeklyAttendancePoint[];
  /** Semanas del mes en pantalla, numeradas como en los reportes de Aulas. */
  weeks: DashboardWeek[];
  /** Mes en pantalla, ej. "Agosto 2026". */
  monthLabel: string;
  /** Fecha activa del sistema (`globalDate`): marca hasta qué día hay datos. */
  today: Date;
  /** Semilla del ámbito elegido en la cabecera, para que el filtro también mueva estos datos. */
  seed: string;
}

interface DayTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

/** Rótulo de columna en dos líneas: el día arriba y su fecha debajo ("Mié" / "05/08"). */
const DayTick: React.FC<DayTickProps> = ({ x = 0, y = 0, payload }) => {
  const [dayLabel, dateLabel] = (payload?.value ?? '').split('|');
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontFamily="Poppins, sans-serif" fill={CHART_AXIS_TICK_STYLE.fill}>
        <tspan x={0} dy={16} fontSize={12} fontWeight={600}>
          {dayLabel}
        </tspan>
        <tspan x={0} dy={15} fontSize={12}>
          {dateLabel}
        </tspan>
      </text>
    </g>
  );
};

const renderTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as DashboardDayAttendance;
  if (point.presente === null) return null;
  const rows = SERIES.map((series) => {
    const entry = payload.find((item) => item.dataKey === series.key);
    return { key: series.key, label: series.label, value: `${entry?.value ?? 0}%`, color: series.color };
  });
  return <ChartTooltip title={`${point.day} ${point.date}`} rows={rows} />;
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
 * El periodo es un mes filtrado por semana, igual que la Vista General del
 * Aula (ver `dashboard.weeks.ts`): cada columna es un día real con su fecha
 * ("Mié 05/08"), no un "día tipo" promediado. Los días que aún no han
 * ocurrido se quedan sin barra en vez de mostrar un dato inventado.
 */
export const WeeklyAttendanceChart: React.FC<WeeklyAttendanceChartProps> = ({
  pattern,
  weeks,
  monthLabel,
  today,
  seed,
}) => {
  const defaultWeekId = getDefaultWeekId(weeks, today);
  const [weekId, setWeekId] = useState(defaultWeekId);
  const selectedWeek = weeks.find((week) => week.id === weekId) ?? weeks.find((week) => week.id === defaultWeekId);

  const data = useMemo(
    () => (selectedWeek ? buildWeekAttendance(pattern, selectedWeek, today, seed) : []),
    [pattern, selectedWeek, today, seed],
  );

  return (
    <ChartCard
      title="Asistencia"
      className="h-full min-h-0"
      bodyClassName="flex flex-col"
      action={
        weeks.length > 0 && (
          <DashboardWeekSelect
            weeks={weeks}
            value={selectedWeek?.id ?? ''}
            onChange={setWeekId}
            ariaLabel="Elegir semana de asistencia"
          />
        )
      }
    >
      <div className="min-h-0 flex-1" style={{ minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
            <ReferenceLine y={ATTENDANCE_GOAL} stroke={CHART_GRID_STROKE} strokeDasharray="4 4" />
            <XAxis
              dataKey="axisLabel"
              tickLine={false}
              axisLine={{ stroke: CHART_GRID_STROKE }}
              interval={0}
              tick={<DayTick />}
              height={40}
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
                formatter={(value) => (value === null || value === undefined ? '' : `${value}%`)}
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
        <p className="whitespace-nowrap text-xs font-semibold text-slate-400 dark:text-slate-500">{monthLabel}</p>
      </div>
    </ChartCard>
  );
};
