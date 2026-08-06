import { pseudoRandom } from '@/lib/pseudoRandom';
import type { CalendarEvent } from '@/types';

/**
 * Datos del calendario escolar 2026: feriados, efemérides, citaciones
 * y el horario docente. Extraídos de App.tsx para romper la dependencia
 * circular con los componentes de calendario.
 */

// --- CONFIGURACIÓN CALENDARIO (Movido a Global) ---
export const YEAR = 2026;
export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
export const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/* -------------------------------------------------------------------------
 * Bimestres del año escolar
 * ---------------------------------------------------------------------- */

export interface SchoolTerm {
  id: 1 | 2 | 3 | 4;
  /** "1° Bimestre", el nombre completo. */
  label: string;
  /** "1° Bim.", para rótulos estrechos como la cabecera de la tabla de asistencia. */
  shortLabel: string;
  start: Date;
  end: Date;
}

/**
 * Determinación de bimestres del año escolar 2026 del Ministerio de
 * Educación. **Es la única fuente de fechas lectivas de la app**: de aquí
 * salen el selector de bimestre del panel Inicio, el recorte de meses de los
 * reportes y la numeración de semanas de la tabla de asistencia. Los tramos
 * entre un bimestre y el siguiente son vacaciones: no hay clases y, por
 * tanto, tampoco asistencia que registrar.
 */
export const SCHOOL_TERMS: SchoolTerm[] = [
  { id: 1, label: '1° Bimestre', shortLabel: '1° Bim.', start: new Date(YEAR, 2, 16), end: new Date(YEAR, 4, 15) },
  { id: 2, label: '2° Bimestre', shortLabel: '2° Bim.', start: new Date(YEAR, 4, 25), end: new Date(YEAR, 6, 24) },
  { id: 3, label: '3° Bimestre', shortLabel: '3° Bim.', start: new Date(YEAR, 7, 10), end: new Date(YEAR, 9, 9) },
  { id: 4, label: '4° Bimestre', shortLabel: '4° Bim.', start: new Date(YEAR, 9, 19), end: new Date(YEAR, 11, 18) },
];

/**
 * Inicio y fin del año escolar: del 16 de marzo al 18 de diciembre. Fuera de
 * ese rango no hay colegio, así que ningún reporte muestra enero ni febrero
 * — no se inventa asistencia de un día sin clases.
 */
export const SCHOOL_YEAR_START = SCHOOL_TERMS[0].start;
export const SCHOOL_YEAR_END = SCHOOL_TERMS[SCHOOL_TERMS.length - 1].end;

/** Rótulo de un tramo que cae entre dos bimestres. */
export const VACATION_LABEL = 'Vacaciones';

/** Bimestre al que pertenece una fecha, o `null` si cae en vacaciones (o fuera del año escolar). */
export const getSchoolTerm = (date: Date): SchoolTerm | null =>
  SCHOOL_TERMS.find((term) => date >= term.start && date <= term.end) ?? null;

/** Lunes de la semana en la que cae `date` (la semana escolar empieza en lunes). */
const mondayOf = (date: Date): Date => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (monday.getDay() + 6) % 7; // domingo (0) queda a 6 días de su lunes
  monday.setDate(monday.getDate() - offset);
  return monday;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Número de semana de una fecha **dentro de su bimestre**, contando desde la
 * fecha de inicio del bimestre y no desde el 1 del mes: por eso el 1 de
 * septiembre es "Semana 4" (el 3° Bimestre arrancó el 10 de agosto) aunque
 * sea el primer día del mes. La semana 1 es la que contiene el día de inicio.
 */
export const getTermWeekNumber = (date: Date, term: SchoolTerm): number =>
  Math.floor((mondayOf(date).getTime() - mondayOf(term.start).getTime()) / MS_PER_DAY / 7) + 1;

