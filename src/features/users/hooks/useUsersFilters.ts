import { useCallback, useMemo, useState } from 'react';

import { ALL, PAGE_SIZE_OPTIONS, STATUS_BY_ROLE } from '@/features/users/users.constants';
import { gradesForLevel, sectionsForGrade } from '@/features/users/users.form';
import type { UserItem, UserRole } from '@/types';

/**
 * Filtros, búsqueda y paginación de la tabla de usuarios.
 *
 * Los filtros son en cascada y se resuelven en los manejadores, no en
 * efectos: al cambiar el nivel se reinician grado y sección en el mismo
 * render, sin estados intermedios imposibles (un grado que no existe en el
 * nivel recién elegido). La página visible se recorta contra el total en
 * lugar de guardarse tal cual, para que borrar el último registro de la
 * página 12 no deje la tabla en blanco.
 */

export interface UsersFilters {
  role: UserRole;
  level: string;
  grade: string;
  section: string;
  status: string;
  search: string;
  page: number;
  pageSize: number;
  totalPages: number;
  gradeOptions: string[];
  sectionOptions: string[];
  statusOptions: string[];
  activeFiltersCount: number;
  filteredUsers: UserItem[];
  pageUsers: UserItem[];
  setRole: (role: UserRole) => void;
  setLevel: (level: string) => void;
  setGrade: (grade: string) => void;
  setSection: (section: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  clearFilters: () => void;
}

const matchesSearch = (user: UserItem, query: string): boolean => {
  if (query === '') return true;
  const needle = query.toLowerCase();
  return (
    user.name.toLowerCase().includes(needle) ||
    user.dni.includes(needle) ||
    user.email.toLowerCase().includes(needle) ||
    (user.modularCode?.toLowerCase().includes(needle) ?? false)
  );
};

export const useUsersFilters = (users: UserItem[]): UsersFilters => {
  const [role, setRoleState] = useState<UserRole>('Estudiante');
  const [level, setLevelState] = useState(ALL);
  const [grade, setGradeState] = useState(ALL);
  const [section, setSectionState] = useState(ALL);
  const [status, setStatusState] = useState(ALL);
  const [search, setSearchState] = useState('');
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  const resetFilters = useCallback(() => {
    setLevelState(ALL);
    setGradeState(ALL);
    setSectionState(ALL);
    setStatusState(ALL);
    setSearchState('');
  }, []);

  /** Cualquier cambio de filtro vuelve a la página 1. */
  const afterFilterChange = useCallback(() => setRequestedPage(1), []);

  const setRole = useCallback(
    (next: UserRole) => {
      setRoleState(next);
      resetFilters();
      afterFilterChange();
    },
    [afterFilterChange, resetFilters],
  );

  const setLevel = useCallback(
    (next: string) => {
      setLevelState(next);
      setGradeState(ALL);
      setSectionState(ALL);
      afterFilterChange();
    },
    [afterFilterChange],
  );

  const setGrade = useCallback(
    (next: string) => {
      setGradeState(next);
      setSectionState(ALL);
      afterFilterChange();
    },
    [afterFilterChange],
  );

  const setSection = useCallback(
    (next: string) => {
      setSectionState(next);
      afterFilterChange();
    },
    [afterFilterChange],
  );

  const setStatus = useCallback(
    (next: string) => {
      setStatusState(next);
      afterFilterChange();
    },
    [afterFilterChange],
  );

  const setSearch = useCallback(
    (next: string) => {
      setSearchState(next);
      afterFilterChange();
    },
    [afterFilterChange],
  );

  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setRequestedPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    resetFilters();
    afterFilterChange();
  }, [afterFilterChange, resetFilters]);

  const gradeOptions = useMemo(() => (level === ALL ? [] : gradesForLevel(level)), [level]);
  const sectionOptions = useMemo(
    () => (level === ALL || grade === ALL ? [] : sectionsForGrade(level, grade)),
    [grade, level],
  );
  const statusOptions = useMemo(() => STATUS_BY_ROLE[role], [role]);

  const activeFiltersCount = useMemo(
    () =>
      [level, grade, section, status].filter((value) => value !== ALL).length +
      (search.trim() === '' ? 0 : 1),
    [grade, level, search, section, status],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === role &&
          (level === ALL || user.level === level) &&
          (grade === ALL || user.grade === grade) &&
          (section === ALL || user.section === section) &&
          (status === ALL || user.status === status) &&
          matchesSearch(user, search.trim()),
      ),
    [grade, level, role, search, section, status, users],
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  // Se recorta al vuelo: si la lista encoge, la página deja de existir sola.
  const page = Math.min(requestedPage, totalPages);
  const pageUsers = useMemo(
    () => filteredUsers.slice((page - 1) * pageSize, page * pageSize),
    [filteredUsers, page, pageSize],
  );

  return {
    role,
    level,
    grade,
    section,
    status,
    search,
    page,
    pageSize,
    totalPages,
    gradeOptions,
    sectionOptions,
    statusOptions,
    activeFiltersCount,
    filteredUsers,
    pageUsers,
    setRole,
    setLevel,
    setGrade,
    setSection,
    setStatus,
    setSearch,
    setPage: setRequestedPage,
    setPageSize,
    clearFilters,
  };
};
