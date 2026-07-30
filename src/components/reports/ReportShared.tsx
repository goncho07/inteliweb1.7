import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { PageHeader } from '@/components/common/PageHeader';
import { ReportPreviewModal } from '@/components/reports/ReportPreviewModal';
import { ReportsBreadcrumbNav } from '@/components/reports/ReportsBreadcrumbNav';
import { ReportsFileListView } from '@/components/reports/ReportsFileListView';
import { ReportsFiltersSidebar } from '@/components/reports/ReportsFiltersSidebar';
import { ReportsFolderGrid } from '@/components/reports/ReportsFolderGrid';
import { MOCK_REPORTS_HISTORY, monthNames, REPORT_TYPES } from '@/components/reports/data';
import { ReportHistoryItem } from '@/components/reports/types';
import { getDaysInMonth } from '@/lib/calendar';
import { containerVariants } from '@/lib/motion';
import { pseudoRandom } from '@/lib/pseudoRandom';
import { EDUCATIONAL_STRUCTURE } from '@/data/education';
import { MOCK_USERS } from '@/data/users';
import { ModuleProps } from '@/types';

export const ReportsModule: React.FC<ModuleProps> = () => {
  const [activeTab, setActiveTab] = useState<'generar' | 'historial'>('generar');
  const [historyPath, setHistoryPath] = useState<string[]>([]);
  const [previewReport, setPreviewReport] = useState<ReportHistoryItem | null>(null);

  // --- Estados de Filtros ---
  const [periodo, setPeriodo] = useState('Mensual');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const week = Math.ceil(Math.floor((d.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000)) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  });
  const [selectedBimestre, setSelectedBimestre] = useState('1');
  const [userType, setUserType] = useState<'Estudiante' | 'Docente'>('Estudiante');
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Filtros de Aula (Cascada)
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Filtros en cascada: al cambiar un nivel superior se reinician los inferiores.
  // Se resuelve en los manejadores y no en efectos, para evitar el render extra
  // que provoca sincronizar estado dentro de useEffect.
  const changeLevel = (level: string) => {
    setSelectedLevel(level);
    setSelectedGrade('Todos');
    setSelectedSection('Todos');
  };

  const changeGrade = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSection('Todos');
  };

  const gradeOptions = useMemo(() => {
    if (selectedLevel === 'Todos') return ['Todos'];
    return ['Todos', ...Object.keys(EDUCATIONAL_STRUCTURE[selectedLevel] || {})];
  }, [selectedLevel]);

  const sectionOptions = useMemo(() => {
    if (selectedLevel === 'Todos' || selectedGrade === 'Todos') return ['Todos'];
    return ['Todos', ...(EDUCATIONAL_STRUCTURE[selectedLevel]?.[selectedGrade] || [])];
  }, [selectedLevel, selectedGrade]);

  // --- Generación de Datos de Asistencia (Simulación) ---

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayLabel = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = date.getDay(); // 0 = Dom, 1 = Lun, etc.
    const labels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return labels[dayOfWeek];
  };

  const filteredUsers = useMemo(() => {
    if (userType === 'Estudiante' && selectedLevel === '') return [];
    return MOCK_USERS.filter(u =>
      u.role === userType &&
      (userType === 'Docente' ? true : (
        (selectedLevel === 'Todos' || u.level === selectedLevel) &&
        (selectedGrade === 'Todos' || u.grade === selectedGrade) &&
        (selectedSection === 'Todos' || u.section === selectedSection)
      )) &&
      (search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.dni.includes(search))
    );
  }, [userType, selectedLevel, selectedGrade, selectedSection, search]);

  const attendanceData = useMemo(() => {
    const totalDays = getDaysInMonth(selectedMonth, selectedYear);
    return filteredUsers.map(user => {
      const statuses: string[] = [];
      let tardanzas = 0;
      let faltas = 0;
      let asistencias = 0;
      let justificadas = 0;

      for (let i = 1; i <= totalDays; i++) {
        const date = new Date(selectedYear, selectedMonth, i);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        if (isWeekend) {
          statuses.push('');
        } else {
          // Determinista a partir de (estudiante, año, mes, día): el mismo
          // alumno muestra siempre la misma asistencia. Con Math.random() el
          // reporte cambiaba en cada recálculo del memo (al filtrar, por ej.).
          const rand = pseudoRandom(`${user.id}-${selectedYear}-${selectedMonth}-${i}`);
          if (rand > 0.92) { statuses.push('F'); faltas++; }
          else if (rand > 0.85) { statuses.push('T'); tardanzas++; }
          else if (rand > 0.80) { statuses.push('J'); justificadas++; }
          else { statuses.push('A'); asistencias++; }
        }
      }
      return { ...user, statuses, stats: { tardanzas, faltas, asistencias, justificadas } };
    });
  }, [filteredUsers, selectedMonth, selectedYear]);

  // Estadísticas Globales para el Gráfico
  const stats = useMemo(() => {
    let t = 0, f = 0, a = 0, j = 0;
    attendanceData.forEach(d => {
      t += d.stats.tardanzas;
      f += d.stats.faltas;
      a += d.stats.asistencias;
      j += d.stats.justificadas;
    });
    const total = t + f + a + j || 1;

    return {
      tardanzas: t,
      faltas: f,
      asistencias: a,
      justificadas: j,
      total
    };
  }, [attendanceData]);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Función para dibujar una tabla para un grupo específico
    const drawTableForGroup = (users: any[], level: string, grade: string, section: string, startY: number) => {
      // Header de la tabla de grupo
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      // Dibujar cuadro de info
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(margin, startY, pageWidth - (margin * 2), 15);

      doc.text(`TIPO: ${userType.toUpperCase()}S`, margin + 5, startY + 10);
      doc.text(`NIVEL: ${level.toUpperCase()}`, margin + 60, startY + 10);
      doc.text(`GRADO: ${grade.toUpperCase()}`, margin + 110, startY + 10);
      doc.text(`SECCIÓN: ${section.toUpperCase()}`, margin + 160, startY + 10);
      doc.text(`MES: ${monthNames[selectedMonth].toUpperCase()} ${selectedYear}`, margin + 220, startY + 10);

      const tableHeaders = [
        { content: 'N°', rowSpan: 2, styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'APELLIDOS Y NOMBRES', rowSpan: 2, styles: { halign: 'left' as const, valign: 'middle' as const } },
        ...daysArray.map(d => ({ content: d.toString(), styles: { halign: 'center' as const } }))
      ];

      const dayLabels = daysArray.map(d => getDayLabel(d));
      const subHeader = dayLabels.map(l => ({ content: l, styles: { halign: 'center' as const, fontSize: 7 } }));

      const tableData = users.map((u, i) => [
        (i + 1).toString(),
        u.name.toUpperCase(),
        ...u.statuses.map((s: string) => s === 'A' ? '' : s) // Según la imagen, 'A' no se muestra, solo un punto o vacío. En la imagen parece vacío para asistencias.
      ]);

      autoTable(doc, {
        startY: startY + 18,
        head: [tableHeaders, subHeader],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 1,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.2
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 60 },
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index > 1) {
            const val = data.cell.text[0];
            if (val === 'F') data.cell.styles.textColor = [244, 63, 94];
            if (val === 'T') data.cell.styles.textColor = [249, 115, 22];
            if (val === 'J') data.cell.styles.textColor = [59, 130, 246];
          }
        }
      });

      return (doc as any).lastAutoTable.finalY;
    };

    // Título Principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('REGISTRO DE ASISTENCIA', pageWidth / 2, 22, { align: 'center' });

    let currentY = 30;

    if (selectedLevel === 'Todos' || selectedGrade === 'Todos' || selectedSection === 'Todos') {
      // Agrupar datos
      const groups: { [key: string]: any[] } = {};
      attendanceData.forEach(u => {
        const key = `${u.level} - ${u.grade} - ${u.section}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(u);
      });

      Object.entries(groups).forEach(([key, users], index) => {
        const [level, grade, section] = key.split(' - ');
        if (index > 0) {
          doc.addPage();
          currentY = 15; // Reset Y on new page
          // Re-dibujar títulos en cada página si es necesario, o solo el de grupo
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('I.E 6049 RICARDO PALMA', pageWidth / 2, 15, { align: 'center' });
          doc.setFontSize(12);
          doc.text('REGISTRO DE ASISTENCIA', pageWidth / 2, 22, { align: 'center' });
          currentY = 30;
        }
        currentY = drawTableForGroup(users, level, grade, section, currentY);
      });
    } else {
      drawTableForGroup(attendanceData, selectedLevel, selectedGrade, selectedSection, currentY);
    }

    // Footer (en la última página o en todas?)
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('. Asistió  F Faltó  T Tardanza  J Falta justificada', margin, footerY);

      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} p. m.`;
      doc.text(`Impreso: ${dateStr}`, pageWidth - margin, footerY, { align: 'right' });
    }

    doc.save(`Reporte_Asistencia_${monthNames[selectedMonth]}_${selectedYear}.pdf`);
  };

  // Configuración del Donut Chart Multi-segmento
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Calcular offsets para apilar los segmentos
  // Orden: Asistencia (Verde) -> Justificada (Azul) -> Tardanza (Naranja) -> Falta (Rojo)
  const pctA = stats.asistencias / stats.total;
  const pctJ = stats.justificadas / stats.total;
  const pctT = stats.tardanzas / stats.total;
  const pctF = stats.faltas / stats.total;

  const dashA = pctA * circumference;
  const dashJ = pctJ * circumference;
  const dashT = pctT * circumference;
  const dashF = pctF * circumference;

  // Rotation offsets (cumulative degrees)
  // Start at -90deg (top)
  const rotA = -90;
  const rotJ = rotA + (pctA * 360);
  const rotT = rotJ + (pctJ * 360);
  const rotF = rotT + (pctT * 360);

  const currentFolderContent = useMemo(() => {
    if (historyPath.length === 0) {
      return { type: 'folders', items: REPORT_TYPES };
    }

    const freq = historyPath[0];

    let filteredReports = MOCK_REPORTS_HISTORY.filter(r => r.type === freq);

    if (selectedLevel && selectedLevel !== 'Todos') {
      filteredReports = filteredReports.filter(r => r.level === selectedLevel);
    }
    if (selectedGrade && selectedGrade !== 'Todos') {
      filteredReports = filteredReports.filter(r => r.grade === selectedGrade);
    }
    if (selectedSection && selectedSection !== 'Todos') {
      filteredReports = filteredReports.filter(r => r.section === selectedSection);
    }

    // Filtro por fecha o semana si aplica
    if (freq === 'Diario' && selectedDate) {
      const [y, m, d] = selectedDate.split('-');
      const day = parseInt(d, 10);
      const monthStr = monthNames[parseInt(m, 10) - 1]?.substring(0, 3).toLowerCase();
      const formattedDate = `${day} ${monthStr}`;

      filteredReports = filteredReports.filter(r => r.date.toLowerCase().includes(formattedDate) || r.title.toLowerCase().includes(formattedDate));
    }

    if (freq === 'Semanal' && selectedWeek) {
      // Simulamos filtro por semana
      const weekNum = selectedWeek.split('-W')[1];
      filteredReports = filteredReports.filter(r => r.title.includes(`Semana ${parseInt(weekNum || '0')}`));
    }

    if (freq === 'Mensual') {
      const monthName = monthNames[selectedMonth];
      filteredReports = filteredReports.filter(r => r.date.includes(monthName) && r.date.includes(selectedYear.toString()));
    }

    if (freq === 'Bimestral') {
      const bimesterMap: Record<string, string> = {
        '1': 'I Bimestre',
        '2': 'II Bimestre',
        '3': 'III Bimestre',
        '4': 'IV Bimestre'
      };
      const bimesterStr = bimesterMap[selectedBimestre];
      if (bimesterStr) {
        filteredReports = filteredReports.filter(r => r.title.includes(bimesterStr) && r.date.includes(selectedYear.toString()));
      }
    }

    if (search) {
      filteredReports = filteredReports.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.date.toLowerCase().includes(search.toLowerCase()));
    }

    return { type: 'files', items: filteredReports };
  }, [historyPath, selectedLevel, selectedGrade, selectedSection, selectedDate, selectedWeek, selectedMonth, selectedYear, selectedBimestre, search]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full flex flex-col font-poppins relative">
      <div className="animate-in fade-in duration-300 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
        <PageHeader
          title="Reportes de Asistencia"
          subtitle="Monitoreo detallado de asistencia y puntualidad."
          icon={BarChart3}
          className="bg-white"
        />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4 gap-6 max-w-[1700px] mx-auto w-full min-h-0 overflow-hidden h-full">
            {/* Side Filters */}
            <ReportsFiltersSidebar
              selectedLevel={selectedLevel}
              onLevelChange={changeLevel}
              selectedGrade={selectedGrade}
              onGradeChange={changeGrade}
              gradeOptions={gradeOptions}
              selectedSection={selectedSection}
              onSectionChange={setSelectedSection}
              sectionOptions={sectionOptions}
              isApplying={isApplying}
              onApply={() => {
                setIsApplying(true);
                setTimeout(() => setIsApplying(false), 1500);
              }}
            />

            <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden h-full border border-slate-200 dark:border-slate-800 bg-[#f4f6fa] dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            {/* Breadcrumb Navigation */}
            <ReportsBreadcrumbNav historyPath={historyPath} setHistoryPath={setHistoryPath} />

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentFolderContent.type === 'folders' ? (
              <ReportsFolderGrid
                items={currentFolderContent.items as string[]}
                historyPath={historyPath}
                setHistoryPath={setHistoryPath}
              />
            ) : (
              <ReportsFileListView
                historyPath={historyPath}
                monthNames={monthNames}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedBimestre={selectedBimestre}
                setSelectedBimestre={setSelectedBimestre}
                items={currentFolderContent.items as ReportHistoryItem[]}
                onPreview={setPreviewReport}
              />
            )}
          </div>
        </div>
        </div>
        </div>
      </div>

      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </motion.div>
  );
};
