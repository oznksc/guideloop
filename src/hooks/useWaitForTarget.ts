import { useState, useEffect, useRef } from 'react';
import { waitForElement, WaitForElementOptions } from '../utils/waitForElement';
import type { WaitForTargetConfig } from '../components/GuideLoop/types';

interface UseWaitForTargetProps {
  targetSelector: string;
  enabled: boolean;
  config?: boolean | WaitForTargetConfig;
}

interface UseWaitForTargetReturn {
  isReady: boolean;
  isWaiting: boolean;
  error: string | null;
}

function elementExists(selector: string): boolean {
  try {
    return !!document.querySelector(selector);
  } catch {
    return false;
  }
}

export const useWaitForTarget = ({
  targetSelector,
  enabled,
  config,
}: UseWaitForTargetProps): UseWaitForTargetReturn => {
  const hasConfig = enabled && !!config;
  const initiallyExists = hasConfig && elementExists(targetSelector);

  const [isReady, setIsReady] = useState(!hasConfig || !!initiallyExists);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasConfig || initiallyExists) {
      return;
    }

    const options: WaitForElementOptions = {};
    if (typeof config === 'object') {
      if (config.timeout) options.timeout = config.timeout;
      if (config.root) options.root = config.root;
    }

    setIsWaiting(true);
    setError(null);

    waitForElement(targetSelector, options)
      .then(() => {
        if (!mountedRef.current) return;
        setIsReady(true);
        setIsWaiting(false);
      })
      .catch((err: Error) => {
        if (!mountedRef.current) return;
        setError(err.message);
        setIsWaiting(false);
      });
  }, [hasConfig, initiallyExists, targetSelector, config]);

  return { isReady, isWaiting, error };
};
