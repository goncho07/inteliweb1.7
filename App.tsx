import React, { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  Bot,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  CalendarDays,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Bell,
  Mail,
  Users,
  Coffee,
  BookOpen,
  Menu,
} from "lucide-react";
import { SidebarItem } from "./components/UI";
import { AIChatPanel, HelpCenterModal } from "./components/Modals";
import { LoginModule } from "./modules/LoginModule.tsx";
import { MENU_CONFIG } from "./config/menu";
import { APP_CONFIG } from "./constants";
import { ModuleId } from "./types";
import { RightSidebarCalendar } from "./src/components/RightSidebarCalendar";

// --- CONFIGURACIÓN CALENDARIO (Movido a Global) ---
const YEAR = 2026;
const MONTH_NAMES = [
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
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export interface CalendarEvent {
  label: string;
  type:
    | "feriado"
    | "academico"
    | "civico"
    | "gestion"
    | "vacaciones"
    | "incidencia"
    | "otros";
  time?: string;
  student?: string;
  parent?: string;
  reason?: string;
}

// Keys are "MonthIndex-Day" (0-based month)
export const EVENTS_2026: Record<string, CalendarEvent[]> = {
  "2-8": [{ label: "Día Int. de la Mujer", type: "civico" }],
  "2-14": [{ label: "Nac. Albert Einstein", type: "civico" }],
  "2-15": [{ label: "Día Derechos Consumidor", type: "civico" }],
  "2-16": [{ label: "INICIO AÑO ESCOLAR / I BIMESTRE", type: "academico" }],
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

export const getEventColor = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "feriado":
      return "bg-rose-500";
    case "incidencia":
      return "bg-rose-500";
    case "vacaciones":
      return "bg-amber-400";
    case "otros":
      return "bg-yellow-400";
    case "academico":
      return "bg-blue-600";
    case "gestion":
      return "bg-purple-500";
    default:
      return "bg-cyan-500"; // civico
  }
};

export const getEventBadgeStyles = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "feriado":
      return "bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 text-slate-900 dark:text-slate-100";
    case "incidencia":
      return "bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 text-slate-900 dark:text-slate-100";
    case "vacaciones":
      return "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 text-slate-900 dark:text-slate-100";
    case "otros":
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 text-slate-900 dark:text-slate-100";
    case "academico":
      return "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 text-slate-900 dark:text-slate-100";
    case "gestion":
      return "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 text-slate-900 dark:text-slate-100";
    default:
      return "bg-cyan-50 border-cyan-200 dark:bg-cyan-900/30 dark:border-cyan-800 text-slate-900 dark:text-slate-100"; // civico
  }
};

const getDaysInMonth = (monthIndex: number, year: number) =>
  new Date(year, monthIndex + 1, 0).getDate();
