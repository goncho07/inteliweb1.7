# Intelicole — Guía de trabajo

Sistema de gestión escolar para instituciones educativas peruanas. React 19 +
TypeScript + Vite 6 + Tailwind 3 + shadcn/ui (Radix), Framer Motion, Recharts,
lucide-react.

## El encargo actual

**Solo frontend y diseño.** La base funcional ya existe; el trabajo es pulirla:
estandarización visual, sistema de diseño, tipografía, iconos, espaciado,
simetría, jerarquía, consistencia, UX/UI y QA.

- **Nada de backend.** Los datos son simulados (`src/data/`, `src/features/*/data.ts`).
  Si falta un dato para una pantalla, invéntalo ahí; no propongas API ni persistencia.
- **No inventes features nuevas.** Rediseñar y ordenar lo existente, no ampliar
  el alcance. Si detectas algo que falta, dilo; no lo construyas sin pedirlo.

### Para quién se diseña

Profesores y directivos de **40 a 60 años**, no nativos digitales, muchos usando
la app en un portátil de la institución. Esto es un criterio de diseño, no un
adorno — cuando dudes entre dos opciones, gana la más legible y explícita:

- Texto de contenido a **16px** (`text-base`) por defecto; **14px** (`text-sm`)
  es el mínimo aceptable. `text-xs` solo para metadatos no esenciales
  (timestamps, contadores, etiquetas en mayúsculas). Nunca por debajo de 12px.
- Toda acción lleva **etiqueta de texto visible**. Los botones de solo icono se
  reservan para acciones universalmente reconocidas (cerrar, volver, buscar) y
  siempre con `aria-label` + `Tooltip`.
- Objetivos de clic de **40px mínimo** (`h-10`), 44px preferido.
- Lenguaje del dominio escolar en español claro: "Apoderado", "Aula", "Citación",
  "Incidencia". Sin jerga técnica, sin anglicismos ("dashboard" → "Panel").
- Confirmación explícita en acciones destructivas y feedback visible tras cada
  acción. Nada de gestos ocultos, hover-only ni descubrimiento por exploración.

## Sistema de diseño (contrato)

Estas escalas son cerradas. Cualquier valor fuera de ellas necesita justificarse.

| Eje | Valores permitidos |
| --- | --- |
| **Espaciado** | Rejilla de 4px: `1, 2, 3, 4, 6, 8, 12`. Prohibidos `p-5`, `p-10`, `p-20`, `gap-5`, `gap-16` |
| **Radios** | `rounded-lg` (controles densos) · `rounded-xl` (por defecto: tarjetas, inputs, botones) · `rounded-2xl` (contenedores y modales) · `rounded-full` (avatares, pills). No `rounded-3xl` ni `rounded-sm/md` fuera de `components/ui/` |
| **Tipografía** | Poppins. `text-xs` → `text-4xl` de la escala de Tailwind. **Prohibidos los valores arbitrarios** (`text-[13px]`, `text-[28px]`). Pesos: `font-medium` cuerpo, `font-semibold` subtítulos, `font-bold` títulos, `font-black` solo en el título de página |
| **Iconos** | lucide-react. Tamaños: `16` (denso/inline) · `20` (por defecto) · `24` (destacado) · `28`/`32` (solo cabecera de módulo o KPI). Prohibidos `10, 12, 22, 26`. `strokeWidth` `2` por defecto, `2.5` en títulos |
| **Color** | Tokens de tema (`primary`, `muted-foreground`, `border`, `destructive`…) y escalas de Tailwind. **No hex nuevos en JSX** |

### Color y temas

- Azul institucional `#3030b8` = token `primary`; navy `#0a2540`; cian `#00c2ff`;
  verde WhatsApp `#00a884`. Definidos en `src/styles/index.css` y
  `tailwind.config.js`.
- Existe un tema alternativo **"Rojo Institucional"** (`<html data-theme="rojo">`)
  que remapea las clases `blue-*` por CSS. Por eso **usa las escalas `blue-*`
  de Tailwind**, no hex literales, en todo lo que deba seguir el tema.
