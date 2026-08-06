import { useState, type FormEvent } from 'react';

import { useSession } from '@/features/auth/SessionContext';
import { DEFAULT_NOTIFICATIONS, PASSWORD_REQUIREMENTS } from '@/features/profile/profile.constants';
import { useProfileIdentity } from '@/features/profile/ProfileIdentityContext';
import { isValidEmail, isValidPhone } from '@/features/users/users.form';
import { useToast } from '@/hooks/use-toast';

export interface PersonalForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type PersonalErrors = Partial<Record<'name' | 'email' | 'phone', string>>;

export interface SecurityForm {
  current: string;
  next: string;
  confirm: string;
}

export type SecurityErrors = Partial<Record<keyof SecurityForm, string>>;

/**
 * Estado de las tres partes editables de Mi Perfil (datos, contraseña y
 * avisos). Vive en un hook y no en cada sección para que cambiar de sección en
 * el sidebar no borre lo que el usuario llevaba escrito.
 *
 * No hay backend: "guardar" valida, confirma con un toast y actualiza el
 * estado local — igual que el resto de la aplicación.
 */
export const useProfileForms = () => {
  const session = useSession();
  const identity = useProfileIdentity();
  const { toast } = useToast();

  // El nombre arranca en el de la identidad (que ya recoge lo guardado antes),
  // no en el de la sesión: si no, salir del módulo y volver revertía el cambio
  // en el formulario mientras el riel seguía con el nombre nuevo.
  const [baseline] = useState<PersonalForm>({
    name: identity.name,
    email: session.user.email,
    phone: session.user.phone ?? '',
    address: session.user.address ?? '',
  });

  const [savedPersonal, setSavedPersonal] = useState<PersonalForm>(baseline);
  const [personalForm, setPersonalForm] = useState<PersonalForm>(baseline);
  const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({});

  const [security, setSecurity] = useState<SecurityForm>({ current: '', next: '', confirm: '' });
  const [securityErrors, setSecurityErrors] = useState<SecurityErrors>({});

  const [notifications, setNotifications] = useState<Record<string, boolean>>(DEFAULT_NOTIFICATIONS);

  const isPersonalDirty = (Object.keys(baseline) as (keyof PersonalForm)[]).some(
    (key) => personalForm[key] !== savedPersonal[key],
  );

  const setPersonalField = <K extends keyof PersonalForm>(key: K, value: PersonalForm[K]) => {
    setPersonalForm((previous) => ({ ...previous, [key]: value }));
    setPersonalErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const resetPersonal = () => {
    setPersonalForm(savedPersonal);
    setPersonalErrors({});
  };

  const submitPersonal = (event: FormEvent) => {
    event.preventDefault();
    const errors: PersonalErrors = {};
    if (personalForm.name.trim().length < 3) {
      errors.name = 'Escribe el nombre y los apellidos completos.';
    }
    if (!isValidEmail(personalForm.email)) {
      errors.email = 'Escribe un correo válido, por ejemplo nombre@colegio.edu.pe';
    }
    if (personalForm.phone.trim() !== '' && !isValidPhone(personalForm.phone)) {
      errors.phone = 'El teléfono debe tener 9 dígitos y empezar por 9.';
    }
    setPersonalErrors(errors);
    if (Object.keys(errors).length > 0) {
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }
    const saved = { ...personalForm, name: personalForm.name.trim() };
    setSavedPersonal(saved);
    setPersonalForm(saved);
    // El nombre no es solo de esta pantalla: el riel lo muestra en su tarjeta.
    identity.setName(saved.name);
    toast({ title: 'Perfil actualizado', description: 'Tus datos personales se guardaron correctamente.' });
  };

  const setSecurityField = <K extends keyof SecurityForm>(key: K, value: string) => {
    setSecurity((previous) => ({ ...previous, [key]: value }));
    setSecurityErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const submitSecurity = (event: FormEvent) => {
    event.preventDefault();
    const errors: SecurityErrors = {};
    if (!security.current) {
      errors.current = 'Escribe tu contraseña actual.';
    }
    if (!PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(security.next))) {
      errors.next = 'La nueva contraseña no cumple todos los requisitos.';
    }
    if (!security.confirm || security.confirm !== security.next) {
      errors.confirm = 'Las contraseñas no coinciden.';
    }
    setSecurityErrors(errors);
    if (Object.keys(errors).length > 0) {
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }
    setSecurity({ current: '', next: '', confirm: '' });
    setSecurityErrors({});
    toast({ title: 'Contraseña actualizada', description: 'Tu nueva contraseña ya está activa.' });
  };

  // Cada interruptor confirma solo: no hay botón "Guardar" en Notificaciones,
  // así que el toast es la única señal de que el cambio se registró.
  const toggleNotification = (id: string, title: string, checked: boolean) => {
    setNotifications((previous) => ({ ...previous, [id]: checked }));
    toast({
      title: checked ? 'Aviso activado' : 'Aviso desactivado',
      description: `${title}: ${checked ? 'lo recibirás a partir de ahora.' : 'dejarás de recibirlo.'}`,
    });
  };

  return {
    personal: {
      form: personalForm,
      errors: personalErrors,
      isDirty: isPersonalDirty,
      setField: setPersonalField,
      reset: resetPersonal,
      submit: submitPersonal,
    },
    security: {
      form: security,
      errors: securityErrors,
      setField: setSecurityField,
      submit: submitSecurity,
    },
    notifications: {
      values: notifications,
      toggle: toggleNotification,
    },
  };
};