const getFirstDayOfMonth = (monthIndex: number, year: number) =>
  new Date(year, monthIndex, 1).getDay();

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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "parent" | null>(null);
  const [parentStudentId, setParentStudentId] = useState<string | undefined>(
    undefined,
  );
  const [currentView, setCurrentView] = useState<ModuleId>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalDate, setGlobalDate] = useState<Date>(new Date(2026, 2, 18));

  // Estados para los menús desplegables
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Estado Global
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"azul" | "rojo">("azul");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Referencias para detectar clics fuera
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Manejo del Modo Oscuro y Tema Rojo
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Theme Rojo Override
    if (themeMode === "rojo") {
      document.documentElement.setAttribute("data-theme", "rojo");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDarkMode, themeMode]);

  // Expose theme setting function globally for ProfileModule
  useEffect(() => {
    (window as any).setGlobalThemeMode = setThemeMode;
    (window as any).currentGlobalThemeMode = themeMode;
    return () => {
      delete (window as any).setGlobalThemeMode;
      delete (window as any).currentGlobalThemeMode;
    };
  }, [themeMode]);

  // Manejo de Clic Fuera de los Menús
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Evento global para abrir ayuda
  useEffect(() => {
    const handleOpenHelpEvent = () => setIsHelpModalOpen(true);

    window.addEventListener("openHelp", handleOpenHelpEvent);
    return () => {
      window.removeEventListener("openHelp", handleOpenHelpEvent);
    };
  }, []);

  // Dynamic View Resolver
  const ActiveComponent =
    MENU_CONFIG.find((m) => m.id === currentView)?.component ||
    MENU_CONFIG[0].component;

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) setHasUnread(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        <LoginModule
          onLogin={(role = "admin", studentId) => {
            setUserRole(role);
            setParentStudentId(studentId);
            setIsAuthenticated(true);
            if (role === "parent") {
              setCurrentView("classrooms");
            }
          }}
          config={APP_CONFIG}
        />
      ) : userRole === "parent" ? (
        <div className="h-screen w-screen bg-gray-50/50 dark:bg-slate-950 overflow-y-auto font-poppins flex flex-col">
          {/* Simple header with logout */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  Portal del Apoderado
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  Vista detallada del estudiante
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center overflow-hidden relative"
                title="Notificaciones"
              >
                <Bell size={18} strokeWidth={2.5} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800"></span>
              </button>
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                title="Ver Calendario"
              >
                <CalendarDays size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-400 hover:text-blue-500 dark:hover:text-yellow-400 shadow-sm border border-gray-100 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                title={
                  isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"
                }
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDarkMode ? "sun" : "moon"}
                    initial={{ y: -20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDarkMode ? (
                      <Sun size={18} strokeWidth={2.5} />
                    ) : (
                      <Moon size={18} strokeWidth={2.5} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
              <div
                className="flex items-center gap-3 pl-2 pr-4 h-10 rounded-full shadow-sm border bg-white border-gray-100 dark:bg-slate-800 dark:border-slate-700 relative cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  PV
                </div>
                <div className="hidden md:block text-left mr-1">
                  <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                    Peepo Vega
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Apoderado
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-2 z-50"
                    >
                      <button
                        onClick={() => {
                          setIsAuthenticated(false);
                          setUserRole(null);
                          setParentStudentId(undefined);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 text-xs font-bold text-rose-600 transition-colors"
                      >
                        <LogOut size={18} /> Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-8 w-full flex-1">
            <ActiveComponent
              key="parent-view"
              onNavigate={setCurrentView}
              parentViewStudentId={parentStudentId}
            />
          </div>
        </div>
      ) : (
        <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex relative text-gray-800 dark:text-gray-200 font-poppins">
          {/* SIDEBAR */}
          {userRole === "admin" && (
            <motion.div
              animate={{ width: isSidebarExpanded ? 320 : 112 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="flex flex-col items-center py-6 bg-transparent z-20 shrink-0 h-full relative"
            >
              <div
                className={`pb-6 mb-6 flex items-center w-full ${isSidebarExpanded ? "px-6 justify-between" : "flex-col justify-center px-4"} gap-3 pt-2`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    layout
                    className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm p-1 bg-white shrink-0 border border-slate-100 dark:border-slate-800"
                  >
                    <img
                      src={APP_CONFIG.sidebarLogo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {isSidebarExpanded && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex flex-col overflow-hidden whitespace-nowrap"
                      >
                        <span className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                          I.E 6049
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wide">
                          Ricardo Palma
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Menu size={24} />
                </button>
              </div>

              <motion.nav
                layout
                className={`flex flex-col gap-1 w-full flex-1 ${isSidebarExpanded ? "px-4" : "px-2"} overflow-y-auto pb-4 scrollbar-hide`}
              >
                <div className="mb-6">
                  {isSidebarExpanded && (
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-widest">
                      Gestión Académica
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    {MENU_CONFIG.filter((item) => !item.hidden).map((item) => (
                      <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={currentView === item.id}
                        onClick={() => setCurrentView(item.id)}
                        expanded={isSidebarExpanded}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  {isSidebarExpanded && (
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-4 mb-3 uppercase tracking-widest">
                      Herramientas
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    <SidebarItem
                      icon={CalendarDays}
                      label="Calendario"
                      active={isCalendarModalOpen}
                      onClick={() => setIsCalendarModalOpen(true)}
                      expanded={isSidebarExpanded}
                    />
                    <SidebarItem
                      icon={Bot}
                      label="Asistente IA"
                      active={chatOpen}
                      onClick={() => setChatOpen(true)}
                      expanded={isSidebarExpanded}
                    />
                    <SidebarItem
                      icon={HelpCircle}
                      label="Ayuda"
                      active={false}
                      onClick={() => {
                        const evt = new CustomEvent("openHelp");
                        window.dispatchEvent(evt);
                      }}
                      expanded={isSidebarExpanded}
                    />
                  </div>
                </div>
              </motion.nav>

              {/* Sidebar Bottom (Profile & Dark Mode) */}
              <div
                className={`mt-auto w-full flex flex-col gap-2 border-t border-gray-100 dark:border-slate-800 ${isSidebarExpanded ? "p-4" : "p-2 pt-4 items-center"} shrink-0`}
              >
                {/* Profile Card */}
                {isSidebarExpanded ? (
                  <div className="flex items-center justify-between gap-3 w-full p-2 pr-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/80 border border-transparent dark:border-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm border border-gray-100">
                    <div
                      className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
                      onClick={() => setCurrentView("profile")}
                      title="Ir a mi perfil"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        AD
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          Carlos Cerquera
                        </span>
                        <span className="text-xs text-gray-500 truncate font-medium">
                          Docente
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCurrentView("profile")}
                    className="w-12 h-12 mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all dark:ring-offset-slate-900"
                    title="Mi Perfil"
                  >
                    AD
                  </button>
                )}

                {/* Switch Tema Oscuro & Log Out grouped together for coherence */}
                <div
                  className={`flex ${isSidebarExpanded ? "flex-row gap-2" : "flex-col gap-2"} w-full`}
                >
                  <div
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`flex items-center justify-center ${isSidebarExpanded ? "flex-1 py-3" : "w-12 h-12"} bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-2xl transition-colors cursor-pointer text-gray-700 dark:text-gray-300 border border-slate-100 dark:border-slate-700`}
                    title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isDarkMode ? "sun" : "moon"}
                        initial={{ opacity: 0, rotate: -45 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 45 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isDarkMode ? (
                          <Sun size={18} className="text-amber-500" />
                        ) : (
                          <Moon
                            size={18}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div
                    onClick={() => setIsAuthenticated(false)}
                    className={`flex items-center justify-center ${isSidebarExpanded ? "flex-1 py-3" : "w-12 h-12"} bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-2xl transition-colors cursor-pointer text-rose-500 border border-rose-100 dark:border-rose-900/50`}
                    title="Cerrar Sesión"
                  >
                    {isSidebarExpanded ? (
                      <div className="flex items-center gap-2">
                        <LogOut size={18} strokeWidth={2.5} />
                        <span className="text-sm font-bold whitespace-nowrap">
                          Salir
                        </span>
                      </div>
                    ) : (
                      <LogOut size={20} strokeWidth={2.5} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MAIN CONTENT */}
          <div className="flex-1 flex h-full overflow-hidden relative bg-transparent p-4 pl-0 gap-4">
            <main className="flex-1 overflow-y-auto flex flex-col relative w-full h-full bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden relative z-0">
              <AnimatePresence mode="wait">
                <ActiveComponent
                  key={currentView}
                  onNavigate={setCurrentView}
                  globalDate={globalDate}
                />
              </AnimatePresence>
            </main>
          </div>

          {/* MODALS */}
          {isCalendarModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-6xl xl:max-w-7xl h-auto min-h-[600px] max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                <button
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  <X size={16} />
                </button>
                <RightSidebarCalendar
                  currentView={currentView}
                  globalDate={globalDate}
                  setGlobalDate={setGlobalDate}
                />
              </div>
            </div>
          )}
          <HelpCenterModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />
          <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      )}
    </>
  );
}
