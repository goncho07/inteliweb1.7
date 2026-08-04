import React, { useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { ModuleBody, ModulePaneHeader } from '@/components/layout/ModuleShell';
import { useToast } from '@/hooks/use-toast';
import type { ClassroomRef } from '@/features/classrooms/types';
import { formatStudentDisplayName, getClassroomLabel } from '@/features/classrooms/overview.format';
import { getCitationsForAula } from '@/features/classrooms/overview.citations';
import { getPeriodLabel, getPeriodRange, stepPeriod, type PeriodId } from '@/features/classrooms/overview.period';
import { downloadAttendanceReport, downloadCitationsReport, downloadIncidentsReport } from '@/features/classrooms/overview.pdf';
import {
  buildAttendanceGridRowsForStudents,
  buildIncidentReportRows,
  buildSchoolDays,
  groupDaysByMonth,
  groupDaysByWeekOfMonth,
} from '@/features/classrooms/overview.rows';
import type { UserItem } from '@/types';

import { AttendanceDayTable } from './overview/AttendanceDayTable';
import { AttendanceGridLegend, AttendanceGridTable } from './overview/AttendanceGridTable';
import { CitationsTable } from './overview/CitationsTable';
import { IncidentsTable } from './overview/IncidentsTable';
import { OverviewInlineEmpty } from './overview/OverviewInlineEmpty';
import { OverviewPeriodBar } from './overview/OverviewPeriodBar';
import { OverviewStatusLegend } from './overview/OverviewStatusLegend';
import { OverviewTabsBar, type OverviewTabId } from './overview/OverviewTabsBar';

const TAB_TITLES: Record<OverviewTabId, string> = {
  asistencia: 'Reporte de Asistencia',
  incidencias: 'Reporte de Incidencias',
  citaciones: 'Reporte de Citaciones',
};

/**
 * Vista General del Aula: asistencia, incidencias y citaciones de la
 * sección elegida, navegables por periodo (hoy/día/semana/mes/bimestre) —
 * el contenido que antes vivía en el módulo Reportes, ahora integrado aquí
 * para no repetir la navegación por aula (ya la resuelve `ClassroomSidebar`).
 * Asistencia e Incidencias se generan a partir del padrón real de alumnos
 * (`students`); Citaciones solo lee `INITIAL_CITATIONS`, el mismo dato que
 * gestiona el módulo Citaciones — aquí no se crean ni editan.
 */
export const ClassroomTodayOverview: React.FC<{
  classroom: ClassroomRef;
  students: UserItem[];
  globalDate?: Date;
}> = ({ classroom, students, globalDate }) => {
  const today = useMemo(() => globalDate ?? new Date(), [globalDate]);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<OverviewTabId>('asistencia');
  const [period, setPeriod] = useState<PeriodId>('mes');
  const [cursor, setCursor] = useState<Date>(today);
  const [search, setSearch] = useState('');

  const aulaSeed = `${classroom.level}-${classroom.grade}-${classroom.section}`;

  // Al cambiar de aula (desde el sidebar) se limpia la búsqueda: evita mostrar "sin resultados" de otra
  // sección. Ajuste de estado durante el render (no en un efecto): evita el doble render que provocaría un `useEffect`.
  const [lastAulaSeed, setLastAulaSeed] = useState(aulaSeed);
  if (lastAulaSeed !== aulaSeed) {
    setLastAulaSeed(aulaSeed);
    setSearch('');
  }
  const aulaLabel = useMemo(() => getClassroomLabel(classroom), [classroom]);

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => formatStudentDisplayName(a.name).localeCompare(formatStudentDisplayName(b.name), 'es')),
    [students],
  );
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedStudents;
    return sortedStudents.filter((s) => s.name.toLowerCase().includes(q));
  }, [sortedStudents, search]);

  const { start, end } = useMemo(() => getPeriodRange(period, cursor, today), [period, cursor, today]);
  const periodLabel = useMemo(() => getPeriodLabel(period, cursor, today), [period, cursor, today]);

  const schoolDays = useMemo(() => buildSchoolDays(start, end), [start, end]);
  const dayGroups = useMemo(() => {
    if (period === 'bimestre') return groupDaysByMonth(schoolDays);
    if (period === 'mes') return groupDaysByWeekOfMonth(schoolDays);
    // "Semana": ya es una única semana, un solo grupo con la etiqueta del periodo (evita partirla si cruza de mes).
    return schoolDays.length > 0 ? [{ label: periodLabel, days: schoolDays }] : [];
  }, [schoolDays, period, periodLabel]);
  const attendanceRows = useMemo(
    () => buildAttendanceGridRowsForStudents(aulaSeed, schoolDays, today, filteredStudents),
    [aulaSeed, schoolDays, today, filteredStudents],
  );
  const isSingleDayPeriod = period === 'hoy' || period === 'dia';

  const incidentRows = useMemo(
    () => buildIncidentReportRows(aulaSeed, filteredStudents, schoolDays, today),
    [aulaSeed, filteredStudents, schoolDays, today],
  );

  const citations = useMemo(() => getCitationsForAula(classroom, start, end), [classroom, start, end]);
  const filteredCitations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return citations;
    return citations.filter((c) => c.student.toLowerCase().includes(q));
  }, [citations, search]);
  const citationStatuses = useMemo(
    () => Array.from(new Set(filteredCitations.map((c) => c.status))),
    [filteredCitations],
  );

  const handleDownload = (format: 'pdf' | 'csv') => {
    if (activeTab === 'asistencia') downloadAttendanceReport(format, aulaLabel, periodLabel, schoolDays, attendanceRows);
    else if (activeTab === 'incidencias') downloadIncidentsReport(format, aulaLabel, periodLabel, incidentRows);
    else downloadCitationsReport(format, aulaLabel, periodLabel, filteredCitations);

    toast({
      title: 'Descarga iniciada',
      description: `Se descargó el ${TAB_TITLES[activeTab].toLowerCase()} de ${aulaLabel} (${periodLabel}).`,
      variant: 'success',
    });
  };

  const legend =
    activeTab === 'asistencia' ? (
      <>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Leyenda:</span>
        <AttendanceGridLegend />
      </>
    ) : activeTab === 'citaciones' && citationStatuses.length > 0 ? (
      <>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Estado:</span>
        <OverviewStatusLegend statuses={citationStatuses} />
      </>
    ) : undefined;

  return (
    <>
      <ModulePaneHeader>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
            <ShieldAlert size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-800 dark:text-white">Vista General del Aula</p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {`${classroom.grade.replace('° Grado', '°')} ${classroom.section} • ${classroom.level}`}
            </p>
          </div>
        </div>
      </ModulePaneHeader>

      <OverviewTabsBar activeTab={activeTab} onTabChange={setActiveTab} legend={legend} />

      <OverviewPeriodBar
        period={period}
        onPeriodChange={setPeriod}
        cursor={cursor}
        today={today}
        onStep={(direction) => setCursor((prev) => stepPeriod(period, prev, direction))}
        search={search}
        onSearchChange={setSearch}
        downloadDisabled={false}
        onDownload={handleDownload}
      />

      <ModuleBody centered>
        {activeTab === 'asistencia' &&
          (filteredStudents.length === 0 ? (
            <OverviewInlineEmpty
              title="No hay alumnos que coincidan con la búsqueda"
              description="Prueba con otro nombre o quita el filtro de búsqueda."
            />
          ) : schoolDays.length === 0 ? (
            <OverviewInlineEmpty
              title="No hay clases en la fecha seleccionada"
              description="Elige otro día: el seleccionado cae en fin de semana."
            />
          ) : isSingleDayPeriod ? (
            <AttendanceDayTable rows={attendanceRows} />
          ) : (
            <AttendanceGridTable groups={dayGroups} rows={attendanceRows} />
          ))}

        {activeTab === 'incidencias' &&
          (incidentRows.length === 0 ? (
            <OverviewInlineEmpty
              title="No hay incidencias registradas en este periodo"
              description="Prueba con otro periodo o revisa que el aula tenga alumnos con incidencias."
            />
          ) : (
            <IncidentsTable rows={incidentRows} />
          ))}

        {activeTab === 'citaciones' &&
          (filteredCitations.length === 0 ? (
            <OverviewInlineEmpty
              title="No hay citaciones registradas en este periodo"
              description="Prueba con otro periodo, o revisa el módulo Citaciones para crear una nueva."
            />
          ) : (
            <CitationsTable citations={filteredCitations} />
          ))}
      </ModuleBody>
    </>
  );
};
