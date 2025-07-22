'use client';

import { Card } from '@/components/ui/card';
import { Type, Grid, Navigation, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionTypes = [
  {
    id: 'hero',
    name: 'Hero',
    icon: Type,
    description: 'Eye-catching header section',
  },
  {
    id: 'features',
    name: 'Features',
    icon: Grid,
    description: 'Showcase your features',
    disabled: true, // Not implemented yet
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: Navigation,
    description: 'Site navigation',
    disabled: true, // Not implemented yet
  },
  {
    id: 'footer',
    name: 'Footer',
    icon: Layers,
    description: 'Footer with links',
    disabled: true, // Not implemented yet
  },
];

interface SectionLibraryProps {
  onDragStart: (sectionType: string) => void;
}

export function SectionLibrary({ onDragStart }: SectionLibraryProps) {
  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wider">
        Section Library
      </h3>
      <div className="space-y-2">
        {sectionTypes.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              draggable={!section.disabled}
              onDragStart={() => !section.disabled && onDragStart(section.id)}
              whileHover={!section.disabled ? { scale: 1.02 } : {}}
              whileDrag={{ scale: 1.05 }}
              className={section.disabled ? 'opacity-50' : ''}
            >
              <Card 
                className={`p-4 cursor-${section.disabled ? 'not-allowed' : 'move'} transition-shadow ${
                  !section.disabled ? 'hover:shadow-md' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{section.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {section.description}
                    </p>
                    {section.disabled && (
                      <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}