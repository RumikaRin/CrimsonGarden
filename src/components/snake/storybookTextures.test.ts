import { describe, expect, it } from 'vitest';
import { clampLabelPosition, getStorybookPalette } from './storybookTextures';

describe('storybook texture helpers', () => {
  it('returns complete palettes for every theme', () => {
    for (const theme of ['cozy', 'neon', 'dark'] as const) {
      const palette = getStorybookPalette(theme);
      expect(palette.paper).toMatch(/^#/);
      expect(palette.ink).toMatch(/^#/);
      expect(palette.snake).toMatch(/^#/);
      expect(palette.apple).toMatch(/^#/);
    }
  });

  it('clamps a word label inside board bounds', () => {
    expect(clampLabelPosition({ x: -20, y: 590 }, { width: 120, height: 28 }, { width: 900, height: 600 }))
      .toEqual({ x: 8, y: 564 });
  });
});
