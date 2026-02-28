'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from './EventCard';
import { formatDayHeader, toISODate, isToday } from '@/lib/utils-calendar';
import type { Event, RoleDefinition } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface DayCardProps {
  day: Date;
  events: Event[];
  roles: RoleDefinition[];
  onEventClick: (event: Event) => void;
  onAddEventClick: (date: string, dayLabel: string) => void;
}

export function DayCard({
  day,
  events,
  roles,
  onEventClick,
  onAddEventClick,
}: DayCardProps) {
  const [showAll, setShowAll] = useState(false);
  const { dayName, dateStr } = formatDayHeader(day);
  const date = toISODate(day);
  const isTodayDate = isToday(day);

  const MAX_VISIBLE = 3;
  const visibleEvents = showAll ? events : events.slice(0, MAX_VISIBLE);
  const hiddenCount = events.length - MAX_VISIBLE;

  const handleAddEvent = () => {
    onAddEventClick(date, `${dayName}, ${dateStr}`);
  };

  return (
    <div
      className={`
        border-2 rounded-lg p-3 min-h-[400px] flex flex-col
        ${isTodayDate ? 'bg-[#EAF3ED] border-[#1F5A2E]' : 'bg-white border-[#E5E7EB]'}
      `}
    >
      {/* Events */}
      <div className="flex-1 space-y-2 mb-2">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs italic">
            No events yet
          </div>
        ) : (
          <>
            <AnimatePresence>
              {visibleEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventCard
                    event={event}
                    roles={roles}
                    onClick={() => onEventClick(event)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Show more/less button */}
            {hiddenCount > 0 && !showAll && (
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                size="sm"
                className="w-full text-xs hover:bg-[#EAF3ED] hover:border-[#1F5A2E]"
              >
                +{hiddenCount} more
              </Button>
            )}

            {showAll && events.length > MAX_VISIBLE && (
              <Button
                onClick={() => setShowAll(false)}
                variant="outline"
                size="sm"
                className="w-full text-xs hover:bg-[#EAF3ED] hover:border-[#1F5A2E]"
              >
                Show less
              </Button>
            )}
          </>
        )}
      </div>

      {/* Add event button */}
      <Button
        onClick={handleAddEvent}
        variant="outline"
        size="sm"
        className="w-full hover:bg-[#EAF3ED] hover:text-[#1F5A2E] hover:border-[#1F5A2E]"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add Event
      </Button>
    </div>
  );
}
