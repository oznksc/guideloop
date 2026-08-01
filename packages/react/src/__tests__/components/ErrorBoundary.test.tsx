import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  GuideLoopErrorBoundary,
} from '../../components/GuideLoop/ErrorBoundary';
import GuideLoop from '../../components/GuideLoop';

function Boom(): React.ReactElement {
  throw new Error('tour render failed');
}

describe('GuideLoopErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    // React logs caught errors to console.error — silence for this suite
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when healthy', () => {
    render(
      <GuideLoopErrorBoundary>
        <span>ok</span>
      </GuideLoopErrorBoundary>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('swallows render errors and shows default null fallback', () => {
    render(
      <GuideLoopErrorBoundary>
        <Boom />
      </GuideLoopErrorBoundary>
    );
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
  });

  it('renders custom fallback and calls onError', () => {
    const onError = jest.fn();
    render(
      <GuideLoopErrorBoundary
        onError={onError}
        fallback={<div role="alert">Tour unavailable</div>}
      >
        <Boom />
      </GuideLoopErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Tour unavailable');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('tour render failed');
  });

  it('isolates failures via GuideLoop onError/fallback props', () => {
    const onError = jest.fn();
    // Force a child throw by using invalid React element via content that throws
    const BadContent = () => {
      throw new Error('step content boom');
    };

    document.body.innerHTML = '<button id="t">T</button>';
    const portalRoot = document.createElement('div');
    portalRoot.id = 'guideloop-portal';
    document.body.appendChild(portalRoot);

    render(
      <GuideLoop
        steps={[
          {
            target: '#t',
            title: 'Bad',
            content: <BadContent />,
          },
        ]}
        isOpen
        onClose={jest.fn()}
        onError={onError}
        fallback={<div data-testid="tour-fallback">safe</div>}
      />
    );

    expect(screen.getByTestId('tour-fallback')).toHaveTextContent('safe');
    expect(onError).toHaveBeenCalled();
  });
});
