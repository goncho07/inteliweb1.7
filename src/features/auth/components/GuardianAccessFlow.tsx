import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, IdCard, LogIn, MessageCircle, Phone, RefreshCw } from 'lucide-react';

import { Field } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { DEMO_GUARDIAN, findAnyUserByDni, findGuardianByDni } from '@/features/auth/accounts';
import { GuardianSteps } from '@/features/auth/components/GuardianSteps';
import { LoginField } from '@/features/auth/components/LoginField';
import { LOGIN_GHOST_BUTTON, LOGIN_PRIMARY_BUTTON } from '@/features/auth/login-ui';
import {
  CODE_LENGTH,
  DNI_LENGTH,
  PHONE_LENGTH,
  buildVerificationCode,
  maskPhone,
  onlyDigits,
} from '@/features/auth/guardian-access';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/** Los tres pasos del acceso del apoderado, en orden. */
type GuardianStep = 'dni' | 'phone' | 'code';

const STEP_ORDER: GuardianStep[] = ['dni', 'phone', 'code'];

const STEP_TITLE: Record<GuardianStep, string> = {
  dni: 'Verificar identidad',
  phone: 'Confirmar celular',
  code: 'Escribir el código',
};

/**
 * Acceso del apoderado en tres pasos: DNI → celular registrado → código de
 * WhatsApp. Al terminar entra con la misma sesión que cualquier otro rol
 * (`onLogin`), y desde ahí ve el expediente de su hijo en Aulas.
 *
 * Reglas del flujo, todas visibles en pantalla y ninguna silenciosa:
 *
 * - Cada paso valida su campo y explica qué falta; ningún botón se queda sin
 *   hacer nada al pulsarlo.
 * - «Volver» retrocede **un** paso (y desde el primero sale al acceso del
 *   personal), en vez de abandonar el flujo entero desde cualquier punto.
 * - Al retroceder al primer paso se olvida el apoderado verificado, así que
 *   volver a entrar arranca limpio en lugar de quedarse en la pantalla de
 *   «verificado» sin forma de avanzar.
 * - No hay backend: el celular se compara con el que el apoderado tiene en el
 *   padrón y el código se deriva de su DNI (`buildVerificationCode`). Los dos
 *   se enseñan como pista de demostración; nada se adivina.
 */
