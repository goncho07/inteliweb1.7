import React, { useState } from 'react';

import { APP_CONFIG } from '@/config/app';
import { cn } from '@/lib/utils';

/**
 * Logotipo institucional de la pantalla de acceso.
 *
 * Son dos archivos —el mismo escudo con el texto en negro y con el texto en
 * blanco—, así que se montan los dos y se enseña el que corresponde al tema:
 * un PNG no se puede recolorear por CSS. El oculto va con `display:none`, de
 * modo que el lector de pantalla anuncia el nombre del colegio una sola vez.
 *
 * Las dos imágenes son remotas. Si alguna no llega, el bloque cae al nombre
 * del colegio en texto en vez de dejar el icono de imagen rota del navegador.
 */
export const LoginBrand: React.FC<{ className?: string }> = ({ className }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <p
        className={cn(
          'text-center text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white',
          className,
        )}
      >
        {APP_CONFIG.schoolName}
      </p>
    );
  }

  return (
    <div className={cn('flex justify-center', className)}>
      <img
        src={APP_CONFIG.loginLogo}
        alt={APP_CONFIG.schoolName}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
        className="h-auto w-full max-w-md object-contain dark:hidden"
      />
      <img
        src={APP_CONFIG.schoolLogo}
        alt={APP_CONFIG.schoolName}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
        className="hidden h-auto w-full max-w-md object-contain dark:block"
      />
    </div>
  );
};
