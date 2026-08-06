/**
 * "Miércoles, 5 de agosto" — fecha larga en español, capitalizada. La usa la
 * cabecera de Inicio (el saludo) y las ventanas de acciones rápidas que
 * abre, así que vive aparte en vez de repetirse en cada una.
 */
export const formatLongDate = (date: Date): string => {
  const formatted = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};
