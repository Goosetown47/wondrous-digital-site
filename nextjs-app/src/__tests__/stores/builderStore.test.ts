/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useBuilderStore } from '@/stores/builderStore';
import type { Section } from '@/stores/builderStore';

describe('useBuilderStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useBuilderStore.getState().clearAll();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useBuilderStore());

    expect(result.current.sections).toEqual([]);
    expect(result.current.publishedSections).toEqual([]);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.pageId).toBe(null);
    expect(result.current.projectId).toBe(null);
  });

  it('should load page with draft and published sections', () => {
    const draftSections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Draft Title' }, order: 0 }
    ];
    const publishedSections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Published Title' }, order: 0 }
    ];

    const { result } = renderHook(() => useBuilderStore());

    act(() => {
      result.current.loadPage('page-1', 'project-1', draftSections, publishedSections, 'Test Page');
    });

    expect(result.current.sections).toEqual(draftSections);
    expect(result.current.publishedSections).toEqual(publishedSections);
    expect(result.current.pageId).toBe('page-1');
    expect(result.current.projectId).toBe('project-1');
    expect(result.current.pageTitle).toBe('Test Page');
    expect(result.current.isDirty).toBe(false);
  });

  it('should mark as dirty when adding section', () => {
    const { result } = renderHook(() => useBuilderStore());

    const newSection: Section = {
      id: 'section-1',
      type: 'hero',
      content: { title: 'New Section' },
      order: 0
    };

    act(() => {
      result.current.addSection(newSection);
    });

    expect(result.current.sections).toEqual([newSection]);
    expect(result.current.isDirty).toBe(true);
  });

  it('should mark as dirty when updating section', () => {
    const initialSection: Section = {
      id: 'section-1',
      type: 'hero',
      content: { title: 'Original Title' },
      order: 0
    };

    const { result } = renderHook(() => useBuilderStore());

    // Load initial state
    act(() => {
      result.current.loadPage('page-1', 'project-1', [initialSection], [initialSection], 'Test Page');
    });

    expect(result.current.isDirty).toBe(false);

    // Update section
    act(() => {
      result.current.updateSection('section-1', { content: { title: 'Updated Title' } });
    });

    expect(result.current.sections[0].content).toEqual({ title: 'Updated Title' });
    expect(result.current.isDirty).toBe(true);
  });

  it('should detect unpublished changes correctly', () => {
    const { result } = renderHook(() => useBuilderStore());

    const draftSections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Draft Title' }, order: 0 }
    ];
    const publishedSections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Published Title' }, order: 0 }
    ];

    // Load page with different draft and published content
    act(() => {
      result.current.loadPage('page-1', 'project-1', draftSections, publishedSections, 'Test Page');
    });

    expect(result.current.hasUnpublishedChanges()).toBe(true);
  });

  it('should not detect unpublished changes when draft equals published', () => {
    const { result } = renderHook(() => useBuilderStore());

    const sections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Same Title' }, order: 0 }
    ];

    // Load page with same draft and published content
    act(() => {
      result.current.loadPage('page-1', 'project-1', sections, sections, 'Test Page');
    });

    expect(result.current.hasUnpublishedChanges()).toBe(false);
  });

  it('should publish draft sections', () => {
    const { result } = renderHook(() => useBuilderStore());

    const draftSections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Draft Title' }, order: 0 }
    ];
    const publishedSections: Section[] = [
      { id: 'section-1', type: 'hero', content: { title: 'Published Title' }, order: 0 }
    ];

    // Load page with different content
    act(() => {
      result.current.loadPage('page-1', 'project-1', draftSections, publishedSections, 'Test Page');
    });

    expect(result.current.hasUnpublishedChanges()).toBe(true);

    // Publish the draft
    act(() => {
      result.current.publishDraft();
    });

    expect(result.current.publishedSections).toEqual(draftSections);
    expect(result.current.hasUnpublishedChanges()).toBe(false);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.saveStatus).toBe('idle');
  });

  it('should manage save status correctly', () => {
    const { result } = renderHook(() => useBuilderStore());

    act(() => {
      result.current.setSaveStatus('saving');
    });

    expect(result.current.saveStatus).toBe('saving');

    act(() => {
      result.current.setSaveStatus('saved');
      result.current.setLastSavedAt(new Date('2023-01-01T00:00:00Z'));
    });

    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.lastSavedAt).toEqual(new Date('2023-01-01T00:00:00Z'));

    act(() => {
      result.current.setSaveStatus('error', 'Save failed');
    });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.saveError).toBe('Save failed');
  });

  it('should clear all state', () => {
    const { result } = renderHook(() => useBuilderStore());

    // Set some state
    act(() => {
      result.current.loadPage('page-1', 'project-1', [
        { id: 'section-1', type: 'hero', content: {}, order: 0 }
      ], [], 'Test Page');
      result.current.setSaveStatus('saved');
      result.current.markDirty();
    });

    expect(result.current.sections.length).toBe(1);
    expect(result.current.isDirty).toBe(true);

    // Clear all
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.sections).toEqual([]);
    expect(result.current.publishedSections).toEqual([]);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.pageId).toBe(null);
    expect(result.current.projectId).toBe(null);
  });
});