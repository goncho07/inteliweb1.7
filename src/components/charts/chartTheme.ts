/**
 * Estilos y colores compartidos por todos los gráficos Recharts de la app
 * (Inicio, Vista General del Aula, Reportes). Ejes y rejilla en tokens de
 * tema (`hsl(var(--border))` / `hsl(var(--muted-foreground))`) en vez de
 * grises fijos, para que se lean igual en claro y oscuro. Recharts dibuja
 * SVG, así que estos valores van como atributos de color (`stroke`/`fill`),
 * no como clases de Tailwind.
 */

/** Rejilla y líneas de eje: recesivas, nunca protagonistas del gráfico. */
export const CHART_GRID_STROKE = 'hsl(var(--border))';

/** Texto de ticks de eje: 12px (mínimo de la escala), mismo tono que el resto de metadatos. */
export const CHART_AXIS_TICK_STYLE = {
  fill: 'hsl(var(--muted-foreground))',
  fontSize: 12,
  fontFamily: 'Poppins, sans-serif',
} as const;

/** Etiqueta de dato directa sobre una barra (ej. "95%" encima de la serie principal). */
export const CHART_DATA_LABEL_STYLE = {
  fill: 'hsl(var(--foreground))',
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'Poppins, sans-serif',
} as const;

/** Resalte del punto/categoría activa al pasar el cursor (fondo sutil, no un color de serie). */
export const CHART_CURSOR_FILL = 'hsl(var(--muted))';

/** Paleta semántica de series: mismo color siempre significa lo mismo en toda la app. */
export const CHART_COLORS = {
  emerald500: '#10b981', // positivo: asistencia (Presente)
  amber500: '#f59e0b', // atención: tardanzas
  rose500: '#f43f5e', // negativo: ausencias
  blue500: '#3b82f6', // dominio "asistencia" en tarjetas de resumen
  yellow500: '#eab308', // gravedad de incidencia: Leve
  orange500: '#f97316', // gravedad de incidencia: Moderada
  red500: '#ef4444', // gravedad de incidencia: Grave
} as const;

/**
 * Alto fijo del área de trazado (Recharts `ResponsiveContainer`). Un valor
 * numérico evita el colapso a 0px que sufre `ResponsiveContainer` cuando su
 * contenedor no tiene una altura definida (pasa por debajo de `lg`, donde el
 * panel vuelve a flujo normal en vez de rejilla).
 */
export const CHART_HEIGHT = 220;
