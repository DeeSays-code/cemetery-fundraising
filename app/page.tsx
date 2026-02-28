'use client';

import React from 'react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { exportCalendarToPDF } from '@/lib/pdf-export';
import type { DayState, RoleDefinition } from '@/lib/types';

export default function Home() {
  const handleExportPDF = async (data: {
    weekStart: Date;
    weekDays: Date[];
    daysData: Record<string, DayState>;
    roles: RoleDefinition[];
  }) => {
    try {
      await exportCalendarToPDF(data);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <CalendarGrid onExportPDF={handleExportPDF} />
    </div>
  );
}
