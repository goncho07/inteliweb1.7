import { ReportHistoryItem } from '@/components/reports/ReportShared';

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
