import React, { useState } from 'react';
import { BookOpen, Calendar, Check, CheckCircle2, ChevronDown, Pencil, User, X } from 'lucide-react';

import { ModulePaneHeader } from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import { CitationAvatar } from './CitationAvatar';
import { CitationCategoryBadge } from './CitationCategoryBadge';
import { CitationConversationTab } from './CitationConversationTab';
import { CitationStatusBadge } from './CitationStatusBadge';
import { getCitationTimeline, isParentOnline } from '../citations.constants';
import type { Citation, CitationMessage } from '../types';

/**
 * Panel de detalle de una citación: todo en una sola vista, sin pestañas —
 * arriba la cabecera (alumno, categoría, estado) y un resumen colapsado por
 * defecto (motivo, fecha, docente, apoderado y el seguimiento de estados,
 * detrás del botón "Ver detalles") y debajo, ocupando el resto del alto, la
 * conversación con el apoderado, que es lo que más se usa día a día. Se usa
 * tanto dentro de `ModulePane` en escritorio (panel fijo,
 * actualiza in-place) como dentro de un `SheetContent` en móvil (bottom
 * sheet, la única función legítima del drawer: apilar en pantallas
 * angostas) — mismo componente, sin duplicar el JSX. `variant="sheet"` deja
 * espacio extra a la derecha de la cabecera para no chocar con el botón "X"
 * que ya trae `SheetContent`.
 */
export const CitationDetailPanel: React.FC<{
  citation: Citation;
  messages: CitationMessage[];
  onApprove: (id: number) => void;
  onComplete: (id: number) => void;
  onOpenReschedule: (citation: Citation) => void;
  onOpenEdit: (citation: Citation) => void;
  variant?: 'pane' | 'sheet';
}> = ({
  citation,
  messages,
  onApprove,
  onComplete,
  onOpenReschedule,
  onOpenEdit,
  variant = 'pane',
}) => {
  const timeline = getCitationTimeline(citation);
  const parentOnline = isParentOnline(citation);
  const showActions = citation.status === 'Pendiente' || citation.status === 'Confirmada';
  const showEdit = citation.status !== 'Completada' && citation.status !== 'Cancelada';

  // Colapsa el resumen al cambiar de citación, sin useEffect (ver "Adjusting
  // state when a prop changes" de React): se ajusta durante el render en vez
  // de con un efecto que dispararía un segundo render en cascada.
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [lastCitationId, setLastCitationId] = useState(citation.id);
  if (citation.id !== lastCitationId) {
    setLastCitationId(citation.id);
    setIsDetailsOpen(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-900">
      {/* Cabecera (siempre visible): quién, categoría y estado */}
      <ModulePaneHeader className={cn(variant === 'sheet' && 'pr-16')}>
        <div className="flex min-w-0 items-center gap-3">
          <CitationAvatar online={parentOnline} />
          {/* Este panel es la conversación de WhatsApp: la cabecera identifica al
              apoderado con quien se habla, no al alumno (que encabeza la lista). */}
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-800 dark:text-white">
              {citation.parent}{' '}
              <span className="font-medium text-slate-500 dark:text-slate-400">· {citation.relationship}</span>
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{citation.parentPhone}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <CitationCategoryBadge category={citation.category} className="px-2.5 py-1 text-sm" />
          <CitationStatusBadge status={citation.status} className="px-3 py-1 text-sm" />
        </div>
      </ModulePaneHeader>

      {/* Resumen: colapsado por defecto, con un botón explícito para desplegarlo — la conversación es lo que más se usa día a día */}
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="shrink-0 border-b border-slate-100 dark:border-slate-800/60">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-6"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{citation.reason}</p>
              {/* El alumno vive aquí, no en la cabecera: la cabecera es el contacto de WhatsApp */}
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {citation.student} · {citation.grade} · {citation.date}, {citation.time}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
              Ver detalles
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', isDetailsOpen && 'rotate-180')}
                strokeWidth={2}
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="hidden-scrollbar space-y-4 overflow-y-auto px-4 pb-4 sm:px-6">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {citation.description || 'Sin descripción adicional reportada por el docente.'}
            </p>

            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <User className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={2} />
              {citation.teacher} ({citation.subject})
            </span>

            {/* Seguimiento: stepper horizontal, mismos 5 pasos siempre, con responsable en los ya ocurridos.
                En anchos angostos (bottom sheet en móvil) se desplaza en horizontal en vez de amontonar las etiquetas. */}
            <div className="hidden-scrollbar overflow-x-auto pt-1">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${timeline.length}, minmax(96px, 1fr))`,
                  minWidth: `${timeline.length * 96}px`,
                }}
              >
                {timeline.map((step, i) => (
                  <div key={i} className="relative flex flex-col items-center px-1 text-center">
                    {i < timeline.length - 1 && (
                      <span
                        className={cn(
                          'absolute left-1/2 top-3 h-0.5 w-full -translate-y-1/2',
                          step.state === 'done' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                        step.state === 'done' && 'border-emerald-500 bg-emerald-500',
                        step.state === 'current' && 'border-amber-500 bg-white dark:bg-slate-900',
                        step.state === 'upcoming' && 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
                        step.state === 'cancelled' && 'border-rose-500 bg-rose-500',
                      )}
                    >
                      {step.state === 'done' && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                      {step.state === 'cancelled' && <X className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                      {step.state === 'current' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                    </span>
                    <p
                      className={cn(
                        'mt-2 break-words text-xs font-semibold',
                        step.state === 'current' && 'text-amber-700 dark:text-amber-400',
                        step.state === 'upcoming' && 'text-slate-400 dark:text-slate-500',
                        step.state === 'cancelled' && 'text-rose-700 dark:text-rose-400',
                        step.state === 'done' && 'text-slate-700 dark:text-slate-200',
                      )}
                    >
                      {step.label}
                    </p>
                    {step.when && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{step.when}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Conversación: ocupa el resto del alto, es lo que más se usa día a día */}
      <div className="flex min-h-0 flex-1 flex-col">
        <CitationConversationTab messages={messages} />
      </div>

      {/* Acciones: siempre visibles */}
      {showActions || showEdit ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800/60 dark:bg-slate-800/40">
          {citation.status === 'Pendiente' && (
            <Button
              variant="outline"
              className="h-12 flex-1 [&_svg]:size-4"
              onClick={() => onOpenReschedule(citation)}
            >
              <Calendar className="h-4 w-4" />
              Reprogramar citación
            </Button>
          )}
          {showEdit && (
            <Button variant="outline" className="h-12 flex-1 [&_svg]:size-4" onClick={() => onOpenEdit(citation)}>
              <Pencil className="h-4 w-4" />
              Editar citación
            </Button>
          )}
          {citation.status === 'Pendiente' && (
            <Button
              className="h-12 flex-1 bg-emerald-600 text-white hover:bg-emerald-700 [&_svg]:size-4"
              onClick={() => onApprove(citation.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Aprobar cita
            </Button>
          )}
          {citation.status === 'Confirmada' && (
            <Button
              className="h-12 flex-1 bg-emerald-600 text-white hover:bg-emerald-700 [&_svg]:size-4"
              onClick={() => onComplete(citation.id)}
            >
              <BookOpen className="h-4 w-4" />
              Cita realizada
            </Button>
          )}
        </div>
      ) : (
        <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800/60 dark:bg-slate-800/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Esta citación ya no admite acciones porque está {citation.status.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
};
