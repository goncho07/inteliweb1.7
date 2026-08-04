import { useEffect, useState } from 'react';

/**
 * Se suscribe a un media query de CSS y devuelve si coincide con el viewport
 * actual. Sirve para decidir en JS qué envoltorio montar cuando la decisión
 * no puede resolverse solo con clases responsive — por ejemplo, el `Sheet`
 * de shadcn se monta en un portal fuera del árbol del módulo, así que no
 * basta con ocultarlo por CSS (`hidden lg:flex`): hay que decidir si se abre
 * o no según el ancho de pantalla.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(mediaQueryList.matches);
    listener();
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
