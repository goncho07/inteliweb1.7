import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind resolviendo conflictos (la última gana).
 * Uso estándar de shadcn/ui para componer variantes con clases condicionales.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
