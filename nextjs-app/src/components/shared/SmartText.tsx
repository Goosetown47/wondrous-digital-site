'use client';

import { useMemo, createElement } from 'react';
import { sanitizeHtml } from '@/lib/sanitization';
import { cn } from '@/lib/utils';

type HTMLTag = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'article' | 'section';

interface SmartTextProps {
  content?: string | null;
  as?: HTMLTag;
  className?: string;
  fallback?: string;
  forceRichText?: boolean;
  children?: React.ReactNode;
}

/**
 * Universal text component that automatically detects and renders
 * plain text, HTML, or Tiptap JSON content appropriately.
 *
 * @param content - The text content (plain, HTML, or JSON string)
 * @param as - HTML element to use for plain text rendering (default: 'p')
 * @param className - CSS classes to apply
 * @param fallback - Text to show when content is empty
 * @param forceRichText - Force rich text rendering even for plain text
 * @param children - Optional children (used when content is empty)
 */
export function SmartText({
  content,
  as = 'p',
  className,
  fallback = '',
  forceRichText = false,
  children,
}: SmartTextProps) {
  // Detect if content is rich text (has HTML tags)
  const isRichContent = useMemo(() => {
    if (!content || typeof content !== 'string') return false;
    if (forceRichText) return true;

    // Simple check: does it contain HTML tags?
    const hasHtmlTags = /<(?:p|div|span|strong|em|ul|ol|li|h[1-6]|br|a|blockquote)[^>]*>/i.test(content);
    return hasHtmlTags;
  }, [content, forceRichText]);

  // If no content, show fallback or children
  if (!content) {
    if (children) return <>{children}</>;
    if (fallback) {
      const Tag = as;
      return createElement(Tag, { className }, fallback);
    }
    return null;
  }

  // Render rich content with sanitized HTML
  if (isRichContent) {
    const sanitizedHtml = sanitizeHtml(content);

    return (
      <div
        className={cn(
          'prose prose-sm max-w-none',
          'prose-headings:font-bold prose-headings:text-foreground',
          'prose-p:text-muted-foreground prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-strong:font-semibold prose-strong:text-foreground',
          'prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:list-decimal prose-ol:pl-6',
          'prose-li:text-muted-foreground prose-li:marker:text-muted-foreground',
          'prose-li:my-1',
          // DON'T include the passed className for rich content
          // Text utilities conflict with prose styling
        )}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Render plain text
  const Tag = as;
  return createElement(Tag, { className }, content);
}

/**
 * Convenience components for common use cases
 */
export function SmartParagraph(props: Omit<SmartTextProps, 'as'>) {
  return <SmartText {...props} as="p" />;
}

export function SmartHeading(props: Omit<SmartTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const { level = 1, ...rest } = props;
  return <SmartText {...rest} as={`h${level}` as HTMLTag} />;
}

export function SmartSpan(props: Omit<SmartTextProps, 'as'>) {
  return <SmartText {...props} as="span" />;
}