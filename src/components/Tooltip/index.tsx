import React, { useRef, useEffect } from 'react';
import { usePopper } from '../../hooks/usePopper';
import { getAnimationStyle } from '../../utils/animation';
import { ImageContentRenderer } from './ImageContent';
import type { TooltipProps } from './types';
import { useTheme } from '../../hooks/useTheme';

// Type guard to check if an element is HTMLElement
const isHTMLElement = (element: Element | null): element is HTMLElement => {
  return element instanceof HTMLElement;
};

// Helper function to safely query and validate HTMLElement
const querySelectorAsHTMLElement = (selector: string): HTMLElement | null => {
  try {
    const element = document.querySelector(selector);
    return isHTMLElement(element) ? element : null;
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
};

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

  // Find and set target element with validation
  useEffect(() => {
    if (!step.target) {
      console.warn('GuideLoop: Empty target selector provided for step', currentStep + 1);
      targetRef.current = null;
      return;
    }

    const element = querySelectorAsHTMLElement(step.target);
    
    if (!element) {
      console.warn(`GuideLoop: No HTMLElement found for selector "${step.target}" in step`, currentStep + 1);
    }
    
    targetRef.current = element;
  }, [step.target, currentStep]);

  // Initialize Popper with null check
  const { update } = usePopper({
    referenceElement: targetRef.current,
    tooltipElement: tooltipRef.current,
    placement: step.placement || 'bottom',
  });

  // Update popper position on window resize with debounce
  useEffect(() => {
    if (!update) return;

    let timeoutId: number;
    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        requestAnimationFrame(update);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(timeoutId);
    };
  }, [update]);

  const buttonLabels = {
    ...defaultLabels,
    ...defaultButtonLabels,
    ...step.buttonLabels
  };

  const showButtons = {
    next: step.showButtons?.next !== false && !isLast,
    previous: step.showButtons?.previous !== false && !isFirst,
    close: step.showButtons?.close !== false
  };

  type ActionKind = 'prev' | 'next' | 'close';

  const renderActionButton = (
    kind: ActionKind,
    visible: boolean,
    label: string,
    handler: () => void,
    variant: 'secondary' | 'primary',
    defaultContent: React.ReactNode
  ) => {
    if (!visible) return null;

    const custom = step.buttons?.[kind];
    if (custom) {
      return (
        <button
          key={kind}
          type="button"
          onClick={handler}
          aria-label={label}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {custom}
        </button>
      );
    }

    return (
      <button
        key={kind}
        type="button"
        onClick={handler}
        className={variant === 'primary' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}
        style={variant === 'primary' ? themeStyles.buttons.primary : themeStyles.buttons.secondary}
        aria-label={label}
      >
        {defaultContent}
      </button>
    );
  };

  // Fallback position for tooltip when target is not found
  const fallbackStyle = !targetRef.current ? {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  } : {};

  return (
    <div
      ref={tooltipRef}
      className="fixed"
      style={{
        ...themeStyles.tooltip,
        ...getAnimationStyle(animation, 'enter'),
        pointerEvents: 'auto',
        maxWidth: '480px',
        overflowY: 'auto',
        ...fallbackStyle,
        ...style
      }}
      role="tooltip"
      aria-label={step.title}
    >
      {/* Progress indicator */}
      <div className="text-sm text-gray-500 mb-2" role="status">
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
        <div className="flex items-center gap-2">
          {step.icon && (
            <span className="shrink-0 text-blue-600" aria-hidden="true">
              {step.icon}
            </span>
          )}
          <h3 className="text-lg font-semibold">
            {step.title}
          </h3>
        </div>
        <div className="text-gray-600">
          {step.content}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
        <div>
          {renderActionButton('prev', showButtons.previous, buttonLabels.prev, onPrev, 'secondary', buttonLabels.prev)}
        </div>
        <div className="flex gap-2">
          {renderActionButton('close', showButtons.close, isLast ? buttonLabels.finish : buttonLabels.skip, onClose, 'secondary', isLast ? buttonLabels.finish : buttonLabels.skip)}
          {renderActionButton('next', showButtons.next, buttonLabels.next, onNext, 'primary', buttonLabels.next)}
        </div>
      </div>
    </div>
  );
};