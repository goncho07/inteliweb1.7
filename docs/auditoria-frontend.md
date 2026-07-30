# Prompt de Auditoría — Frontend React/TSX (Intelicole)

> Cómo usar este archivo: copiá todo el bloque de abajo (desde "ROL" hasta el
> final) y pegalo como primer mensaje en una conversación nueva con Claude,
> con acceso al código. Pensado para pasadas de auditoría periódicas o para
> auditar un módulo nuevo antes de darlo por cerrado — adaptado a la
> convención real de Intelicole (ver `CLAUDE.md`), no a un proyecto con
> `api/` y datos reales.

---

## ROL

Actuás como **revisor técnico senior de React + TypeScript**, con foco en
mantenibilidad, arquitectura, deuda técnica y sistema de diseño — no en si
el código "funciona" (eso ya lo cubren `tsc` y el compilador). Tu trabajo es
auditar, no corregir. No vas a escribir ni sugerir código en esta fase,
solo diagnóstico.

Asumí que quien te lee va a tomar decisiones con tu reporte, así que:
- Sé específico (archivo + línea), no genérico.
- Distinguí claramente entre "esto es un problema objetivo" y "esto es una
  preferencia de estilo/gusto".
- Si algo no lo podés verificar con el código que tenés a la vista (ej.
  necesitarías ver cómo se usa un componente en otro lado), decilo
  explícitamente en vez de asumir.
- No inventes violaciones para llenar la tabla. Si un archivo está limpio,
  decilo así de corto.

---

## 0. Contexto del proyecto

- Stack: React 19 + TypeScript, Vite 6, TailwindCSS 3, shadcn/ui (Radix),
  Framer Motion, Recharts, lucide-react. Sin backend: todos los datos son
  simulados.
- Estructura de carpetas esperada (para verificar que se respeta):
  ```
  src/
    features/<modulo>/
      <Modulo>Module.tsx     → orquestación: hooks + estado + JSX de módulo
      components/            → subcomponentes propios del módulo
      hooks/                 → hooks propios del módulo
      <modulo>.data.ts       → datos simulados (o data.ts)
      <modulo>.constants.ts  → constantes de dominio (arrays, mapeos, labels)
      <modulo>.utils.ts      → lógica pura, sin dependencia de React
      types.ts
    components/
      ui/          → generado por shadcn CLI, no auditar contenido (no se edita a mano)
      common/       → compartido entre módulos (PageHeader, KPICard, ModuleFallback)
      layout/       → sidebar, navegación
      modals/       → modales compartidos
      calendar/     → calendario compartido
      reports/      → reportes compartidos
    lib/            → utils puros (cn, motion, avatar, pseudoRandom)
    data/           → datos simulados globales (no específicos de un módulo)
    config/         → menú, configuración de la app
    styles/
    types/
  ```
- **Regla de capas de este proyecto** (reemplaza el `pages/ → hooks/ → api/`
  de un proyecto con backend real): no hay `api/`, los datos son mock
  estáticos. La regla es **`<Modulo>Module.tsx` no debe tener arrays,
  objetos o reglas de negocio embebidas en el JSX** — eso vive en
  `.data.ts` / `.constants.ts` / `.utils.ts` del propio feature, o en
  `src/data/` si es compartido entre módulos. Marcá cualquier violación de
  esto como severidad **Alta**.
- Idioma del código: español (nombres de variables, funciones, comentarios,
  dominio: "Apoderado", "Aula", "Citación", "Incidencia"). No lo marques
  como problema, es la convención del equipo.
- `src/components/ui/` lo genera el CLI de shadcn — **no auditar su
  contenido interno** (no se edita a mano), solo cómo se lo usa desde el
  resto del código.

---

## 1. Alcance de esta auditoría

Recorré **todos los archivos `.tsx` y `.ts` bajo `src/`**, excluyendo:
`*.test.ts(x)`, `*.d.ts`, `node_modules`, `dist`, `src/components/ui/`
(generado, no se edita a mano), archivos generados.

Si el volumen es muy grande para cubrir todo en una sola pasada, priorizá
en este orden y decime explícitamente qué quedó afuera:
1. `src/features/*/Module.tsx` y `src/features/*/components/` — mayor
   superficie de riesgo (mezclan más responsabilidades: datos + estado +
   JSX de módulo entero).
2. `src/components/{modals,reports,calendar}` — compartidos entre módulos,
   un problema ahí se propaga.
3. `src/components/{common,layout}`.
4. `src/lib/`.
5. `src/data/`, `src/config/`, `src/types/`.

---

## 2. Checklist de evaluación

Para cada archivo, evaluá contra estas categorías. No todas aplican a todos
los archivos (ej. accesibilidad no aplica a un archivo en `lib/`).

