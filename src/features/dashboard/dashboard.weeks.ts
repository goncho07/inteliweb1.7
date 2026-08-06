import { getMonthLabel, getMonthRange, isSameDay } from '@/features/classrooms/overview.period';
import { buildSchoolDays, groupDaysBySchoolWeek, type AttendanceGridDay } from '@/features/classrooms/overview.rows';
import { pseudoRandom } from '@/lib/pseudoRandom';

import type { Bimestre, IncidentTypeCount, WeeklyAttendancePoint } from './dashboard.constants';

/**
 * Periodo de las tarjetas del panel Inicio: **un mes, filtrado por semana**,
 * exactamente el mismo criterio que la Vista General del Aula (los reportes
 * del colegio se emiten por mes y sus columnas se agrupan en "Semana 1",
 * "Semana 2"…). Por eso el mes y el corte de semanas se calculan reutilizando
 * `overview.period` / `overview.rows` de Aulas, en vez de repetir aquí una
 * numeración de semanas propia que podría no coincidir con la de los reportes.
 */

export interface DashboardWeek {
  /** Identificador del tramo dentro del mes: la fecha de su primer día. */
  id: string;
  /**
   * "Semana 2" en los tramos de semana completa; en los tramos partidos por el
   * cambio de mes —que no llegan a ser una semana— el rango de fechas, porque
   * un elemento del selector sin nombre no se puede elegir.
   */
  label: string;
  /** Días de colegio (lunes a viernes) del tramo. Los tramos de inicio y fin de mes pueden tener menos de 5. */
  days: AttendanceGridDay[];
  /** Rango legible del tramo, ej. "03/08 – 07/08". */
  rangeLabel: string;
}

/** Fecha corta "05/08", la que rotula cada columna del gráfico. */
export const formatDayMonth = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

/**
 * Mes que se muestra para el bimestre elegido en el panel lateral: el mes en
 * curso si cae dentro del bimestre y, si no (bimestre pasado o futuro), el mes
 * en que arranca.
 */
export const getDashboardMonth = (bimestre: Bimestre, today: Date): Date => {
  const first = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const start = first(bimestre.start);
  const current = first(today);
  return current >= start && current <= first(bimestre.end) ? current : start;
};

export const getDashboardMonthLabel = (monthCursor: Date): string => getMonthLabel(monthCursor);

/** Semanas de colegio del mes, numeradas igual que la cabecera de la tabla mensual de Aulas. */
export const getMonthWeeks = (monthCursor: Date): DashboardWeek[] => {
  const { start, end } = getMonthRange(monthCursor);
  return groupDaysBySchoolWeek(buildSchoolDays(start, end)).map((group) => {
    const firstDay = group.days[0].date;
    const lastDay = group.days[group.days.length - 1].date;
    const rangeLabel =
      group.days.length === 1
        ? formatDayMonth(firstDay)
        : `${formatDayMonth(firstDay)} – ${formatDayMonth(lastDay)}`;
    return {
      id: firstDay.toISOString(),
      label: group.label || rangeLabel,
      days: group.days,
      rangeLabel,
    };
  });
};

/**
 * Semana que se abre por defecto: la que contiene el día de hoy. Si el mes ya
 * pasó, la última; si aún no ha llegado, la primera.
 */
export const getDefaultWeekId = (weeks: DashboardWeek[], today: Date): string => {
  const containingToday = weeks.find((week) => week.days.some((day) => isSameDay(day.date, today)));
  if (containingToday) return containingToday.id;
  const started = [...weeks].reverse().find((week) => week.days[0].date <= today);
  return (started ?? weeks[0])?.id ?? '';
};

/** Punto de una columna del gráfico de asistencia: un día concreto, con su fecha. */
export interface DashboardDayAttendance {
  /** Día de la semana, ej. "Mié". */
  day: string;
  /** Fecha del día, ej. "05/08". */
  date: string;
  /** Día y fecha juntos ("Mié|05/08"): es la categoría del eje X, que se pinta en dos líneas. */
  axisLabel: string;
  /** Porcentajes del día (suman 100). `null` en días que todavía no han ocurrido. */
  presente: number | null;
  ausente: number | null;
  tardanza: number | null;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/**
 * Asistencia día a día de la semana elegida, derivada del patrón semanal del
 * bimestre con una variación determinista por fecha (`pseudoRandom`): son
 * datos simulados, pero un mismo día muestra siempre lo mismo. Los días que
 * aún no han ocurrido no se inventan — quedan sin barra.
 */
export const buildWeekAttendance = (
  pattern: WeeklyAttendancePoint[],
  week: DashboardWeek,
  today: Date,
  seed: string,
): DashboardDayAttendance[] =>
  week.days.map((day) => {
    const weekdayIndex = Math.min(Math.max(day.date.getDay() - 1, 0), pattern.length - 1);
    const base = pattern[weekdayIndex];
    const dayLabel = WEEKDAY_LABELS[weekdayIndex] ?? base.day;
    const dateLabel = formatDayMonth(day.date);
    const labels = { day: dayLabel, date: dateLabel, axisLabel: `${dayLabel}|${dateLabel}` };
    if (day.date > today) return { ...labels, presente: null, ausente: null, tardanza: null };

    // ±4 puntos respecto al patrón del bimestre: variación creíble entre días
    // sin desdibujar la forma de la semana.
    const delta = Math.round((pseudoRandom(`asistencia-dia-${seed}-${dayKey(day.date)}`) - 0.5) * 8);
    const presente = Math.min(100, Math.max(70, base.presente + delta));
    const remainder = 100 - presente;
    const baseRemainder = base.ausente + base.tardanza;
    // El reparto ausente/tardanza mantiene la proporción del patrón de origen.
    const ausente = baseRemainder === 0 ? remainder : Math.round((remainder * base.ausente) / baseRemainder);
    return { ...labels, presente, ausente, tardanza: remainder - ausente };
  });

/**
 * Tipos de incidencia de la semana elegida, derivados del perfil del bimestre
 * y acotados a los días ya transcurridos. Un tipo sin casos esa semana no
 * aparece: una barra en cero no dice nada.
 */
export const buildWeekIncidentTypes = (
  profile: IncidentTypeCount[],
  week: DashboardWeek,
  today: Date,
  seed: string,
): IncidentTypeCount[] => {
  const elapsed = week.days.filter((day) => day.date <= today).length;
  if (elapsed === 0) return [];
  const share = elapsed / week.days.length;
  return profile
    .map((item) => ({
      ...item,
      count: Math.round(
        item.count * (0.6 + pseudoRandom(`incidencia-semana-${seed}-${week.id}-${item.type}`) * 0.6) * share,
      ),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
};
