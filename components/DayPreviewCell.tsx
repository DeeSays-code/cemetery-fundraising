'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { Event } from '@/lib/types';

interface DayPreviewCellProps {
  date: string;
  events: Event[];
  isToday?: boolean;
  onClick: () => void;
}

export function DayPreviewCell({
  date,
  events,
  isToday = false,
  onClick,
}: DayPreviewCellProps) {
  const lockedEvents = events.filter((e) => e.locked && e.details.trim());
  const eventCount = events.length;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full p-3 rounded-lg border-2 min-h-[120px]
        ${isToday ? 'bg-[#EAF3ED]' : 'bg-white'}
        border-[#E5E7EB] hover:border-[#1F5A2E]
        transition-all cursor-pointer
        flex flex-col items-start text-left
        min-w-0
      `}
    >
      {/* Event count badge */}
      <div className="flex items-center gap-2 mb-2 w-full">
        <Badge
          variant={eventCount > 0 ? 'default' : 'secondary'}
          className={`
            text-xs
            ${eventCount > 0 ? 'bg-[#1F5A2E] hover:bg-[#154021]' : ''}
          `}
        >
          <Calendar className="w-3 h-3 mr-1" />
          {eventCount} {eventCount === 1 ? 'event' : 'events'}
        </Badge>
      </div>

      {/* Preview of locked event titles */}
      {lockedEvents.length > 0 ? (
        <div className="flex-1 w-full space-y-1">
          {lockedEvents.slice(0, 2).map((event, index) => (
            <div
              key={event.id}
              className="text-xs font-bold text-[#1F5A2E] truncate w-full"
            >
              {event.details.split('\n')[0] || 'Event ' + (index + 1)}
            </div>
          ))}
          {lockedEvents.length > 2 && (
            <div className="text-xs text-gray-500 italic">
              +{lockedEvents.length - 2} more locked
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 italic">
          Click to manage events
        </div>
      )}
    </motion.button>
  );
}
