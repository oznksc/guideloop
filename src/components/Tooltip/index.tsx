import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { TooltipProps } from './types';
import { calculateTooltipPosition } from '../../utils/position';
import { getAnimationStyle } from '../../utils/animation';
import { ImageContentRenderer } from './ImageContent';

const defaultLabels = {
  next: 'Next',
  prev: 'Previous',
  skip: 'Skip',
  finish: 'Finish'
};


export const Tooltip: React.FC<TooltipProps> = ({
  step,
  position,
  theme,
  customTheme,
  onNext,
  onPrev,
  onClose,
  isFirst,
  isLast,
  currentStep,
  totalSteps,
  animation,
  defaultButtonLabels = defaultLabels,

}) => {
  const themeStyles = useTheme(theme, customTheme);
  const tooltipPosition = calculateTooltipPosition(position, step.placement);

  const buttonLabels = {
    ...defaultLabels,
    ...defaultButtonLabels,
    ...step.buttonLabels
  };


  return (
    <div
      className="fixed"
      style={{
        ...tooltipPosition,
        ...themeStyles.tooltip,
        ...getAnimationStyle(animation, 'enter'),
        pointerEvents: 'auto',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
      role="tooltip"
    >
      {/* Progress indicator */}
      <div className="text-sm text-gray-500 mb-2">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {/* Image content if exists */}
      {step.image && (
        <div className="flex justify-center">
          <ImageContentRenderer image={step.image} />
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          {step.title}
        </h3>
        <div className="text-gray-600">
          {step.content}
        </div>
      </div>

       {/* Navigation buttons */}
       <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
        <div>
          {!isFirst && (
            <button
              onClick={onPrev}
              className="text-gray-600 hover:text-gray-900"
              style={themeStyles.buttons.secondary}
            >
              {buttonLabels.prev}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            style={themeStyles.buttons.secondary}
          >
            {isLast ? buttonLabels.finish : buttonLabels.skip}
          </button>
          {!isLast && (
            <button
              onClick={onNext}
              className="bg-blue-600 text-white"
              style={themeStyles.buttons.primary}
            >
              {buttonLabels.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};