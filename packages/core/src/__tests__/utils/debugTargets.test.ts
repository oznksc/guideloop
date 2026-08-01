import { buildTargetDebugInfo } from '../../debug/targets';

describe('buildTargetDebugInfo', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('marks primary and additional targets as found or missing', () => {
    const el = document.createElement('div');
    el.id = 'primary';
    document.body.appendChild(el);

    const rows = buildTargetDebugInfo({
      primarySelector: '#primary',
      primaryShape: 'circle',
      additionalTargets: ['#gone', { selector: '#primary', shape: 'ellipse' }],
      holes: [
        { top: 1, left: 2, width: 10, height: 20, shape: 'circle' },
        { top: 0, left: 0, width: 0, height: 0, shape: 'rect' },
        { top: 5, left: 5, width: 8, height: 8, shape: 'ellipse' },
      ],
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      selector: '#primary',
      found: true,
      role: 'primary',
      shape: 'circle',
    });
    expect(rows[1]).toMatchObject({
      selector: '#gone',
      found: false,
      role: 'additional',
    });
    expect(rows[2].found).toBe(true);
    expect(rows[2].shape).toBe('ellipse');
  });
});
