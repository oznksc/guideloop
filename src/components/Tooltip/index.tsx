import React, { useRef, useEffect, useState } from 'react';
import { usePopper } from '../../hooks/usePopper';
import { getAnimationStyle } from '../../utils/animation';
import { querySelectorAsHTMLElement } from '../../utils/dom';
import { ImageContentRenderer } from './ImageContent';
import { TooltipButton } from './TooltipButton';
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
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const themeStyles = useTheme(theme, customTheme);

  useEffect(() => {
    if (!step.target) {
      console.warn('GuideLoop: Empty target selector provided for step', currentStep + 1);
      setTargetElement(null);
      return;
    }

    const element = querySelectorAsHTMLElement(step.target);
    
    if (!element) {
      console.warn(`GuideLoop: No HTMLElement found for selector "${step.target}" in step`, currentStep + 1);
    }
    
    setTargetElement(element);
  }, [step.target, currentStep]);

  const { update } = usePopper({
    referenceElement: targetElement,
    tooltipElement: tooltipRef.current,
    placement: step.placement || 'bottom',
  });

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

  const fallbackStyle = !targetElement ? {
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
          <TooltipButton
            kind="prev"
            visible={showButtons.previous}
            label={buttonLabels.prev}
            handler={onPrev}
            variant="secondary"
            defaultContent={buttonLabels.prev}
            themeStyles={themeStyles.buttons}
            customButton={step.buttons?.prev}
          />
        </div>
        <div className="flex gap-2">
          <TooltipButton
            kind="close"
            visible={showButtons.close}
            label={isLast ? buttonLabels.finish : buttonLabels.skip}
            handler={onClose}
            variant="secondary"
            defaultContent={isLast ? buttonLabels.finish : buttonLabels.skip}
            themeStyles={themeStyles.buttons}
            customButton={step.buttons?.close}
          />
          <TooltipButton
            kind="next"
            visible={showButtons.next}
            label={buttonLabels.next}
            handler={onNext}
            variant="primary"
            defaultContent={buttonLabels.next}
            themeStyles={themeStyles.buttons}
            customButton={step.buttons?.next}
          />
        </div>
      </div>
    </div>
  );
};
