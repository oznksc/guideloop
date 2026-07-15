import { renderHook, act } from '@testing-library/react';
import { useSteps } from '../../hooks/useSteps';

describe('useSteps', () => {
  const mockSteps = [
    { target: '#step1', title: 'Step 1', content: 'Content 1' },
    { target: '#step2', title: 'Step 2', content: 'Content 2' },
    { target: '#step3', title: 'Step 3', content: 'Content 3' },
  ];

  it('sets initial step from initialStep prop', () => {
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 1 }));
    expect(result.current.currentStepData).toEqual(mockSteps[1]);
  });

  it('defaults to step 0 when initialStep is 0', () => {
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));
    expect(result.current.currentStepData).toEqual(mockSteps[0]);
  });

  it('advances on nextStep and calls onStepChange', async () => {
    const onStepChange = jest.fn();
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0, onStepChange }));

    await act(async () => { await result.current.nextStep(); });

    expect(result.current.currentStepData).toEqual(mockSteps[1]);
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('calls onComplete when nextStep is called on the last step', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 2, onComplete }));

    await act(async () => { await result.current.nextStep(); });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.currentStepData).toEqual(mockSteps[2]);
  });

  it('goes back on prevStep and calls onStepChange', async () => {
    const onStepChange = jest.fn();
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 2, onStepChange }));

    await act(async () => { await result.current.prevStep(); });

    expect(result.current.currentStepData).toEqual(mockSteps[1]);
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('does not go back before step 0', () => {
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));
    act(() => { result.current.prevStep(); });
    expect(result.current.currentStepData).toEqual(mockSteps[0]);
  });

  it('tracks isFirstStep and isLastStep correctly', async () => {
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));

    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);

    await act(async () => { await result.current.nextStep(); });
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);

    await act(async () => { await result.current.nextStep(); });
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(true);
  });

  it('reports totalSteps correctly', () => {
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));
    expect(result.current.totalSteps).toBe(3);
  });

  it('filters out steps with condition returning false', () => {
    const stepsWithCondition = [
      { target: '#s1', title: 'S1', content: 'C1', condition: () => true },
      { target: '#s2', title: 'S2', content: 'C2', condition: () => false },
      { target: '#s3', title: 'S3', content: 'C3' },
    ];
    const { result } = renderHook(() => useSteps({ steps: stepsWithCondition, initialStep: 0 }));
    expect(result.current.totalSteps).toBe(2);
    expect(result.current.currentStepData).toEqual(stepsWithCondition[0]);
  });

  it('sets current step directly via setCurrentStep', () => {
    const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));
    act(() => { result.current.setCurrentStep(2); });
    expect(result.current.currentStepData).toEqual(mockSteps[2]);
  });

  it('calls afterStep during nextStep transition', async () => {
    const afterStep = jest.fn();
    const stepsWithHooks = [{ ...mockSteps[0], afterStep }, ...mockSteps.slice(1)];
    const { result } = renderHook(() => useSteps({ steps: stepsWithHooks, initialStep: 0 }));

    await act(async () => { await result.current.nextStep(); });
    expect(afterStep).toHaveBeenCalledTimes(1);
  });

  it('calls beforeStep on the target step during nextStep', async () => {
    const beforeStep = jest.fn();
    const stepsWithHooks = [mockSteps[0], { ...mockSteps[1], beforeStep }];
    const { result } = renderHook(() => useSteps({ steps: stepsWithHooks, initialStep: 0 }));

    await act(async () => { await result.current.nextStep(); });
    expect(beforeStep).toHaveBeenCalledTimes(1);
  });

  it('calls beforeStep during prevStep transition', async () => {
    const beforeStep = jest.fn();
    const stepsWithHooks = [{ ...mockSteps[0], beforeStep }, mockSteps[1]];
    const { result } = renderHook(() => useSteps({ steps: stepsWithHooks, initialStep: 1 }));

    await act(async () => { await result.current.prevStep(); });
    expect(beforeStep).toHaveBeenCalledTimes(1);
  });

  it('handles async afterStep without error', async () => {
    const afterStep = jest.fn().mockResolvedValue(undefined);
    const stepsWithHooks = [{ ...mockSteps[0], afterStep }, ...mockSteps.slice(1)];
    const { result } = renderHook(() => useSteps({ steps: stepsWithHooks, initialStep: 0 }));

    await act(async () => { await result.current.nextStep(); });
    expect(afterStep).toHaveBeenCalledTimes(1);
    expect(result.current.currentStepData).toEqual(mockSteps[1]);
  });

  describe('branch', () => {
    it('jumps to target step when branch returns a number', async () => {
      const stepsWithBranch = [
        { target: '#s0', title: 'S0', content: 'C0', branch: () => 2 },
        { target: '#s1', title: 'S1', content: 'C1' },
        { target: '#s2', title: 'S2', content: 'C2' },
      ];
      const { result } = renderHook(() => useSteps({ steps: stepsWithBranch, initialStep: 0 }));

      await act(async () => { await result.current.nextStep(); });
      expect(result.current.currentStepData).toEqual(stepsWithBranch[2]);
    });

    it('calls onComplete when branch target exceeds valid steps', async () => {
      const onComplete = jest.fn();
      const stepsWithBranch = [
        { target: '#s0', title: 'S0', content: 'C0', branch: () => 5 },
      ];
      const { result } = renderHook(() => useSteps({ steps: stepsWithBranch, initialStep: 0, onComplete }));

      await act(async () => { await result.current.nextStep(); });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('uses normal next step when branch returns undefined', async () => {
      const stepsWithBranch = [
        { target: '#s0', title: 'S0', content: 'C0' },
        { target: '#s1', title: 'S1', content: 'C1' },
      ];
      const { result } = renderHook(() => useSteps({ steps: stepsWithBranch, initialStep: 0 }));

      await act(async () => { await result.current.nextStep(); });
      expect(result.current.currentStepData).toEqual(stepsWithBranch[1]);
    });

    it('calls afterStep of current step before branch jump', async () => {
      const afterStep = jest.fn();
      const stepsWithBranch = [
        { target: '#s0', title: 'S0', content: 'C0', afterStep, branch: () => 2 },
        { target: '#s1', title: 'S1', content: 'C1' },
        { target: '#s2', title: 'S2', content: 'C2' },
      ];
      const { result } = renderHook(() => useSteps({ steps: stepsWithBranch, initialStep: 0 }));

      await act(async () => { await result.current.nextStep(); });
      expect(afterStep).toHaveBeenCalledTimes(1);
      expect(result.current.currentStepData).toEqual(stepsWithBranch[2]);
    });
  });

  describe('stepStatus', () => {
    it('starts as idle', () => {
      const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));
      expect(result.current.stepStatus).toBe('idle');
    });

    it('returns success after nextStep completes', async () => {
      const { result } = renderHook(() => useSteps({ steps: mockSteps, initialStep: 0 }));

      await act(async () => { await result.current.nextStep(); });
      expect(result.current.stepStatus).toBe('success');
    });

    it('returns error status when beforeStep throws', async () => {
      const beforeStep = jest.fn().mockRejectedValue(new Error('fail'));
      const stepsWithHooks = [mockSteps[0], { ...mockSteps[1], beforeStep }];
      const { result } = renderHook(() => useSteps({ steps: stepsWithHooks, initialStep: 0 }));

      await act(async () => { await result.current.nextStep(); });
      expect(result.current.stepStatus).toBe('error');
    });
  });
});
