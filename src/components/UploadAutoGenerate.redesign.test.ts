import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('UploadAutoGenerate redesign contract', () => {
  it('implements the parser-workbench shell structure and custom status rail', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/UploadAutoGenerate.tsx'), 'utf8');

    expect(source).toContain('data-generate-shell="parser-workbench"');
    expect(source).toContain('ParserWorkbenchHeader');
    expect(source).toContain('GenerationStatusRail');
  });
});
