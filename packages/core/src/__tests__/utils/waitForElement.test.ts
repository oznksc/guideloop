import { waitForElement } from '../../dom/wait';

describe('waitForElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves immediately if element already exists', async () => {
    const el = document.createElement('div');
    el.id = 'existing';
    document.body.appendChild(el);

    const promise = waitForElement('#existing');
    jest.advanceTimersByTime(0);
    const result = await promise;
    expect(result).toBe(el);
  });

  it('resolves when element appears in DOM', async () => {
    const promise = waitForElement('#dynamic', { timeout: 5000 });

    setTimeout(() => {
      const el = document.createElement('div');
      el.id = 'dynamic';
      document.body.appendChild(el);
    }, 100);

    jest.advanceTimersByTime(100);
    const result = await promise;
    expect(result).toBe(document.getElementById('dynamic'));
  });

  it('rejects after timeout when element never appears', async () => {
    const promise = waitForElement('#never', { timeout: 1000 });

    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('not found');
  });

  it('uses default timeout of 10000ms', () => {
    const promise = waitForElement('#ghost');

    jest.advanceTimersByTime(10000);

    return expect(promise).rejects.toThrow('not found');
  });

  it('resolves when element appears under custom root', async () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const promise = waitForElement('#deep', { root, timeout: 5000 });

    setTimeout(() => {
      const el = document.createElement('div');
      el.id = 'deep';
      root.appendChild(el);
    }, 50);

    jest.advanceTimersByTime(50);
    const result = await promise;
    expect(result).toBe(document.getElementById('deep'));
  });

  it('rejects with custom timeout message', async () => {
    const promise = waitForElement('#ghost-custom', { timeout: 500 });

    jest.advanceTimersByTime(500);

    await expect(promise).rejects.toThrow('500ms');
  });

  it('observer.disconnect prevents duplicate resolution', async () => {
    const promise = waitForElement('#dup-safety', { timeout: 2000 });

    setTimeout(() => {
      const el = document.createElement('div');
      el.id = 'dup-safety';
      document.body.appendChild(el);
    }, 100);

    jest.advanceTimersByTime(100);
    const result1 = await promise;
    expect(result1).toBe(document.getElementById('dup-safety'));

    jest.advanceTimersByTime(2000);
  });
});
