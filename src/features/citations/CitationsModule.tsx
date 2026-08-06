import React, { useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';

import { ModulePane, ModuleShell } from '@/components/layout/ModuleShell';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MOCK_USERS } from '@/data/users';
import { useSession } from '@/features/auth/SessionContext';
import { visibleCitations, visibleStudents } from '@/features/auth/scope';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import type { ModuleProps } from '@/types';

import { CitationDetailPanel } from './components/CitationDetailPanel';
import { CitationsListPanel } from './components/CitationsListPanel';
import {
  DraftCitationModal,
  formatGuardianPhone,
  formatStudentGrade,
  guardianRelationship,
  type DraftCitationResult,
} from './components/DraftCitationModal';
import { RescheduleCitationModal } from './components/RescheduleCitationModal';
import { INITIAL_CITATIONS } from './citations.constants';
import { getUnreadCount, MESSAGES_BY_CITATION } from './citations.messages';
import type { Citation, CitationCategoryFilter, CitationStatusFilter } from './types';

/** El detalle se muestra como bottom sheet por debajo de este ancho (mismo criterio que `ModuleShell` para pasar a fila). */
const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

/**
 * Módulo de Citaciones: lista filtrable a la izquierda + panel de la
 * conversación con el apoderado (el detalle de la citación se abre aparte,
 * en un panel lateral — ver `CitationDetailPanel`). En escritorio el panel
 * es fijo y se actualiza in-place; en móvil se muestra como un panel
 * deslizante desde abajo. Datos simulados (`citations.constants.ts`,
 * `citations.messages.ts`); sin persistencia.
 */
