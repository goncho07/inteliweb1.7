import type { ClassroomRef, UserItem } from '@/types';
import { EDUCATIONAL_STRUCTURE, getSectionSize } from '@/data/education';
import { pseudoRandom } from '@/lib/pseudoRandom';

/**
 * Fábrica de datos simulados. Genera el padrón completo de la institución
 * (estudiantes, docentes, administrativos y apoderados) a partir de la
 * estructura educativa real.
 *
 * Cada campo se siembra con `pseudoRandom()` a partir del `id` del usuario
 * (nunca `Math.random()`): el mismo `id` genera siempre la misma persona
 * simulada, incluso tras recargar la página. Al conectar el backend,
 * reemplazar `MOCK_USERS` por la respuesta de la API.
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

/** Subconjunto masculino de `FIRST_NAMES`, usado para derivar el campo `gender`. */
const MALE_NAMES = new Set([
  'Mateo', 'Santiago', 'Thiago', 'Liam', 'Gael', 'Alessandro', 'Nicolas', 'Benjamin',
  'Sebastian', 'Matias', 'Diego', 'Joaquin', 'Carlos', 'Jose', 'Luis', 'Jorge', 'Piero',
]);

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500',
  'bg-indigo-500', 'bg-cyan-600', 'bg-teal-600', 'bg-pink-500', 'bg-slate-500',
];

const LEVELS: UserItem['level'][] = ['Inicial', 'Primaria', 'Secundaria'];

/** Elige un elemento de `list` de forma estable: la misma `seed` siempre devuelve el mismo elemento. */
const pickSeeded = <T,>(list: T[], seed: string): T => list[Math.floor(pseudoRandom(seed) * list.length)];

/** Entero estable en `[min, max]` a partir de una semilla de texto. */
const seededInt = (seed: string, min: number, max: number): number =>
  Math.floor(min + pseudoRandom(seed) * (max - min + 1));

