import React, { useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartCard } from '@/components/charts/ChartCard';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { CHART_AXIS_TICK_STYLE, CHART_CURSOR_FILL, CHART_DATA_LABEL_STYLE, CHART_GRID_STROKE, CHART_HEIGHT } from '@/components/charts/chartTheme';
import {
  INCIDENT_SEVERITY_COLORS,
  type IncidentSeverityLevel,
  type IncidentTypeCount,
} from '../dashboard.constants';
import { buildWeekIncidentTypes, getDefaultWeekId, type DashboardWeek } from '../dashboard.weeks';
import { DashboardWeekSelect } from './DashboardWeekSelect';

const SEVERITY_LEGEND: { severity: IncidentSeverityLevel; label: string }[] = [
  { severity: 'Leve', label: 'Leve' },
  { severity: 'Moderada', label: 'Moderado' },
  { severity: 'Grave', label: 'Grave' },
];

interface IncidentTypesChartProps {
  /** Perfil de tipos de incidencia del bimestre elegido, del que se deriva cada semana. */
  profile: IncidentTypeCount[];
  /** Semanas del mes en pantalla, numeradas como en los reportes de Aulas. */
  weeks: DashboardWeek[];
  /** Mes en pantalla, ej. "Agosto 2026". */
  monthLabel: string;
  /** Fecha activa del sistema (`globalDate`): marca hasta qué día hay datos. */
  today: Date;
  /** Semilla del ámbito elegido en la cabecera, para que el filtro también mueva estos datos. */
  seed: string;
}

const TICK_MAX_CHARS_PER_LINE = 12;
/** Tope duro de líneas: una 3ra línea invade el espacio reservado para la leyenda de gravedad. */
const TICK_MAX_LINES = 2;

/** Reparte una etiqueta larga ("Falta de aseo personal") en máximo 2 líneas cortas, en vez de rotarla — el texto rotado es más lento de leer para el usuario de 40-60 años. */
const wrapTickLabel = (label: string): string[] => {
  const words = label.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (lines.length < TICK_MAX_LINES - 1 && candidate.length > TICK_MAX_CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
};

interface IncidentTypeTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

const IncidentTypeTick: React.FC<IncidentTypeTickProps> = ({ x = 0, y = 0, payload }) => {
  const lines = wrapTickLabel(payload?.value ?? '');
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontSize={12} fontFamily="Poppins, sans-serif" fill={CHART_AXIS_TICK_STYLE.fill}>
        {lines.map((line) => (
          <tspan key={line} x={0} dy={14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const renderTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as IncidentTypeCount;
  return (
    <ChartTooltip
      title={point.type}
      rows={[{ key: point.type, label: point.severity, value: `${point.count} casos`, color: point.fill }]}
    />
  );
};

/**
 * "Tipos de Incidencia": barras verticales por tipo/motivo (no por gravedad
 * total, ver `dashboard.constants.ts`), coloreadas según la gravedad de cada
 * tipo — reemplaza la cinta de proporción + tarjetas de severidad de la
 * antigua `IncidentsOverviewCard` (decisión del responsable de producto,
 * DESIGN_SYSTEM.md § C2). Los nombres de motivo son largos ("Falta de aseo
 * personal"), así que las etiquetas del eje se reparten en 2-3 líneas
 * horizontales (`IncidentTypeTick`) en vez de rotarse — el texto rotado es
 * más lento de leer para el usuario de 40-60 años. Leyenda de gravedad
 * siempre visible, debajo del gráfico: el color solo no basta para
 * distinguir 3 niveles (§ C2.1).
 *
 * El periodo es un mes filtrado por semana, el mismo que la tarjeta de
 * Asistencia y que la Vista General del Aula (ver `dashboard.weeks.ts`).
 */
export const IncidentTypesChart: React.FC<IncidentTypesChartProps> = ({
  profile,
  weeks,
  monthLabel,
  today,
  seed,
}) => {
  const defaultWeekId = getDefaultWeekId(weeks, today);
  const [weekId, setWeekId] = useState(defaultWeekId);
  const selectedWeek = weeks.find((week) => week.id === weekId) ?? weeks.find((week) => week.id === defaultWeekId);

  const data = useMemo(
    () => (selectedWeek ? buildWeekIncidentTypes(profile, selectedWeek, today, seed) : []),
    [profile, selectedWeek, today, seed],
  );

  return (
    <ChartCard
      title="Tipos de Incidencia"
      className="h-full min-h-0"
      bodyClassName="flex flex-col"
      action={
        weeks.length > 0 && (
          <DashboardWeekSelect
            weeks={weeks}
            value={selectedWeek?.id ?? ''}
            onChange={setWeekId}
            ariaLabel="Elegir semana de tipos de incidencia"
          />
        )
      }
    >
      {data.length === 0 ? (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground"
          style={{ minHeight: CHART_HEIGHT }}
        >
          <ShieldAlert size={20} strokeWidth={2} />
          <p className="text-sm">Sin incidencias registradas en {selectedWeek?.label ?? 'esta semana'}.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1" style={{ minHeight: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 8, left: -8, bottom: 4 }} barCategoryGap="24%">
              <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
              <XAxis
                dataKey="type"
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_STROKE }}
                interval={0}
                tick={<IncidentTypeTick />}
                height={44}
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
              <Bar dataKey="count" name="Incidencias" radius={[4, 4, 0, 0]}>
                {data.map((item) => (
                  <Cell key={item.type} fill={item.fill} />
                ))}
                <LabelList dataKey="count" position="top" style={CHART_DATA_LABEL_STYLE} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 flex shrink-0 flex-col items-center gap-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {SEVERITY_LEGEND.map((item) => (
            <div key={item.severity} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: INCIDENT_SEVERITY_COLORS[item.severity] }}
              />
              <span className="whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <p className="whitespace-nowrap text-xs font-semibold text-slate-400 dark:text-slate-500">{monthLabel}</p>
      </div>
    </ChartCard>
  );
};
