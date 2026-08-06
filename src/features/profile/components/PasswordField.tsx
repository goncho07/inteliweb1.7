import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Field } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Campo de contraseña con botón para mostrar/ocultar el texto. El ojo va sin
 * etiqueta visible por ser universalmente reconocido, pero con `aria-label` y
 * tooltip.
 */
export const PasswordField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
}> = ({ id, label, value, onChange, error, hint, autoComplete }) => {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-11 rounded-xl pr-12 text-base"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setVisible((prev) => !prev)}
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-lg text-slate-400 transition-none hover:text-slate-600 active:scale-100 dark:hover:text-slate-300"
            >
              {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}</TooltipContent>
        </Tooltip>
      </div>
    </Field>
  );
};
