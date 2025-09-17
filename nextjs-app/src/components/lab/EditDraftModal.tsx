'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftName: string;
  draftDescription?: string;
  onSave: (name: string, description: string) => void;
}

export function EditDraftModal({
  open,
  onOpenChange,
  draftName,
  draftDescription = '',
  onSave,
}: EditDraftModalProps) {
  const [name, setName] = useState(draftName);
  const [description, setDescription] = useState(draftDescription);

  const handleSave = () => {
    onSave(name, description);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(draftName);
      setDescription(draftDescription);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Draft Details</DialogTitle>
          <DialogDescription>
            Update the name and description for this draft.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="draft-name">Name</Label>
            <Input
              id="draft-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter draft name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="draft-description">Description</Label>
            <Textarea
              id="draft-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter draft description"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}