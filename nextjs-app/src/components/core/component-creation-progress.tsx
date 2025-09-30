'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProgressStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

interface ComponentCreationProgressProps {
  isOpen: boolean;
  onClose: () => void;
  componentName: string;
  steps: ProgressStep[];
}

const stepLabels: Record<string, string> = {
  generating_name: 'Generating Component Name',
  saving_to_database: 'Saving to Database',
  creating_files: 'Creating Component Files',
  updating_registry: 'Updating Component Registry',
  finalizing: 'Finalizing'
};

export function ComponentCreationProgress({
  isOpen,
  onClose,
  componentName,
  steps
}: ComponentCreationProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completedSteps = steps.filter(
      s => s.status === 'completed' || s.status === 'error'
    ).length;
    const progressValue = (completedSteps / steps.length) * 100;
    setProgress(progressValue);
  }, [steps]);

  const isComplete = steps.every(s => s.status === 'completed');
  const hasError = steps.some(s => s.status === 'error');

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isComplete ? 'Component Created Successfully!' :
             hasError ? 'Component Creation Partially Complete' :
             'Creating Component...'}
          </DialogTitle>
          <DialogDescription>
            {componentName && `Component: ${componentName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Progress value={progress} className="h-2" />

          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.step}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg transition-colors",
                  step.status === 'in_progress' && "bg-blue-50 dark:bg-blue-900/20",
                  step.status === 'completed' && "bg-green-50 dark:bg-green-900/20",
                  step.status === 'error' && "bg-red-50 dark:bg-red-900/20"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    step.status === 'pending' && "text-gray-500"
                  )}>
                    {stepLabels[step.step] || step.step}
                  </p>
                  {step.message && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(isComplete || hasError) && (
            <div className="pt-2 flex justify-end">
              <Button onClick={onClose}>
                {hasError ? 'Close' : 'Done'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}