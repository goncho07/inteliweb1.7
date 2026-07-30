import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  CITATIONS_2026,
  EVENTS_2026,
  SCHEDULE_TIME_SLOTS,
  TEACHER_SCHEDULE,
} from "@/data/calendar";
import { getEventBadgeStyles, getEventColor } from "@/lib/calendar";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface RightSidebarCalendarProps {
  currentView: string;
  globalDate: Date;
  setGlobalDate: React.Dispatch<React.SetStateAction<Date>>;
}

export const RightSidebarCalendar: React.FC<RightSidebarCalendarProps> = ({
  currentView,
  globalDate,
  setGlobalDate,
}) => {
  const [calendarDate, setCalendarDate] = useState(new Date(globalDate));
  const [selectedDayEvent, setSelectedDayEvent] = useState<number | null>(
    globalDate.getDate(),
  );

  // El usuario puede navegar de mes libremente, pero cuando el padre cambia la
  // fecha global el calendario vuelve a situarse sobre ella. Se ajusta durante
  // el render en lugar de con un efecto, para no pintar antes el mes anterior.
  const [prevGlobalDate, setPrevGlobalDate] = React.useState(globalDate);
  if (prevGlobalDate !== globalDate) {
    setPrevGlobalDate(globalDate);
    if (
      globalDate.getMonth() !== calendarDate.getMonth() ||
      globalDate.getFullYear() !== calendarDate.getFullYear()
    ) {
      setCalendarDate(new Date(globalDate));
    }
    setSelectedDayEvent(globalDate.getDate());
  }

  const currentMonthIndex = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const rawFirstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
  let firstDayIndex = rawFirstDayIndex - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    if (i < firstDayIndex || i >= firstDayIndex + daysInMonth) return null;
    return i - firstDayIndex + 1;
  });

  const getDayName = (date: Date) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[date.getDay()];
  };
  const todayDayOfWeek = getDayName(new Date());

  const handleDayClick = (day: number) => {
    setSelectedDayEvent(day);
    const newGlobalDate = new Date(currentYear, currentMonthIndex, day);
    setGlobalDate(newGlobalDate);
  };

  const isCitationsView = currentView === "citations";
  const displayEvents = isCitationsView ? CITATIONS_2026 : EVENTS_2026;

  return (
    <motion.div
      variants={itemVariants}
      className="w-full h-full flex flex-col md:flex-row bg-transparent overflow-hidden"
    >
      {/* Left Side: Calendar & Agenda */}
      <div className="flex-1 flex flex-col border-r border-slate-100 dark:border-slate-800 border-b md:border-b-0 min-h-0 bg-white dark:bg-slate-900 lg:w-1/2">
        <div className="p-6 shrink-0 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-[#0D082C] dark:text-white text-[18px] capitalize">
              {calendarDate.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCalendarDate(
                    new Date(currentYear, currentMonthIndex - 1, 1),
                  )
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCalendarDate(
                    new Date(currentYear, currentMonthIndex + 1, 1),
                  )
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Grid Calendario */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["LU", "MA", "MI", "JU", "VI", "SA", "DO"].map((day) => (
              <div
                key={day}
                className="text-[11px] font-black text-slate-400 tracking-wider text-center py-2"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null)
                return <div key={i} className="aspect-square" />;
              const eventKey = `${currentMonthIndex}-${day}`;
              const dayEvents = displayEvents[eventKey] || [];
              const isSelected = selectedDayEvent === day;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonthIndex &&
                new Date().getFullYear() === currentYear;
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all border ${
                    isSelected
                      ? "bg-[#3030b8] text-white border-transparent shadow-md shadow-indigo-500/30"
                      : isToday
                        ? "bg-indigo-50 text-[#3030b8] border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700 border-transparent text-slate-700 dark:text-slate-300 font-semibold text-[13px]"
                  }`}
                >
                  <span
                    className={`${isSelected || isToday ? "scale-110 font-bold text-[14px]" : ""}`}
                  >
                    {day}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-1 -mb-2">
                      {dayEvents.slice(0, 3).map((e: any, idx: number) => (
                        <span
                          key={idx}
                          className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : isCitationsView ? (e.type === "incidencia" ? "bg-rose-500" : e.type === "academico" ? "bg-indigo-500" : e.type === "gestion" ? "bg-emerald-500" : "bg-amber-400") : getEventColor(e.type)}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {isCitationsView
              ? [
                  { label: "Académico", color: "bg-indigo-500" },
                  { label: "Incidencia", color: "bg-rose-500" },
                  { label: "Gestión", color: "bg-emerald-500" },
                  { label: "Otros", color: "bg-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${item.color}`}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))
              : [
                  { label: "Académico", color: "bg-blue-600" },
                  { label: "Cívico", color: "bg-cyan-500" },
                  { label: "Feriado", color: "bg-rose-500" },
                  { label: "Vacaciones", color: "bg-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${item.color}`}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="border-b-[2px] border-slate-200 dark:border-slate-700/50 pb-3 mb-4 flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">
              Agenda del Día
            </h4>
            {selectedDayEvent && (
              <span className="text-[13px] font-bold text-[#3030b8] dark:text-indigo-400">
                {selectedDayEvent} de{" "}
                {calendarDate.toLocaleDateString("es-ES", { month: "long" })}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {selectedDayEvent &&
            displayEvents[`${currentMonthIndex}-${selectedDayEvent}`] ? (
              displayEvents[`${currentMonthIndex}-${selectedDayEvent}`].map(
                (ev: any, i: number) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-2xl border transition-colors flex flex-col ${
                      isCitationsView
                        ? ev.type === "incidencia"
                          ? "border-rose-200 bg-rose-50 dark:bg-rose-900/10"
                          : ev.type === "academico"
                            ? "border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10"
                            : ev.type === "gestion"
                              ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10"
                              : "border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                        : getEventBadgeStyles(ev.type)
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCitationsView
                            ? ev.type === "incidencia"
                              ? "bg-rose-500"
                              : ev.type === "academico"
                                ? "bg-indigo-500"
                                : ev.type === "gestion"
                                  ? "bg-emerald-500"
                                  : "bg-amber-400"
                            : getEventColor(ev.type)
                        }`}
                      ></span>
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isCitationsView
                            ? ev.type === "incidencia"
                              ? "text-rose-600"
                              : ev.type === "academico"
                                ? "text-indigo-600"
                                : ev.type === "gestion"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                            : "opacity-80"
                        }`}
                      >
                        {ev.type}
                      </span>
                      {ev.time && (
                        <span className="ml-auto text-[10px] font-bold text-slate-500">
                          {ev.time}
                        </span>
                      )}
                    </div>
                    <h5
                      className={`font-bold text-[14px] flex-1 ${isCitationsView ? "text-slate-800 dark:text-slate-200 leading-tight mb-1" : ""}`}
                    >
                      {isCitationsView ? ev.student : ev.label}
                    </h5>
                    {isCitationsView && (
                      <p className="text-[12px] font-medium text-slate-500 truncate">
                        {ev.reason}
                      </p>
                    )}
                  </div>
                ),
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <CalendarDays size={24} className="mb-2 opacity-50" />
                <p className="text-[13px] font-medium">
                  No hay eventos para este día.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Schedule */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900/50 lg:w-1/2">
        <div className="p-5 border-b-[2px] border-slate-100 dark:border-slate-800/50 shrink-0 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-[#0D082C] dark:text-white text-[15px] flex items-center justify-between">
            Tu Horario: {todayDayOfWeek}
            <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest px-2 py-1 bg-white dark:bg-slate-800 rounded-md border border-indigo-100 dark:border-indigo-800">
              DIA LECTIVO
            </span>
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
          {SCHEDULE_TIME_SLOTS.map((slot: any, i: number) => {
            const classData = TEACHER_SCHEDULE[todayDayOfWeek]?.find(
              (t: any) => t.start === slot.start,
            );
            if (slot.isRecreo) {
              return (
                <div
                  key={i}
                  className="flex items-stretch rounded-xl overflow-hidden bg-white/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-[80px] shrink-0 bg-slate-100 dark:bg-slate-800/80 p-2 flex flex-col justify-center items-center text-slate-500 border-r border-slate-200 dark:border-slate-700">
                    <span className="text-[12px] font-black tracking-tighter">
                      {slot.start}
                    </span>
                    <span className="text-[10px] font-bold opacity-60">
                      a {slot.end}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center px-5 py-3">
                    <span className="text-[13px] font-black text-slate-400 dark:text-slate-500 tracking-wider">
                      RECREO
                    </span>
                  </div>
                </div>
              );
            }

            if (!classData || classData.subject === "LIBRE") {
              return (
                <div
                  key={i}
                  className="flex items-stretch rounded-xl overflow-hidden border border-dashed border-slate-200 dark:border-slate-700"
                >
                  <div className="w-[80px] shrink-0 p-2 flex flex-col justify-center items-center text-slate-400 border-r border-dashed border-slate-200 dark:border-slate-700">
                    <span className="text-[12px] font-black tracking-tighter">
                      {slot.start}
                    </span>
                    <span className="text-[10px] font-bold opacity-60">
                      a {slot.end}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center px-5 py-3">
                    <span className="text-[13px] font-bold text-slate-400 italic">
                      Hora Libre
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`flex items-stretch rounded-xl overflow-hidden border ${classData.color} bg-white dark:bg-slate-900 shadow-sm transition-transform hover:-translate-y-0.5`}
              >
                <div className="w-[80px] shrink-0 bg-slate-50/80 dark:bg-black/20 p-2 flex flex-col justify-center items-center border-r border-inherit">
                  <span className="text-[12px] font-black tracking-tighter">
                    {slot.start}
                  </span>
                  <span className="text-[10px] font-bold opacity-60">
                    a {slot.end}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center px-5 py-3">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="text-[15px] font-bold flex-1">
                      {classData.subject}
                    </span>
                    {classData.section && (
                      <span
                        className={`text-[11px] font-black shrink-0 px-2.5 py-1 rounded-md border ${classData.color} bg-white dark:bg-slate-800`}
                      >
                        {classData.section}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
