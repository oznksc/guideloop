// TailwindTooltip.tsx
"use client"
import React from 'react';
import type { BaseTooltipProps } from './types';
import type { Step } from '../Walkthrough';

export const TailwindTooltip: React.FC<BaseTooltipProps> = ({
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
      className="absolute bg-white rounded-lg shadow-xl p-6 w-[300px] border border-gray-200"
      style={position}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </div>
        {(currentStepData.showButtons?.close ?? defaultShowButtons.close) && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors duration-150"
            aria-label="Close"
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
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {currentStepData.title}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {currentStepData.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        {(currentStepData.showButtons?.previous ?? defaultShowButtons.previous) && (
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className={`
              inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
              transition-colors duration-150 
              ${currentStep === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Previous
          </button>
        )}
        
        {(currentStepData.showButtons?.next ?? defaultShowButtons.next) && (
          <button
            onClick={onNext}
            className="
              inline-flex items-center px-4 py-2 text-sm font-medium text-white
              bg-blue-600 rounded-md hover:bg-blue-700 
              transition-colors duration-150 ml-2
            "
          >
            {currentStep === totalSteps - 1 ? 'Finish' : (
              <>
                Next
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tooltip Pointer */}
      <div 
        className="absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45"
        style={{
          ...getTooltipPointerPosition(currentStepData.placement),
          borderTop: currentStepData.placement === 'bottom' ? 'none' : undefined,
          borderLeft: currentStepData.placement === 'right' ? 'none' : undefined,
          borderBottom: currentStepData.placement === 'top' ? 'none' : undefined,
          borderRight: currentStepData.placement === 'left' ? 'none' : undefined,
        }}
      />
    </div>
  );
};

// Tooltip pointer pozisyonu için yardımcı fonksiyon
const getTooltipPointerPosition = (placement: Step['placement'] = 'bottom') => {
  switch (placement) {
    case 'top':
      return {
        bottom: '-6px',
        left: 'calc(50% - 6px)',
      };
    case 'bottom':
      return {
        top: '-6px',
        left: 'calc(50% - 6px)',
      };
    case 'left':
      return {
        right: '-6px',
        top: 'calc(50% - 6px)',
      };
    case 'right':
      return {
        left: '-6px',
        top: 'calc(50% - 6px)',
      };
  }
};