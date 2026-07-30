import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ReportHistoryItem } from '@/components/reports/types';
import type {
  AttendanceCalendarDay,
  PersonalIncidentEntry,
} from '@/features/classrooms/types';

/** Helpers del módulo de aulas: auxiliares, historial de reportes e iconos. */

export const getAuxiliarForClassroom = (
  level: string,
  grade: string,
  section: string,
) => {
  if (level === "Secundaria") {
    if (grade === "1° Grado" || grade === "2° Grado") {
      return grade === "1° Grado" ? "Carlos Mendoza" : "Ana Rojas";
    } else if (grade === "3° Grado" || grade === "4° Grado") {
      return grade === "3° Grado" ? "Luis Ramirez" : "Carmen Vega";
    } else if (grade === "5° Grado") {
      return ["A", "B"].includes(section) ? "Jorge Silva" : "Rosa Paredes";
    }
  } else if (level === "Primaria") {
    return "María Fernandez";
  }
  return "Juana Perez";
};

export const getScopedReportsHistory = (
  classroom: {
    level: string;
    grade: string;
    section: string;
  },
  globalDate?: Date,
) => {
  const reports: ReportHistoryItem[] = [];
  let id = 1;
  const REPORT_TYPES = ["Diario", "Semanal", "Mensual", "Bimestral"];

  const realNow = new Date();
  const year = realNow.getFullYear();

  REPORT_TYPES.forEach((type) => {
    if (type === "Diario") {
      const curr = new Date(year, 2, 1);
      const endNode = new Date(year, 11, 31);
      while (curr <= endNode) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const currentDay = new Date(curr);
          const cYear = currentDay.getFullYear();
          const cMonth = currentDay.toLocaleDateString("es-ES", {
            month: "long",
          });
          const cCapMonth = cMonth.charAt(0).toUpperCase() + cMonth.slice(1);
          const cDayName = currentDay.toLocaleDateString("es-ES", {
            weekday: "long",
          });
          const cCapDayName =
            cDayName.charAt(0).toUpperCase() + cDayName.slice(1);
          const cDayDate = `${currentDay.getDate()} de ${cCapMonth} ${cYear}`;

          const isFuture =
            new Date(
              currentDay.getFullYear(),
              currentDay.getMonth(),
              currentDay.getDate(),
            ) >
            new Date(
              realNow.getFullYear(),
              realNow.getMonth(),
              realNow.getDate(),
            );

          reports.push({
            id: id++,
            type,
            title: `Reporte Diario - ${cCapDayName} ${currentDay.getDate()}`,
            date: cDayDate,
            level: classroom.level,
            grade: classroom.grade,
            section: classroom.section,
            size: isFuture ? "-" : `${(Math.random() * 1 + 0.5).toFixed(1)} MB`,
            progress: 100,
            status: isFuture ? "pending" : "generated",
            targetDate: currentDay,
          });
        }
        curr.setDate(curr.getDate() + 1);
      }
    } else if (type === "Semanal") {
      for (let m = 2; m <= 11; m++) {
        const d = new Date(year, m, 1);
        const monthNameStr = d.toLocaleDateString("es-ES", { month: "long" });
        const capMonth =
          monthNameStr.charAt(0).toUpperCase() + monthNameStr.slice(1);

        for (let i = 1; i <= 4; i++) {
          const startDay = (i - 1) * 7 + 1;
          const endDay = i * 7;
          const weekStartDate = new Date(year, m, startDay);
          const isFuture =
            new Date(
              weekStartDate.getFullYear(),
              weekStartDate.getMonth(),
              weekStartDate.getDate(),
            ) >
            new Date(
              realNow.getFullYear(),
              realNow.getMonth(),
              realNow.getDate(),
            );

          reports.push({
            id: id++,
            type,
            title: `Semana ${i} - ${capMonth}`,
            date: `${startDay} - ${endDay} de ${capMonth}`,
            level: classroom.level,
            grade: classroom.grade,
            section: classroom.section,
            size: isFuture ? "-" : `${(Math.random() * 2 + 1).toFixed(1)} MB`,
            progress: 100,
            status: isFuture ? "pending" : "generated",
            targetDate: weekStartDate,
          });
        }
      }
    } else if (type === "Mensual") {
      for (let m = 2; m <= 11; m++) {
        const d = new Date(year, m, 1);
        const monthNameStr = d.toLocaleDateString("es-ES", { month: "long" });
        const capMonth =
          monthNameStr.charAt(0).toUpperCase() + monthNameStr.slice(1);
        const isFuture =
          new Date(year, m, 1) >
          new Date(realNow.getFullYear(), realNow.getMonth(), 1);

        reports.push({
          id: id++,
          type,
          title: `Reporte Mensual - ${capMonth}`,
          date: `${capMonth} ${year}`,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: isFuture ? "-" : `${(Math.random() * 3 + 2).toFixed(1)} MB`,
          progress: 100,
          status: isFuture ? "pending" : "generated",
          targetDate: d,
        });
      }
    } else if (type === "Bimestral") {
      const bimesters = [
        { title: "I Bimestre (Marzo - Mayo)", month: 2 },
        { title: "II Bimestre (Mayo - Julio)", month: 4 },
        { title: "III Bimestre (Agosto - Octubre)", month: 7 },
        { title: "IV Bimestre (Octubre - Diciembre)", month: 9 },
      ];

      bimesters.forEach((b) => {
        const d = new Date(year, b.month, 1);
        const isFuture =
          new Date(year, b.month, 1) >
          new Date(realNow.getFullYear(), realNow.getMonth(), 1);
        reports.push({
          id: id++,
          type,
          title: b.title,
          date: `Bimestre ${year}`,
          level: classroom.level,
          grade: classroom.grade,
          section: classroom.section,
          size: isFuture ? "-" : `${(Math.random() * 5 + 3).toFixed(1)} MB`,
          progress: 100,
          status: isFuture ? "pending" : "generated",
          targetDate: d,
        });
      });
    }
  });
  return reports;
};

