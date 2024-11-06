import React, { useRef, useEffect } from 'react';
import { usePopper } from '../../hooks/usePopper';
import { getAnimationStyle } from '../../utils/animation';
import { ImageContentRenderer } from './ImageContent';
import type { TooltipProps } from './types';
import { useTheme } from '../../hooks/useTheme';

const defaultLabels = {
  next: 'Next',
  prev: 'Previous',
  skip: 'Skip',
  finish: 'Finish'
};

export const Tooltip: React.FC<TooltipProps> = ({
  step,
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
  style = {},
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const themeStyles = useTheme(theme, customTheme);

  // Find and set target element
  useEffect(() => {
    targetRef.current = document.querySelector(step.target);
  }, [step.target]);

  // Initialize Popper
  const { update } = usePopper({
    referenceElement: targetRef.current,
    tooltipElement: tooltipRef.current,
    placement: step.placement,
  });

  // Update popper position on window resize
  useEffect(() => {
    const handleResize = () => update();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [update]);

  const buttonLabels = {
    ...defaultLabels,
    ...defaultButtonLabels,
    ...step.buttonLabels
  };

  // Butonların görünürlük durumlarını belirle
  const showButtons = {
    next: step.showButtons?.next !== false && !isLast,
    previous: step.showButtons?.previous !== false && !isFirst,
    close: step.showButtons?.close !== false
  };

  return (
    <div
      ref={tooltipRef}
      className="fixed rounded-xl max-w-xs md:max-w-md"
      style={{
        ...themeStyles.tooltip,
        ...getAnimationStyle(animation, 'enter'),
        pointerEvents: 'auto',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        ...style
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
          {showButtons.previous && (
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
          {showButtons.close && (
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
              style={themeStyles.buttons.secondary}
            >
              {isLast ? buttonLabels.finish : buttonLabels.skip}
            </button>
          )}
          {showButtons.next && (
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