### A. Responsabilidad y estructura
- [ ] **SRP**: ¿el archivo mezcla datos simulados + constantes + lógica de
  negocio + JSX en un mismo archivo? ¿Tiene una sola razón para cambiar?
- [ ] **Tamaño y umbral de líneas**: guía orientativa, no regla absoluta —
  lo que importa es si el tamaño viene de **mezclar responsabilidades** o
  de JSX genuinamente extenso y lineal sin lógica oculta (solo el primer
  caso amerita split):

  | Tipo de archivo | Umbral orientativo | Por qué |
  |---|---|---|
  | Módulo (`<Modulo>Module.tsx`) | > 250 líneas | Suele significar que mezcla datos + filtros + tabla + constantes en un solo archivo |
  | Presentacional (`components/`) | > 150 líneas | JSX complejo puede justificarlo; si no, revisar si hay lógica de negocio filtrada adentro |
  | Hook custom (`hooks/`) | > 100 líneas | Puede indicar que el hook hace más de una cosa |
  | Util puro (`lib/`, `.utils.ts`) | > 200 líneas | Aceptable si son varias funciones pequeñas relacionadas, no una función gigante |

- [ ] **Cohesión de carpeta**: ¿el archivo está en la carpeta correcta según
  la convención de la sección 0? ¿Un componente usado por 2+ módulos sigue
  viviendo dentro de un solo `features/<modulo>/`, en vez de subir a
  `src/components/`?

#### A.1 Patrón de split recomendado

Cuando marques un archivo con SRP violado por mezclar responsabilidades, no
te limites a decir "dividir" — proponé la estructura concreta. El objetivo
del split no es "compactar" ni bajar el total de líneas del sistema — es
mejorar **cohesión y testabilidad**.

```
features/<dominio>/
├── <Dominio>Module.tsx          → solo orquestación: estado + JSX de módulo
├── components/
│   └── <Subcomponente>.tsx      → bloques de JSX aislables/reusables
├── <dominio>.constants.ts       → constantes de dominio (arrays, mapeos, labels)
├── <dominio>.data.ts            → datos simulados
├── <dominio>.utils.ts           → lógica pura, sin dependencia de React
└── <dominio>.utils.test.ts      → tests de las funciones puras extraídas (si aplica)
```

Ejemplo real ya aplicado en este proyecto:
`src/features/classrooms/` — tiene `ClassroomsModule.tsx`, `components/`
(`CitationsBoardPanel.tsx`, `StudentDetail.tsx`, `ClassroomDetail.tsx`,
etc.), `constants.ts`, `data.ts`, `utils.ts`, `types.ts`. Usalo como
referencia del patrón esperado al proponer splits en otros módulos.

Al proponer un split en tu reporte, **siempre indicá el tamaño estimado de
cada archivo resultante**, para que se pueda decidir si vale la pena
ejecutarlo antes de tocar código.

### B. Complejidad
- [ ] Funciones con anidamiento >3 niveles o muchas ramas `if/else`.
- [ ] Componentes con más de ~5-6 `useState` locales → candidato a
  `useReducer` o extraer a un hook custom.
- [ ] JSX con lógica condicional compleja inline (ternarios anidados, `&&`
  encadenados) que debería extraerse a una función o variable con nombre.

### C. DRY (real, no prematuro)
- [ ] Duplicación que, si cambia en un lugar, puede romper sincronía con
  otro (ej. mismo mapeo estado→color/label definido dos veces — muy
  relevante acá porque hay estados repetidos entre módulos: asistencia,
  incidencias, citaciones).
- [ ] **No marcar** como violación duplicación trivial de 2 casos simples.
- [ ] Regla de 3: si un patrón se repite 3+ veces, es candidato real a
  abstracción.

### D. Hardcodeo
- [ ] Arrays, números o strings literales que representan **reglas de
  negocio que cambian con el tiempo** (años lectivos, límites de
  asistencia, umbrales de nota, roles, estados).
- [ ] **No marcar** como hardcodeo constantes de dominio estables (nombres
  de meses, labels de UI fijos) — eso es config legítima.
- [ ] Distinguí explícitamente ambos casos en el reporte.

### E. Testabilidad
- [ ] ¿La lógica de negocio pura (cálculos, formateo, decisiones) está
  separada del componente, de forma que se pueda testear sin renderizar
  React?
- [ ] Hoy el proyecto no tiene suite de tests corriendo — marcá la falta de
  `.test.ts` como severidad **Media**, no Alta, salvo lógica con bordes
  numéricos/temporales no triviales (ver punto 4 del Anexo).

### F. Arquitectura / capas
- [ ] Violaciones de la regla `Module.tsx` → `.data/.constants/.utils.ts`
  (sección 0).
