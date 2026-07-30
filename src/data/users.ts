import type { UserItem } from '@/types';
import { EDUCATIONAL_STRUCTURE } from '@/data/education';

/**
 * Fábrica de datos simulados. Genera el padrón completo de la institución
 * (estudiantes, docentes, administrativos y apoderados) a partir de la
 * estructura educativa real.
 *
 * Nota: usa `Math.random()`, por lo que el padrón cambia en cada recarga.
 * Al conectar el backend, reemplazar `MOCK_USERS` por la respuesta de la API.
 */

const FIRST_NAMES = [
  'Mateo', 'Valentina', 'Santiago', 'Luciana', 'Thiago', 'Maria', 'Liam', 'Catalina',
  'Gael', 'Fernanda', 'Alessandro', 'Mia', 'Nicolas', 'Alessia', 'Benjamin', 'Camila',
  'Sebastian', 'Ariana', 'Matias', 'Luana', 'Diego', 'Ximena', 'Joaquin', 'Danna',
  'Carlos', 'Ana', 'Jose', 'Elena', 'Luis', 'Sofia', 'Jorge', 'Gabriela', 'Piero', 'Valery',
];

const LAST_NAMES = [
  'Quispe', 'Flores', 'Rodriguez', 'Sanchez', 'Garcia', 'Rojas', 'Mamani', 'Chavez',
  'Lopez', 'Mendoza', 'Torres', 'Diaz', 'Castillo', 'Espinoza', 'Huaman', 'Vargas',
  'Ramos', 'Gutierrez', 'Ruiz', 'Fernandez', 'Gomez', 'Perez', 'Vasquez', 'Castro',
  'Romero', 'Suarez', 'Delgado', 'Acosta', 'Paredes', 'Salazar', 'Reyna', 'Campos',
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500',
  'bg-indigo-500', 'bg-cyan-600', 'bg-teal-600', 'bg-pink-500', 'bg-slate-500',
];

const LEVELS: UserItem['level'][] = ['Inicial', 'Primaria', 'Secundaria'];

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const generateRandomUser = (
  id: number,
  role: UserItem['role'],
  level?: UserItem['level'],
  grade?: string,
  section?: string,
): UserItem => {
  const firstName = pick(FIRST_NAMES);
  const lastName1 = pick(LAST_NAMES);
  const lastName2 = pick(LAST_NAMES);

  // DNI peruano: 8 dígitos.
  const dni = Math.floor(10000000 + Math.random() * 90000000).toString();

  let status: UserItem['status'];
  if (role === 'Estudiante') {
    const rand = Math.random();
    if (rand > 0.95) status = 'Retirado';
    else if (rand > 0.9) status = 'Trasladado';
    else if (rand > 0.85) status = 'Egresado';
    else status = 'Matriculado';
  } else {
    status = Math.random() > 0.95 ? 'Inactivo' : 'Activo';
  }

  return {
    id: id.toString(),
    code: role === 'Estudiante' ? `EST20261000${1000 + id}` : undefined,
    name: `${firstName} ${lastName1} ${lastName2}`,
    dni,
    role,
    level,
    grade,
    section,
    status,
    avatarColor: pick(AVATAR_COLORS),
    email: `${firstName.toLowerCase()}.${lastName1.toLowerCase()}@peepos.edu.pe`,
    phone: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
    address: 'Av. Siempre Viva 123',
  };
};

/** Recorre nivel → grado → sección de la estructura educativa. */
const forEachSection = (fn: (level: UserItem['level'], grade: string, section: string) => void) => {
  Object.entries(EDUCATIONAL_STRUCTURE).forEach(([level, grades]) => {
    Object.entries(grades).forEach(([grade, sections]) => {
      sections.forEach((section) => fn(level as UserItem['level'], grade, section));
    });
  });
};

const generateMockData = (): UserItem[] => {
  const users: UserItem[] = [];
  let idCounter = 1;

  // 30 estudiantes por sección.
  forEachSection((level, grade, section) => {
    for (let i = 0; i < 30; i++) {
      users.push(generateRandomUser(idCounter++, 'Estudiante', level, grade, section));
    }
  });

  // Un docente tutor por sección.
  forEachSection((level, grade, section) => {
    users.push(generateRandomUser(idCounter++, 'Docente', level, grade, section));
  });

  // Docentes sin aula asignada.
  for (let i = 0; i < 10; i++) {
    users.push(generateRandomUser(idCounter++, 'Docente', pick(LEVELS)));
  }

  // Personal administrativo.
  for (let i = 0; i < 15; i++) {
    users.push(generateRandomUser(idCounter++, 'Administrativo'));
  }

  // Apoderados de muestra.
  for (let i = 0; i < 100; i++) {
    users.push(generateRandomUser(idCounter++, 'Apoderado', pick(LEVELS)));
  }

  return users;
};

export const MOCK_USERS = generateMockData();
