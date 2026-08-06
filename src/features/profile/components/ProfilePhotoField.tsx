import React, { useRef } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { useProfileIdentity } from '@/features/profile/ProfileIdentityContext';
import { useToast } from '@/hooks/use-toast';

/** Tamaño máximo de la foto de perfil. Por encima, el navegador se atraganta al previsualizarla. */
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/**
 * Foto de perfil: la misma que sale en el riel de navegación. Si no hay foto se
 * muestran las iniciales — nunca una imagen generada ni traída de un servicio
 * externo.
 *
 * No es una tarjeta propia sino la primera fila de "Información de contacto":
 * la foto es un dato de contacto más, y sacarla a su propio bloque gastaba una
 * pantalla entera de alto para un avatar y dos botones.
 *
 * Lee y escribe en `ProfileIdentityContext`, no en un estado propio: por eso al
 * subirla se aplica también en el riel, sin que este componente sepa que el
 * riel existe.
 */
export const ProfilePhotoField: React.FC = () => {
  const { name, photo, setPhoto } = useProfileIdentity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Se limpia el input antes de leer para que elegir dos veces la misma foto
    // vuelva a disparar `change`.
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Archivo no válido', description: 'Elige una imagen (JPG o PNG).' });
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast({
        variant: 'destructive',
        title: 'La imagen pesa demasiado',
        description: 'Elige una foto de menos de 2 MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      toast({ title: 'Foto actualizada', description: 'Tu foto ya se ve en toda la aplicación.' });
    };
    // Sin esto, un archivo ilegible dejaba la pantalla igual y sin explicación.
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'No se pudo leer la imagen',
        description: 'Vuelve a intentarlo o elige otro archivo.',
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/60">
      <ProfileAvatar name={name} photo={photo} className="h-16 w-16" textClassName="text-xl" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-slate-800 dark:text-slate-100">Foto de perfil</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Te identifica en el menú lateral. JPG o PNG, hasta 2 MB.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFile}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      <div className="flex shrink-0 items-center gap-2">
        {photo && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPhoto(null);
              toast({ title: 'Foto eliminada', description: 'Volvimos a mostrar tus iniciales.' });
            }}
            className="h-10 gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:text-destructive"
          >
            <Trash2 size={20} /> Quitar
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 gap-2 rounded-xl px-4 text-sm font-semibold"
        >
          <ImageUp size={20} /> {photo ? 'Cambiar foto' : 'Subir foto'}
        </Button>
      </div>
    </div>
  );
};
