'use client';

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
    next: step.showButtons?.next !== false,
    previous: step.showButtons?.previous !== false && !isFirst,
    close: step.showButtons?.close !== false && !isLast,
  };

  const fallbackStyle = !targetElement ? {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  } : {};

  return (
    <div
      ref={tooltipRef}
      className="guideloop-tooltip"
      style={{
        position: 'fixed',
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
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }} role="status">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {/* Image content if exists */}
      {step.image && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ImageContentRenderer image={step.image} />
        </div>
      )}

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {step.icon && (
            <span style={{ flexShrink: 0, color: '#2563eb' }} aria-hidden="true">
              {step.icon}
            </span>
          )}
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {step.title}
          </h3>
        </div>
        <div style={{ color: '#4b5563' }}>
          {step.content}
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <TooltipButton
            kind="close"
            visible={showButtons.close}
            label={buttonLabels.skip}
            handler={onClose}
            variant="secondary"
            defaultContent={buttonLabels.skip}
            themeStyles={themeStyles.buttons}
            customButton={step.buttons?.close}
          />
          <TooltipButton
            kind="next"
            visible={showButtons.next}
            label={isLast ? buttonLabels.finish : buttonLabels.next}
            handler={onNext}
            variant="primary"
            defaultContent={isLast ? buttonLabels.finish : buttonLabels.next}
            themeStyles={themeStyles.buttons}
            customButton={step.buttons?.next}
          />
        </div>
      </div>
    </div>
  );
};
