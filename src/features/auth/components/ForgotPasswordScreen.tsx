import React, { useId, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LoginField } from '@/features/auth/components/LoginField';
import { LOGIN_LINK_BUTTON, LOGIN_PRIMARY_BUTTON } from '@/features/auth/login-ui';
import { cn } from '@/lib/utils';

/**
 * «¿Olvidaste tu contraseña?» del login, como pantalla completa (antes era un
 * modal). No hay backend que envíe un correo de restablecimiento, así que el
 * envío no dispara nada real: tras escribir el correo, la pantalla dice la
 * verdad — en este sistema de datos simulados la clave no se valida, y para
 * un problema real de acceso el camino es Dirección.
 */
export const ForgotPasswordScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.includes('@')) {
      setError('Ingrese un correo válido.');
      return;
    }

    setError(undefined);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 size={24} strokeWidth={2} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Revise su bandeja de entrada
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Este es un sistema de datos simulados: no hace falta recordar una clave real, cualquier
            clave que escriba junto a su DNI es válida.
          </p>
        </div>

        <p className="text-base text-slate-600 dark:text-slate-300">
          Si de todas formas no logra ingresar —por ejemplo, porque su DNI no está registrado—,
          comuníquese con Dirección para regularizar su acceso.
        </p>

        <Button
          type="button"
          onClick={onBack}
          className={LOGIN_PRIMARY_BUTTON}
        >
          <ArrowLeft size={24} strokeWidth={2} aria-hidden />
          Volver al inicio de sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound size={24} strokeWidth={2} aria-hidden />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Recuperar contraseña
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">
          Le enviaremos un enlace para restablecer su contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <LoginField
          id={emailId}
          label="Correo electrónico"
          icon={Mail}
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setError(undefined);
          }}
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          error={error}
          autoFocus
        />

        <Button type="submit" className={LOGIN_PRIMARY_BUTTON}>
          <Send size={24} strokeWidth={2} aria-hidden />
          Enviar enlace de recuperación
        </Button>
      </form>

      <Button
        type="button"
        variant="link"
        onClick={onBack}
        className={cn('mx-auto flex items-center gap-2 [&_svg]:size-5', LOGIN_LINK_BUTTON)}
      >
        <ArrowLeft size={20} strokeWidth={2} aria-hidden />
        Volver al inicio de sesión
      </Button>
    </div>
  );
};
