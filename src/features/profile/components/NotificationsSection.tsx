import React from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ProfileCard,
  ProfileSectionColumn,
  ProfileSectionGrid,
} from '@/features/profile/components/ProfileCard';
import type { useProfileForms } from '@/features/profile/hooks/useProfileForms';
import { NOTIFICATION_GROUPS, type NotificationPref } from '@/features/profile/profile.constants';

/**
 * Notificaciones, en la rejilla estándar de dos paneles: los dos canales
 * ordinarios —la aplicación y el correo— ocupan un panel cada uno, y los avisos
 * urgentes cruzan las dos columnas al pie, que es donde se les ve el peso.
 *
 * No hay botón "Guardar" —cada interruptor se aplica al momento y lo confirma
 * con un toast—, así que la cabecera del panel lleva el recuento de avisos
 * activos como señal visible del cambio.
 */
export const NotificationsSection: React.FC<{
  notifications: ReturnType<typeof useProfileForms>['notifications'];
}> = ({ notifications }) => {
  const [inApp, byEmail, urgent] = NOTIFICATION_GROUPS;

  const renderPref = (pref: NotificationPref) => (
    <div
      key={pref.id}
      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30"
    >
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={`notif-${pref.id}`}
          className="min-w-0 cursor-pointer text-base font-bold text-slate-900 dark:text-white"
        >
          {pref.title}
        </Label>
        <Switch
          id={`notif-${pref.id}`}
          checked={notifications.values[pref.id]}
          onCheckedChange={(checked) => notifications.toggle(pref.id, pref.title, checked)}
          className="shrink-0"
        />
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pref.description}</p>
    </div>
  );

  return (
    <ProfileSectionGrid>
      <ProfileSectionColumn>
        <ProfileCard
          title={inApp.title}
          description={inApp.description}
          icon={inApp.icon}
          bodyClassName="flex flex-col gap-3"
        >
          {inApp.prefs.map(renderPref)}
        </ProfileCard>
      </ProfileSectionColumn>

      <ProfileSectionColumn>
        <ProfileCard
          title={byEmail.title}
          description={byEmail.description}
          icon={byEmail.icon}
          bodyClassName="flex flex-col gap-3"
        >
          {byEmail.prefs.map(renderPref)}
        </ProfileCard>
      </ProfileSectionColumn>

      {/* Última fila a todo lo ancho: la excepción prevista por la rejilla,
          para el bloque que no se reparte entre los dos paneles. */}
      <ProfileCard
        title={urgent.title}
        description={urgent.description}
        icon={urgent.icon}
        className="xl:col-span-2"
        bodyClassName="grid grid-cols-1 gap-3 xl:grid-cols-2"
      >
        {urgent.prefs.map(renderPref)}
      </ProfileCard>
    </ProfileSectionGrid>
  );
};
