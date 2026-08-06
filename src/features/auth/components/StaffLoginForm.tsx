import React, { useId, useState } from 'react';
import { HeartHandshake, LogIn, IdCard, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { APP_CONFIG } from '@/config/app';
import { findAccountByDni, findAnyUserByDni } from '@/features/auth/accounts';
import { LoginField } from '@/features/auth/components/LoginField';
import { DNI_LENGTH, onlyDigits } from '@/features/auth/guardian-access';
import {
  LOGIN_LINK_BUTTON,
  LOGIN_PRIMARY_BUTTON,
  LOGIN_SECONDARY_BUTTON,
} from '@/features/auth/login-ui';
import type { UserItem } from '@/types';

/**
 * Acceso del personal (directivo, docente y auxiliar): DNI + clave.
 *
 * El DNI se busca en el padrón simulado (`MOCK_USERS`); la clave no se valida
 * porque no hay backend contra el que hacerlo — «¿Olvidaste tu contraseña?»
 * lo explica en vez de simular un correo de recuperación que no llegaría a
 * ningún lado. «Mantener sesión iniciada» sí funciona de verdad: guarda el id
 * del usuario en el navegador (`rememberUser`) para que la próxima vez que se
 * abra la app entre directo, sin pasar de nuevo por este formulario.
 */
export const StaffLoginForm: React.FC<{
  onLogin: (user: UserItem, remember: boolean) => void;
  onGuardianAccess: () => void;
  onForgotPassword: () => void;
}> = ({ onLogin, onGuardianAccess, onForgotPassword }) => {
  const rememberId = useId();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ dni?: string; password?: string }>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (dni.length !== DNI_LENGTH) {
      setErrors({ dni: `El DNI tiene ${DNI_LENGTH} dígitos.` });
      return;
    }
    if (password.length === 0) {
      setErrors({ password: 'Escriba su contraseña para continuar.' });
      return;
    }

    const account = findAccountByDni(dni);
    if (!account) {
      setErrors({
        dni: findAnyUserByDni(dni)
          ? 'Este DNI está registrado en el colegio, pero no tiene acceso al sistema. Comuníquese con Dirección.'
          : 'No encontramos este DNI en el padrón del colegio. Revise los dígitos e inténtelo otra vez.',
      });
      return;
    }

    setErrors({});
    onLogin(account, remember);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-black tracking-tight text-red-600 dark:text-red-500">
          {APP_CONFIG.schoolShortName}
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Ingrese con su DNI y su contraseña para entrar al sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-4">
          <LoginField
            id="acceso-dni"
            label="DNI"
            icon={IdCard}
            value={dni}
            onChange={(value) => {
              setDni(onlyDigits(value));
              setErrors({});
            }}
            inputMode="numeric"
            autoComplete="username"
            maxLength={DNI_LENGTH}
            placeholder="Ejemplo: 12345678"
            error={errors.dni}
            autoFocus
          />

          <LoginField
            id="acceso-clave"
            label="Contraseña"
            icon={Lock}
            toggleablePassword
            value={password}
            onChange={(value) => {
              setPassword(value);
              setErrors({});
            }}
            autoComplete="current-password"
            placeholder="Ingrese su contraseña"
            error={errors.password}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={rememberId}
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
              className="h-5 w-5 rounded"
            />
            <label
              htmlFor={rememberId}
              className="cursor-pointer text-base font-medium text-slate-700 dark:text-slate-300"
            >
              Mantener sesión iniciada
            </label>
          </div>

          <Button type="button" variant="link" onClick={onForgotPassword} className={LOGIN_LINK_BUTTON}>
            ¿Olvidó su contraseña?
          </Button>
        </div>

        <Button type="submit" className={LOGIN_PRIMARY_BUTTON}>
          <LogIn size={24} strokeWidth={2} aria-hidden />
          Iniciar sesión
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span aria-hidden className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-base font-medium text-slate-500 dark:text-slate-400">
          ¿Es usted apoderado?
        </span>
        <span aria-hidden className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onGuardianAccess}
        className={LOGIN_SECONDARY_BUTTON}
      >
        <HeartHandshake size={24} strokeWidth={2} aria-hidden />
        Ver el avance de mi hijo
      </Button>
    </div>
  );
};
