'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface GuideLoopErrorBoundaryProps {
  children: ReactNode;
  /**
   * Called when a render error is caught inside the tour tree.
   * Host apps can log or report without the whole page crashing.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * Optional UI when the tour fails. Defaults to `null` (silent recovery).
   */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates GuideLoop render failures so a bad step/target path cannot
 * take down the host application.
 */
export class GuideLoopErrorBoundary extends Component<
  GuideLoopErrorBoundaryProps,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: GuideLoopErrorBoundaryProps): void {
    // Allow recovery if the parent remounts children after fixing config
    // (e.g. steps / isOpen change). Reset only when we were in error state.
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
