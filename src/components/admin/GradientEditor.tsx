import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

interface GradientEditorProps {
  isOpen: boolean;
  gradientName: string;
  initialGradient: string;
  onClose: () => void;
  onSave: (gradient: string) => void;
}

const GradientEditor: React.FC<GradientEditorProps> = ({
  isOpen,
  gradientName,
  initialGradient,
  onClose,
  onSave
}) => {
  const [colorStops, setColorStops] = useState<ColorStop[]>([]);
  const [direction, setDirection] = useState<number>(135); // Default 135deg
  const gradientRef = useRef<HTMLDivElement>(null);

  // Parse gradient string into color stops
  useEffect(() => {
    if (initialGradient) {
      const stops = parseGradientString(initialGradient);
      setColorStops(stops);
      
      // Extract direction from gradient string
      const dirMatch = initialGradient.match(/(\d+)deg/);
      if (dirMatch) {
        setDirection(parseInt(dirMatch[1]));
      }
    }
  }, [initialGradient]);

  const parseGradientString = (gradientStr: string): ColorStop[] => {
    // Parse "linear-gradient(135deg, #000000 0%, #F9FAFB 100%)"
    const matches = gradientStr.match(/#[a-fA-F0-9]{6}\s+\d+%/g);
    if (!matches) {
      // Default stops if parsing fails
      return [
        { id: '1', color: '#000000', position: 0 },
        { id: '2', color: '#F9FAFB', position: 100 }
      ];
    }
    
    return matches.map((match, index) => {
      const [color, position] = match.split(' ');
      return {
        id: String(index + 1),
        color: color,
        position: parseInt(position.replace('%', ''))
      };
    });
  };

  const generateGradientString = (): string => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    return `linear-gradient(${direction}deg, ${stopsStr})`;
  };

  const addColorStop = () => {
    const newPosition = colorStops.length > 0 
      ? Math.min(100, Math.max(...colorStops.map(s => s.position)) + 20)
      : 50;
    
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#6B7280',
      position: newPosition
    };
    
    setColorStops([...colorStops, newStop]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter(stop => stop.id !== id));
    }
  };

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setColorStops(colorStops.map(stop => 
      stop.id === id ? { ...stop, ...updates } : stop
    ));
  };

  const handlePositionChange = (id: string, newPosition: number) => {
    const clampedPosition = Math.max(0, Math.min(100, newPosition));
    updateColorStop(id, { position: clampedPosition });
  };

  const handleSave = () => {
    const gradientString = generateGradientString();
    onSave(gradientString);
  };

  if (!isOpen) return null;

  const currentGradient = generateGradientString();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit {gradientName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Gradient Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div
            ref={gradientRef}
            className="w-full h-24 rounded-lg border border-gray-200 relative"
            style={{ background: currentGradient }}
          >
            {/* Color stop indicators */}
            {colorStops.map((stop) => (
              <div
                key={stop.id}
                className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-400 rounded-full cursor-pointer transform -translate-x-1/2"
                style={{ left: `${stop.position}%` }}
                onClick={() => {
                  // Focus on this color stop for editing
                }}
              />
            ))}
          </div>
        </div>

        {/* Direction Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Direction: {direction}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={direction}
            onChange={(e) => setDirection(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0° (→)</span>
            <span>90° (↓)</span>
            <span>180° (←)</span>
            <span>270° (↑)</span>
          </div>
        </div>

        {/* Color Stops */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Color Stops
            </label>
            <button
              onClick={addColorStop}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Stop
            </button>
          </div>
          
          <div className="space-y-3">
            {colorStops.map((stop) => (
              <div key={stop.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {/* Color Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                    className="w-10 h-10 border border-gray-200 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="#000000"
                  />
                </div>
                
                {/* Position Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => handlePositionChange(stop.id, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => handlePositionChange(stop.id, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                
                {/* Remove Button */}
                {colorStops.length > 2 && (
                  <button
                    onClick={() => removeColorStop(stop.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current CSS Value */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSS Value
          </label>
          <div className="p-3 bg-gray-100 rounded-lg">
            <code className="text-sm text-gray-800 break-all">
              {currentGradient}
            </code>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-primary-dark-purple transition-colors duration-200"
          >
            Save Gradient
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradientEditor;