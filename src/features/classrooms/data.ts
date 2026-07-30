import type { CitationItem } from '@/features/classrooms/types';

/** Datos simulados del módulo de aulas: citaciones iniciales y horario docente. */

export const INITIAL_CITATIONS: CitationItem[] = [
  {
    id: "c1",
    name: "Luciana Delgado Ramos",
    avatarLetter: "L",
    avatarColor: "bg-teal-600",
    reason: "Incidencias - Acumulación de 5 incidencias leves",
    theme: "yellow",
    status: "pending",
    scheduledDate: "En proceso para el 2026-04-20 a las 10:00",
    incidents: [
      {
        type: "Uso de joyas",
        date: "10/04/2026",
        time: "08:15",
        teacher: "Ana Rojas",
      },
      {
        type: "Uso de celular",
        date: "11/04/2026",
        time: "11:30",
        teacher: "Carlos Mendoza",
      },
      {
        type: "Uñas pintadas",
        date: "12/04/2026",
        time: "10:00",
        teacher: "Ana Rojas",
      },
      {
        type: "Falta de aseo personal",
        date: "14/04/2026",
        time: "09:45",
        teacher: "Luis Ramirez",
      },
      {
        type: "Uniforme incompleto",
        date: "15/04/2026",
        time: "12:20",
        teacher: "Ana Rojas",
      },
    ],
  },
  {
    id: "c2",
    name: "Nicolas Mendoza Sanchez",
    avatarLetter: "N",
    avatarColor: "bg-rose-500",
    reason: "Incidencias - Acumulación de 3 incidencias moderadas",
    theme: "orange",
    status: "waiting",
    scheduledDate: "En proceso para el 2026-04-20 a las 15:30",
  },
  {
    id: "c3",
    name: "Luana Gutierrez Ramos",
    avatarLetter: "L",
    avatarColor: "bg-rose-500",
    reason: "Incidencias - 4 incidencias leves reportadas (En límite)",
    theme: "orange",
    status: "confirmed_by_parent",
    scheduledDate: "Confirmada para el 2026-04-20 a las 15:30",
  },
  {
    id: "c4",
    name: "Catalina Chavez Paredes",
    avatarLetter: "C",
    avatarColor: "bg-purple-500",
    reason: "Incidencias - 1 incidencia grave reportada",
    theme: "red",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-20 a las 15:30",
  },
  {
    id: "c5",
    name: "Diego Ramos Vargas",
    avatarLetter: "D",
    avatarColor: "bg-blue-600",
    reason: "Incidencias - Conducta reiterativa",
    theme: "yellow",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-21 a las 09:00",
  },
  {
    id: "c6",
    name: "Valentina Ruiz",
    avatarLetter: "V",
    avatarColor: "bg-emerald-600",
    reason: "Académico - Bajo rendimiento académico",
    theme: "orange",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-22 a las 10:30",
  },
  {
    id: "c7",
    name: "Santiago Silva",
    avatarLetter: "S",
    avatarColor: "bg-indigo-600",
    reason: "Otros - Faltas injustificadas",
    theme: "red",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-24 a las 11:00",
  },
  {
    id: "c8",
    name: "María Fernanda Lopez",
    avatarLetter: "M",
    avatarColor: "bg-pink-600",
    reason: "Otros - Problemas de convivencia",
    theme: "red",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-05 a las 08:30",
  },
  {
    id: "c9",
    name: "Joaquin Perez Rey",
    avatarLetter: "J",
    avatarColor: "bg-sky-600",
    reason: "Incidencias - Uso inadecuado de tablet",
    theme: "orange",
    status: "closed",
    scheduledDate: "Confirmada para el 2026-04-12 a las 10:00",
  },
  {
    id: "c10",
    name: "Valeria Gomez Torre",
    avatarLetter: "V",
    avatarColor: "bg-amber-600",
    reason: "Académico - Falta a clase virtual",
    theme: "blue",
    status: "pending",
    scheduledDate: "En proceso para el 2026-04-25 a las 16:00",
  },
  {
    id: "c11",
    name: "Sebastián Diaz",
    avatarLetter: "S",
    avatarColor: "bg-lime-600",
    reason: "Académico - Falta de tareas",
    theme: "blue",
    status: "waiting",
    scheduledDate: "En proceso para el 2026-04-26 a las 12:00",
  },
  {
    id: "c12",
    name: "Carla Pineda",
    avatarLetter: "C",
    avatarColor: "bg-cyan-600",
    reason: "Incidencias - Evasión de clases",
    theme: "red",
    status: "pending",
    scheduledDate: "En proceso para el 2026-04-22 a las 11:30",
    incidents: [
      {
        type: "Fuga de aula",
        date: "16/04/2026",
        time: "11:20",
        teacher: "Marta Díaz",
      },
    ],
  },
  {
    id: "c13",
    name: "Matias Cardenas",
    avatarLetter: "M",
    avatarColor: "bg-fuchsia-600",
    reason: "Académico - Falta de entrega de proyectos asignados",
    theme: "blue",
    status: "waiting",
    scheduledDate: "En proceso para el 2026-04-23 a las 09:15",
  },
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
