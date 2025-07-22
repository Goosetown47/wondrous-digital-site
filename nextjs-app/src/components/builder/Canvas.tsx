'use client';

import { HeroSection } from '@/components/sections/HeroSection';
import { useBuilderStore } from '@/stores/builderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type HeroContent } from '@/schemas/section';

export function Canvas() {
  const { sections, selectedSectionId, setSelectedSection, removeSection, updateSection } = 
    useBuilderStore();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Drop handling will be implemented in the parent component
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSectionContentChange = (sectionId: string, updates: Partial<HeroContent>) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        content: { ...section.content, ...updates }
      });
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {sections.length === 0 ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No sections yet</p>
            <p className="text-sm text-gray-400">
              Drag a section from the library to get started
            </p>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          {sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`relative group ${
                selectedSectionId === section.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedSection(section.id)}
            >
              {/* Delete button */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(section.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Render section based on type */}
              {section.type === 'hero' && (
                <HeroSection 
                  content={section.content as HeroContent}
                  isEditing={selectedSectionId === section.id}
                  onContentChange={(updates) => 
                    handleSectionContentChange(section.id, updates)
                  }
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}