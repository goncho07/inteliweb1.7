import jsPDF from 'jspdf';

import { COURSES } from '@/features/users/constants';
import { MOCK_USERS } from '@/data/users';
import { UserItem } from '@/types';

/** Helpers del módulo de usuarios: generación de carnets QR y reportes en PDF. */

/** Genera y descarga el PDF con los carnets QR (uno por curso) de un estudiante. */
export const downloadUserQRCarnets = async (user: UserItem) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidth = 85;
  const cardHeight = 54;
  const margin = 15;
  const gap = 5;
  const pageWidth = doc.internal.pageSize.getWidth();

  let currentX = margin;
  let currentY = margin;

  // Mostrar un indicador de carga si es posible, pero aquí lo haremos directo
  for (const course of COURSES) {
    if (currentY + cardHeight > 280) {
      doc.addPage();
      currentY = margin;
      currentX = margin;
    }

    // Draw Card Border
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(currentX, currentY, cardWidth, cardHeight, 3, 3, 'S');

    // Header background
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(currentX, currentY, cardWidth, 10, 3, 3, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('I.E 6049 RICARDO PALMA', currentX + cardWidth / 2, currentY + 6, { align: 'center' });

    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(user.name.toUpperCase(), currentX + cardWidth / 2, currentY + 16, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text(course.toUpperCase(), currentX + cardWidth / 2, currentY + 22, { align: 'center' });

    // QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`STUDENT:${user.dni}:${course}`)}`;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.addImage(base64, 'PNG', currentX + (cardWidth - 25) / 2, currentY + 25, 25, 25);
    } catch (e) {
      console.error("Error loading QR", e);
    }

    // Footer info
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text(`${user.level} - ${user.grade?.replace("° Grado", "")}° ${user.section}`, currentX + cardWidth / 2, currentY + cardHeight - 4, { align: 'center' });

    // Update positions for grid (2 columns)
    if (currentX + cardWidth + gap + cardWidth > pageWidth) {
      currentX = margin;
      currentY += cardHeight + gap;
    } else {
      currentX += cardWidth + gap;
    }
  }

  doc.save(`Carnets_QR_${user.name.replace(/\s+/g, '_')}.pdf`);
};

/** Genera y descarga el reporte individual de incidencias de un usuario en PDF. */
export const downloadUserIncidentsReport = (user: UserItem) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Título Principal
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('REPORTE INDIVIDUAL DE INCIDENCIAS', pageWidth / 2, 22, { align: 'center' });

  // Cuadro de Información
  const startY = 30;
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(margin, startY, pageWidth - (margin * 2), 20);

  doc.setFontSize(9);
  doc.text(`ESTUDIANTE: ${user.name.toUpperCase()}`, margin + 5, startY + 7);
  doc.text(`DNI: ${user.dni}`, margin + 5, startY + 14);
  doc.text(`NIVEL: ${user.level?.toUpperCase() || '-'}`, margin + 100, startY + 7);
  doc.text(`GRADO/SECCIÓN: ${user.grade?.toUpperCase() || '-'} ${user.section?.toUpperCase() || '-'}`, margin + 100, startY + 14);

  // Mock Table Data (since we don't have the real logs here)
  const tableData = [
    ['12/05/2025', '08:15 AM', 'FALTA DE UNIFORME', 'NORMAS', 'Vino sin la corbata del uniforme.', 'REGISTRADO'],
    ['14/05/2025', '11:00 AM', 'SIN MATERIAL', 'ACADÉMICO', 'No trajo material de arte.', 'REGISTRADO']
  ];

  import('jspdf-autotable').then(({ default: autoTable }) => {
    autoTable(doc, {
      startY: startY + 25,
      head: [['FECHA', 'HORA', 'INCIDENCIA', 'CATEGORÍA', 'DETALLE', 'ESTADO']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.2
      },
      margin: { left: margin, right: margin }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      doc.text(`Generado el: ${dateStr}`, margin, footerY);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    }

    doc.save(`Reporte_Incidencias_${user.name.replace(/\s+/g, '_')}.pdf`);
  });
};

/** Genera y descarga en un único PDF los carnets QR (por curso) de todos los estudiantes filtrados por nivel/grado/sección. */
export const generateBulkCarnets = async (level: string, grade: string, section: string) => {
  const students = MOCK_USERS.filter(u =>
    u.role === 'Estudiante' &&
    (level === 'Todos' || u.level === level) &&
    (grade === 'Todos' || u.grade === grade) &&
    (section === 'Todos' || u.section === section)
  );

  if (students.length === 0) {
    alert("No se encontraron estudiantes con los filtros seleccionados.");
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidth = 85;
  const cardHeight = 54;
  const margin = 15;
  const gap = 5;
  const pageWidth = doc.internal.pageSize.getWidth();

  let currentX = margin;
  let currentY = margin;
  let isFirst = true;

  for (const user of students) {
    for (const course of COURSES) {
      if (!isFirst && currentX === margin && currentY === margin) {
        doc.addPage();
      }
      isFirst = false;

      // Draw Card Border
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(currentX, currentY, cardWidth, cardHeight, 3, 3, 'S');

      // Header background
      doc.setFillColor(30, 64, 175);
      doc.roundedRect(currentX, currentY, cardWidth, 10, 3, 3, 'F');

      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('I.E 6049 RICARDO PALMA', currentX + cardWidth / 2, currentY + 6, { align: 'center' });

      // Student Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(user.name.toUpperCase(), currentX + cardWidth / 2, currentY + 16, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text(course.toUpperCase(), currentX + cardWidth / 2, currentY + 22, { align: 'center' });

      // QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`STUDENT:${user.dni}:${course}`)}`;
      try {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, 'PNG', currentX + (cardWidth - 25) / 2, currentY + 25, 25, 25);
      } catch (e) {
        console.error("Error loading QR", e);
      }

      // Footer info
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text(`${user.level} - ${user.grade?.replace("° Grado", "")}° ${user.section}`, currentX + cardWidth / 2, currentY + cardHeight - 4, { align: 'center' });

      // Update positions for grid (2 columns)
      if (currentX + cardWidth + gap + cardWidth > pageWidth) {
        currentX = margin;
        currentY += cardHeight + gap;
        if (currentY + cardHeight > 280) {
          currentY = margin;
        }
      } else {
        currentX += cardWidth + gap;
      }
    }
  }

  doc.save(`Carnets_Lote_${level}_${grade}_${section}.pdf`);
};
