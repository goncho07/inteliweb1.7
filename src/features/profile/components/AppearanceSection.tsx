import React from 'react';
import { CalendarDays, Eye, Palette, SunMoon, Users } from 'lucide-react';

import { NavCard } from '@/components/common/NavCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ProfileCard,
  ProfileSectionColumn,
  ProfileSectionGrid,
} from '@/features/profile/components/ProfileCard';
import { DISPLAY_MODES, THEME_OPTIONS } from '@/features/profile/profile.constants';
import { useThemeMode } from '@/features/theme/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * Maqueta reducida de la interfaz —riel, cabecera, tarjeta y botones— pintada
 * solo con tokens del tema. Sirve para ver el efecto de la combinación elegida
 * sin salir del módulo a comprobarlo.
 */
const ThemePreview: React.FC = () => (
  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
    <div className="flex">
      <div className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Users size={20} />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <CalendarDays size={20} />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Palette size={20} />
        </div>
      </div>

      <div className="min-w-0 flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users size={20} strokeWidth={2.5} />
          </div>
          <p className="truncate text-base font-black text-slate-800 dark:text-white">Usuarios</p>
        </div>

        <div className="flex flex-col gap-3 p-3">
          <div className="rounded-xl border border-primary bg-primary/10 p-3">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Elemento seleccionado</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Así se marca lo que está activo.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" tabIndex={-1} aria-hidden className="pointer-events-none h-10 rounded-xl text-base">
              Acción principal
            </Button>
            <Button
              type="button"
              variant="outline"
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none h-10 rounded-xl text-base"
            >
              Secundaria
            </Button>
            <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">Etiqueta</Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Apariencia, en la rejilla estándar de dos paneles: una decisión por panel
 * —claro u oscuro, azul o rojo institucional— y la vista previa cruzando las
 * dos columnas al pie, donde se ve el efecto de ambas juntas sin desplazar la
 * pantalla.
 *
 * El riel de la izquierda conserva su atajo de modo oscuro; aquí está la
 * versión explicada, con el estado activo visible.
 */
export const AppearanceSection: React.FC = () => {
  const { themeMode, setThemeMode, isDarkMode, setIsDarkMode } = useThemeMode();
  const activeDisplay = isDarkMode ? 'oscuro' : 'claro';

  return (
    <ProfileSectionGrid>
      <ProfileSectionColumn>
        <ProfileCard
          title="Modo de visualización"
          description="Fondo claro para el día, oscuro para la noche."
          icon={SunMoon}
          bodyClassName="flex flex-col gap-3"
        >
          {DISPLAY_MODES.map((mode) => {
            const isSelected = activeDisplay === mode.id;
            return (
              <NavCard
                key={mode.id}
                title={mode.title}
                statLines={[mode.description]}
                selected={isSelected}
                onClick={() => setIsDarkMode(mode.id === 'oscuro')}
                badge={isSelected ? 'Activo' : undefined}
                badgeClassName={
                  isSelected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : undefined
                }
                leadingClassName={isSelected ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}
                leading={
                  <mode.icon
                    size={24}
                    strokeWidth={2.5}
                    className={cn(isSelected ? 'text-primary-foreground' : 'text-slate-500 dark:text-slate-400')}
                  />
                }
              />
            );
          })}
        </ProfileCard>
      </ProfileSectionColumn>

      <ProfileSectionColumn>
        <ProfileCard
          title="Color del sistema"
          description="Define el color de los botones, los títulos y el foco de teclado."
          icon={Palette}
          bodyClassName="flex flex-col gap-3"
        >
          {THEME_OPTIONS.map((option) => {
            const isSelected = themeMode === option.id;
            return (
              <NavCard
                key={option.id}
                title={option.title}
                statLines={[option.description]}
                selected={isSelected}
                onClick={() => setThemeMode(option.id)}
                leadingClassName={option.swatchClassName}
                badge={isSelected ? 'Activo' : undefined}
                badgeClassName={
                  isSelected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : undefined
                }
              />
            );
          })}
        </ProfileCard>
      </ProfileSectionColumn>

      {/* Última fila a todo lo ancho: la excepción prevista por la rejilla,
          para el bloque que no pertenece a una columna ni a la otra. */}
      <ProfileCard
        title="Vista previa"
        description="Así se verá el sistema con lo que elijas."
        icon={Eye}
        className="xl:col-span-2"
        bodyClassName="max-w-[720px]"
      >
        <ThemePreview />
      </ProfileCard>
    </ProfileSectionGrid>
  );
};
