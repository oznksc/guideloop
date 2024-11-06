import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { TooltipProps } from './types';
import { calculateTooltipPosition } from '../../utils/position';
import { getAnimationStyle } from '../../utils/animation';

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
}) => {
  const themeStyles = useTheme(theme, customTheme);
  const tooltipPosition = calculateTooltipPosition(position, step.placement);

  return (
    <div
      className="fixed pointer-events-auto"
      style={{
        ...tooltipPosition,
        ...themeStyles.tooltip,
        ...getAnimationStyle(animation, 'enter')
      }}
      role="tooltip"
    >
      {/* Progress indicator */}
      <div className="text-sm text-gray-500 mb-2">
        Step {currentStep + 1} of {totalSteps}
      </div>

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
              Previous
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            style={themeStyles.buttons.secondary}
          >
            {isLast ? 'Finish' : 'Skip'}
          </button>
          {!isLast && (
            <button
              onClick={onNext}
              className="bg-blue-600 text-white"
              style={themeStyles.buttons.primary}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};