// Las claves tienen el formato "MesIndex-Dia" (mes base 0).
// Keys are "MonthIndex-Day" (0-based month)
export const EVENTS_2026: Record<string, CalendarEvent[]> = {
  "2-8": [{ label: "Día Int. de la Mujer", type: "civico" }],
  "2-14": [{ label: "Nac. Albert Einstein", type: "civico" }],
  "2-15": [{ label: "Día Derechos Consumidor", type: "civico" }],
  "2-16": [{ label: "INICIO AÑO ESCOLAR / I BIMESTRE", type: "academico" }],
  "2-18": [{ label: "Simulacro de Sismo", type: "gestion" }],
  "2-21": [{ label: "Día Síndrome de Down", type: "civico" }],
  "2-22": [{ label: "Día Mundial del Agua", type: "civico" }],
  "2-24": [{ label: "Lucha contra TBC", type: "civico" }],
  "2-26": [{ label: "La Hora del Planeta", type: "civico" }],
  "2-28": [{ label: "Nac. Mario Vargas Llosa", type: "civico" }],
  "3-1": [{ label: "Día de la Educación", type: "civico" }],
  "3-2": [
    { label: "Jueves Santo", type: "feriado" },
    { label: "Día Libro Infantil / Autismo", type: "civico" },
  ],
  "3-3": [{ label: "Viernes Santo", type: "feriado" }],
  "3-7": [{ label: "Día Mundial de la Salud", type: "civico" }],
  "3-12": [{ label: "Día Niño Peruano / Inca Garcilaso", type: "civico" }],
  "3-14": [{ label: "Día de las Américas", type: "civico" }],
  "3-22": [{ label: "Día de la Tierra", type: "civico" }],
  "3-23": [{ label: "Día del Idioma / Libro", type: "civico" }],
  "4-1": [{ label: "Día del Trabajo", type: "feriado" }],
  "4-2": [{ label: "Combate del Dos de Mayo", type: "civico" }],
  "4-8": [{ label: "Cruz Roja", type: "civico" }],
  "4-10": [{ label: "Día de la Madre", type: "civico" }],
  "4-11": [{ label: "Acción Heroica M. Parado de Bellido", type: "civico" }],
  "4-15": [
    { label: "FIN I BIMESTRE", type: "academico" },
    { label: "Día de la Familia", type: "civico" },
  ],
  "4-16": [{ label: "Inicio Vacaciones Gestión 1", type: "vacaciones" }],
  "4-17": [
    { label: "Día de Internet", type: "civico" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "4-18": [
    { label: "Sacrificio Túpac Amaru II", type: "civico" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "4-19": [{ label: "Vacaciones", type: "vacaciones" }],
  "4-20": [{ label: "Vacaciones", type: "vacaciones" }],
  "4-21": [{ label: "Vacaciones", type: "vacaciones" }],
  "4-22": [{ label: "Vacaciones", type: "vacaciones" }],
  "4-23": [{ label: "Vacaciones", type: "vacaciones" }],
  "4-24": [{ label: "Fin Vacaciones", type: "vacaciones" }],
  "4-25": [
    { label: "INICIO II BIMESTRE", type: "academico" },
    { label: "Educación Inicial", type: "civico" },
  ],
  "4-26": [{ label: "Integración Andina", type: "civico" }],
  "4-31": [{ label: "Día Sin Tabaco", type: "civico" }],
  "5-2": [{ label: "Día Faustino Sánchez Carrión", type: "civico" }],
  "5-5": [{ label: "Medio Ambiente", type: "civico" }],
  "5-7": [{ label: "Día de la Bandera", type: "feriado" }],
  "5-12": [{ label: "Contra Trabajo Infantil", type: "civico" }],
  "5-17": [{ label: "Lucha contra Sequía", type: "civico" }],
  "5-21": [{ label: "Día del Padre", type: "civico" }],
  "5-24": [{ label: "Día del Campesino", type: "civico" }],
  "5-26": [{ label: "Lucha contra Drogas", type: "civico" }],
  "5-29": [{ label: "San Pedro y San Pablo", type: "feriado" }],
  "6-6": [{ label: "Día del Maestro", type: "civico" }],
  "6-7": [{ label: "Descubrimiento Machu Picchu", type: "civico" }],
  "6-10": [{ label: "Batalla de Huamachuco", type: "civico" }],
  "6-23": [{ label: "Capitán FAP Quiñones", type: "feriado" }],
  "6-24": [
    { label: "FIN II BIMESTRE", type: "academico" },
    { label: "Nac. Simón Bolívar", type: "civico" },
  ],
  "6-27": [{ label: "Inicio Vacaciones Medio Año", type: "vacaciones" }],
  "6-28": [
    { label: "Independencia del Perú", type: "feriado" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "6-29": [
    { label: "Fiestas Patrias", type: "feriado" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "6-30": [{ label: "Vacaciones", type: "vacaciones" }],
  "6-31": [{ label: "Vacaciones", type: "vacaciones" }],
  "7-1": [{ label: "Vacaciones", type: "vacaciones" }],
  "7-2": [{ label: "Vacaciones", type: "vacaciones" }],
  "7-3": [{ label: "Vacaciones", type: "vacaciones" }],
  "7-4": [{ label: "Vacaciones", type: "vacaciones" }],
  "7-5": [{ label: "Vacaciones", type: "vacaciones" }],
  "7-6": [
    { label: "Batalla de Junín", type: "feriado" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "7-7": [{ label: "Fin Vacaciones", type: "vacaciones" }],
  "7-9": [{ label: "Poblaciones Indígenas", type: "civico" }],
  "7-10": [{ label: "INICIO III BIMESTRE", type: "academico" }],
  "7-17": [{ label: "Muerte San Martín", type: "civico" }],
  "7-22": [{ label: "Día del Folclore", type: "civico" }],
  "7-26": [{ label: "Día del Adulto Mayor", type: "civico" }],
  "7-28": [{ label: "Reincorporación de Tacna", type: "civico" }],
  "7-30": [{ label: "Santa Rosa de Lima", type: "feriado" }],
  "8-1": [{ label: "Semana Educación Vial", type: "civico" }],
  "8-7": [{ label: "Derechos Cívicos de la Mujer", type: "civico" }],
  "8-8": [{ label: "Alfabetización", type: "civico" }],
  "8-13": [{ label: "Familia Peruana", type: "civico" }],
  "8-23": [{ label: "Primavera / Juventud", type: "civico" }],
  "8-24": [{ label: "Derechos Humanos", type: "civico" }],
  "9-1": [{ label: "Día del Periodismo", type: "civico" }],
  "9-8": [
    { label: "Combate de Angamos", type: "feriado" },
    { label: "Educación Física", type: "civico" },
  ],
  "9-9": [{ label: "FIN III BIMESTRE", type: "academico" }],
  "9-10": [{ label: "Inicio Gestión 3", type: "vacaciones" }],
  "9-11": [{ label: "Vacaciones", type: "vacaciones" }],
  "9-12": [
    { label: "Llegada Cristóbal Colón", type: "civico" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "9-13": [{ label: "Vacaciones", type: "vacaciones" }],
  "9-14": [{ label: "Vacaciones", type: "vacaciones" }],
  "9-15": [{ label: "Vacaciones", type: "vacaciones" }],
  "9-16": [
    { label: "Persona con Discapacidad", type: "civico" },
    { label: "Vacaciones", type: "vacaciones" },
  ],
  "9-17": [{ label: "Vacaciones", type: "vacaciones" }],
  "9-18": [{ label: "Fin Vacaciones", type: "vacaciones" }],
  "9-19": [{ label: "INICIO IV BIMESTRE", type: "academico" }],
  "9-21": [{ label: "Ahorro de Energía", type: "civico" }],
  "9-31": [{ label: "Día de la Canción Criolla", type: "civico" }],
  "10-1": [{ label: "Todos los Santos", type: "feriado" }],
  "10-4": [{ label: "Rebelión Túpac Amaru II", type: "civico" }],
  "10-10": [{ label: "Biblioteca Escolar", type: "civico" }],
  "10-20": [{ label: "Derechos del Niño", type: "civico" }],
  "10-27": [{ label: "Batalla de Tarapacá", type: "civico" }],
  "11-1": [{ label: "Lucha contra el SIDA", type: "civico" }],
  "11-8": [{ label: "Inmaculada Concepción", type: "feriado" }],
  "11-9": [{ label: "Batalla de Ayacucho", type: "feriado" }],
  "11-10": [{ label: "Derechos Humanos", type: "civico" }],
  "11-18": [{ label: "FIN IV BIMESTRE / CLAUSURA", type: "academico" }],
  "11-25": [{ label: "Navidad", type: "feriado" }],
};

export const CITATIONS_2026: Record<string, CalendarEvent[]> = {
  // MARZO (Month 2)
  // March 18 is Wed. Miercoles libre 09:30 AM
  "2-18": [
    {
      label: "Citación Madre de Valentina S.",
      type: "academico",
      time: "09:30 AM",
      student: "Valentina Soto",
      parent: "Carla Soto",
      reason: "Adaptación al año escolar",
    },
    {
      label: "Citación Padre de Diego H.",
      type: "incidencia",
      time: "12:45 PM",
      student: "Diego Huamán",
      parent: "Jorge Huamán",
      reason: "Conducta en recreo",
    },
  ],
  // March 2 is Monday. Lunes libre 11:15 AM
  "2-2": [
    {
      label: "Citación de Apoderado de Lucía D.",
      type: "academico",
      time: "11:15 AM",
      student: "Lucía Domínguez",
      parent: "María López",
      reason: "Falta de tareas",
    },
  ],
  // March 3 is Tuesday. Martes libre 09:30 AM
  "2-3": [
    {
      label: "Citación Madre de Camila V.",
      type: "incidencia",
      time: "09:30 AM",
      student: "Camila Vargas",
      parent: "Ana Vargas",
      reason: "Pelea en recreo",
    },
  ],
  // March 4 is Wed. Miercoles libre 09:30 AM
  "2-4": [
    {
      label: "Citación Madre de Thiago",
      type: "gestion",
      time: "09:30 AM",
      student: "Thiago Gómez",
      parent: "Luis Gómez",
      reason: "Firma de compromiso",
    },
  ],
  // March 5 is Thu. Jueves libre 10:15 AM
  "2-5": [
    {
      label: "Citación Padre de José",
      type: "otros",
      time: "10:15 AM",
      student: "José Ramirez",
      parent: "Carlos Ruiz",
      reason: "Faltas injustificadas",
    },
  ],
  // March 6 is Fri. Viernes libre 08:00 AM
  "2-6": [
    {
      label: "Citación Padre de Mateo R.",
      type: "academico",
      time: "08:00 AM",
      student: "Mateo Rojas",
      parent: "Elena Rojas",
      reason: "Entrega de libreta",
    },
  ],

  // ABRIL (Month 3)
  // April 6 is Mon. Lunes libre 11:15 AM
  "3-6": [
    {
      label: "Citación Padre de Santiago",
      type: "academico",
      time: "11:15 AM",
      student: "Santiago Ruiz",
      parent: "Andrés Ruiz",
      reason: "Mejora reportada",
    },
  ],
  // April 7 is Tue. Martes libre 09:30 AM
  "3-7": [
    {
      label: "Citación Madre de Juan Pérez",
      type: "incidencia",
      time: "09:30 AM",
      student: "Juan Pérez",
      parent: "Ana L.",
      reason: "Agresión en aula",
    },
  ],
  // April 8 is Wed. Miercoles libre 09:30 AM
  "3-8": [
    {
      label: "Citación Padre de Luis Silva",
      type: "academico",
      time: "09:30 AM",
      student: "Luis Silva",
      parent: "Alberto Silva",
      reason: "Apoyo en Lenguaje",
    },
  ],
  // April 9 is Thu. Jueves libre 10:15 AM
  "3-9": [
    {
      label: "Citación Madre de Andrea",
      type: "academico",
      time: "10:15 AM",
      student: "Andrea Conde",
      parent: "Julia Conde",
      reason: "Revisión de cuaderno",
    },
  ],
  // April 13 is Mon. Lunes libre 14:00 PM
  "3-13": [
    {
      label: "Citación Padre de Nicolas",
      type: "gestion",
      time: "14:00 PM",
      student: "Nicolas Salas",
      parent: "Victor Salas",
      reason: "Matrícula condicional",
    },
  ],

  // MAYO (Month 4)
  // May 4 is Mon. Lunes libre 11:15 AM
  "4-4": [
    {
      label: "Citación Madre de Benjamín",
      type: "academico",
      time: "11:15 AM",
      student: "Benjamín Flores",
      parent: "Silvia Flores",
      reason: "Excelente progreso, plan de beca",
    },
  ],
  // May 5 is Tue. Martes libre 09:30 AM
  "4-5": [
    {
      label: "Citación Padre de Gael",
      type: "incidencia",
      time: "09:30 AM",
      student: "Gael Ramos",
      parent: "Roberto Ramos",
      reason: "Agresión en horario de salida",
    },
  ],
  // May 6 is Wed. Miercoles libre 09:30 AM
  "4-6": [
    {
      label: "Citación Madre de Isabella",
      type: "gestion",
      time: "09:30 AM",
      student: "Isabella Silva",
      parent: "Karen Silva",
      reason: "Falta de seguro escolar",
    },
  ],
  // May 7 is Thu. Jueves libre 10:15 AM
  "4-7": [
    {
      label: "Citación Padre de Thiago Castillo",
      type: "academico",
      time: "10:15 AM",
      student: "Thiago Castillo",
      parent: "Julio Castillo",
      reason: "Desempeño bajo en ciencias",
    },
  ],
  // May 8 is Fri. Viernes libre 08:00 AM
  "4-8": [
    {
      label: "Citación Apoderado de Mia",
      type: "incidencia",
      time: "08:00 AM",
      student: "Mia Cardenas",
      parent: "Rosa Cardenas",
      reason: "Interrupciones constantes en clase",
    },
  ],

  // JUNIO (Month 5)
  // June 1 is Mon. Lunes libre 14:00 PM
  "5-1": [
    {
      label: "Citación Padre de Emilio",
      type: "gestion",
      time: "14:00 PM",
      student: "Emilio Castro",
      parent: "Jose Castro",
      reason: "Validación de traslado documental",
    },
  ],
  // June 2 is Tue. Martes libre 10:15 AM
  "5-2": [
    {
      label: "Citación Madre de Alejandro",
      type: "academico",
      time: "10:15 AM",
      student: "Alejandro Mendoza",
      parent: "Susana Mendoza",
      reason: "Reforzamiento de lectura",
    },
  ],
};

export const SCHEDULE_TIME_SLOTS = [
  { start: "8:00", end: "8:45" },
  { start: "8:45", end: "9:30" },
  { start: "9:30", end: "10:15" },
  { start: "10:15", end: "11:00" },
  { start: "11:00", end: "11:15", isRecreo: true },
  { start: "11:15", end: "12:00" },
  { start: "12:00", end: "12:45" },
  { start: "12:45", end: "13:15", isRecreo: true },
  { start: "13:15", end: "14:00" },
  { start: "14:00", end: "14:45" },
  { start: "14:45", end: "15:30" },
];

export const TEACHER_SCHEDULE: Record<
  string,
  {
    start: string;
    end: string;
    subject: string;
    section?: string;
    color: string;
  }[]
> = {
  Lunes: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
  ],
  Martes: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "TUT",
      section: "3°C",
      color:
        "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600/60 dark:text-emerald-100 dark:border-emerald-700",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "TUT",
      section: "3°C",
      color:
        "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600/60 dark:text-emerald-100 dark:border-emerald-700",
    },
  ],
  Miércoles: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "DPCC",
      section: "3°B",
      color:
        "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "REUNIÓN TUTORIAS",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "REUNIÓN TUTORIAS",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "DPCC",
      section: "4°A",
      color:
        "bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    },
  ],
  Jueves: [
    {
      start: "8:00",
      end: "8:45",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "DPCC",
      section: "3°A",
      color:
        "bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "DPCC",
      section: "3°C",
      color:
        "bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700",
    },
  ],
  Viernes: [
    {
      start: "8:00",
      end: "8:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "8:45",
      end: "9:30",
      subject: "REUNIÓN CORD DPCC",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
    {
      start: "9:30",
      end: "10:15",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "10:15",
      end: "11:00",
      subject: "DPCC",
      section: "4°B",
      color:
        "bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700",
    },
    {
      start: "11:00",
      end: "11:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "11:15",
      end: "12:00",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "12:00",
      end: "12:45",
      subject: "DPCC",
      section: "3°D",
      color:
        "bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700",
    },
    {
      start: "12:45",
      end: "13:15",
      subject: "RECREO",
      color:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      start: "13:15",
      end: "14:00",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:00",
      end: "14:45",
      subject: "LIBRE",
      color:
        "bg-transparent text-slate-400 border-dashed border-slate-200 dark:border-slate-800",
    },
    {
      start: "14:45",
      end: "15:30",
      subject: "REUNIÓN CORD EPT",
      color: "bg-transparent text-slate-800 font-bold dark:text-slate-200",
    },
  ],
};

/* -------------------------------------------------------------------------
 * Horario del alumno (vista del apoderado)
 * ---------------------------------------------------------------------- */

/**
 * El apoderado no ve el horario del docente que inició sesión (no tiene
 * sentido para él) — ve el horario semanal de clases de su propio hijo. No
 * hay una malla curricular real que traer, así que se deriva de forma
 * determinista del aula del alumno (nivel, grado y sección) con
 * `pseudoRandom`: la misma aula siempre muestra el mismo horario.
 */
const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  Inicial: ['Juego Libre', 'Psicomotricidad', 'Comunicación', 'Matemática', 'Arte', 'Música'],
  Primaria: [
    'Comunicación',
    'Matemática',
    'Personal Social',
    'Ciencia y Tecnología',
    'Arte y Cultura',
    'Educación Física',
    'Inglés',
    'Religión',
    'Tutoría',
  ],
  Secundaria: [
    'Comunicación',
    'Matemática',
    'Inglés',
    'Ciencias Sociales',
    'Ciencia y Tecnología',
    'DPCC',
    'Educación Física',
    'Arte y Cultura',
    'Religión',
    'Educación para el Trabajo',
    'Tutoría',
  ],
};

const STUDENT_SUBJECT_COLORS = [
  'bg-indigo-200 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
  'bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800',
  'bg-amber-400 text-amber-900 border-amber-500 dark:bg-amber-600/40 dark:text-amber-300 dark:border-amber-700',
  'bg-sky-400 text-sky-900 border-sky-500 dark:bg-sky-600/40 dark:text-sky-200 dark:border-sky-700',
  'bg-yellow-300 text-yellow-900 border-yellow-400 dark:bg-yellow-600/40 dark:text-yellow-300 dark:border-yellow-700',
  'bg-lime-300 text-lime-900 border-lime-400 dark:bg-lime-600/40 dark:text-lime-300 dark:border-lime-700',
  'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600/60 dark:text-emerald-100 dark:border-emerald-700',
  'bg-violet-300 text-violet-900 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800',
];

export interface StudentScheduleSlot {
  start: string;
  end: string;
  subject: string;
  color: string;
  isRecreo?: boolean;
}

/** Horario semanal de un alumno para un día puntual, mismo orden que `SCHEDULE_TIME_SLOTS`. */
export const getStudentSchedule = (
  level: string,
  grade: string,
  section: string,
  weekday: string,
): StudentScheduleSlot[] => {
  const subjects = SUBJECTS_BY_LEVEL[level] ?? SUBJECTS_BY_LEVEL.Primaria;
  const seedBase = `horario-alumno-${level}-${grade}-${section}-${weekday}`;

  let classSlotIndex = 0;
  let blockSubject = '';

  return SCHEDULE_TIME_SLOTS.map((slot) => {
    if (slot.isRecreo) {
      return {
        start: slot.start,
        end: slot.end,
        subject: 'Recreo',
        color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        isRecreo: true,
      };
    }

    // Bloques de dos periodos seguidos con la misma materia, como en un horario real.
    if (classSlotIndex % 2 === 0) {
      const previousSubject = blockSubject;
      let index = Math.floor(pseudoRandom(`${seedBase}-${classSlotIndex}`) * subjects.length);
      if (subjects[index] === previousSubject) index = (index + 1) % subjects.length;
      blockSubject = subjects[index];
    }
    classSlotIndex += 1;

    const colorIndex = subjects.indexOf(blockSubject) % STUDENT_SUBJECT_COLORS.length;
    return { start: slot.start, end: slot.end, subject: blockSubject, color: STUDENT_SUBJECT_COLORS[colorIndex] };
  });
};
