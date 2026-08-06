/**
 * Medidas compartidas de la pantalla de acceso.
 *
 * El login es la única pantalla que un profesor ve antes de entrar, y sus tres
 * vistas —personal, apoderado y recuperar contraseña— se alternan en el mismo
 * sitio: si cada una elige su propio alto de botón o su propio radio, el
 * cambio de vista se nota como un salto. Aquí viven esas medidas una sola vez.
 *
 * El texto de los controles va a 20px (`text-xl`), el mismo tamaño del campo
 * de DNI: en esta pantalla todo lo que se lee o se pulsa está a esa escala.
 */

/** Acción principal de una vista (una por pantalla): alta y a ancho completo. */
export const LOGIN_PRIMARY_BUTTON =
  'h-14 w-full rounded-md text-xl font-bold [&_svg]:size-6';

/** Acción secundaria a ancho completo (`variant="outline"`). */
export const LOGIN_SECONDARY_BUTTON = LOGIN_PRIMARY_BUTTON;

/** Acción terciaria (`variant="ghost"`): volver, reenviar código. */
export const LOGIN_GHOST_BUTTON =
  'h-12 gap-2 rounded-md px-4 text-xl font-semibold [&_svg]:size-5';

/** Enlace en línea (`variant="link"`), sin alto propio. */
export const LOGIN_LINK_BUTTON = 'h-auto p-0 text-sm font-semibold';
