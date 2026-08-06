import React, { useState } from 'react';
import { KeyRound, User } from 'lucide-react';

import { NavCard } from '@/components/common/NavCard';
import {
  ModuleBody,
  ModulePane,
  ModulePaneHeader,
  ModuleShell,
  ModuleSidebar,
  ModuleSidebarBody,
  ModuleSidebarSection,
} from '@/components/layout/ModuleShell';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/features/auth/SessionContext';
import { ROLE_LABEL } from '@/features/auth/session';
import { AppearanceSection } from '@/features/profile/components/AppearanceSection';
import { NotificationsSection } from '@/features/profile/components/NotificationsSection';
import { PersonalSection } from '@/features/profile/components/PersonalSection';
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { SecuritySection } from '@/features/profile/components/SecuritySection';
import { useProfileForms } from '@/features/profile/hooks/useProfileForms';
import { useProfileIdentity } from '@/features/profile/ProfileIdentityContext';
import {
  NOTIFICATION_GROUPS,
  PROFILE_SECTIONS,
  THEME_OPTIONS,
  type ProfileSection,
} from '@/features/profile/profile.constants';
import { ACCOUNT_STATUS } from '@/features/profile/profile.data';
import { useThemeMode } from '@/features/theme/ThemeContext';
import { cn } from '@/lib/utils';
import type { ModuleProps } from '@/types';

/**
 * Badge de estado de la cabecera del panel: mismo aspecto en las cuatro
 * secciones. Dice **cómo está** la sección abierta ahora mismo — nunca repite
 * un dato que ya está escrito en un bloque del cuerpo.
 */
const HeaderMeta: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <Badge
    variant="outline"
    className={cn(
      'shrink-0 gap-2 border-slate-200 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400',
      className,
    )}
  >
    {children}
  </Badge>
);

/**
 * Mi Perfil: los datos, la contraseña, las notificaciones y la apariencia de
 * quien inició sesión. Anatomía estándar de módulo — el sidebar recorre las
 * cuatro secciones y la cabecera del panel dice cuál está abierta; el cuerpo
 * es una rejilla de tarjetas (`ProfileCard`), el mismo lenguaje visual que
 * Inicio o la Vista General del Aula.
 *
 * Cada sección cabe entera en el panel a 1366×768: las tarjetas se reparten en
 * una o dos columnas y no hay barra de desplazamiento. Si se le añade
 * contenido a una sección, hay que recolocarla — no dejar que crezca hacia
 * abajo.
 *
 * La foto y el nombre no viven aquí sino en `ProfileIdentityContext`, porque
 * el riel de navegación también los muestra.
 *
 * Todo es simulado: no hay backend, así que "guardar" valida y confirma con un
 * toast pero no persiste entre sesiones — igual que el resto de la aplicación.
 */
export const ProfileModule: React.FC<ModuleProps> = () => {
  const session = useSession();
  const identity = useProfileIdentity();
  const { themeMode, isDarkMode } = useThemeMode();
  const { personal, security, notifications } = useProfileForms();

  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');

  const roleLabel = ROLE_LABEL[session.role];
  const section = PROFILE_SECTIONS.find((item) => item.id === activeSection) ?? PROFILE_SECTIONS[0];
  const SectionIcon = section.icon;

  const allPrefs = NOTIFICATION_GROUPS.flatMap((group) => group.prefs);
  const activeNotifications = allPrefs.filter((pref) => notifications.values[pref.id]).length;
  const activeTheme = THEME_OPTIONS.find((option) => option.id === themeMode);

  // Dato de estado de la sección abierta, a la derecha de la cabecera.
  const sectionMeta =
    activeSection === 'personal' ? (
      // Si hay cambios sin guardar hay que decirlo aquí: el botón "Guardar"
      // queda al final de un panel con scroll y puede no estar a la vista.
      <HeaderMeta
        className={
          personal.isDirty
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
            : undefined
        }
      >
        <span aria-live="polite">{personal.isDirty ? 'Tienes cambios sin guardar' : 'Sin cambios pendientes'}</span>
      </HeaderMeta>
    ) : activeSection === 'security' ? (
      <HeaderMeta>
        <KeyRound size={16} aria-hidden /> Contraseña actualizada {ACCOUNT_STATUS.passwordUpdated.toLowerCase()}
      </HeaderMeta>
    ) : activeSection === 'notifications' ? (
      <HeaderMeta>
        <span aria-live="polite">
          {activeNotifications} de {allPrefs.length} avisos activos
        </span>
      </HeaderMeta>
    ) : (
      <HeaderMeta>
        {activeTheme?.title} · Modo {isDarkMode ? 'oscuro' : 'claro'}
      </HeaderMeta>
    );

  return (
    <ModuleShell>
      <ModuleSidebar title="Mi perfil" icon={User}>
        <ModuleSidebarBody>
          {/* Quién eres: el panel de la derecha lo ocupa la sección abierta,
              así que la identidad vive aquí, una sola vez. */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <ProfileAvatar
              name={identity.name}
              photo={identity.photo}
              className="h-14 w-14"
              textClassName="text-lg"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-800 dark:text-white">{identity.name}</p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{roleLabel}</p>
            </div>
          </div>

          {/* Solo navegación: el estado de la cuenta (último acceso, contraseña,
              correo verificado) es contenido de la sección Seguridad y se
              contaba también aquí — el mismo dato en dos sitios de la pantalla. */}
          <ModuleSidebarSection label="Secciones">
            {PROFILE_SECTIONS.map((item) => {
              const isSelected = item.id === activeSection;
              return (
                <NavCard
                  key={item.id}
                  title={item.title}
                  statLines={[item.description]}
                  selected={isSelected}
                  onClick={() => setActiveSection(item.id)}
                  leadingClassName={isSelected ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}
                  leading={
                    <item.icon
                      size={24}
                      strokeWidth={2.5}
                      className={cn(isSelected ? 'text-primary-foreground' : 'text-slate-500 dark:text-slate-400')}
                    />
                  }
                />
              );
            })}
          </ModuleSidebarSection>
        </ModuleSidebarBody>
      </ModuleSidebar>

      <ModulePane>
        {/* Única cabecera de la sección abierta: no se repite dentro del cuerpo. */}
        <ModulePaneHeader>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SectionIcon size={24} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-800 dark:text-white">{section.title}</h2>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{section.summary}</p>
            </div>
          </div>
          {sectionMeta}
        </ModulePaneHeader>

        {/* Relleno propio más ajustado que el de un módulo con scroll (`lg:p-6`
            en vez de `lg:px-8 lg:pb-8`): esos 16px de más eran justo lo que
            sacaba a la sección Datos personales fuera de la pantalla del
            portátil. El `overflow-y-auto` de `ModuleBody` se conserva como red
            de seguridad para pantallas más bajas de 768px. */}
        <ModuleBody centered className="p-4 lg:p-6">
          {activeSection === 'personal' && (
            <PersonalSection user={session.user} roleLabel={roleLabel} personal={personal} />
          )}
          {activeSection === 'security' && <SecuritySection security={security} />}
          {activeSection === 'notifications' && <NotificationsSection notifications={notifications} />}
          {activeSection === 'appearance' && <AppearanceSection />}
        </ModuleBody>
      </ModulePane>
    </ModuleShell>
  );
};
