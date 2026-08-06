import logoRicardoPalma from '@/assets/images/logo-ricardo-palma.png';

/**
 * Configuración visual de la aplicación (marca e imágenes institucionales).
 *
 * Las imágenes remotas se sirven por el endpoint de *thumbnail* de Google
 * Drive: `export=view` devuelve una página HTML de confirmación en vez del
 * archivo, y `<img>` no puede mostrarla. Cualquier otro alojamiento temporal
 * (CDN de Discord y similares) caduca por firma y la imagen deja de cargar a
 * los días — por eso no se usa ninguno.
 *
 * El logotipo del login es la excepción: vive en `src/assets/images` y entra
 * por `import`, así que lo empaqueta Vite. Es la versión recortada al ras del
 * escudo — la de Drive traía un margen transparente cocido dentro del PNG que
 * abría un hueco enorme entre el escudo y el título de la pantalla de acceso.
 */
export const APP_CONFIG = {
  /** Nombre institucional completo: alternativa de texto de las imágenes de marca. */
  schoolName: 'I.E. N° 6049 «Ricardo Palma»',
  /** Forma corta del nombre, para el pie de página y otros usos breves. */
  schoolShortName: 'I.E 6049 Ricardo Palma',
  /** Fachada del colegio: columna ilustrativa del login. */
  loginBg: 'https://drive.google.com/thumbnail?id=1JOjD0MmX_y9udKCQPEcFdQgVc5D5XARb&sz=w1920',
  /** Logotipo completo (escudo + nombre) con el texto en negro — tema claro. */
  loginLogo: logoRicardoPalma,
  /** El mismo logotipo con el texto en blanco — modo oscuro. */
  schoolLogo: 'https://drive.google.com/thumbnail?id=1oai4WgUeM77ne_3cBK18_q7JXpKvKbFZ&sz=w1000',
  /** Solo el escudo: riel de navegación y avatar institucional de una citación. */
  sidebarLogo: 'https://drive.google.com/thumbnail?id=1IXIpFfX7cP7XjqqekPWvCemhA_kC-6Jv&sz=w500',
} as const;
