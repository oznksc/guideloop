import { renderHook } from '@testing-library/react';
import { useTheme } from '../../hooks/useTheme';
import { tailwindTheme } from '../../themes/tailwind';
import { materialTheme } from '../../themes/material';
import { antdTheme } from '../../themes/antd';
import type { ThemeConfig } from '../../themes/types';

describe('useTheme', () => {
  it('returns tailwind theme by default', () => {
    const { result } = renderHook(() => useTheme('tailwind'));
    expect(result.current).toEqual(tailwindTheme);
  });

  it('returns material theme when specified', () => {
    const { result } = renderHook(() => useTheme('material'));
    expect(result.current).toEqual(materialTheme);
  });

  it('returns antd theme when specified', () => {
    const { result } = renderHook(() => useTheme('antd'));
    expect(result.current).toEqual(antdTheme);
  });

  it('falls back to tailwind for unknown theme', () => {
    const { result } = renderHook(() => useTheme('unknown' as 'tailwind'));
    expect(result.current).toEqual(tailwindTheme);
  });

  it('merges custom theme override for tooltip background', () => {
    const custom: Partial<ThemeConfig> = {
      tooltip: { background: 'red', textColor: '#000', borderRadius: '4px', padding: '8px', boxShadow: 'none' },
    };
    const { result } = renderHook(() => useTheme('tailwind', custom));
    expect(result.current.tooltip.background).toBe('red');
    expect(result.current.tooltip.textColor).toBe('#000');
  });

  it('merges custom theme override for buttons', () => {
    const custom: Partial<ThemeConfig> = {
      buttons: {
        primary: { background: 'green', textColor: 'white', hoverBackground: 'darkgreen', padding: '8px' },
        secondary: { background: 'transparent', textColor: '#666', hoverBackground: '#eee', padding: '8px' },
      },
    };
    const { result } = renderHook(() => useTheme('material', custom));
    expect(result.current.buttons.primary.background).toBe('green');
    expect(result.current.buttons.primary.textColor).toBe('white');
  });

  it('merges multiple section overrides at once', () => {
    const custom: Partial<ThemeConfig> = {
      overlay: { background: '#111', opacity: 0.8 },
      spotlight: { borderColor: '#ff0000', borderWidth: '3px', borderRadius: '4px', animation: 'none' },
    };
    const { result } = renderHook(() => useTheme('antd', custom));
    expect(result.current.overlay.background).toBe('#111');
    expect(result.current.overlay.opacity).toBe(0.8);
    expect(result.current.spotlight.borderColor).toBe('#ff0000');
  });

  it('does not mutate the base theme', () => {
    const beforeBg = tailwindTheme.tooltip.background;
    const custom: Partial<ThemeConfig> = {
      tooltip: { background: 'purple', textColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: 'lg' },
    };
    const { result } = renderHook(() => useTheme('tailwind', custom));
    expect(result.current.tooltip.background).toBe('purple');
    expect(tailwindTheme.tooltip.background).toBe(beforeBg);
  });

  it('returns same reference for same inputs (memoization)', () => {
    const { result, rerender } = renderHook(
      ({ theme, custom }: { theme: 'tailwind'; custom?: Partial<ThemeConfig> }) => useTheme(theme, custom),
      { initialProps: { theme: 'tailwind' as const } }
    );

    const firstResult = result.current;
    rerender({ theme: 'tailwind' });
    expect(result.current).toBe(firstResult);
  });
});
