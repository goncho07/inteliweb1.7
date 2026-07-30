import React from 'react';
import { ChevronRight } from 'lucide-react';

import { ReportCardItem } from '@/components/reports/ReportCardItem';

/** Carrusel horizontal de tarjetas de reporte (asistencia o incidencias) del historial. */
export const ScrollableReportList = ({ items, type, historyPath, onPreview }: any) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const isFourCols = historyPath[0] === 'Semanal' || historyPath[0] === 'Bimestral';
  const showArrow = isFourCols ? items.length > 4 : items.length > 5;

  return (
    <div className="relative group/carousel">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-5 pb-2 scrollbar-hide snap-x items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((report: any) => (
          <div
            key={report.id + '-' + type}
            className={`shrink-0 snap-start flex flex-col ${isFourCols ? 'w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]' : 'w-full sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] xl:w-[calc((100%-5rem)/5)]'}`}
          >
            <ReportCardItem
              report={report}
              type={type}
              onPreview={() => onPreview(report)}
            />
          </div>
        ))}
      </div>
      {showArrow && (
        <button
          onClick={scrollRight}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-full p-2 text-indigo-500 hover:text-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-700 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
};
