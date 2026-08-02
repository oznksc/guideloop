import { createSpotlightTracker } from '../core/SpotlightTracker';

describe('createSpotlightTracker', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="box" style="position:absolute;top:10px;left:20px;width:100px;height:50px;"></div>
    `;
    // jsdom getBoundingClientRect often returns zeros — stub it
    const box = document.getElementById('box')!;
    box.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 20,
        width: 100,
        height: 50,
        bottom: 60,
        right: 120,
        x: 20,
        y: 10,
        toJSON: () => ({}),
      }) as DOMRect;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('measures targets with padding', () => {
    const tracker = createSpotlightTracker([
      { selector: '#box', padding: 8, shape: 'rect' },
    ]);

    const holes = tracker.getHoles();
    expect(holes).toHaveLength(1);
    expect(holes[0].top).toBe(2);
    expect(holes[0].left).toBe(12);
    expect(holes[0].width).toBe(116);
    expect(holes[0].height).toBe(66);

    tracker.destroy();
  });

  it('notifies subscribers on setTargets', () => {
    const tracker = createSpotlightTracker();
    const listener = jest.fn();
    tracker.subscribe(listener);
    expect(listener).toHaveBeenCalled();

    tracker.setTargets([{ selector: '#box', padding: 0 }]);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(tracker.getHoles()[0].width).toBe(100);

    tracker.destroy();
  });
});