/**
 * Descompone la fecha agendada de una citación (texto libre tipo
 * "En proceso para el ... a las ...") en una fecha corta y una hora para
 * las tarjetas del panel de citaciones (`CitationsBoardPanel`).
 */
export const formatCitationSchedule = (scheduledDate?: string) => {
  let timeStr = "10:00 hrs";
  let dateStr = "15 Abr";
  if (scheduledDate) {
    const parts = scheduledDate
      .replace("En proceso para el ", "")
      .replace("Confirmada para el ", "")
      .split("a las");
    if (parts[0]) {
      dateStr = parts[0].trim();
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dDate = new Date(dateStr);
        dateStr = `${dDate.getDate()} ${dDate.toLocaleString("es-PE", { month: "short" })}`;
      } else {
        dateStr = dateStr.split(",")[0].replace(" de ", ", ");
      }
    }
    if (parts[1]) timeStr = parts[1].trim() + " hrs";
  }
  return { dateStr, timeStr };
};

/** Extrae el nombre del mes (Abril/Mayo/Junio) de la fecha agendada de una citación. */
export const getMonthFromName = (dateString: string | undefined) => {
  if (!dateString) return "";
  return dateString.toLowerCase().includes("abril")
    ? "Abril"
    : dateString.toLowerCase().includes("mayo")
      ? "Mayo"
      : dateString.toLowerCase().includes("junio")
        ? "Junio"
        : "";
};

/**
 * Genera y descarga el PDF del reporte personal de un estudiante
 * (asistencia mensual o incidencias) usado por `StudentDetail`.
 */
