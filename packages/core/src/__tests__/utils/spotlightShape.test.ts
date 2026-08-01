import {
  resolveSpotlightShape,
  isValidHole,
  getShapeName,
} from '../../geometry/shapes';

describe('spotlightShape', () => {
  const hole = { top: 100, left: 200, width: 100, height: 50 };

  describe('resolveSpotlightShape', () => {
    it('defaults to rect with theme border radius', () => {
      const resolved = resolveSpotlightShape(hole, undefined, '8px');
      expect(resolved).toEqual({
        type: 'rect',
        x: 200,
        y: 100,
        width: 100,
        height: 50,
        rx: 8,
      });
    });

    it('resolves circle using max dimension as diameter', () => {
      const resolved = resolveSpotlightShape(hole, 'circle');
      expect(resolved).toEqual({
        type: 'circle',
        cx: 250,
        cy: 125,
        r: 50,
      });
    });

    it('resolves ellipse from half width/height', () => {
      const resolved = resolveSpotlightShape(hole, 'ellipse');
      expect(resolved).toEqual({
        type: 'ellipse',
        cx: 250,
        cy: 125,
        rx: 50,
        ry: 25,
      });
    });

    it('resolves polygon from normalized points', () => {
      const resolved = resolveSpotlightShape(hole, {
        type: 'polygon',
        points: [
          [0.5, 0],
          [1, 1],
          [0, 1],
        ],
      });
      expect(resolved).toEqual({
        type: 'polygon',
        points: '250,100 300,150 200,150',
      });
    });

    it('falls back to rect for invalid polygon', () => {
      const resolved = resolveSpotlightShape(hole, {
        type: 'polygon',
        points: [[0, 0], [1, 1]],
      });
      expect(resolved.type).toBe('rect');
    });
  });

  describe('isValidHole', () => {
    it('rejects null, zero-size, and missing holes', () => {
      expect(isValidHole(null)).toBe(false);
      expect(isValidHole(undefined)).toBe(false);
      expect(isValidHole({ top: 0, left: 0, width: 0, height: 10 })).toBe(false);
      expect(isValidHole(hole)).toBe(true);
    });
  });

  describe('getShapeName', () => {
    it('returns rect by default and polygon for custom shapes', () => {
      expect(getShapeName()).toBe('rect');
      expect(getShapeName('circle')).toBe('circle');
      expect(
        getShapeName({ type: 'polygon', points: [[0, 0], [1, 0], [0.5, 1]] })
      ).toBe('polygon');
    });
  });
});
