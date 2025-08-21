"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
  description: string
}

interface SignupStepperProps {
  currentStep: number
  steps: Step[]
}

export function SignupStepper({ currentStep, steps }: SignupStepperProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                  isCompleted
                    ? "border-green-500 bg-green-500 text-white"
                    : isActive
                    ? "border-gray-900 bg-white text-gray-900"
                    : "border-gray-300 bg-white text-gray-400"
                )}
                data-completed={isCompleted ? "true" : undefined}
                data-active={isActive ? "true" : undefined}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <span className="text-base font-semibold">{step.number}</span>
                )}
              </div>
              
              {/* Step Text - Hidden on mobile, shown on desktop */}
              <div className="hidden md:block ml-3">
                <p className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isCompleted ? "text-gray-900" : isActive ? "text-gray-900" : "text-gray-500"
                )}>
                  Step {step.number}
                </p>
                <p className={cn(
                  "text-xs whitespace-nowrap",
                  isCompleted || isActive ? "text-gray-600" : "text-gray-400"
                )}>
                  {step.title}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 mx-2 md:mx-4 connector">
                <div
                  className={cn(
                    "h-0.5 transition-all duration-200",
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Vertical version for mobile sidebar
export function SignupStepperVertical({ currentStep, steps }: SignupStepperProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.number} className="relative">
            <div className="flex items-start">
              {/* Step Circle */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 flex-shrink-0",
                  isCompleted
                    ? "border-green-500 bg-green-500 text-white"
                    : isActive
                    ? "border-gray-900 bg-white text-gray-900"
                    : "border-gray-300 bg-white text-gray-400"
                )}
                data-completed={isCompleted ? "true" : undefined}
                data-active={isActive ? "true" : undefined}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>

              {/* Step Text */}
              <div className="ml-3">
                <p className={cn(
                  "text-sm",
                  isCompleted || isActive ? "text-gray-900" : "text-gray-500"
                )}>
                  <span className="font-medium">Step {step.number}:</span> {step.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-4 top-8 w-0.5 h-8 transition-all duration-200",
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}