/**
 * RoleRow Component
 *
 * Displays a role row across all 7 days with volunteer signup functionality
 *
 * KEY FEATURES:
 * - Name and phone number inputs for each day
 * - Phone number auto-formatting: (XXX) XXX-XXXX as user types
 * - Add button to create volunteer chips
 * - Duplicate prevention: blocks exact name+phone matches within same role/day
 * - Volunteer chips display with wrapping and dynamic height
 * - Remove functionality with animated transitions
 * - Cell expands vertically as more volunteers are added
 * - Internal scroll for very tall cells (10+ volunteers)
 * - All chips remain visible with wrapping
 *
 * PHONE NUMBER HANDLING:
 * - Input: Auto-masked as user types using maskPhoneInput()
 * - Storage: Stored as clean 10-digit string
 * - Display: Formatted as (XXX) XXX-XXXX in chips
 * - Validation: Requires exactly 10 digits
 *
 * DUPLICATE PREVENTION:
 * - Same role/day: Blocks duplicate with error message
 * - Different days in same role: Allows but could flag (future enhancement)
 */

'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  maskPhoneInput,
  isValidPhone,
  formatPhone,
  isDuplicateVolunteer,
  generateId,
  cleanPhone,
} from '@/lib/utils-calendar';
import type { VolunteerEntry, DayState } from '@/lib/types';

interface RoleRowProps {
  roleId: string;
  roleLabel: string;
  weekDays: Date[];
  daysData: Record<string, DayState>;
  todayDate: string;
  onAddVolunteer: (date: string, roleId: string, volunteer: VolunteerEntry) => void;
  onRemoveVolunteer: (date: string, roleId: string, volunteerId: string) => void;
  onRoleLabelClick: (roleId: string, roleLabel: string) => void;
}

interface DayInputState {
  name: string;
  phone: string;
  error: string;
}

export function RoleRow({
  roleId,
  roleLabel,
  weekDays,
  daysData,
  todayDate,
  onAddVolunteer,
  onRemoveVolunteer,
  onRoleLabelClick,
}: RoleRowProps) {
  // State for each day's inputs (indexed by ISO date)
  const [inputs, setInputs] = useState<Record<string, DayInputState>>({});

  const getInputState = (date: string): DayInputState => {
    return inputs[date] || { name: '', phone: '', error: '' };
  };

  const updateInput = (date: string, updates: Partial<DayInputState>) => {
    setInputs((prev) => ({
      ...prev,
      [date]: { ...getInputState(date), ...updates },
    }));
  };

  const handlePhoneChange = (date: string, value: string) => {
    const masked = maskPhoneInput(value);
    updateInput(date, { phone: masked, error: '' });
  };

  const handleAddVolunteer = (date: string) => {
    const state = getInputState(date);
    const name = state.name.trim();
    const phone = state.phone;

    // Validate inputs
    if (!name) {
      updateInput(date, { error: 'Name is required' });
      return;
    }

    if (!isValidPhone(phone)) {
      updateInput(date, { error: 'Please enter a valid 10-digit phone number' });
      return;
    }

    // Check for duplicates in the same role/day
    const dayState = daysData[date];
    const existingVolunteers = dayState?.roles[roleId] || [];

    if (isDuplicateVolunteer(existingVolunteers, name, phone)) {
      updateInput(date, { error: 'This volunteer is already signed up for this day' });
      return;
    }

    // Add volunteer
    const volunteer: VolunteerEntry = {
      id: generateId(),
      name,
      phone: cleanPhone(phone),
    };

    onAddVolunteer(date, roleId, volunteer);

    // Clear inputs
    updateInput(date, { name: '', phone: '', error: '' });
  };

  const handleRemoveVolunteer = (date: string, volunteerId: string) => {
    onRemoveVolunteer(date, roleId, volunteerId);
  };

  const handleKeyPress = (date: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVolunteer(date);
    }
  };

  return (
    <div className="grid grid-cols-[180px_repeat(7,1fr)] gap-2 mb-2">
      {/* Role label */}
      <button
        onClick={() => onRoleLabelClick(roleId, roleLabel)}
        className="
          flex items-center px-4 py-3 bg-[#1F5A2E] text-white rounded-lg
          font-semibold text-sm hover:bg-[#154021] transition-colors
          text-left cursor-pointer
        "
      >
        {roleLabel}
      </button>

      {/* Day cells */}
      {weekDays.map((day) => {
        const date = day.toISOString().split('T')[0];
        const dayState = daysData[date];
        const volunteers = dayState?.roles[roleId] || [];
        const inputState = getInputState(date);
        const isToday = date === todayDate;

        return (
          <div
            key={`${roleId}-${date}`}
            className={`
              p-3 rounded-lg border-2 border-[#E5E7EB]
              ${isToday ? 'bg-[#EAF3ED]' : 'bg-white'}
              hover:border-[#1F5A2E] transition-all
              min-h-[120px] flex flex-col
              min-w-0
            `}
          >
            {/* Input section */}
            <div className="space-y-2 mb-3">
              <Input
                placeholder="Name"
                value={inputState.name}
                onChange={(e) => updateInput(date, { name: e.target.value, error: '' })}
                onKeyPress={(e) => handleKeyPress(date, e)}
                className="h-8 text-sm focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
              />
              <Input
                placeholder="(555) 123-4567"
                value={inputState.phone}
                onChange={(e) => handlePhoneChange(date, e.target.value)}
                onKeyPress={(e) => handleKeyPress(date, e)}
                maxLength={14} // (XXX) XXX-XXXX
                className="h-8 text-sm focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
              />
              {inputState.error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-red-600 text-xs"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>{inputState.error}</span>
                </motion.div>
              )}
              <Button
                onClick={() => handleAddVolunteer(date)}
                size="sm"
                className="w-full h-8 bg-[#1F5A2E] hover:bg-[#154021] text-white transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Volunteers chips - with wrapping and dynamic height */}
            <div className="flex-1 overflow-auto max-h-[300px] min-w-0">
              <div className="flex flex-wrap gap-2 w-full">
                <AnimatePresence>
                  {volunteers.map((volunteer) => (
                    <motion.div
                      key={volunteer.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Badge
                        variant="secondary"
                        className="
                          flex items-center gap-1 px-2 py-1
                          bg-[#EAF3ED] hover:bg-[#1F5A2E] hover:text-white
                          transition-colors cursor-pointer group
                          text-xs max-w-full
                        "
                      >
                        <span className="font-medium truncate">{volunteer.name}</span>
                        <span className="text-gray-600 group-hover:text-white shrink-0">
                          {formatPhone(volunteer.phone)}
                        </span>
                        <button
                          onClick={() => handleRemoveVolunteer(date, volunteer.id)}
                          className="
                            ml-1 hover:bg-red-500 rounded-full p-0.5
                            transition-colors
                          "
                          aria-label={`Remove ${volunteer.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
