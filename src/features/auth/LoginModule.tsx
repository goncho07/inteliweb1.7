import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/app';
import { ContactSupportDialog } from '@/features/auth/components/ContactSupportDialog';
import { ForgotPasswordScreen } from '@/features/auth/components/ForgotPasswordScreen';
import { GuardianAccessFlow } from '@/features/auth/components/GuardianAccessFlow';
import { LoginBrand } from '@/features/auth/components/LoginBrand';
import { StaffLoginForm } from '@/features/auth/components/StaffLoginForm';
import type { UserItem } from '@/types';

/**
 * Pantalla de acceso, con la anatomía del bloque `login` de shadcn: dos
 * columnas iguales, la fotografía del colegio a la izquierda —a sangre y sin
 * ningún velo de color encima— y el formulario a la derecha. Por debajo de
 * `lg` la fotografía se retira y queda solo el formulario, centrado.
 *
 * La pantalla es estática: ocupa exactamente el alto de la ventana y no
 * admite scroll en ninguna dirección, ni en la fotografía ni en la columna
 * del formulario.
 *
 * Hay tres formas de entrar; las dos primeras terminan en `onLogin`, que
 * construye la sesión (`buildSession`):
 *
 * - **Personal** (directivo, docente, auxiliar): DNI + clave (`StaffLoginForm`).
 * - **Apoderado**: los tres pasos de `GuardianAccessFlow`.
 * - **Recuperar contraseña**: pantalla informativa (`ForgotPasswordScreen`),
 *   vuelve al acceso de personal.
 *
 * En los dos primeros casos el DNI se busca en el padrón simulado
 * (`MOCK_USERS`): no hay una lista de usuarios y contraseñas aparte.
 */
export const LoginModule: React.FC<{ onLogin: (user: UserItem, remember: boolean) => void }> = ({
  onLogin,
}) => {
  const [mode, setMode] = useState<'staff' | 'guardian' | 'forgot'>('staff');
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    // `overflow-hidden` en la raíz y en la columna del formulario: la
    // pantalla de acceso no hace scroll en ningún eje, ni siquiera si el
    // contenido roza el alto de la ventana.
    <div className="grid h-screen w-full overflow-hidden bg-white font-poppins dark:bg-slate-950 lg:grid-cols-5">
      {/* Fotografía de la fachada: se muestra tal cual, sin degradado ni tinte
          encima. Es la única imagen decorativa de la app, así que va con `alt`
          vacío y `aria-hidden` — no aporta nada que el texto no diga. Ocupa
          tres de las cinco columnas (60%): más protagonismo que el formulario,
          que no necesita tanto ancho para sus campos. */}
      <div className="relative hidden bg-slate-100 dark:bg-slate-900 lg:block lg:col-span-3">
        <img
          src={APP_CONFIG.loginBg}
          alt=""
          aria-hidden
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-6 overflow-hidden p-6 sm:p-8 lg:col-span-2 lg:p-12">
        {/* El escudo va fuera del bloque centrado: si viviera dentro, cada
            vista (personal, apoderado, recuperar) tiene un alto distinto y el
            centrado vertical lo movería a cada cambio de paso. Aquí se queda
            clavado arriba, pase lo que pase debajo, y a su tamaño natural. */}
        <div className="flex shrink-0 justify-center">
          <LoginBrand />
        </div>

        {/* `min-h-0` + scroll propio: si la ventana es muy baja el formulario
            se desplaza dentro de su zona, en vez de desbordarse por debajo del
            escudo y verse encima del texto. */}
        <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            {mode === 'staff' && (
              <StaffLoginForm
                onLogin={onLogin}
                onGuardianAccess={() => setMode('guardian')}
                onForgotPassword={() => setMode('forgot')}
              />
            )}
            {mode === 'guardian' && (
              <GuardianAccessFlow
                onLogin={(user) => onLogin(user, false)}
                onCancel={() => setMode('staff')}
              />
            )}
            {mode === 'forgot' && <ForgotPasswordScreen onBack={() => setMode('staff')} />}
          </div>
        </main>

        <footer className="space-y-1 text-center text-base text-slate-500 dark:text-slate-400">
          <p>
            ¿Problemas para ingresar?{' '}
            <Button
              type="button"
              variant="link"
              onClick={() => setSupportOpen(true)}
              className="h-auto p-0 align-baseline text-base font-semibold"
            >
              Contactar soporte
            </Button>
          </p>
          <p>© 2026 {APP_CONFIG.schoolShortName}</p>
        </footer>
      </div>

      <ContactSupportDialog open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
};
