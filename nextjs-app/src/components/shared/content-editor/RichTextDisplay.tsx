'use client';

import { useMemo } from 'react';
import { sanitizeHtml } from '@/lib/sanitization';
import { cn } from '@/lib/utils';

interface RichTextDisplayProps {
  content: string | Record<string, unknown>;
  className?: string;
}

/**
 * Safely renders HTML content with DOMPurify for XSS protection.
 * This simplified version just sanitizes and displays HTML.
 * No more JSON parsing or conversion - that complexity was unnecessary.
 */
export function RichTextDisplay({
  content,
  className,
}: RichTextDisplayProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';

    // If it's already a string (HTML), use it
    let html = '';
    if (typeof content === 'string') {
      html = content;
    } else {
      // If somehow an object is passed, try to stringify it
      console.warn('RichTextDisplay received non-string content:', content);
      html = JSON.stringify(content);
    }

    // Sanitize HTML to prevent XSS attacks
    const sanitized = sanitizeHtml(html);

    return sanitized;
  }, [content]);

  // If no content or empty after sanitization, show placeholder
  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-bold prose-headings:text-foreground',
        'prose-p:text-muted-foreground prose-p:leading-relaxed',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:font-semibold prose-strong:text-foreground',
        // List styling fixes - ensure proper display of bullets and numbers
        'prose-ul:list-disc prose-ul:pl-6 prose-ul:my-2',
        'prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-2',
        'prose-li:text-muted-foreground prose-li:marker:text-muted-foreground',
        'prose-li:my-1',
        // Nested list styling
        '[&_ul]:list-disc [&_ul]:pl-6',
        '[&_ol]:list-decimal [&_ol]:pl-6',
        '[&_li]:marker:text-muted-foreground',
        // Ensure list markers are visible
        '[&_ul]:list-inside [&_ol]:list-inside',
        'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-md',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}