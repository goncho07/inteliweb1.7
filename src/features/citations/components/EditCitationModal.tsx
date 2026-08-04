import React from 'react';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <DialogContent className="rounded-2xl p-0 gap-0 max-w-[500px] overflow-hidden">
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-0">
          <DialogTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" /> Editar citación
          </DialogTitle>
          {citation && (
            <p className="text-sm text-slate-500 dark:text-slate-400 pt-1">
              {citation.student} · {citation.date} a las {citation.time}
            </p>
          )}
        </DialogHeader>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="edit-reason" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Motivo
            </Label>
            <Input
              id="edit-reason"
              value={editReason}
              onChange={(e) => onEditReasonChange(e.target.value)}
              placeholder="Ej: Bajo rendimiento en Matemáticas"
              className="h-10 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="edit-category" className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">
              Categoría
            </Label>
            <Select value={editCategory} onValueChange={(value) => onEditCategoryChange(value as CitationCategory)}>
              <SelectTrigger id="edit-category" className="h-10 rounded-xl">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="edit-description"
              className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              Descripción
            </Label>
            <Textarea
              id="edit-description"
              value={editDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              placeholder="Detalle de la citación..."
              className="rounded-xl h-28 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!editReason.trim()}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