const generateRandomUser = (
  id: number,
  role: UserItem['role'],
  level?: UserItem['level'],
  grade?: string,
  section?: string,
): UserItem => {
  const firstName = pickSeeded(FIRST_NAMES, `user-${id}-first`);
  const lastName1 = pickSeeded(LAST_NAMES, `user-${id}-last1`);
  const lastName2 = pickSeeded(LAST_NAMES, `user-${id}-last2`);

  // DNI peruano: 8 dígitos.
  const dni = seededInt(`user-${id}-dni`, 10000000, 99999999).toString();

  let status: UserItem['status'];
  if (role === 'Estudiante') {
    const rand = pseudoRandom(`user-${id}-status`);
    if (rand > 0.95) status = 'Retirado';
    else if (rand > 0.9) status = 'Trasladado';
    else if (rand > 0.85) status = 'Egresado';
    else status = 'Matriculado';
  } else {
    status = pseudoRandom(`user-${id}-status`) > 0.95 ? 'Inactivo' : 'Activo';
  }

  return {
    id: id.toString(),
    code: role === 'Estudiante' ? `EST20261000${1000 + id}` : undefined,
    name: `${firstName} ${lastName1} ${lastName2}`,
    dni,
    role,
    gender: MALE_NAMES.has(firstName) ? 'M' : 'F',
    level,
    grade,
    section,
    status,
    avatarColor: pickSeeded(AVATAR_COLORS, `user-${id}-avatar`),
    email: `${firstName.toLowerCase()}.${lastName1.toLowerCase()}@peepos.edu.pe`,
    phone: `9${seededInt(`user-${id}-phone`, 10000000, 99999999)}`,
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

/** Todas las aulas del colegio, agrupadas por nivel — para repartir aulas entre docentes. */
const CLASSROOMS_BY_LEVEL: Record<string, ClassroomRef[]> = Object.fromEntries(
  Object.entries(EDUCATIONAL_STRUCTURE).map(([level, grades]) => [
    level,
    Object.entries(grades).flatMap(([grade, sections]) =>
      sections.map((section): ClassroomRef => ({ level, grade, section })),
    ),
  ]),
);

const sameClassroom = (a: ClassroomRef, b: ClassroomRef): boolean =>
  a.level === b.level && a.grade === b.grade && a.section === b.section;

/**
 * Reparte quién entra al sistema y con qué rol: todos los docentes generados
 * pasan a `'docente'`; del personal administrativo, los primeros 5 son
 * `'directivo'` y el resto `'auxiliar'`; todos los apoderados son
 * `'apoderado'`. Los estudiantes quedan sin `appRole` — no inician sesión.
 */
const assignAppRoles = (users: UserItem[]): void => {
  const administrativeStaff = users.filter((u) => u.role === 'Administrativo');
  administrativeStaff.forEach((u, index) => {
    u.appRole = index < 5 ? 'directivo' : 'auxiliar';
  });
  users.forEach((u) => {
    if (u.role === 'Docente') u.appRole = 'docente';
    if (u.role === 'Apoderado') u.appRole = 'apoderado';
  });
};

/**
 * Da a cada docente 4-6 aulas de su mismo nivel a su cargo (semilla
 * `docente-${id}-…`, determinista). El docente tutor de una sección siempre
 * la incluye primero; los docentes sin aula reciben solo aulas sorteadas.
 */
const assignTeacherClassrooms = (users: UserItem[]): void => {
  const teachers = users.filter((u) => u.role === 'Docente');
  teachers.forEach((teacher) => {
    const own: ClassroomRef | null =
      teacher.level && teacher.grade && teacher.section
        ? { level: teacher.level, grade: teacher.grade, section: teacher.section }
        : null;
    const level = teacher.level ?? pickSeeded(LEVELS, `docente-${teacher.id}-nivel`)!;
    const pool = (CLASSROOMS_BY_LEVEL[level as string] ?? []).filter((c) => !own || !sameClassroom(c, own));

    const target = seededInt(`docente-${teacher.id}-aula-count`, 4, 6);
    const classrooms: ClassroomRef[] = own ? [own] : [];
    let attempt = 0;
    while (classrooms.length < target && pool.length > 0 && attempt < pool.length * 3) {
      const candidate = pickSeeded(pool, `docente-${teacher.id}-aula-pick-${attempt}`);
      if (!classrooms.some((c) => sameClassroom(c, candidate))) classrooms.push(candidate);
      attempt++;
    }

    teacher.classrooms = classrooms;
  });
};

/**
 * Asigna a cada apoderado exactamente un hijo entre los estudiantes
 * matriculados (semilla `apoderado-${id}-hijo`) y escribe el vínculo
 * recíproco en el alumno.
 */
const linkGuardians = (users: UserItem[]): void => {
  const guardians = users.filter((u) => u.role === 'Apoderado');
  const enrolledStudents = users.filter((u) => u.role === 'Estudiante' && u.status === 'Matriculado');

  guardians.forEach((guardian) => {
    if (enrolledStudents.length === 0) return;
    const child = pickSeeded(enrolledStudents, `apoderado-${guardian.id}-hijo`);
    guardian.childrenIds = [child.id];
    child.guardianIds = [...(child.guardianIds ?? []), guardian.id];
  });
};

const generateMockData = (): UserItem[] => {
  const users: UserItem[] = [];
  let idCounter = 1;

  // Nómina real por sección en Secundaria; 30 por defecto en el resto (ver `getSectionSize`).
  forEachSection((level, grade, section) => {
    const size = getSectionSize(level, grade, section);
    for (let i = 0; i < size; i++) {
      users.push(generateRandomUser(idCounter++, 'Estudiante', level, grade, section));
    }
  });

  // Un docente tutor por sección.
  forEachSection((level, grade, section) => {
    users.push(generateRandomUser(idCounter++, 'Docente', level, grade, section));
  });

  // Docentes sin aula asignada.
  for (let i = 0; i < 10; i++) {
    const uid = idCounter++;
    users.push(generateRandomUser(uid, 'Docente', pickSeeded(LEVELS, `user-${uid}-level`)));
  }

  // Personal administrativo.
  for (let i = 0; i < 15; i++) {
    users.push(generateRandomUser(idCounter++, 'Administrativo'));
  }

  // Apoderados de muestra.
  for (let i = 0; i < 100; i++) {
    const uid = idCounter++;
    users.push(generateRandomUser(uid, 'Apoderado', pickSeeded(LEVELS, `user-${uid}-level`)));
  }

  assignAppRoles(users);
  assignTeacherClassrooms(users);
  linkGuardians(users);

  return users;
};

export const MOCK_USERS = generateMockData();
