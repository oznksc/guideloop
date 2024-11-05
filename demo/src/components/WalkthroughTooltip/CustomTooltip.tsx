// CustomTooltip.tsx
"use client"
import React from 'react';
import type { BaseTooltipProps } from './types';

interface CustomTooltipStyles {
  container?: React.CSSProperties;
  header?: React.CSSProperties;
  title?: React.CSSProperties;
  content?: React.CSSProperties;
  footer?: React.CSSProperties;
  arrow?: React.CSSProperties;
  closeButton?: React.CSSProperties;
  navigationButton?: React.CSSProperties;
}

interface CustomTooltipClassNames {
  container?: string;
  header?: string;
  title?: string;
  content?: string;
  footer?: string;
  arrow?: string;
  closeButton?: string;
  navigationButton?: string;
}

export interface CustomTooltipProps extends BaseTooltipProps {
  styles?: CustomTooltipStyles;
  classNames?: CustomTooltipClassNames;
  renderHeader?: (props: BaseTooltipProps) => React.ReactNode;
  renderTitle?: (props: BaseTooltipProps) => React.ReactNode;
  renderContent?: (props: BaseTooltipProps) => React.ReactNode;
  renderFooter?: (props: BaseTooltipProps) => React.ReactNode;
  renderCloseButton?: (props: BaseTooltipProps) => React.ReactNode;
  renderNavigationButtons?: (props: BaseTooltipProps) => React.ReactNode;
  renderArrow?: (props: BaseTooltipProps) => React.ReactNode;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  currentStep,
  totalSteps,
  currentStepData,
  defaultShowButtons,
  position,
  onNext,
  onPrev,
  onClose,
  styles = {},
  classNames = {},
  renderHeader,
  renderTitle,
  renderContent,
  renderFooter,
  renderCloseButton,
  renderNavigationButtons,
  renderArrow,
}) => {
  // Default arrow style hesaplama
  const getDefaultArrowStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: '12px',
      height: '12px',
      backgroundColor: 'inherit',
      transform: 'rotate(45deg)',
    };

    switch (currentStepData.placement) {
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

  // Default render fonksiyonları
  const defaultRenderHeader = () => (
    <div 
      className={`flex justify-between items-center mb-3 ${classNames.header || ''}`}
      style={styles.header}
    >
      <span className="text-xs text-gray-300">
        Step {currentStep + 1} of {totalSteps}
      </span>
      {(currentStepData.showButtons?.close ?? defaultShowButtons.close) && 
        (renderCloseButton ? renderCloseButton({
          currentStep,
          totalSteps,
          currentStepData,
          defaultShowButtons,
          position,
          onNext,
          onPrev,
          onClose
        }) : (
          <button 
            onClick={onClose}
            className={`text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800 ${classNames.closeButton || ''}`}
            style={styles.closeButton}
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
        ))}
    </div>
  );

  const defaultRenderContent = () => (
    <div 
      className={`space-y-2 ${classNames.content || ''}`}
      style={styles.content}
    >
      <div 
        className={`text-lg font-medium ${classNames.title || ''}`}
        style={styles.title}
      >
        {currentStepData.title}
      </div>
      <div className="text-gray-300 text-sm leading-relaxed">
        {currentStepData.content}
      </div>
    </div>
  );

  const defaultRenderNavigationButtons = () => (
    <>
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
            ${classNames.navigationButton || ''}
          `}
          style={styles.navigationButton}
        >
          Previous
        </button>
      )}
      
      {(currentStepData.showButtons?.next ?? defaultShowButtons.next) && (
        <button
          onClick={onNext}
          className={`
            px-4 py-1.5 text-sm bg-blue-500 text-white rounded
            hover:bg-blue-600 transition-colors duration-150
            ${classNames.navigationButton || ''}
          `}
          style={styles.navigationButton}
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        </button>
      )}
    </>
  );

  const defaultRenderFooter = () => (
    <div 
      className={`flex justify-between items-center mt-4 pt-3 border-t border-gray-700 ${classNames.footer || ''}`}
      style={styles.footer}
    >
      {renderNavigationButtons ? 
        renderNavigationButtons({
          currentStep,
          totalSteps,
          currentStepData,
          defaultShowButtons,
          position,
          onNext,
          onPrev,
          onClose
        }) : 
        defaultRenderNavigationButtons()
      }
    </div>
  );

  return (
    <div 
      className={`absolute shadow-lg rounded-lg bg-gray-900 text-white ${classNames.container || ''}`}
      style={{
        ...position,
        minWidth: '300px',
        padding: '1rem',
        ...styles.container,
      }}
    >
      {renderHeader ? 
        renderHeader({
          currentStep,
          totalSteps,
          currentStepData,
          defaultShowButtons,
          position,
          onNext,
          onPrev,
          onClose
        }) : 
        defaultRenderHeader()
      }

      {renderContent ? 
        renderContent({
          currentStep,
          totalSteps,
          currentStepData,
          defaultShowButtons,
          position,
          onNext,
          onPrev,
          onClose
        }) : 
        defaultRenderContent()
      }

      {renderFooter ? 
        renderFooter({
          currentStep,
          totalSteps,
          currentStepData,
          defaultShowButtons,
          position,
          onNext,
          onPrev,
          onClose
        }) : 
        defaultRenderFooter()
      }

      {renderArrow ? 
        renderArrow({
          currentStep,
          totalSteps,
          currentStepData,
          defaultShowButtons,
          position,
          onNext,
          onPrev,
          onClose
        }) : 
        <div
          className={`absolute bg-inherit transform ${classNames.arrow || ''}`}
          style={{
            ...getDefaultArrowStyle(),
            ...styles.arrow,
          }}
        />
      }
    </div>
  );
};