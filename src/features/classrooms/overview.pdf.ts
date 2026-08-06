import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { Citation } from '@/features/citations/types';

import { formatStudentDisplayName } from './overview.format';
import { ATTENDANCE_CELL_META, type AttendanceGridDay, type AttendanceGridRow, type IncidentReportRow } from './overview.rows';

/**
 * Descarga real del reporte actualmente visible en la Vista General del Aula
 * (aula + periodo + pestaña activa). Los PDF se generan de verdad con jsPDF;
 * Excel se exporta como un CSV real (Excel lo abre sin problema), con
 * exactamente los mismos datos deterministas que se ven en pantalla.
 */

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const toCsv = (rows: string[][]) =>
  rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n');

/** BOM UTF-8: sin él, Excel abre el CSV con acentos rotos. */
const BOM = String.fromCharCode(0xfeff);

const triggerBlobDownload = (content: string, fileName: string) => {
  const blob = new Blob([BOM, content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const addHeader = (doc: jsPDF, title: string, aulaLabel: string, periodLabel: string) => {
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`${aulaLabel} · ${periodLabel}`, 14, 25);
};

export const downloadAttendanceReport = (
  format: 'pdf' | 'csv',
  aulaLabel: string,
  periodLabel: string,
  days: AttendanceGridDay[],
  rows: AttendanceGridRow[],
) => {
  const head = ['N°', 'Estudiante', ...days.map((d) => `${d.dayLabel} ${d.weekdayLabel}`)];
  const body = rows.map((row, index) => [
    String(index + 1),
    formatStudentDisplayName(row.name),
    ...row.cells.map((state) => ATTENDANCE_CELL_META[state].letter),
  ]);
  const fileName = sanitizeFileName(`Asistencia_${aulaLabel}_${periodLabel}`);

  if (format === 'pdf') {
    const doc = new jsPDF({ orientation: days.length > 10 ? 'landscape' : 'portrait' });
    addHeader(doc, 'Reporte de Asistencia', aulaLabel, periodLabel);
    autoTable(doc, { startY: 30, head: [head], body, styles: { fontSize: 7 } });
    doc.save(`${fileName}.pdf`);
    return;
  }
  triggerBlobDownload(toCsv([head, ...body]), `${fileName}.csv`);
};

export const downloadIncidentsReport = (
  format: 'pdf' | 'csv',
  aulaLabel: string,
  periodLabel: string,
  rows: IncidentReportRow[],
) => {
  const head = ['N°', 'Estudiante', 'Fecha y hora', 'Tipo', 'Gravedad', 'Registrado por', 'Descripción'];
  const body = rows.map((row, index) => [
    String(index + 1),
    formatStudentDisplayName(row.studentName),
    `${row.dateLabel} ${row.timeLabel}`,
    row.type.label,
    row.type.category,
    row.teacherName,
    row.description,
  ]);
  const fileName = sanitizeFileName(`Incidencias_${aulaLabel}_${periodLabel}`);

  if (format === 'pdf') {
    const doc = new jsPDF();
    addHeader(doc, 'Reporte de Incidencias', aulaLabel, periodLabel);
    autoTable(doc, { startY: 30, head: [head], body, styles: { fontSize: 8 } });
    doc.save(`${fileName}.pdf`);
    return;
  }
  triggerBlobDownload(toCsv([head, ...body]), `${fileName}.csv`);
};

export const downloadCitationsReport = (
  format: 'pdf' | 'csv',
  aulaLabel: string,
  periodLabel: string,
  citations: Citation[],
) => {
  const head = ['N°', 'Estudiante', 'Fecha citación', 'Motivo de citación', 'Apoderado citado', 'Estado'];
  const body = citations.map((c, index) => [
    String(index + 1),
    c.student,
    `${c.date} ${c.time}`,
    c.reason,
    `${c.parent} (${c.relationship})`,
    c.status,
  ]);
  const fileName = sanitizeFileName(`Citaciones_${aulaLabel}_${periodLabel}`);

  if (format === 'pdf') {
    const doc = new jsPDF();
    addHeader(doc, 'Reporte de Citaciones', aulaLabel, periodLabel);
    autoTable(doc, { startY: 30, head: [head], body, styles: { fontSize: 8 } });
    doc.save(`${fileName}.pdf`);
    return;
  }
  triggerBlobDownload(toCsv([head, ...body]), `${fileName}.csv`);
};
