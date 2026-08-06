import React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClassroomRef } from '@/types';

/** Clave única de un aula dentro de un desplegable: `${nivel}-${grado}-${sección}`. */
export const classroomOptionKey = (c: ClassroomRef): string => `${c.level}-${c.grade}-${c.section}`;

/** Texto corto de un aula en un desplegable: "3° A · Primaria". */
export const classroomOptionLabel = (c: ClassroomRef): string =>
  `${c.grade.replace(' Grado', '')} ${c.section} · ${c.level}`;

/**
 * Desplegable de aula: reemplaza a la antigua rejilla de tarjetas
 * (`ClassroomGridPicker`) en los formularios de una sola pantalla — elegir el
 * aula ya no es un paso propio, es el primer campo del formulario. Se usa
 * dentro de `Field` para la etiqueta, igual que cualquier otro control.
 */
export const ClassroomSelect: React.FC<{
  id: string;
  classrooms: ClassroomRef[];
  value: ClassroomRef | null;
  onChange: (classroom: ClassroomRef) => void;
  placeholder?: string;
  className?: string;
}> = ({ id, classrooms, value, onChange, placeholder = 'Selecciona un aula', className }) => (
  <Select
    value={value ? classroomOptionKey(value) : undefined}
    onValueChange={(key) => {
      const classroom = classrooms.find((c) => classroomOptionKey(c) === key);
      if (classroom) onChange(classroom);
    }}
    disabled={classrooms.length === 0}
  >
    <SelectTrigger
      id={id}
      className={className ?? 'h-11 rounded-xl text-base shadow-sm disabled:cursor-not-allowed disabled:opacity-60'}
    >
      <SelectValue placeholder={classrooms.length === 0 ? 'No tienes aulas asignadas' : placeholder} />
    </SelectTrigger>
    <SelectContent className="rounded-xl">
      {classrooms.map((c) => (
        <SelectItem key={classroomOptionKey(c)} value={classroomOptionKey(c)} className="h-10 text-base">
          {classroomOptionLabel(c)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
