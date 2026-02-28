'use client';

import React from 'react';
import { getCoverageStatus } from '@/lib/utils-calendar';
import type { Event, RoleDefinition } from '@/lib/types';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
  roles: RoleDefinition[];
  onClick: () => void;
}

export function EventCard({ event, roles, onClick }: EventCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="
        w-full text-left p-3 rounded-lg
        bg-[#EAF3ED] border-2 border-[#1F5A2E]
        hover:shadow-md hover:scale-[1.02]
        transition-all duration-200
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Event details - auto-capitalized for formatting */}
      <div className="mb-2">
        <div className="text-xs font-bold text-[#1F5A2E] line-clamp-3 whitespace-pre-wrap uppercase">
          {event.details}
        </div>
      </div>

      {/* Coverage indicators */}
      <div className="space-y-1">
        {roles.map((role) => {
          const { current, minimum, isMet } = getCoverageStatus(event, role);
          return (
            <div
              key={role.id}
              className={`
                flex items-center justify-between px-2 py-1 rounded text-xs font-medium
                ${isMet ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}
              `}
            >
              <span className="truncate flex-1">{role.label}</span>
              <span className="ml-2 font-bold">
                {current}/{minimum}
              </span>
            </div>
          );
        })}
      </div>
    </motion.button>
  );
}
