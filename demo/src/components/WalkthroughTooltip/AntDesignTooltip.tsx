// AntDesignTooltip.tsx
"use client"
import React from 'react';
import type { BaseTooltipProps } from './types';
import type { Step } from '../Walkthrough';

export const AntDesignTooltip: React.FC<BaseTooltipProps> = ({
  currentStep,
  totalSteps,
  currentStepData,
  defaultShowButtons,
  position,
  onNext,
  onPrev,
  onClose
}) => {
  return (
    <div 
      className="absolute shadow-lg rounded-lg bg-gray-900 text-white" 
      style={{
        ...position,
        minWidth: '300px',
        padding: '1rem',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-300">
          Step {currentStep + 1} of {totalSteps}
        </span>
        {(currentStepData.showButtons?.close ?? defaultShowButtons.close) && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="text-lg font-medium">
          {currentStepData.title}
        </div>
        <div className="text-gray-300 text-sm leading-relaxed">
          {currentStepData.content}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
        {(currentStepData.showButtons?.previous ?? defaultShowButtons.previous) && (
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className={`
              px-4 py-1.5 text-sm rounded
              ${currentStep === 0
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
              }
              transition-colors duration-150
            `}
          >
            Previous
          </button>
        )}
        
        {(currentStepData.showButtons?.next ?? defaultShowButtons.next) && (
          <button
            onClick={onNext}
            className="
              px-4 py-1.5 text-sm bg-blue-500 text-white rounded
              hover:bg-blue-600 transition-colors duration-150
            "
          >
            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>

      {/* Tooltip Arrow */}
      <div
        className="absolute w-3 h-3 bg-gray-900 transform rotate-45"
        style={getArrowStyle(currentStepData.placement)}
      />
    </div>
  );
};

const getArrowStyle = (placement: Step['placement'] = 'bottom'): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
  };

  switch (placement) {
    case 'top':
      return {
        ...baseStyle,
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      };
    case 'bottom':
      return {
        ...baseStyle,
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
      };
    case 'left':
      return {
        ...baseStyle,
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
      };
    case 'right':
      return {
        ...baseStyle,
        left: '-6px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
      };
    default:
      return baseStyle;
  }
};