'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, Trash2, Check, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { getCoverageStatus, formatPhone, maskPhoneInput, isValidPhone, cleanPhone, isDuplicateVolunteer, generateId } from '@/lib/utils-calendar';
import type { Event, RoleDefinition, VolunteerEntry } from '@/lib/types';

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  roles: RoleDefinition[];
  onUpdateEvent: (eventId: string, details: string) => void;
  onToggleLock: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddVolunteer: (eventId: string, roleId: string, volunteer: VolunteerEntry) => void;
  onRemoveVolunteer: (eventId: string, roleId: string, volunteerId: string) => void;
  onRequestUnlock: () => void;
  onRequestDelete: () => void;
}

interface AddFormState {
  roleId: string | null;
  name: string;
  phone: string;
  error: string;
}

export function EventDetailModal({
  open,
  onClose,
  event,
  roles,
  onUpdateEvent,
  onToggleLock,
  onDeleteEvent,
  onAddVolunteer,
  onRemoveVolunteer,
  onRequestUnlock,
  onRequestDelete,
}: EventDetailModalProps) {
  const [editedDetails, setEditedDetails] = useState('');
  const [addForms, setAddForms] = useState<Record<string, AddFormState>>({});

  // Reset state when event changes or modal closes
  useEffect(() => {
    if (event) {
      setEditedDetails(event.details);
    }
    if (!open) {
      setAddForms({});
    }
  }, [event, open]);

  if (!event || !open) return null;

  const isEditing = !event.locked;

  const handleToggleLockClick = () => {
    if (event.locked) {
      // Unlocking - show confirmation
      onRequestUnlock();
    } else {
      // Locking - save and lock
      const trimmedDetails = editedDetails.trim();
      if (trimmedDetails) {
        onUpdateEvent(event.id, trimmedDetails);
        onToggleLock(event.id);
      }
    }
  };

  const openAddForm = (roleId: string) => {
    setAddForms((prev) => ({
      ...prev,
      [roleId]: { roleId, name: '', phone: '', error: '' },
    }));
  };

  const closeAddForm = (roleId: string) => {
    setAddForms((prev) => {
      const newForms = { ...prev };
      delete newForms[roleId];
      return newForms;
    });
  };

  const handlePhoneChange = (roleId: string, value: string) => {
    const masked = maskPhoneInput(value);
    setAddForms((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], phone: masked, error: '' },
    }));
  };

  const handleAddVolunteer = (roleId: string) => {
    const form = addForms[roleId];
    if (!form) return;

    const name = form.name.trim();
    const phone = form.phone;

    if (!name) {
      setAddForms((prev) => ({
        ...prev,
        [roleId]: { ...prev[roleId], error: 'Name is required' },
      }));
      return;
    }

    if (!isValidPhone(phone)) {
      setAddForms((prev) => ({
        ...prev,
        [roleId]: { ...prev[roleId], error: 'Valid 10-digit phone required' },
      }));
      return;
    }

    const existingVolunteers = event.roles[roleId] || [];
    if (isDuplicateVolunteer(existingVolunteers, name, phone)) {
      setAddForms((prev) => ({
        ...prev,
        [roleId]: { ...prev[roleId], error: 'Already signed up for this role' },
      }));
      return;
    }

    const volunteer: VolunteerEntry = {
      id: generateId(),
      name,
      phone: cleanPhone(phone),
    };

    onAddVolunteer(event.id, roleId, volunteer);
    closeAddForm(roleId);
  };

  const handleKeyPress = (e: React.KeyboardEvent, roleId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVolunteer(roleId);
    } else if (e.key === 'Escape') {
      closeAddForm(roleId);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              fixed inset-4 md:inset-8 lg:inset-16 z-50
              bg-white rounded-lg shadow-2xl
              overflow-hidden flex flex-col
            "
          >
            {/* Header */}
            <div className="bg-[#1F5A2E] text-white p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold flex-1 min-w-0 mr-4">
                Event Details
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleLockClick}
                  size="sm"
                  className="bg-white text-[#1F5A2E] hover:bg-gray-100 font-semibold"
                  title={event.locked ? 'Unlock to update event details' : 'Lock and save changes'}
                >
                  {event.locked ? (
                    <>
                      <Unlock className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Unlock to Update Event Details</span>
                      <span className="sm:hidden">Unlock</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Lock & Save</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={onRequestDelete}
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <Button
                  onClick={onClose}
                  size="sm"
                  className="bg-white/10 text-white hover:bg-white/20"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Event details */}
              <div className="mb-6 p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]">
                {isEditing ? (
                  <Textarea
                    value={editedDetails}
                    onChange={(e) => setEditedDetails(e.target.value)}
                    className="min-h-[100px] font-medium"
                    placeholder="Event details..."
                  />
                ) : (
                  <div className="text-sm font-bold text-gray-800 whitespace-pre-wrap">
                    {event.details}
                  </div>
                )}
              </div>

              {/* Roles and volunteer signups */}
              <div className="space-y-4">
                {roles.map((role) => {
                  const volunteers = event.roles[role.id] || [];
                  const { current, minimum, isMet } = getCoverageStatus(event, role);
                  const isAddingToThisRole = !!addForms[role.id];

                  return (
                    <div
                      key={role.id}
                      className="border-2 rounded-lg p-4 bg-white border-[#E5E7EB]"
                    >
                      {/* Role header with coverage */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold text-[#1F5A2E]">
                            {role.label}
                          </h3>
                          <div
                            className={`
                              px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1
                              ${isMet ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}
                            `}
                          >
                            <span>{current}/{minimum}</span>
                            {isMet ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>

                        {!isAddingToThisRole && (
                          <Button
                            onClick={() => openAddForm(role.id)}
                            size="sm"
                            className="bg-[#1F5A2E] hover:bg-[#154021]"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>

                      {/* Volunteer chips */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          <AnimatePresence>
                            {volunteers.map((volunteer) => (
                              <motion.div
                                key={volunteer.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                layout
                              >
                                <Badge
                                  variant="secondary"
                                  className="
                                    flex items-center gap-1.5 px-3 py-1.5
                                    bg-[#EAF3ED] hover:bg-[#1F5A2E] hover:text-white
                                    transition-colors group text-sm
                                  "
                                >
                                  <span className="font-medium">{volunteer.name}</span>
                                  <span className="text-gray-600 group-hover:text-white text-xs">
                                    {formatPhone(volunteer.phone)}
                                  </span>
                                  <button
                                    onClick={() => onRemoveVolunteer(event.id, role.id, volunteer.id)}
                                    className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                                    aria-label={`Remove ${volunteer.name}`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {volunteers.length === 0 && !isAddingToThisRole && (
                            <span className="text-sm text-gray-400 italic py-1">
                              No volunteers yet
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Inline add form */}
                      <AnimatePresence>
                        {isAddingToThisRole && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-[#E5E7EB]">
                              <div className="space-y-2">
                                <Input
                                  placeholder="Volunteer name"
                                  value={addForms[role.id].name}
                                  onChange={(e) =>
                                    setAddForms((prev) => ({
                                      ...prev,
                                      [role.id]: {
                                        ...prev[role.id],
                                        name: e.target.value,
                                        error: '',
                                      },
                                    }))
                                  }
                                  onKeyDown={(e) => handleKeyPress(e, role.id)}
                                  className="focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
                                  autoFocus
                                />
                                <Input
                                  placeholder="(555) 123-4567"
                                  value={addForms[role.id].phone}
                                  onChange={(e) => handlePhoneChange(role.id, e.target.value)}
                                  onKeyDown={(e) => handleKeyPress(e, role.id)}
                                  maxLength={14}
                                  className="focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
                                />

                                {addForms[role.id].error && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-1 text-red-600 text-sm p-2 bg-red-50 rounded"
                                  >
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{addForms[role.id].error}</span>
                                  </motion.div>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleAddVolunteer(role.id)}
                                    size="sm"
                                    className="flex-1 bg-[#1F5A2E] hover:bg-[#154021]"
                                  >
                                    Add Volunteer
                                  </Button>
                                  <Button
                                    onClick={() => closeAddForm(role.id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E5E7EB] p-4 md:p-6 bg-gray-50">
              <Button
                onClick={onClose}
                className="w-full md:w-auto bg-[#1F5A2E] hover:bg-[#154021]"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