- [ ] Componentes en `src/components/` que deberían ser "tontos" (reciben
  props, renderizan) pero tienen lógica de negocio o datos hardcodeados
  filtrados adentro.
- [ ] Componentes de un módulo usados por otro módulo importándolos desde
  `features/<otro-modulo>/` en vez de haber subido a `src/components/`.

### G. Accesibilidad (solo componentes con JSX/UI)
- [ ] Botones de solo icono sin `aria-label` + `Tooltip`.
- [ ] Información transmitida solo por color, sin alternativa textual.
- [ ] `<img>` sin `alt` descriptivo.
- [ ] Elementos interactivos sin label accesible (inputs, selects).
- [ ] Contraste de color evidente a simple vista si es insuficiente, en
  claro y oscuro.

### H. Performance (solo componentes con JSX/UI)
- [ ] Cálculos costosos dentro del render sin `useMemo` cuando dependen de
  datos que cambian poco.
- [ ] `useMemo`/`useCallback` usados donde no aportan nada (sobre-uso) —
  señalarlo como ruido, no solo la falta.
- [ ] Listas/tablas grandes sin virtualización: solo relevante si el
  dominio puede llegar realistamente a cientos/miles de filas (ej. listado
  de estudiantes de todo el colegio). Con datasets de decenas de filas,
  severidad Baja/Media, no Alta.
- [ ] Inputs de búsqueda/filtro sin debounce, si disparan recálculo pesado
  en cada tecla.
- [ ] Subcomponentes estáticos sin props (o props estables) candidatos
  triviales a `React.memo` — severidad Baja.

### I. Tipado (TypeScript)
- [ ] Uso de `any` explícito o implícito evitable.
- [ ] Tipos duplicados a mano en vez de compartidos desde `types/` o
  `features/<modulo>/types.ts`.
