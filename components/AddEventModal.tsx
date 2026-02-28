'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // ISO date string
  dayLabel: string; // e.g., "Monday, Feb 23"
  onSave: (details: string) => void;
}

export function AddEventModal({
  open,
  onOpenChange,
  date,
  dayLabel,
  onSave,
}: AddEventModalProps) {
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setDetails('');
      setError('');
    }
  }, [open]);

  const handleSave = () => {
    const trimmedDetails = details.trim();

    if (!trimmedDetails) {
      setError('Event details are required');
      return;
    }

    onSave(trimmedDetails);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1F5A2E] text-xl">
            Add New Event
          </DialogTitle>
          <DialogDescription>
            Creating event for <span className="font-semibold">{dayLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event details */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Event Details *
            </label>
            <Textarea
              placeholder="Event name, location, time, notes..."
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
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
