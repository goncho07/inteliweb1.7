import React from 'react';
import { Contact, History, Save, ShieldCheck } from 'lucide-react';

import { Field } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileCard, ProfileFact, ProfileSectionColumn, ProfileSectionGrid } from '@/features/profile/components/ProfileCard';
import { ProfilePhotoField } from '@/features/profile/components/ProfilePhotoField';
import type { useProfileForms } from '@/features/profile/hooks/useProfileForms';
import { ACCOUNT_ACTIVITY } from '@/features/profile/profile.data';
import type { UserItem } from '@/types';

/**
 * Datos personales. Panel izquierdo: lo único que el docente puede cambiar —su
 * foto, encabezando la tarjeta, y sus datos de contacto—. Panel derecho: lo que
 * gestiona la dirección del colegio y el historial de la cuenta, solo de leer.
 *
 * El cargo no es un campo del formulario aunque lo parezca: no se puede editar,
 * así que vive con el resto de datos de la cuenta y no como una casilla
 * deshabilitada con un candado.
 */
export const PersonalSection: React.FC<{
  user: UserItem;
  roleLabel: string;
  personal: ReturnType<typeof useProfileForms>['personal'];
}> = ({ user, roleLabel, personal }) => {
  const { form, errors, isDirty, setField, reset, submit } = personal;

  return (
    <ProfileSectionGrid>
      <ProfileSectionColumn>
        <form onSubmit={submit}>
          <ProfileCard
            title="Información de contacto"
            description="Tu foto y los datos con los que te localizan la dirección y los apoderados."
            icon={Contact}
            bodyClassName="flex flex-col gap-4"
            footer={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={reset}
                  disabled={!isDirty}
                  className="h-12 rounded-xl px-6 text-base font-semibold"
                >
                  Descartar cambios
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty}
                  className="h-12 gap-2 rounded-xl px-8 text-base font-semibold"
                >
                  <Save size={20} /> Guardar cambios
                </Button>
              </>
            }
          >
            <ProfilePhotoField />

            {/* Una columna en el portátil (el panel mide ~400px ahí: dos
                casillas por fila dejarían un correo sin verse entero) y dos en
                monitor ancho. */}
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              <Field id="name" label="Nombres completos" error={errors.name}>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setField('name', event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className="h-11 rounded-xl text-base"
                />
              </Field>

              <Field id="email" label="Correo electrónico" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="h-11 rounded-xl text-base"
                />
              </Field>

              {/* El formato va en el `placeholder` y no en una pista debajo: la
                  pista añadía una línea a cada fila del formulario. */}
              <Field id="phone" label="Teléfono" error={errors.phone}>
                <Input
                  id="phone"
                  inputMode="numeric"
                  placeholder="987654321"
                  value={form.phone}
                  onChange={(event) => setField('phone', event.target.value.replace(/\D/g, '').slice(0, 9))}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className="h-11 rounded-xl text-base tabular-nums"
                />
              </Field>

              <Field id="address" label="Dirección">
                <Input
                  id="address"
                  placeholder="Calle o avenida y número"
                  value={form.address}
                  onChange={(event) => setField('address', event.target.value)}
                  className="h-11 rounded-xl text-base"
                />
              </Field>
            </div>
          </ProfileCard>
        </form>
      </ProfileSectionColumn>

      <ProfileSectionColumn>
        <ProfileCard
          title="Datos de la cuenta"
          description="Los gestiona la dirección del colegio; desde aquí no se editan."
          icon={ShieldCheck}
          bodyClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <ProfileFact label="Cargo o rol" value={roleLabel} />
          <ProfileFact label="Documento de identidad" value={user.dni} />
          <ProfileFact label="Situación" value={user.status} />
          <ProfileFact
            label="Correo electrónico"
            value={<span className="text-emerald-600 dark:text-emerald-400">Verificado</span>}
          />
        </ProfileCard>

        <ProfileCard
          title="Actividad reciente"
          description="Últimos movimientos de tu cuenta."
          icon={History}
          bodyClassName="flex flex-col gap-3"
        >
          {ACCOUNT_ACTIVITY.map((event) => (
            <ProfileFact key={event.id} icon={event.icon} label={event.label} value={event.detail} />
          ))}
        </ProfileCard>
      </ProfileSectionColumn>
    </ProfileSectionGrid>
  );
};