export const GuardianAccessFlow: React.FC<{
  onLogin: (user: UserItem) => void;
  onCancel: () => void;
}> = ({ onLogin, onCancel }) => {
  const { toast } = useToast();

  const [step, setStep] = useState<GuardianStep>('dni');
  const [dni, setDni] = useState('');
  const [guardian, setGuardian] = useState<UserItem | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  /** Sube con cada reenvío para que el código nuevo no repita el anterior. */
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);
  const registeredPhone = guardian?.phone ?? '';
  const expectedCode = guardian ? buildVerificationCode(guardian.dni, resendCount) : '';

  const goBack = () => {
    setError(null);
    if (step === 'code') {
      setCode('');
      setStep('phone');
      return;
    }
    if (step === 'phone') {
      setPhone('');
      setGuardian(null);
      setStep('dni');
      return;
    }
    onCancel();
  };

  const handleSubmitDni = () => {
    if (dni.length !== DNI_LENGTH) {
      setError(`El DNI tiene ${DNI_LENGTH} dígitos.`);
      return;
    }

    const found = findGuardianByDni(dni);
    if (!found) {
      setError(
        findAnyUserByDni(dni)
          ? 'Este DNI está en el padrón del colegio, pero no figura como apoderado de ningún estudiante. Comuníquese con Dirección.'
          : 'No encontramos este DNI entre los apoderados registrados. Revise los dígitos e inténtelo otra vez.',
      );
      return;
    }

    setGuardian(found);
    setPhone('');
    setError(null);
    setStep('phone');
  };

  const handleSubmitPhone = () => {
    if (phone.length !== PHONE_LENGTH) {
      setError(`El celular tiene ${PHONE_LENGTH} dígitos.`);
      return;
    }
    if (registeredPhone && phone !== registeredPhone) {
      setError(
        'Este número no coincide con el celular que tiene registrado en el colegio. Comuníquese con Dirección para actualizarlo.',
      );
      return;
    }

    setCode('');
    setResendCount(0);
    setError(null);
    setStep('code');
    toast({
      title: 'Código enviado',
      description: `Enviamos un código de ${CODE_LENGTH} dígitos por WhatsApp al ${maskPhone(phone)}.`,
      variant: 'success',
    });
  };

  const handleResendCode = () => {
    setResendCount((count) => count + 1);
    setCode('');
    setError(null);
    toast({
      title: 'Código reenviado',
      description: `Enviamos un código nuevo por WhatsApp al ${maskPhone(phone)}. El anterior ya no sirve.`,
      variant: 'info',
    });
  };

  const handleSubmitCode = () => {
    if (!guardian) return;
    if (code.length !== CODE_LENGTH) {
      setError(`El código tiene ${CODE_LENGTH} dígitos.`);
      return;
    }
    if (code !== expectedCode) {
      setError('El código no es correcto. Revíselo o pida uno nuevo.');
      return;
    }

    setError(null);
    onLogin(guardian);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 'dni') handleSubmitDni();
    else if (step === 'phone') handleSubmitPhone();
    else handleSubmitCode();
  };

  const description: Record<GuardianStep, string> = {
    dni: 'Verifique su identidad con el DNI que registró en el colegio. Solo pueden entrar los apoderados de un estudiante matriculado.',
    phone: `Escriba el celular que registró en el colegio (${maskPhone(registeredPhone)}). Le enviaremos ahí un código de seguridad por WhatsApp.`,
    code: `Escriba el código de ${CODE_LENGTH} dígitos que enviamos por WhatsApp al ${maskPhone(phone)}.`,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button type="button" variant="ghost" onClick={goBack} className={LOGIN_GHOST_BUTTON}>
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          {step === 'dni' ? 'Volver al acceso del personal' : 'Volver al paso anterior'}
        </Button>

        <GuardianSteps steps={STEP_ORDER.map((item) => STEP_TITLE[item])} current={stepIndex} />
      </div>

      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Acceso de apoderados
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400">{description[step]}</p>
      </div>

      {guardian && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/20">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-800/50 dark:text-emerald-400">
            <CheckCircle2 size={20} strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Apoderado verificado
            </p>
            <p className="truncate text-base font-bold text-emerald-900 dark:text-emerald-200">
              {guardian.name}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {step === 'dni' && (
          <LoginField
            key="dni"
            id="apoderado-dni"
            label="DNI del apoderado"
            icon={IdCard}
            value={dni}
            onChange={(value) => {
              setDni(onlyDigits(value));
              setError(null);
            }}
            inputMode="numeric"
            autoComplete="username"
            maxLength={DNI_LENGTH}
            placeholder="Ejemplo: 12345678"
            error={error ?? undefined}
            hint={DEMO_GUARDIAN ? `Datos simulados: pruebe con el DNI ${DEMO_GUARDIAN.dni}.` : undefined}
            autoFocus
          />
        )}

        {step === 'phone' && (
          <LoginField
            key="phone"
            id="apoderado-celular"
            label="Celular registrado"
            icon={Phone}
            type="tel"
            value={phone}
            onChange={(value) => {
              setPhone(onlyDigits(value));
              setError(null);
            }}
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={PHONE_LENGTH}
            placeholder="Ejemplo: 987654321"
            error={error ?? undefined}
            hint={registeredPhone ? `Datos simulados: su celular registrado es ${registeredPhone}.` : undefined}
            autoFocus
          />
        )}

        {step === 'code' && (
          <Field
            id="apoderado-codigo"
            label="Código de verificación"
            error={error ?? undefined}
            hint={`Datos simulados: el código es ${expectedCode}.`}
            required
            labelClassName="text-xl font-medium"
            className="items-center text-center"
          >
            <InputOTP
              id="apoderado-codigo"
              value={code}
              onChange={(value) => {
                setCode(onlyDigits(value));
                setError(null);
              }}
              maxLength={CODE_LENGTH}
              inputMode="numeric"
              autoComplete="one-time-code"
              containerClassName="justify-center"
              aria-invalid={!!error}
              aria-describedby={error ? 'apoderado-codigo-error' : undefined}
              autoFocus
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-14 w-12 !rounded-md !border !border-input text-2xl font-bold"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Field>
        )}

        <div className="space-y-3">
          <Button type="submit" className={LOGIN_PRIMARY_BUTTON}>
            {step === 'dni' && (
              <>
                <IdCard size={24} strokeWidth={2} aria-hidden />
                Verificar mi DNI
              </>
            )}
            {step === 'phone' && (
              <>
                <MessageCircle size={24} strokeWidth={2} aria-hidden />
                Enviar código por WhatsApp
              </>
            )}
            {step === 'code' && (
              <>
                <LogIn size={24} strokeWidth={2} aria-hidden />
                Entrar a la vista de apoderado
              </>
            )}
          </Button>

          {step === 'code' && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendCode}
              className={cn('w-full', LOGIN_GHOST_BUTTON)}
            >
              <RefreshCw size={20} strokeWidth={2} aria-hidden />
              Reenviar código
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