- Modo oscuro por clase `.dark` con negros puros (`slate-950` = `#000000`).
  Toda pantalla debe verse correcta en claro y oscuro.
- **Excepción**: el módulo WhatsApp replica deliberadamente la paleta de WhatsApp
  (`#111b21`, `#202c33`, `#efeae2`…). Ahí los hex son intencionales; céntralos en
  constantes del módulo en lugar de repetirlos.

## Deuda de diseño conocida (el trabajo)

Medido sobre el código actual. Es el mapa de lo que hay que arreglar:

1. **~226 `<button>` crudos** en 28 archivos y **26 `<select>` nativos** en vez de
   `Button` / `Select` de shadcn. Es la mayor fuente de inconsistencia visual y
   de accesibilidad (el `<select>` nativo no sigue el tema ni el modo oscuro).
2. **Accesibilidad casi ausente**: 2 `aria-label` en todo el proyecto frente a
   decenas de botones de solo icono; `<img>` sin `alt` descriptivo.
3. **Escalas desbordadas**: 12 variantes de `rounded-*`, 13 tamaños de icono,
   valores tipográficos arbitrarios en `PageHeader`.
4. **Hex sin token** fuera de WhatsApp: `#0D082C`, `#EAEBF0`, `#8792A2`,
   `#f8fafd`, `#546274`, además de la paleta pastel embebida en `KPICard`.
5. **Archivos desbordados** que impiden trabajar el diseño con precisión:
   `CitationsBoardPanel.tsx` (1575), `StudentDetail.tsx` (1507),
   `ReportShared.tsx` (1146), `UsersModule.tsx` (1075).
6. **Estados faltantes**: revisar vacío / cargando / error en cada listado.

## Convenciones de código

- Imports por alias `@/...` (→ `src/`). Nunca `../../..`.
- `src/components/ui/` lo genera el CLI de shadcn: **no editar a mano**. Para
  añadir uno: `npx shadcn@latest add <componente>`. Variantes nuevas se añaden
  en el `cva` del componente.
- Clases condicionales con `cn()` de `@/lib/utils`; nunca template literals.
- Animaciones desde `@/lib/motion` (`itemVariants`, `containerVariants`,
  `modalVariants`). No redefinir.
- Avatares con `getStudentAvatarUrl()` de `@/lib/avatar`.
- Datos estables entre renders con `pseudoRandom()` de `@/lib/pseudoRandom`,
  nunca `Math.random()`.
- Un feature por carpeta en `src/features/<modulo>/`, con `components/` y
  `hooks/` propios. Compartido en `src/components/{common,layout,modals,calendar,reports}`.
- Interfaz, comentarios y dominio en **español**.
- Al tocar una zona, tipa lo que tocas. No añadas `any` nuevos.

## Verificación

Obligatorio antes de dar algo por terminado:

```bash
npm run typecheck
npm run lint      # 0 errores; los ~183 avisos son deuda heredada
npm run build     # si tocaste estilos o layout
npm run dev       # http://localhost:3000
```

Comprueba siempre en **claro y oscuro** y a **1366×768** (el portátil típico del
centro), además de pantalla ancha.

## Subagentes

Definidos en `.claude/agents/`. Cada uno cubre una disciplina:

| Agente | Cuándo |
| --- | --- |
| `frontend-developer` | Implementar o modificar UI |
| `design-system-guardian` | Normalizar tokens, escalas, radios, iconos, tipografía, hex sueltos |
| `ux-reviewer` | Revisar flujos, jerarquía y microcopy para el usuario de 40-60 años |
| `accessibility-auditor` | Contraste, foco, teclado, ARIA, tamaños de objetivo |
| `frontend-qa` | QA visual y funcional: estados, responsive, temas, typecheck/lint/build |
| `ui-refactor` | Partir archivos gigantes sin cambiar un pixel del render |
| `charts-designer` | Gráficos de Recharts y visualización de datos |
