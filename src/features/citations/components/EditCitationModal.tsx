import React from 'react';
import { Pencil } from 'lucide-react';

import {
  DialogShellBody,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { LabeledSelect } from '@/components/common/LabeledSelect';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { CATEGORY_OPTIONS } from '../citations.constants';
import type { Citation, CitationCategory } from '../types';

/** Modal para editar el motivo, la categoría y la descripción de una citación. */
export const EditCitationModal: React.FC<{
  isOpen: boolean;
  citation: Citation | null;
  editReason: string;
  onEditReasonChange: (value: string) => void;
  editCategory: CitationCategory;
  onEditCategoryChange: (value: CitationCategory) => void;
  editDescription: string;
  onEditDescriptionChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  citation,
  editReason,
  onEditReasonChange,
  editCategory,
  onEditCategoryChange,
  editDescription,
  onEditDescriptionChange,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogShellContent size="sm">
        <DialogShellHeader
          icon={Pencil}
          title="Editar citación"
          description={
            citation ? `${citation.student} · ${citation.date} a las ${citation.time}` : undefined
          }
        />

        <DialogShellBody>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="edit-reason"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Motivo
            </Label>
            <Input
              id="edit-reason"
              value={editReason}
              onChange={(e) => onEditReasonChange(e.target.value)}
              placeholder="Ej: Bajo rendimiento en Matemáticas"
              className="h-11 rounded-xl text-base"
            />
          </div>

          <LabeledSelect
            id="edit-category"
            label="Categoría"
            value={editCategory}
            options={CATEGORY_OPTIONS}
            onChange={(value) => onEditCategoryChange(value as CitationCategory)}
          />

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="edit-description"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Descripción
            </Label>
            <Textarea
              id="edit-description"
              value={editDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              placeholder="Detalle de la citación…"
              className="h-28 resize-none rounded-xl text-base"
            />
          </div>
        </DialogShellBody>

        <DialogShellFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 rounded-xl px-6 text-base font-semibold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!editReason.trim()}
            className="h-12 rounded-xl px-6 text-base font-semibold"
          >
            Guardar cambios
          </Button>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
