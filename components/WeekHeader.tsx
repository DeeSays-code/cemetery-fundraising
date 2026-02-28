'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDayHeader, isToday } from '@/lib/utils-calendar';
import { motion } from 'framer-motion';

interface WeekHeaderProps {
  weekDays: Date[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onExportPDF: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function WeekHeader({
  weekDays,
  onPrevWeek,
  onNextWeek,
  onToday,
  onExportPDF,
  canGoPrev,
  canGoNext,
}: WeekHeaderProps) {
  return (
    <div className="mb-4">
      {/* Navigation bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#1F5A2E]">
          Muslim Ummah Cemetery Fundraising Signup
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={onToday}
            variant="outline"
            size="sm"
            className="hover:bg-[#EAF3ED] transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>

          <div className="flex items-center gap-1">
            <Button
              onClick={onPrevWeek}
              disabled={!canGoPrev}
              variant="outline"
              size="icon"
              className="hover:bg-[#EAF3ED] transition-colors disabled:opacity-50"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              onClick={onNextWeek}
              disabled={!canGoNext}
              variant="outline"
              size="icon"
              className="hover:bg-[#EAF3ED] transition-colors disabled:opacity-50"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={onExportPDF}
            variant="default"
            size="sm"
            className="bg-[#1F5A2E] hover:bg-[#154021] text-white transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day/date labels */}
        {weekDays.map((day, index) => {
          const { dayName, dateStr } = formatDayHeader(day);
          const isTodayDate = isToday(day);

          return (
            <motion.div
              key={`header-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg
                border-2 transition-all
                ${
                  isTodayDate
                    ? 'bg-[#1F5A2E] text-white border-[#1F5A2E]'
                    : 'bg-white border-[#E5E7EB] hover:border-[#1F5A2E]'
                }
              `}
            >
              <div className={`text-sm font-semibold ${isTodayDate ? 'text-white' : 'text-gray-600'}`}>
                {dayName}
              </div>
              <div className={`text-lg font-bold ${isTodayDate ? 'text-white' : 'text-[#1F5A2E]'}`}>
                {dateStr}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
