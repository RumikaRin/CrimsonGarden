export type StorybookTheme = 'cozy' | 'neon' | 'dark';

export interface StorybookPalette {
  paper: string;
  paperShade: string;
  ink: string;
  mutedInk: string;
  snake: string;
  snakeLight: string;
  apple: string;
  appleLight: string;
  leaf: string;
  obstacle: string;
  accent: string;
}

const palettes: Record<StorybookTheme, StorybookPalette> = {
  cozy: {
    paper: '#F5ECD9',
    paperShade: '#DDC9A4',
    ink: '#4B3028',
    mutedInk: '#806452',
    snake: '#B83B47',
    snakeLight: '#E47B79',
    apple: '#C72C41',
    appleLight: '#F5968D',
    leaf: '#547A4A',
    obstacle: '#7A5942',
    accent: '#DC143C',
  },
  neon: {
    paper: '#EEF5E6',
    paperShade: '#C7D9B8',
    ink: '#244735',
    mutedInk: '#607865',
    snake: '#2F684D',
    snakeLight: '#79B58B',
    apple: '#C9414E',
    appleLight: '#F2A09A',
    leaf: '#426F43',
    obstacle: '#765943',
    accent: '#224334',
  },
  dark: {
    paper: '#231E19',
    paperShade: '#100E0C',
    ink: '#F1DFC1',
    mutedInk: '#B49C7D',
    snake: '#D0525D',
    snakeLight: '#F09088',
    apple: '#E14A58',
    appleLight: '#FFAAA0',
    leaf: '#78A36E',
    obstacle: '#8D6A4D',
    accent: '#F87171',
  },
};

export function getStorybookPalette(theme: StorybookTheme): StorybookPalette {
  return palettes[theme];
}

export function clampLabelPosition(
  position: { x: number; y: number },
  label: { width: number; height: number },
  board: { width: number; height: number },
  inset = 8,
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(position.x, inset), board.width - label.width - inset),
    y: Math.min(Math.max(position.y, inset), board.height - label.height - inset),
  };
}
