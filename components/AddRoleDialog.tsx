'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRole: (roleName: string) => void;
}

export function AddRoleDialog({ open, onOpenChange, onAddRole }: AddRoleDialogProps) {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setRoleName('');
      setError('');
    }
  }, [open]);

  const handleAdd = () => {
    const trimmedName = roleName.trim();

    // Validate
    if (!trimmedName) {
      setError('Role name is required');
      return;
    }

    // Add role and close dialog
    onAddRole(trimmedName);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1F5A2E]">Add Custom Role</DialogTitle>
          <DialogDescription>
            Enter a name for the new role. It will be added to all days in the calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="e.g., Event coordinator, Setup crew..."
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className="focus:border-[#1F5A2E] focus:ring-[#1F5A2E]"
              autoFocus
            />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-[#1F5A2E] hover:bg-[#154021] text-white"
          >
            Add Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