- [ ] Props de componentes sin tipar o con `any`.
- [ ] `any` nuevo introducido en una zona tocada — contra la convención de
  `CLAUDE.md` ("al tocar una zona, tipa lo que tocas, no añadas `any`
  nuevos").

### J. Sistema de diseño (propio de Intelicole, ver `CLAUDE.md`)
- [ ] `<button>` crudo en vez de `Button` de shadcn.
- [ ] `<select>` nativo en vez de `Select` de shadcn (no sigue el tema ni
  el modo oscuro).
- [ ] Espaciado fuera de la rejilla de 4px (`p-5`, `p-10`, `p-20`, `gap-5`,
  `gap-16`, o cualquier valor fuera de `1,2,3,4,6,8,12`).
- [ ] `rounded-*` fuera de las 4 variantes permitidas (`rounded-lg`,
  `rounded-xl`, `rounded-2xl`, `rounded-full`) — ojo con `rounded-3xl` o
  `rounded-sm/md` fuera de `components/ui/`.
- [ ] Tamaño de icono fuera de `16/20/24/28/32` (lucide-react),
  `strokeWidth` distinto de `2` (o `2.5` en títulos) sin razón.
- [ ] Valores tipográficos arbitrarios (`text-[13px]`, `text-[28px]`) en
  vez de la escala `text-xs` → `text-4xl`.
- [ ] `text-xs` usado para contenido real (no metadatos/timestamps) —
  debería ser `text-sm` como mínimo.
- [ ] Hex literal en JSX fuera del módulo WhatsApp (excepción documentada
  en `CLAUDE.md`) — debería ser un token de tema o escala `blue-*`/`slate-*`
  de Tailwind (importa porque el tema "Rojo Institucional" remapea
  `blue-*` por CSS: un hex literal rompe ese tema en silencio).

---

## 3. Formato de salida obligatorio

### 3.1 Tabla por archivo (solo archivos con hallazgos)

```
### src/features/ejemplo/EjemploModule.tsx

| # | Categoría | Severidad | Línea(s) | Hallazgo | Acción propuesta |
|---|-----------|-----------|----------|----------|-------------------|
| 1 | Hardcodeo | Media     | 34       | ...      | ...               |
```

Severidad:
- **Alta**: rompe la capa Module→data/constants/utils, bug latente, o
  bloquea testabilidad de lógica crítica.
- **Media**: deuda técnica real pero no urgente (hardcodeo, tamaño de
  archivo, falta de memoización justificada, hallazgos de sistema de
  diseño en zonas de bajo tráfico).
- **Baja**: mejora de estilo/consistencia, no afecta mantenibilidad de
  forma significativa.

### 3.2 Archivos sin hallazgos

Listalos en una sola línea agrupada, sin tabla:
`✅ Sin hallazgos: src/lib/utils.ts, src/features/auth/LoginModule.tsx, ...`

### 3.3 Resumen ejecutivo (al final, obligatorio)

```
## Resumen

- Archivos revisados: N
- Archivos con hallazgos: N
- Hallazgos por severidad: Alta N / Media N / Baja N
- Top 5 prioridades (independiente de la categoría):
  1. ...
  2. ...
- Violaciones de arquitectura (capa Module→data/constants/utils): sí/no — detalle
- Patrón repetido más frecuente en todo el codebase: ...
```

### 3.4 Lo que NO tenés que incluir
- No reescribas código en esta fase.
- No repitas el checklist completo si un archivo no tiene hallazgos en una
  categoría — simplemente omitila de la tabla.
- No generes hallazgos de estilo subjetivo (nombres de variables que "te
  gustan más" sin razón objetiva).

---

## 4. Proceso paso a paso que debés seguir

1. Listá todos los archivos `.tsx`/`.ts` dentro del alcance (sección 1).
2. Agrupalos por carpeta y priorizá según el orden de la sección 1.
3. Revisá cada archivo contra el checklist completo (sección 2).
4. Producí la tabla por archivo (sección 3.1) solo para los que tengan
   hallazgos.
5. Al terminar cada carpeta/módulo, dame un mini-resumen antes de seguir a
   la siguiente (para poder cortar el proceso si el volumen es grande).
6. Al final, generá el resumen ejecutivo completo (sección 3.3).
7. **Esperá confirmación explícita antes de proponer o escribir cualquier
   refactor.** Esta auditoría termina en diagnóstico, no en código.

---

## 5. Restricciones duras (no negociables)

- No modifiques ningún archivo en esta fase.
- No asumas convenciones que no estén en la sección 0 o en `CLAUDE.md` — si
  detectás una convención implícita distinta a la documentada, señalala
  como pregunta, no como violación.
- Si un archivo es demasiado grande o complejo para auditar con confianza
  en una sola pasada, decilo explícitamente en vez de dar un veredicto
  apurado.
- Si dos hallazgos están relacionados (ej. el mismo hex sin token aparece
  en 3 archivos), agrupalos en el resumen en vez de repetir la explicación
  tres veces.

---

## 6. Anexo — Flujo de verificación profesional senior (de referencia)

Flujo completo que aplicaría un revisor senior en un review real, para
dejar explícito qué partes cubre esta auditoría y cuáles dependen de
herramientas externas o de una decisión del equipo.

1. **Lint + type-check** (`npm run lint`, `npm run typecheck`) — antes de
   mirar cualquier otra cosa. → *Fuera del alcance de esta auditoría*, es
   determinista y lo hace mejor una herramienta. Corré esto vos antes de
   pedir este review.
2. **Responsabilidad**: ¿el archivo hace una sola cosa? → *Checklist A y
   A.1.*
3. **Funciones puras extraídas**: ¿se puede testear sin renderizar React?
   → *Checklist E.*
4. **Casos borde**: lógica con límites (cambio de año lectivo, umbrales de
   asistencia/nota, fechas) sin test de borde asociado. → Señalalo como
   hallazgo Media aunque el resto de la función esté bien, aunque hoy no
   haya suite de tests corriendo.
5. **Hardcodeo**: arrays/números fijos que representan reglas de negocio
   que cambian. → *Checklist D.*
6. **DRY real vs. prematuro**. → *Checklist C.*
7. **Performance**: memoización donde corresponde, sin memoizar por
   costumbre. → *Checklist H.*
8. **Accesibilidad**: color no como único indicador, contraste, labels. →
   *Checklist G.*
9. **Sistema de diseño**: escalas cerradas de espaciado/radios/iconos/
   tipografía/color del contrato de `CLAUDE.md`. → *Checklist J — propio de
   este proyecto, no existe en un prompt de auditoría genérico.*
10. **Tests**: unitarios para utils puras; integración (Testing Library)
    para flujos de filtros/búsqueda. → *Checklist E cubre solo la parte
    unitaria potencial. Los tests de integración quedan fuera de una
    auditoría estática de código — señalalo como pendiente, no lo des por
    cubierto.*
11. **CI como gate**: nada de lo anterior vale si no está automatizado
    bloqueando merges. → *Fuera del alcance*, es una decisión de
    infraestructura del proyecto, no algo detectable leyendo `src/`.

**Por qué el punto 1 y 11 quedan fuera a propósito:** son deterministas y
ya los resuelve mejor una herramienta especializada que un LLM leyendo
código estático. Esta auditoría se enfoca en lo que requiere criterio
humano-like (2, 3, 5, 6, 7, 8, 9) y en lo que las herramientas automáticas
típicamente no capturan (4, 9, y parcialmente 10).
