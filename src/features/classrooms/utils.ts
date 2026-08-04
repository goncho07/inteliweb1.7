import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type {
  AttendanceCalendarDay,
  PersonalIncidentEntry,
} from '@/features/classrooms/types';

/** Helpers del módulo de aulas. */

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
