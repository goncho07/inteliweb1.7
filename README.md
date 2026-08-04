# Intelicole Web

Sistema de gestión escolar para instituciones educativas peruanas: matrícula,
asistencia, incidencias conductuales, citaciones a apoderados y libretas de
notas.

## Stack

| Área        | Tecnología                                  |
| ----------- | ------------------------------------------- |
| UI          | React 19 + TypeScript                       |
| Build       | Vite 6                                      |
| Estilos     | Tailwind CSS 3 + shadcn/ui (Radix UI)       |
| Animación   | Framer Motion                               |
| Gráficos    | Recharts                                    |
| PDF         | jsPDF + jspdf-autotable                     |
| Iconos      | lucide-react                                |

## Puesta en marcha

```bash
npm install
npm run dev             # http://localhost:3000
```

## Scripts

| Comando                | Qué hace                                        |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo en el puerto 3000        |
| `npm run build`        | Build de producción en `dist/`                  |
| `npm run preview`      | Sirve el build de producción                    |
| `npm run typecheck`    | Comprobación de tipos (`tsc --noEmit`)          |
| `npm run lint`         | ESLint                                          |
| `npm run lint:fix`     | ESLint con autocorrección                       |
| `npm run format`       | Prettier (ordena además las clases de Tailwind) |

## Estructura

```
src/
├── App.tsx                  Shell: autenticación, sidebar, enrutado por módulo
├── main.tsx                 Punto de entrada
├── assets/images/           Imágenes empaquetadas por Vite
├── components/
│   ├── ui/                  shadcn/ui — generado por CLI, no editar a mano
│   ├── common/              Primitivos propios (StudentAvatar, NavCard)
│   ├── layout/              Piezas del armazón (SidebarItem)
│   ├── modals/              Todos los modales + barrel `index.ts`
│   └── calendar/            CustomCalendar, RightSidebarCalendar
├── config/
│   ├── app.ts               Marca e imágenes institucionales
│   └── menu.tsx             Registro de módulos del menú lateral
├── data/                    Datos simulados (calendario, padrón, estructura)
├── features/                Un directorio por módulo de negocio (carga lazy)
│   ├── auth/  dashboard/  users/  profile/
│   ├── citations/  whatsapp/
│   └── classrooms/          panelVariants.ts define las variantes del panel
│                            de seguimiento (Incidencias / Comunicados)
├── lib/                     Utilidades puras (cn, avatares, fechas, motion)
├── styles/index.css         Directivas Tailwind + tokens de tema
└── types/index.ts           Tipos compartidos
```

### Convenciones

- **Imports por alias**: siempre `@/...` (mapeado a `src/`), nunca `../../..`.
- **UI con shadcn/ui**: usa los componentes de `@/components/ui` en lugar de
  `<button>` o `<input>` estilizados a mano. Para añadir uno nuevo:
  ```bash
  npx shadcn@latest add <componente>
  ```
- **Clases condicionales**: combínalas con `cn()` de `@/lib/utils`.
- **Un feature por carpeta** en `src/features/`, con sus `components/` y
  `hooks/` propios cuando crezca.

## Tema

La identidad visual se define con variables CSS en
[`src/styles/index.css`](src/styles/index.css) y se expone a Tailwind desde
[`tailwind.config.js`](tailwind.config.js):

- `primary` `#3030b8` (azul institucional), `brand-navy` `#0a2540`,
  `brand-cyan` `#00c2ff`.
- Modo oscuro por clase `.dark`, con negros puros (`slate-950` → `#000000`).
- Tema alternativo "Rojo Institucional" con `<html data-theme="rojo">`.

## Rendimiento

Los módulos se cargan bajo demanda con `React.lazy` desde
[`src/config/menu.tsx`](src/config/menu.tsx), y las librerías pesadas van a
chunks propios (`react-vendor`, `charts`, `motion`) para que el navegador las
mantenga cacheadas entre despliegues. La carga inicial es de ~696 KB; el módulo
de Aulas (600 KB) sólo se descarga al abrirlo.

Al añadir un módulo nuevo, regístralo en `MENU_CONFIG` con `lazy()` igual que
los demás; `App.tsx` ya lo envuelve en un `<Suspense>`.

## Estado conocido

- `src/features/classrooms/` concentra la mayor parte de la lógica de la
  aplicación y sigue siendo el módulo más pesado.
- Los datos son simulados (`src/data/`). El padrón de `MOCK_USERS` se regenera
  en cada recarga; al conectar el backend hay que sustituirlo por la respuesta
  real. Los datos que deben ser estables entre renders usan `pseudoRandom()`
  de [`src/lib/pseudoRandom.ts`](src/lib/pseudoRandom.ts), no `Math.random()`.
- `npm run lint` está en cero errores. Quedan ~183 avisos, casi todos
  `no-explicit-any` en código heredado: al tocar una zona, tipa lo que toques.
