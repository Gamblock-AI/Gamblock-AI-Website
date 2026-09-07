import { describe, expect, it } from 'vitest';
import type { EducationModule } from './use-education';
import { normalizeEducationModule } from './use-education';

describe('normalizeEducationModule', () => {
  it('converts nullable media and progress collections into safe defaults', () => {
    const normalized = normalizeEducationModule({
      thumbnails: null,
      thumbnail_urls: null,
      media_urls: null,
      sources: null,
      sections: null,
      progress: null,
    } as unknown as EducationModule);

    expect(normalized.thumbnails).toEqual([]);
    expect(normalized.thumbnail_urls).toEqual({});
    expect(normalized.media_urls).toEqual({});
    expect(normalized.sources).toEqual([]);
    expect(normalized.sections).toEqual([]);
    expect(normalized.progress).toEqual({
      completed_section_ids: [],
      opened_media_ids: [],
      correct_check_ids: [],
      progress_percent: 0,
    });
  });
});
