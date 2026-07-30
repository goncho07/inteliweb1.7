/** Constantes del módulo de aulas. */

export const COLORS = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
];

export const TEACHER_GRADES = ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"];
export const TEACHER_SECTIONS: Record<string, string[]> = {
  "1° Grado": ["A", "B", "C"],
  "2° Grado": ["A", "B", "C"],
  "3° Grado": ["A", "B", "C", "D"],
  "4° Grado": ["A", "B"],
  "5° Grado": ["A", "B"],
};

export const MONTHS = [
  { value: 2, label: "Marzo" },
  { value: 3, label: "Abril" },
  { value: 4, label: "Mayo" },
  { value: 5, label: "Junio" },
  { value: 6, label: "Julio" },
  { value: 7, label: "Agosto" },
  { value: 8, label: "Septiembre" },
  { value: 9, label: "Octubre" },
  { value: 10, label: "Noviembre" },
  { value: 11, label: "Diciembre" },
];
