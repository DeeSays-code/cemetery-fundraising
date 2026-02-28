'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekDays: Date[];
  onSaveEvent: (date: string, eventDetails: string) => void;
}

export function AdminEventModal({
  open,
  onOpenChange,
  weekDays,
  onSaveEvent,
}: AdminEventModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [eventDetails, setEventDetails] = useState('');
  const [error, setError] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Default to first day of the week
      if (weekDays.length > 0) {
        setSelectedDate(weekDays[0].toISOString().split('T')[0]);
      }
    } else {
      setEventDetails('');
      setError('');
    }
  }, [open, weekDays]);

  const handleSave = () => {
    const trimmed = eventDetails.trim();

    if (!trimmed) {
      setError('Event details are required');
      return;
    }

    if (!selectedDate) {
      setError('Please select a day');
      return;
    }

    // Save event and close
    onSaveEvent(selectedDate, trimmed);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const formatDateOption = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1F5A2E] text-xl">
            Create New Event (Admin)
          </DialogTitle>
          <DialogDescription>
            Select a day and add event details. The event will be locked once saved and ready for volunteer signups.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Day selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Day
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="
                w-full h-10 px-3 rounded-lg border-2 border-[#E5E7EB]
                focus:border-[#1F5A2E] focus:ring-2 focus:ring-[#1F5A2E] focus:ring-opacity-20
                text-sm
              "
            >
              {weekDays.map((day) => {
                const dateStr = day.toISOString().split('T')[0];
                return (
                  <option key={dateStr} value={dateStr}>
                    {formatDateOption(day)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Event details */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Event Details
            </label>
            <Textarea
              placeholder="Event name, location, time, notes..."
              value={eventDetails}
              onChange={(e) => {
                setEventDetails(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyPress}
              className="min-h-[120px] focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border">Cmd/Ctrl + Enter</kbd> to save quickly
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#1F5A2E] hover:bg-[#154021] text-white"
          >
            Save Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
