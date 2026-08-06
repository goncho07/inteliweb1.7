import React from 'react';
import { Calendar, CreditCard, GraduationCap, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react';

import { DialogShellSection } from '@/components/common/DialogShell';
import { DataField } from '@/features/users/components/UserDetailFields';
import { ROLE_META } from '@/features/users/users.constants';
import { calculateAge, formatBirthDate, formatGender, formatPhone } from '@/features/users/users.format';
import type { UserItem } from '@/types';

/**
 * Ficha en modo lectura: los mismos apartados que el formulario, pero sin
 * controles. Es lo primero que se ve al abrir a una persona; «Editar» cambia
 * a `UserFormBody` sobre los mismos datos, sin abrir una segunda ventana.
 *
 * Un alumno no tiene su propia sección de Contacto: el teléfono y la
 * dirección que importan son los de su apoderado, ya visibles en la fila de
 * «Apoderados registrados» y en su propia ficha.
 */
export const UserDetailsView: React.FC<{ user: UserItem }> = ({ user }) => {
  const meta = ROLE_META[user.role];
  const isStudent = user.role === 'Estudiante';
  const age = calculateAge(user.birthDate);
  const birthDateValue = formatBirthDate(user.birthDate);

  return (
    <>
      <DialogShellSection title="Identidad" icon={CreditCard}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DataField label="DNI" value={user.dni} icon={CreditCard} />
          <DataField label="Género" value={formatGender(user.gender)} icon={User} />
          <DataField
            label="Fecha de nacimiento"
            value={birthDateValue}
            hint={age !== null ? `${age} años` : undefined}
            icon={Calendar}
          />
          {isStudent && (
            <DataField label="Código del estudiante" value={user.modularCode} icon={CreditCard} />
          )}
        </div>
      </DialogShellSection>

      {!isStudent && (
        <DialogShellSection title="Contacto" icon={Phone}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DataField label="Correo electrónico" value={user.email} icon={Mail} />
            <DataField label="Teléfono" value={formatPhone(user.phone)} icon={Phone} />
            <div className="sm:col-span-2">
              <DataField label="Dirección" value={user.address} icon={MapPin} />
            </div>
          </div>
        </DialogShellSection>
      )}

      {meta.hasClassroom && (
        <DialogShellSection
          title={isStudent ? 'Aula asignada' : 'Aula que tutela'}
          icon={GraduationCap}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DataField label="Nivel educativo" value={user.level} icon={GraduationCap} />
            <DataField label="Grado" value={user.grade} icon={GraduationCap} />
            <DataField label="Sección" value={user.section} icon={GraduationCap} />
            {user.role === 'Docente' && (
              <DataField label="Curso que dicta" value={user.subject} icon={GraduationCap} />
            )}
          </div>
        </DialogShellSection>
      )}

      {user.role === 'Administrativo' && (
        <DialogShellSection title="Puesto" icon={ShieldCheck}>
          <DataField label="Cargo" value={user.position} icon={ShieldCheck} />
        </DialogShellSection>
      )}
    </>
  );
};
