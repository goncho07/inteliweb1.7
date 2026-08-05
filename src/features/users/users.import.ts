import { ROLE_ORDER, STATUS_BY_ROLE } from '@/features/users/users.constants';
import {
  NONE,
  emptyUserForm,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from '@/features/users/users.form';
import type { UserRole, UserStatus } from '@/types';

/**
 * Carga masiva de usuarios desde un archivo CSV. Todo ocurre en el navegador:
 * se lee el archivo, se valida fila a fila con las mismas reglas del
 * formulario y se muestra qué entra y qué se descarta antes de confirmar.
 */

/** Columnas del archivo, en orden. La cabecera debe traerlas con estos nombres. */
export const CSV_COLUMNS = [
  'nombre',
  'dni',
  'rol',
  'genero',
  'estado',
  'correo',
  'telefono',
  'direccion',
  'fecha_nacimiento',
  'nivel',
  'grado',
  'seccion',
] as const;

type CsvColumn = (typeof CSV_COLUMNS)[number];

export interface ImportRow {
  /** Número de línea dentro del archivo, contando la cabecera. Para señalar el error. */
  line: number;
  name: string;
  dni: string;
  values: UserFormValues;
  errors: UserFormErrors;
}

export interface ImportResult {
  valid: ImportRow[];
  invalid: ImportRow[];
  /** Error que impide leer el archivo entero (cabecera ausente, archivo vacío…). */
  fatalError?: string;
}

/** Separa una línea CSV respetando las comillas dobles de Excel. */
const splitCsvLine = (line: string, delimiter: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
};

/** Excel en español exporta con `;`; el resto del mundo con `,`. Se acepta cualquiera. */
const detectDelimiter = (headerLine: string): string =>
  headerLine.split(';').length > headerLine.split(',').length ? ';' : ',';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // marcas de acento
    .trim();

/** Convierte el texto de una celda al rol correspondiente, o `null` si no coincide. */
const parseRole = (value: string): UserRole | null =>
  ROLE_ORDER.find((role) => normalize(role) === normalize(value)) ?? null;

const parseStatus = (value: string, role: UserRole): UserStatus | null =>
  STATUS_BY_ROLE[role].find((status) => normalize(status) === normalize(value)) ?? null;

/** Acepta `AAAA-MM-DD` y el `DD/MM/AAAA` que escribe Excel; devuelve siempre ISO. */
const parseDate = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const slashed = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashed) {
    const [, day, month, year] = slashed;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return trimmed; // Se validará después y se marcará como fila con error.
};

/** Archivo de ejemplo con la cabecera y dos filas rellenas. */
export const buildCsvTemplate = (): string =>
  [
    CSV_COLUMNS.join(';'),
    'Maria Quispe Flores;12345678;Estudiante;F;Matriculado;maria.quispe@colegio.edu.pe;987654321;Av. Los Héroes 123;2015-03-14;Primaria;3° Grado;A',
    'Carlos Rojas Mendoza;87654321;Docente;M;Activo;carlos.rojas@colegio.edu.pe;912345678;Jr. San Martín 456;1985-07-02;Secundaria;1° Grado;B',
  ].join('\r\n');

/** Descarga la plantilla CSV con la codificación que Excel abre sin romper las tildes. */
export const downloadCsvTemplate = (): void => {
  // El BOM es lo que hace que Excel interprete el archivo como UTF-8.
  const blob = new Blob(['\uFEFF', buildCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_usuarios.csv';
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Lee el CSV completo y devuelve las filas válidas y las descartadas.
 * `existingDnis` son los DNI ya presentes en el padrón; los duplicados dentro
 * del propio archivo también se descartan.
 */
export const parseUsersCsv = (text: string, existingDnis: Set<string>): ImportResult => {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return { valid: [], invalid: [], fatalError: 'El archivo está vacío.' };
  }

  const delimiter = detectDelimiter(lines[0]);
  const header = splitCsvLine(lines[0], delimiter).map(normalize);
  const missing = CSV_COLUMNS.filter((column) => !header.includes(column));

  if (missing.length > 0) {
    return {
      valid: [],
      invalid: [],
      fatalError: `Faltan columnas en la cabecera: ${missing.join(', ')}. Descarga la plantilla para ver el formato.`,
    };
  }

  const columnIndex = Object.fromEntries(
    CSV_COLUMNS.map((column) => [column, header.indexOf(column)]),
  ) as Record<CsvColumn, number>;

  const seenDnis = new Set(existingDnis);
  const valid: ImportRow[] = [];
  const invalid: ImportRow[] = [];

  lines.slice(1).forEach((line, index) => {
    const cells = splitCsvLine(line, delimiter);
    const cell = (column: CsvColumn): string => cells[columnIndex[column]] ?? '';

    const role = parseRole(cell('rol'));
    const values: UserFormValues = {
      ...emptyUserForm(role ?? 'Estudiante'),
      name: cell('nombre'),
      dni: cell('dni'),
      gender: normalize(cell('genero')).startsWith('m') ? 'M' : 'F',
      email: cell('correo'),
      phone: cell('telefono'),
      address: cell('direccion'),
      birthDate: parseDate(cell('fecha_nacimiento')),
      level: cell('nivel').trim() || NONE,
      grade: cell('grado').trim() || NONE,
      section: cell('seccion').trim() || NONE,
    };

    const errors: UserFormErrors = {};
    if (!role) {
      errors.role = `Rol no reconocido: «${cell('rol')}». Usa ${ROLE_ORDER.join(', ')}.`;
    } else {
      const status = parseStatus(cell('estado'), role);
      if (!status) {
        errors.status = `Estado no válido para ${role}. Usa ${STATUS_BY_ROLE[role].join(', ')}.`;
      } else {
        values.status = status;
      }
    }

    Object.assign(errors, validateUserForm(values, { existingDnis: seenDnis, isEditing: false }));

    const row: ImportRow = {
      line: index + 2,
      name: values.name || '(sin nombre)',
      dni: values.dni,
      values,
      errors,
    };

    if (Object.keys(errors).length === 0) {
      seenDnis.add(values.dni.trim());
      valid.push(row);
    } else {
      invalid.push(row);
    }
  });

  return { valid, invalid };
};
