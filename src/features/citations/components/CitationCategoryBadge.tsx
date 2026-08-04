import React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { CATEGORY_BADGE_CLASSES, CATEGORY_ICONS } from '../citations.constants';
import type { CitationCategory } from '../types';

/** Insignia de categoría de una citación (Académico, Incidencias, Gestión, Otros), con los mismos colores e icono en toda la app. */
export const CitationCategoryBadge: React.FC<{
  category: CitationCategory;
  className?: string;
}> = ({ category, className }) => {
  const CategoryIcon = CATEGORY_ICONS[category];
  return (
    <Badge
      variant="outline"
      className={cn('rounded-lg gap-1 font-semibold [&_svg]:size-3.5', CATEGORY_BADGE_CLASSES[category], className)}
    >
      <CategoryIcon strokeWidth={2} />
      {category}
    </Badge>
  );
};
