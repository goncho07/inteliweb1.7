import React, { useState } from 'react';
import { FilterX, SlidersHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * Botón «Filtros» con su panel flotante: la única forma de filtrar una lista en
 * la app. Nació en Citaciones y ahora lo comparten todas las pantallas con
 * listado (Citaciones, Usuarios), para que filtrar se haga siempre igual y en
 * el mismo sitio — al lado del buscador — en vez de una fila de desplegables
 * distinta por módulo.
 *
 * Los cambios no se aplican al vuelo: se eligen dentro del panel y se confirman
 * con «Aplicar filtros», así la lista no se mueve mientras se decide. Lo que ya
 * está aplicado se muestra fuera del panel con `AppliedFilterChips`.
 *
 * El panel arranca siempre desde lo aplicado: `onOpen` es donde el módulo copia
 * sus filtros al borrador, para que cerrar sin aplicar no deje nada a medias.
 */
export const FiltersPopover: React.FC<{
  /** Nombre accesible del panel, p. ej. «Filtrar citaciones». No se muestra. */
  title: string;
  /** Filtros aplicados: se muestran como ficha numérica sobre el botón. */
  appliedCount: number;
  /** Filtros elegidos en el borrador: con 0, «Limpiar» se bloquea. */
  draftCount: number;
  /** Sincronizar el borrador con lo aplicado al abrir. */
  onOpen: () => void;
  /** Vaciar el borrador sin tocar lo aplicado. */
  onClearDraft: () => void;
  /** Volcar el borrador a los filtros reales. El panel se cierra solo. */
  onApply: () => void;
  /** Los campos del panel. */
  children: React.ReactNode;
  className?: string;
}> = ({ title, appliedCount, draftCount, onOpen, onClearDraft, onApply, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) onOpen();
    setIsOpen(open);
  };

  const handleApply = () => {
    onApply();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-12 shrink-0 gap-2 rounded-xl px-4 text-base font-semibold shadow-sm',
            className,
          )}
        >
          <SlidersHorizontal size={20} />
          Filtros
          {appliedCount > 0 && (
            <Badge className="h-6 min-w-6 justify-center rounded-full bg-primary px-1.5 text-sm">
              {appliedCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      {/* Sin cabecera visible: el botón que abre el panel ya dice «Filtros» y
          repetir «Filtrar citaciones» encima solo añadía una fila más. El
          título sigue nombrando el panel para lectores de pantalla. */}
      <PopoverContent aria-label={title} align="end" className="w-[380px] rounded-2xl p-0">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">{children}</div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClearDraft}
            disabled={draftCount === 0}
            className="h-11 gap-2 rounded-xl px-4 text-base font-semibold"
          >
            <FilterX size={20} />
            Limpiar
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="h-11 rounded-xl px-4 text-base font-semibold"
          >
            Aplicar filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
