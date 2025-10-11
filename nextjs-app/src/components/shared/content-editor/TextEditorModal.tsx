'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProjectPages } from '@/hooks/useProjectPages';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  AlignLeft,
  Link2,
  Unlink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextType } from './EditableText';

interface TextEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  type?: TextType;
  onUpdate: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  projectId?: string | null;
}

export function TextEditorModal({
  open,
  onOpenChange,
  value,
  type = 'plain',
  onUpdate,
  placeholder = 'Enter text...',
  maxLength,
  projectId,
}: TextEditorModalProps) {
  const [plainText, setPlainText] = useState(value || '');
  const [activeTab, setActiveTab] = useState<'plain' | 'rich'>('plain');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkDialogUrl, setLinkDialogUrl] = useState('');
  const [linkDialogNewTab, setLinkDialogNewTab] = useState(false);
  const [linkType, setLinkType] = useState<'external' | 'internal'>('external');
  const [selectedPage, setSelectedPage] = useState('');

  // Fetch pages from the current project
  const { pages, loading: pagesLoading } = useProjectPages({
    projectId,
    enabled: open // Only fetch when modal is open
  });

  // Initialize Tiptap editor for rich text
  const editor = useEditor({
    immediatelyRender: false, // Fix for SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false, // Disable built-in Link to avoid duplicate with custom Link extension
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Enter your text here...',
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          'min-h-[200px] p-3 rounded-module-md border',
          // Ensure lists display properly in editor
          'prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:list-decimal prose-ol:pl-6',
          'prose-li:my-1',
          '[&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:list-decimal [&_ol]:pl-6'
        ),
      },
    },
  });

  // Update local state when value changes
  useEffect(() => {
    // Detect if content has HTML tags to determine initial tab
    const hasHtmlTags = value && (value.includes('<p>') || value.includes('<ul>') || value.includes('<ol>') ||
                                   value.includes('<strong>') || value.includes('<em>') || value.includes('<a>'));

    if (type === 'paragraph' && hasHtmlTags) {
      setActiveTab('rich');
    } else {
      setActiveTab('plain');
    }

    setPlainText(value || '');

    if (editor && value) {
      // Always set content as HTML/text - Tiptap handles both
      editor.commands.setContent(value);
    }
  }, [value, editor, type]);


  const handleSave = useCallback(() => {
    let finalValue = '';

    // Save based on active tab, not component type
    if (activeTab === 'rich' && editor) {
      // Save as HTML for rich text
      finalValue = editor.getHTML();
    } else {
      // Save as plain text
      finalValue = plainText;
    }

    if (maxLength && finalValue.length > maxLength) {
      finalValue = finalValue.slice(0, maxLength);
    }

    onUpdate(finalValue);
    onOpenChange(false);
  }, [activeTab, plainText, editor, maxLength, onUpdate, onOpenChange]);

  const handleCancel = useCallback(() => {
    // Reset to original values
    setPlainText(value || '');
    if (editor) {
      editor.commands.setContent(value || '');
    }
    onOpenChange(false);
  }, [value, editor, onOpenChange]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowLinkDialog(false);
      setLinkDialogUrl('');
      setLinkDialogNewTab(false);
      setLinkType('external');
      setSelectedPage('');
    }
  }, [open]);

  // Handle link operations
  const handleSetLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href || '';
    const previousTarget = editor.getAttributes('link').target || '';

    setLinkDialogUrl(previousUrl);
    setLinkDialogNewTab(previousTarget === '_blank');
    setShowLinkDialog(true);
  }, [editor]);

  const handleApplyLink = useCallback(() => {
    if (!editor) return;

    // Determine the final URL based on link type
    const finalUrl = linkType === 'internal' ? selectedPage : linkDialogUrl;
    if (!finalUrl) return;

    // Set the link with the URL and target
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: finalUrl,
        target: linkDialogNewTab ? '_blank' : null,
        rel: linkDialogNewTab ? 'noopener noreferrer' : null
      })
      .run();

    // Close dialog and reset
    setShowLinkDialog(false);
    setLinkDialogUrl('');
    setLinkDialogNewTab(false);
    setLinkType('external');
    setSelectedPage('');
  }, [editor, linkDialogUrl, linkDialogNewTab, linkType, selectedPage]);

  const handleUnsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const renderToolbar = () => {
    if (!editor) return null;

    return (
      <div className="flex items-center gap-1 p-2 border-b">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bold') && 'bg-muted'
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('italic') && 'bg-muted'
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bulletList') && 'bg-muted'
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('orderedList') && 'bg-muted'
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSetLink}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('link') && 'bg-muted'
          )}
          title="Add/Edit Link (Ctrl+K)"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        {editor.isActive('link') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUnsetLink}
            className="h-8 w-8 p-0"
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'heading' ? <Type className="h-5 w-5" /> : <AlignLeft className="h-5 w-5" />}
            Edit {type === 'heading' ? 'Heading' : type === 'button' ? 'Button Text' : 'Text'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit the text content for this section. Choose between plain text or rich text formatting.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'plain' | 'rich')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plain">Plain Text</TabsTrigger>
            <TabsTrigger value="rich" disabled={type === 'heading' || type === 'button'}>
              Rich Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plain" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="plain-text">Text Content</Label>
                {type === 'heading' || type === 'button' ? (
                  <Input
                    id="plain-text"
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className="mt-2"
                  />
                ) : (
                  <Textarea
                    id="plain-text"
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    rows={6}
                    className="mt-2"
                  />
                )}
                {maxLength && (
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {plainText.length} / {maxLength}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rich" className="mt-4">
            <div className="space-y-2">
              {editor ? (
                <>
                  {renderToolbar()}
                  <div className="max-h-[400px] overflow-y-auto rounded-module-md border">
                    <EditorContent editor={editor} />
                  </div>
                </>
              ) : (
                <div className="min-h-[200px] p-3 rounded-module-md border flex items-center justify-center text-muted-foreground">
                  Loading editor...
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Link Dialog */}
    <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <DialogDescription className="sr-only">
            Add a hyperlink to the selected text. Choose between external URLs or internal pages.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Link Type Selection */}
          <div className="grid gap-2">
            <Label>Link Type</Label>
            <RadioGroup value={linkType} onValueChange={(value) => setLinkType(value as 'external' | 'internal')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="external" id="external" />
                <Label htmlFor="external" className="font-normal cursor-pointer">
                  External URL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="internal" id="internal" />
                <Label htmlFor="internal" className="font-normal cursor-pointer">
                  Internal Page
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* External URL Input */}
          {linkType === 'external' && (
            <div className="grid gap-2">
              <Label htmlFor="link-url-input">URL</Label>
              <Input
                id="link-url-input"
                type="url"
                value={linkDialogUrl}
                onChange={(e) => setLinkDialogUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyLink();
                  }
                }}
              />
            </div>
          )}

          {/* Internal Page Selection */}
          {linkType === 'internal' && (
            <div className="grid gap-2">
              <Label htmlFor="page-select">Select Page</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger id="page-select">
                  <SelectValue placeholder={pagesLoading ? "Loading pages..." : pages.length === 0 ? "No pages available" : "Choose a page..."} />
                </SelectTrigger>
                <SelectContent>
                  {pages.length === 0 && !pagesLoading ? (
                    <div className="py-2 px-3 text-sm text-muted-foreground">
                      No pages available. Create pages in your project first.
                    </div>
                  ) : (
                    pages.map((page) => (
                      <SelectItem key={page.id} value={page.path}>
                        {page.title || page.path}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Open in new tab option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="link-new-tab"
              checked={linkDialogNewTab}
              onCheckedChange={(checked) => setLinkDialogNewTab(checked as boolean)}
            />
            <Label
              htmlFor="link-new-tab"
              className="text-sm font-normal cursor-pointer"
            >
              Open in new tab
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowLinkDialog(false);
              setLinkDialogUrl('');
              setLinkDialogNewTab(false);
              setLinkType('external');
              setSelectedPage('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyLink}
            disabled={linkType === 'external' ? !linkDialogUrl : !selectedPage}
          >
            Apply Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}