import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

interface SortableTileProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Sortable wrapper component for dashboard tiles
 * 
 * Uses @dnd-kit/sortable for drag and drop functionality.
 * Wraps tile content with sortable behavior including:
 * - Drag handle via listeners
 * - Smooth animations with CSS transforms
 * - Touch support for mobile
 * 
 * Based on Context7 documentation: /websites/dndkit
 */
export function SortableTile({id, children}: SortableTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="sortable-tile"
    >
      {children}
    </div>
  );
}

