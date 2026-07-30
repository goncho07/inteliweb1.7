/**
 * Configuración visual de la aplicación (marca e imágenes institucionales).
 * Se usa el endpoint de thumbnail de Google Drive porque es más fiable
 * para incrustar que `export=view`.
 */
export const APP_CONFIG = {
  loginBg:
    'https://drive.google.com/thumbnail?id=1JOjD0MmX_y9udKCQPEcFdQgVc5D5XARb&sz=w1920',
  schoolLogo:
    'https://drive.google.com/thumbnail?id=1oai4WgUeM77ne_3cBK18_q7JXpKvKbFZ&sz=w1000',
  sidebarLogo:
    'https://drive.google.com/thumbnail?id=1IXIpFfX7cP7XjqqekPWvCemhA_kC-6Jv&sz=w500',
} as const;
