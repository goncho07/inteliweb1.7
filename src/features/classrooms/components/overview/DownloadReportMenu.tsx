import React from 'react';
import { ChevronDown, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/** Botón "Descargar Reporte": PDF o Excel/CSV del reporte visible. Deshabilitado (con motivo) sin aula seleccionada. */
export const DownloadReportMenu: React.FC<{
  disabled: boolean;
  onDownload: (format: 'pdf' | 'csv') => void;
}> = ({ disabled, onDownload }) => {
  const trigger = (
    <Button
      type="button"
      disabled={disabled}
      className="h-11 gap-2 rounded-xl px-4 font-bold"
    >
      <Download size={20} strokeWidth={2} />
      Descargar Reporte
      <ChevronDown size={16} strokeWidth={2} />
    </Button>
  );

  if (!disabled) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem onClick={() => onDownload('pdf')} className="h-10 cursor-pointer rounded-lg text-sm">
            Descargar como PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownload('csv')} className="h-10 cursor-pointer rounded-lg text-sm">
            Descargar como Excel (CSV)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* `span` envuelve el botón deshabilitado: un `button[disabled]` no dispara el Tooltip por sí solo. */}
          <span className="inline-flex" tabIndex={0}>
            {trigger}
          </span>
        </TooltipTrigger>
        <TooltipContent>Selecciona un aula para poder descargar su reporte</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