export const downloadStudentReport = ({
  studentName,
  reportType,
  selectedReportMonth,
  calendarData,
  personalIncidents,
}: {
  studentName: string;
  reportType: "Asistencia" | "Incidencias" | "Completo";
  selectedReportMonth: number;
  calendarData: (AttendanceCalendarDay | null)[];
  personalIncidents: PersonalIncidentEntry[];
}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("I.E 6049 RICARDO PALMA", pageWidth / 2, 15, { align: "center" });
  doc.text(`REGISTRO DE ${reportType.toUpperCase()}`, pageWidth / 2, 22, {
    align: "center",
  });

  // Subheader info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TIPO: ESTUDIANTES", 14, 35);
  doc.text("NIVEL: INICIAL", 70, 35);
  doc.text("GRADO: 3 AÑOS", 130, 35);
  doc.text("SECCIÓN: MARGARITAS", 190, 35);

  const monthNames = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  const currentMonthName = monthNames[selectedReportMonth];
  const currentYear = new Date().getFullYear();
  doc.text(`MES: ${currentMonthName} ${currentYear}`, 250, 35);

  // Draw border for subheader
  doc.rect(12, 28, pageWidth - 24, 10);

  if (reportType === "Asistencia") {
    // Generate days for the month
    const daysInMonth = new Date(
      currentYear,
      selectedReportMonth + 1,
      0,
    ).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const dayLetters = days.map((day) => {
      const date = new Date(currentYear, selectedReportMonth, day);
      const dayOfWeek = date.getDay();
      return ["D", "L", "M", "M", "J", "V", "S"][dayOfWeek];
    });

    const head = [
      [
        {
          content: "N°",
          rowSpan: 2,
          styles: { halign: "center" as const, valign: "middle" as const },
        },
        {
          content: "APELLIDOS Y NOMBRES",
          rowSpan: 2,
          styles: { halign: "center" as const, valign: "middle" as const },
        },
        ...days.map((d) => ({
          content: d.toString(),
          styles: { halign: "center" as const, cellPadding: 1 },
        })),
      ],
      [
        ...dayLetters.map((l) => ({
          content: l,
          styles: { halign: "center" as const, cellPadding: 1 },
        })),
      ],
    ];

    const body = [
      [
        1,
        studentName.toUpperCase(),
        ...days.map((day) => {
          const date = new Date(currentYear, selectedReportMonth, day);
          const dayOfWeek = date.getDay();

          if (dayOfWeek === 0 || dayOfWeek === 6) {
            return ""; // Weekend
          } else {
            // Use actual calendar data if available
            const record = calendarData.find((r) => r && r.dayNumber === day);
            if (record) {
              if (record.originalStatus === "Falta")
                return {
                  content: "F",
                  styles: {
                    textColor: [255, 0, 0] as [number, number, number],
                  },
                };
              if (record.originalStatus === "Tardanza")
                return {
                  content: "T",
                  styles: {
                    textColor: [255, 165, 0] as [number, number, number],
                  },
                };
              if (record.status.includes("Justificada"))
                return {
                  content: "J",
                  styles: {
                    textColor: [0, 0, 255] as [number, number, number],
                  },
                };
            }
            return ""; // Present
          }
        }),
      ],
    ];

    autoTable(doc, {
      startY: 40,
      head: head,
      body: body,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 1,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 50 },
      },
    });

    // Legend
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      ". Asistió   F Faltó   T Tardanza   J Falta justificada",
      14,
      finalY + 5,
    );

    // Print date
    const printDate = new Date().toLocaleString("es-PE");
    doc.text(`Impreso: ${printDate}`, pageWidth - 14, finalY + 5, {
      align: "right",
    });
  } else if (reportType === "Incidencias") {
    const head = [["Fecha", "Hora", "Tipo", "Descripción", "Registrado por"]];
    const body = personalIncidents.map((inc) => [
      inc.date,
      inc.time || "10:30 AM",
      inc.type.label,
      inc.description,
      inc.teacher || "Prof. María García",
    ]);

    autoTable(doc, {
      startY: 40,
      head: head,
      body: body,
      theme: "grid",
      styles: { fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 40;
    const printDate = new Date().toLocaleString("es-PE");
    doc.setFontSize(8);
    doc.text(`Impreso: ${printDate}`, pageWidth - 14, finalY + 5, {
      align: "right",
    });
  }

  doc.save(`Reporte_${reportType}_${studentName.replace(/\s+/g, '_')}.pdf`);
};

export const getFluentClassroomIcon = (section: string) => {
  const hash = section.charCodeAt(0) % 5;
  const icons = [
    "blue-book.svg",
    "green-book.svg",
    "orange-book.svg",
    "closed-book.svg",
    "open-book.svg",
  ];
  return icons[hash];
};
