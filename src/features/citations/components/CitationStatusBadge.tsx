import React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { STATUS_BADGE_CLASSES } from '../citations.constants';
import type { CitationStatus } from '../types';

/** Insignia de estado de una citación, con los mismos colores en lista y detalle. */
export const CitationStatusBadge: React.FC<{
  status: CitationStatus;
  className?: string;
}> = ({ status, className }) => {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-lg font-semibold', STATUS_BADGE_CLASSES[status], className)}
    >
      {status}
    </Badge>
  );
};
