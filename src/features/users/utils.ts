import jsPDF from 'jspdf';

import { ALL, COURSES } from '@/features/users/users.constants';
import type { UserItem } from '@/types';

/** Generación de los carnets QR de estudiante en PDF. */

const SCHOOL_NAME = 'I.E 6049 RICARDO PALMA';

/** Geometría de la hoja A4 en milímetros: 2 columnas × 4 filas de carnets. */
const CARD = { width: 85, height: 54, margin: 15, gap: 5, columns: 2, rows: 4 };

/** Un carnet = un estudiante en un curso. */
interface Carnet {
  student: UserItem;
  course: string;
  /** QR en base64, o `null` si el servicio no respondió. */
  image: string | null;
}

/** Estudiantes que entran en un lote de carnets, según los filtros elegidos. */
export const selectCarnetStudents = (
  users: UserItem[],
  level: string,
  grade: string,
  section: string,
): UserItem[] =>
  users.filter(
    (user) =>
      user.role === 'Estudiante' &&
      (level === ALL || user.level === level) &&
      (grade === ALL || user.grade === grade) &&
      (section === ALL || user.section === section),
  );

/** Cuántos carnets salen de una lista de estudiantes (uno por curso). */
export const countCarnets = (students: UserItem[]): number => students.length * COURSES.length;

const fetchQrImage = async (data: string): Promise<string | null> => {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Descarga los QR en tandas en vez de uno detrás de otro: con un aula entera
 * son cientos de peticiones y en serie la generación tardaba minutos sin que
 * la pantalla dijese nada.
 */
const CONCURRENCY = 6;

const loadCarnets = async (
  students: UserItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<Carnet[]> => {
  const pending: Carnet[] = students.flatMap((student) =>
    COURSES.map((course) => ({ student, course, image: null })),
  );

  let done = 0;
  for (let start = 0; start < pending.length; start += CONCURRENCY) {
    const batch = pending.slice(start, start + CONCURRENCY);
    await Promise.all(
      batch.map(async (carnet) => {
        carnet.image = await fetchQrImage(`STUDENT:${carnet.student.dni}:${carnet.course}`);
        done += 1;
        onProgress?.(done, pending.length);
      }),
    );
  }

  return pending;
};

/** Posición (x, y) del carnet número `index` dentro de su página. */
const cardPosition = (index: number): { x: number; y: number; isNewPage: boolean } => {
  const perPage = CARD.columns * CARD.rows;
  const slot = index % perPage;
  const column = slot % CARD.columns;
  const row = Math.floor(slot / CARD.columns);
  return {
    x: CARD.margin + column * (CARD.width + CARD.gap),
    y: CARD.margin + row * (CARD.height + CARD.gap),
    isNewPage: index > 0 && slot === 0,
  };
};

const drawCarnet = (doc: jsPDF, carnet: Carnet, x: number, y: number): void => {
  const { student, course, image } = carnet;
  const centerX = x + CARD.width / 2;

  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(x, y, CARD.width, CARD.height, 3, 3, 'S');

  doc.setFillColor(30, 64, 175);
  doc.roundedRect(x, y, CARD.width, 10, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, centerX, y + 6, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(student.name.toUpperCase(), centerX, y + 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(course.toUpperCase(), centerX, y + 22, { align: 'center' });

  if (image) {
    doc.addImage(image, 'PNG', x + (CARD.width - 25) / 2, y + 25, 25, 25);
  } else {
    // Sin QR el carnet sigue siendo útil si lleva el código legible debajo.
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('QR no disponible', centerX, y + 36, { align: 'center' });
    doc.text(`${student.dni} · ${course}`, centerX, y + 40, { align: 'center' });
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  const classroom = [student.level, student.grade, student.section].filter(Boolean).join(' · ');
  doc.text(classroom || 'Sin aula asignada', centerX, y + CARD.height - 4, { align: 'center' });
};

/**
 * Genera y descarga el PDF de carnets de los estudiantes indicados.
 * Devuelve cuántos QR no se pudieron descargar, para poder avisarlo.
 */
export const downloadCarnetsPdf = async (
  students: UserItem[],
  fileName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ failed: number }> => {
  const carnets = await loadCarnets(students, onProgress);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  carnets.forEach((carnet, index) => {
    const { x, y, isNewPage } = cardPosition(index);
    if (isNewPage) doc.addPage();
    drawCarnet(doc, carnet, x, y);
  });

  doc.save(`${fileName}.pdf`);
  return { failed: carnets.filter((carnet) => carnet.image === null).length };
};

/** Carnets QR (uno por curso) de un único estudiante. */
export const downloadUserQRCarnets = (user: UserItem): Promise<{ failed: number }> =>
  downloadCarnetsPdf([user], `Carnets_QR_${user.name.replace(/\s+/g, '_')}`);
