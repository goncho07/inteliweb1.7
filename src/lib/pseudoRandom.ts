/**
 * Generador pseudoaleatorio determinista a partir de una semilla de texto.
 *
 * Se usa para los datos simulados que se muestran en pantalla: `Math.random()`
 * los regeneraría en cada render o recálculo de memo, haciendo que un mismo
 * estudiante mostrase asistencias distintas al filtrar. Con esto, la misma
 * semilla devuelve siempre el mismo valor en [0, 1).
 *
 * Implementación: hash FNV-1a de 32 bits + mezcla final (xorshift).
 */
export function pseudoRandom(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Mezcla final para repartir mejor los bits bajos.
  h ^= h >>> 15;
  h = Math.imul(h, 0x2545f491);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}
