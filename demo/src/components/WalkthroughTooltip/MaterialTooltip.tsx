// MaterialTooltip.tsx
"use client"
import React from 'react';
import { Tooltip as MuiTooltip } from '@mui/material';
import type { BaseTooltipProps } from './types';
import type { Step } from '../Walkthrough';

export const MaterialTooltip: React.FC<BaseTooltipProps> = ({
  currentStep,
  totalSteps,
  currentStepData,
  defaultShowButtons,
  position,
  onNext,
  onPrev,
  onClose
}) => {
  // MUI için pozisyon hesaplama
  const getPlacement = (placement?: Step['placement']) => {
    switch (placement) {
      case 'top': return 'top';
      case 'bottom': return 'bottom';
      case 'left': return 'left';
      case 'right': return 'right';
      default: return 'bottom';
    }
  };

  return (
    <MuiTooltip
      open={true}
      arrow
      placement={getPlacement(currentStepData.placement)}
      PopperProps={{
        style: {
          position: 'fixed',
          ...position
        },
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport'
            },
          }
        ]
      }}
      title={
        <div className="min-w-[280px] p-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-300">
              Step {currentStep + 1} of {totalSteps}
            </span>
            {(currentStepData.showButtons?.close ?? defaultShowButtons.close) && (
              <button
                onClick={onClose}
                className="p-1 text-gray-300 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="mb-2 font-medium text-lg">
            {currentStepData.title}
          </div>
          
          <div className="mb-3 text-gray-200">
            {currentStepData.content}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            {(currentStepData.showButtons?.previous ?? defaultShowButtons.previous) && (
              <button
                onClick={onPrev}
                disabled={currentStep === 0}
                className="text-sm text-blue-300 disabled:text-gray-500 hover:text-blue-200"
              >
                Previous
              </button>
            )}
            
            {(currentStepData.showButtons?.next ?? defaultShowButtons.next) && (
              <button
                onClick={onNext}
                className="text-sm bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="w-px h-px opacity-0 fixed" style={position} />
    </MuiTooltip>
  );
};