export const CitationsModule: React.FC<ModuleProps> = () => {
  const session = useSession();
  const scopedCitations = useMemo(() => visibleCitations(session, INITIAL_CITATIONS), [session]);
  const [citationsList, setCitationsList] = useState<Citation[]>(scopedCitations);
  const [selectedCitationId, setSelectedCitationId] = useState<number | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<CitationStatusFilter>('Todas');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [selectedSection, setSelectedSection] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState<CitationCategoryFilter>('Todos');

  const { toast } = useToast();

  // Conversación (pestaña "Conversación" del detalle): historial de solo lectura, sin envío de mensajes nuevos.
  const [readCitationIds, setReadCitationIds] = useState<Set<number>>(new Set());

  // Modal de reprogramación
  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean; citation: Citation | null }>({
    isOpen: false,
    citation: null,
  });
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');
  const [reschedReason, setReschedReason] = useState('');

  // Modal de redacción (asistente de 4 pasos para crear una citación nueva)
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  // Todo el padrón visible para esta sesión: el listado del asistente debe
  // ser la nómina real del aula elegida, alumno por alumno. `linkGuardians`
  // (`data/users.ts`) solo asocia 100 apoderados de muestra al azar, así que
  // no todos tienen uno — el propio asistente lo avisa al elegir a un alumno
  // sin apoderado en vez de ocultarlo de la lista.
  const draftableStudents = useMemo(() => visibleStudents(session), [session]);

  const filteredCitations = useMemo(() => {
    return citationsList.filter((c) => {
      if (
        searchTerm &&
        !c.student.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !c.parent.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (selectedCategory !== 'Todos' && c.category !== selectedCategory) return false;
      if (selectedStatusTab !== 'Todas' && c.status !== selectedStatusTab) return false;
      if (selectedLevel !== 'Todos' && c.level !== selectedLevel) return false;

      if (selectedGrade !== 'Todos' || selectedSection !== 'Todos') {
        const gradeMatch = c.grade.match(/(\d+°)\s+([A-Z])/);
        if (gradeMatch) {
          const [, g, s] = gradeMatch;
          if (selectedGrade !== 'Todos' && g !== selectedGrade) return false;
          if (selectedSection !== 'Todos' && s !== selectedSection) return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [citationsList, searchTerm, selectedStatusTab, selectedLevel, selectedGrade, selectedSection, selectedCategory]);

  // Si no hay ninguna citación elegida, se muestra la primera de la lista.
  // Se deriva en el render en lugar de sincronizarlo con un efecto, así se
  // evita el render intermedio con la vista de detalle vacía.
  const activeCitationId = selectedCitationId ?? filteredCitations[0]?.id ?? null;
  const activeCitation = useMemo(
    () => citationsList.find((c) => c.id === activeCitationId) || null,
    [activeCitationId, citationsList],
  );
  const activeMessages = activeCitation ? MESSAGES_BY_CITATION[activeCitation.id] ?? [] : [];

  /** Mensajes sin leer visibles en la lista: 0 si la citación ya se abrió en esta sesión. */
  const getDisplayedUnreadCount = (id: number): number => (readCitationIds.has(id) ? 0 : getUnreadCount(id));

  const updateCitationStatus = (id: number, newStatus: Citation['status']) => {
    setCitationsList((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    toast({
      title: 'Citación actualizada',
      description: `Citación ${newStatus.toLowerCase()} correctamente.`,
      variant: 'success',
    });
    setIsMobileSheetOpen(false);
  };

  // Seleccionar una citación de la lista actualiza el panel de detalle
  // in-place en escritorio, o abre el panel deslizante en móvil.
  const handleSelectCitation = (id: number) => {
    setSelectedCitationId(id);
    setReadCitationIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    if (!isDesktop) setIsMobileSheetOpen(true);
  };

  const openReschedule = (citation: Citation) => {
    setIsMobileSheetOpen(false);
    setReschedDate('');
    setReschedTime('');
    setReschedReason('');
    setRescheduleModal({ isOpen: true, citation });
  };

  const handleReschedule = () => {
    if (!rescheduleModal.citation) return;
    const citationId = rescheduleModal.citation.id;
    setCitationsList((prev) =>
      prev.map((c) =>
        c.id === citationId
          ? { ...c, status: 'Reprogramada', date: reschedDate, time: reschedTime, reason: reschedReason || c.reason }
          : c,
      ),
    );
    toast({
      title: 'Citación reprogramada',
      description: 'La citación se reprogramó correctamente.',
      variant: 'success',
    });
    setRescheduleModal({ isOpen: false, citation: null });
  };

  const handleDraftCitation = (draft: DraftCitationResult) => {
    const newId = Math.max(0, ...citationsList.map((c) => c.id)) + 1;
    const newCitation: Citation = {
      id: newId,
      student: draft.student.name,
      parent: draft.guardian.name,
      relationship: guardianRelationship(draft.guardian),
      parentPhone: formatGuardianPhone(draft.guardian.phone),
      grade: formatStudentGrade(draft.student),
      level: (draft.student.level as Citation['level']) ?? 'Primaria',
      reason: draft.reason,
      description: draft.description,
      category: draft.category,
      date: draft.date,
      time: draft.time,
      status: 'Pendiente',
      teacher: session.user.name,
      subject: session.user.subject ?? session.user.position ?? 'Dirección',
      ...(draft.incidents && draft.incidents.length > 0 ? { incidents: draft.incidents } : {}),
    };

    setCitationsList((prev) => [newCitation, ...prev]);
    setSelectedCitationId(newId);
    setIsDraftModalOpen(false);
    toast({
      title: 'Citación creada',
      description: `Se registró la citación de ${newCitation.parent} correctamente.`,
      variant: 'success',
    });
  };

  return (
    <ModuleShell>
      <CitationsListPanel
        citations={filteredCitations}
        activeCitationId={activeCitationId}
        onSelectCitation={handleSelectCitation}
        getUnreadCount={getDisplayedUnreadCount}
        onDraftCitation={() => setIsDraftModalOpen(true)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedStatusTab={selectedStatusTab}
        onStatusTabChange={setSelectedStatusTab}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedGrade={selectedGrade}
        onGradeChange={setSelectedGrade}
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Detalle: panel fijo, solo en escritorio (≥ lg). En móvil se usa el bottom sheet de abajo. */}
      <ModulePane className="hidden lg:flex">
        {activeCitation ? (
          <CitationDetailPanel
            citation={activeCitation}
            messages={activeMessages}
            onApprove={(id) => updateCitationStatus(id, 'Confirmada')}
            onComplete={(id) => updateCitationStatus(id, 'Completada')}
            onOpenReschedule={openReschedule}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-slate-500 dark:text-slate-400">
            <CalendarCheck className="h-8 w-8" strokeWidth={2} />
            <p className="text-sm font-semibold">No hay citaciones con estos filtros</p>
            <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Prueba a cambiar el estado, el nivel o el motivo seleccionados.
            </p>
          </div>
        )}
      </ModulePane>

      {/* Detalle en móvil (< lg): panel deslizante desde abajo, cerrable con "X" o clic fuera. */}
      {/* `isDesktop` evita que el sheet quede abierto si la ventana crece mientras estaba visible en móvil. */}
      <Sheet open={isMobileSheetOpen && !isDesktop} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0">
          {activeCitation && (
            <CitationDetailPanel
              variant="sheet"
              citation={activeCitation}
              messages={activeMessages}
              onApprove={(id) => updateCitationStatus(id, 'Confirmada')}
              onComplete={(id) => updateCitationStatus(id, 'Completada')}
              onOpenReschedule={openReschedule}
            />
          )}
        </SheetContent>
      </Sheet>

      <RescheduleCitationModal
        isOpen={rescheduleModal.isOpen}
        citation={rescheduleModal.citation}
        reschedDate={reschedDate}
        onRescheduleDateChange={setReschedDate}
        reschedTime={reschedTime}
        onRescheduleTimeChange={setReschedTime}
        reschedReason={reschedReason}
        onRescheduleReasonChange={setReschedReason}
        onClose={() => setRescheduleModal({ isOpen: false, citation: null })}
        onConfirm={handleReschedule}
      />

      <DraftCitationModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        students={draftableStudents}
        allUsers={MOCK_USERS}
        onConfirm={handleDraftCitation}
      />
    </ModuleShell>
  );
};
