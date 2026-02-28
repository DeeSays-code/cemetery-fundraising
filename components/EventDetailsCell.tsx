'use client';

import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import type { EventDetails } from '@/lib/types';

interface EventDetailsCellProps {
  date: string;
  eventDetails: EventDetails;
  onUpdate: (date: string, text: string) => void;
  onToggleLock: (date: string) => void;
  isToday?: boolean;
}

export function EventDetailsCell({
  date,
  eventDetails,
  onUpdate,
  onToggleLock,
  isToday = false,
}: EventDetailsCellProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const handleLockClick = () => {
    if (eventDetails.locked) {
      // Show confirmation modal before unlocking
      setShowUnlockModal(true);
    } else {
      // Lock immediately
      onToggleLock(date);
    }
  };

  const handleConfirmUnlock = () => {
    onToggleLock(date);
    setShowUnlockModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: eventDetails.locked ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
        className={`
          p-3 rounded-lg border-2 min-h-[120px]
          ${isToday ? 'bg-[#EAF3ED]' : 'bg-white'}
          ${eventDetails.locked ? 'border-gray-300' : 'border-[#E5E7EB] hover:border-[#1F5A2E]'}
          transition-all
          min-w-0
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">Event Details</span>
          <div className="flex items-center gap-2">
            {eventDetails.locked && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
            <Button
              onClick={handleLockClick}
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-[#EAF3ED] transition-colors"
              aria-label={eventDetails.locked ? 'Unlock event' : 'Lock event'}
            >
              {eventDetails.locked ? (
                <Unlock className="w-4 h-4 text-[#1F5A2E]" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500 hover:text-[#1F5A2E]" />
              )}
            </Button>
          </div>
        </div>

        <Textarea
          value={eventDetails.text}
          onChange={(e) => onUpdate(date, e.target.value)}
          disabled={eventDetails.locked}
          placeholder="Event name, location, time, notes..."
          className={`
            resize-none min-h-[80px] text-sm
            ${eventDetails.locked ? 'cursor-not-allowed bg-gray-50' : ''}
            focus:border-[#1F5A2E] focus:ring-[#1F5A2E]
          `}
        />
      </motion.div>

      {/* Unlock confirmation modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Event Details?</DialogTitle>
            <DialogDescription>
              The event has been locked. Are you sure you want to edit it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnlockModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUnlock}
              className="bg-[#1F5A2E] hover:bg-[#154021] text-white"
            >
              Yes, unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
