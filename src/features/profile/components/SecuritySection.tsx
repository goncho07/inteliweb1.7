import React, { useState } from 'react';
import { CheckCircle2, Circle, KeyRound, Laptop, LogOut, MonitorSmartphone, Save, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/features/profile/components/PasswordField';
import {
  ProfileCard,
  ProfileSectionColumn,
  ProfileSectionGrid,
} from '@/features/profile/components/ProfileCard';
import type { useProfileForms } from '@/features/profile/hooks/useProfileForms';
import { PASSWORD_REQUIREMENTS, PASSWORD_STRENGTH_LEVELS, SECURITY_TIPS } from '@/features/profile/profile.constants';
import { ACTIVE_DEVICES } from '@/features/profile/profile.data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Seguridad, en la rejilla estándar de dos paneles: a la izquierda lo único
 * editable —la contraseña, con su medidor en vivo—; a la derecha lo
 * informativo: dónde sigue abierta la sesión y tres hábitos que proteger.
 *
 * El estado de la cuenta (correo verificado, último acceso) no se repite aquí:
 * vive en "Datos personales", junto al resto de datos de la cuenta.
 */
export const SecuritySection: React.FC<{
  security: ReturnType<typeof useProfileForms>['security'];
}> = ({ security }) => {
  const { form, errors, setField, submit } = security;
  const { toast } = useToast();
  const [devices, setDevices] = useState(ACTIVE_DEVICES);

  const metRequirements = PASSWORD_REQUIREMENTS.filter((requirement) => requirement.test(form.next)).length;
  const strength = PASSWORD_STRENGTH_LEVELS[form.next ? metRequirements : 0];
  const otherDevices = devices.filter((device) => !device.current);

  const closeOtherSessions = () => {
    setDevices((previous) => previous.filter((device) => device.current));
    toast({
      title: 'Sesiones cerradas',
      description: `Se cerró la sesión en ${otherDevices.length} ${otherDevices.length === 1 ? 'dispositivo' : 'dispositivos'}.`,
    });
  };

  return (
    <ProfileSectionGrid>
      <ProfileSectionColumn>
        <form onSubmit={submit}>
        <ProfileCard
          title="Cambiar contraseña"
          description="Se te pedirá la actual antes de guardar la nueva."
          icon={KeyRound}
          bodyClassName="flex flex-col gap-4"
          footer={
            <Button type="submit" className="h-12 gap-2 rounded-xl px-8 text-base font-semibold">
              <Save size={20} /> Actualizar contraseña
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <PasswordField
              id="current"
              label="Contraseña actual"
              value={form.current}
              onChange={(value) => setField('current', value)}
              error={errors.current}
              autoComplete="current-password"
            />
            <PasswordField
              id="next"
              label="Nueva contraseña"
              value={form.next}
              onChange={(value) => setField('next', value)}
              error={errors.next}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirm"
              label="Confirmar nueva contraseña"
              value={form.confirm}
              onChange={(value) => setField('confirm', value)}
              error={errors.confirm}
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fortaleza de la contraseña</h4>
              <span
                aria-live="polite"
                className={cn('text-sm font-bold', form.next ? strength.textClassName : 'text-slate-400')}
              >
                {form.next ? strength.label : 'Sin escribir'}
              </span>
            </div>
            {/* Cuatro tramos = cuatro requisitos: el medidor y la lista de
                abajo cuentan lo mismo, para no dar dos criterios distintos. */}
            <div className="mt-3 flex items-center gap-2">
              {PASSWORD_REQUIREMENTS.map((requirement, index) => (
                <span
                  key={requirement.id}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    form.next && index < metRequirements ? strength.barClassName : 'bg-slate-200 dark:bg-slate-700',
                  )}
                />
              ))}
            </div>

            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm font-medium text-slate-500 sm:grid-cols-2 dark:text-slate-400">
              {PASSWORD_REQUIREMENTS.map((requirement) => {
                const met = requirement.test(form.next);
                return (
                  <li key={requirement.id} className="flex items-center gap-2">
                    {met ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    ) : (
                      <Circle size={16} className="shrink-0 text-slate-300 dark:text-slate-600" />
                    )}
                    <span className={cn(met && 'text-slate-700 dark:text-slate-200')}>{requirement.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          </ProfileCard>
        </form>
      </ProfileSectionColumn>

      <ProfileSectionColumn>
        <ProfileCard
          title="Dispositivos con sesión abierta"
          description="Dónde está tu cuenta iniciada ahora mismo."
          icon={MonitorSmartphone}
          bodyClassName="flex flex-col gap-2"
          footer={
            otherDevices.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={closeOtherSessions}
                className="h-12 gap-2 rounded-xl px-6 text-base font-semibold"
              >
                <LogOut size={20} /> Cerrar las demás sesiones
              </Button>
            ) : undefined
          }
        >
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30"
            >
              <Laptop size={20} aria-hidden className="shrink-0 text-slate-400 dark:text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">{device.device}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {device.browser} · {device.location}
                </p>
              </div>
              {device.current ? (
                <Badge className="shrink-0 border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                  Este equipo
                </Badge>
              ) : (
                <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {device.lastActive}
                </span>
              )}
            </div>
          ))}
        </ProfileCard>

        <ProfileCard
          title="Consejos de seguridad"
          description="Tres hábitos que protegen los datos de tus alumnos."
          icon={ShieldCheck}
          bodyClassName="flex flex-col gap-2"
        >
          {SECURITY_TIPS.map((tip) => (
            <p key={tip} className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={20} aria-hidden className="shrink-0 text-primary" />
              {tip}
            </p>
          ))}
        </ProfileCard>
      </ProfileSectionColumn>
    </ProfileSectionGrid>
  );
};
