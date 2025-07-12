/**
 * Converts Editor.js data to Markdown format
 * @param {Object} editorData - Editor.js saved data object
 * @returns {string} Markdown formatted text
 */
export const editorJsToMarkdown = (editorData: any): string => {
  let markdown = '';
  
  if (!editorData || !editorData.blocks) {
    return markdown;
  }
  
  editorData.blocks.forEach((block: any) => {
    switch (block.type) {
      case 'header': {
        const level = block.data.level;
        
        const headerText = '#'.repeat(level) + ' ' + block.data.text + '\n\n';
        
        markdown += headerText;
        break;
      }
        
      case 'paragraph':
        markdown += block.data.text + '\n\n';
        break;
        
      case 'list': {
        const listItems = block.data.items;
        const isNested = Array.isArray(listItems) && listItems.some((item: any) => item.items && item.items.length);
        
        if (isNested) {
          // Handle nested lists by recursively processing them
          const processNestedList = (items: any[], level = 0, ordered = false) => {
            items.forEach((item: any) => {
              const indent = ' '.repeat(level * 2);
              const marker = ordered ? '1.' : '-';
              
              if (typeof item === 'string') {
                markdown += `${indent}${marker} ${item}\n`;
              } else if (typeof item.content === 'string') {
                markdown += `${indent}${marker} ${item.content}\n`;
                
                if (item.items && item.items.length) {
                  processNestedList(item.items, level + 1, ordered);
                }
              }
            });
          };
          
          processNestedList(listItems, 0, block.data.style === 'ordered');
          markdown += '\n';
        } else {
          // Handle simple lists
          listItems.forEach((item: string) => {
            if (block.data.style === 'ordered') {
              markdown += '1. ' + item + '\n';
            } else if (block.data.style === 'checklist') {
              markdown += '- [ ] ' + item + '\n';
            } else {
              markdown += '- ' + item + '\n';
            }
          });
          markdown += '\n';
        }
        break;
      }
        
      case 'quote':
        markdown += '> ' + block.data.text + '\n';
        if (block.data.caption) {
          markdown += '> — ' + block.data.caption + '\n';
        }
        markdown += '\n';
        break;
        
      case 'code':
        markdown += '```' + (block.data.language || '') + '\n' + block.data.code + '\n```\n\n';
        break;
        
      case 'image': {
        // Caption is optional, so check if it exists
        const caption = block.data.caption ? ` "${block.data.caption}"` : '';
        markdown += `![${block.data.caption || 'Image'}](${block.data.file.url}${caption})\n\n`;
        break;
      }
        
      case 'table':
        if (block.data.content && block.data.content.length > 0) {
          // Header row
          markdown += '| ' + block.data.content[0].join(' | ') + ' |\n';
          // Separator row
          markdown += '| ' + block.data.content[0].map(() => '---').join(' | ') + ' |\n';
          
          // Content rows (if there are any beyond the first row)
          if (block.data.content.length > 1) {
            block.data.content.slice(1).forEach((row: string[]) => {
              markdown += '| ' + row.join(' | ') + ' |\n';
            });
          }
        }
        markdown += '\n';
        break;
        
      case 'delimiter':
        markdown += '---\n\n';
        break;
        
      case 'columns':
        markdown += '<!-- columns start -->\n';
        block.data.columns.forEach((column: any, index: number) => {
          markdown += `<!-- column ${index+1} start -->\n`;
          column.blocks.forEach((columnBlock: any) => {
            // Process each column's blocks (simplified)
            if (columnBlock.type === 'paragraph') {
              markdown += columnBlock.data.text + '\n\n';
            } else if (columnBlock.type === 'header') {
              markdown += '#'.repeat(columnBlock.data.level) + ' ' + columnBlock.data.text + '\n\n';
            }
            // Add more nested block types as needed
          });
          markdown += `<!-- column ${index+1} end -->\n`;
        });
        markdown += '<!-- columns end -->\n\n';
        break;
        
      default:
        // Generic handling for unknown block types
        if (block.data && block.data.text) {
          markdown += block.data.text + '\n\n';
        }
    }
  });
  
  return markdown;
};

/**
 * Converts Markdown to Editor.js data
 * This is a simplified conversion and may not handle all cases perfectly
 * @param {string} markdown - Markdown formatted text
 * @returns {Object} Editor.js compatible data object
 */
export const markdownToEditorJs = (markdown: string) => {
  const blocks: any[] = [];
  
  // If markdown is empty or undefined, return a single empty paragraph block
  if (!markdown || markdown.trim() === '') {
    return { 
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: ''
          }
        }
      ] 
    };
  }
  
  // Split content by double newlines to separate blocks
  const lines = markdown.split(/\n\n+/);
  
  lines.forEach((line) => {
    line = line.trim();
    if (!line) return; // Skip empty lines
    
    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      blocks.push({
        type: 'header',
        data: {
          text: headerMatch[2],
          level: headerMatch[1].length
        }
      });
      return;
    }
    
    // Blockquote
    if (line.startsWith('>')) {
      // Extract caption if it exists (format: "> text\n> — caption")
      const quoteLines = line.split('\n');
      const text = quoteLines[0].replace(/^>\s*/, '');
      let caption = '';
      
      if (quoteLines.length > 1 && quoteLines[1].match(/^>\s*[—-]\s*(.+)$/)) {
        caption = quoteLines[1].match(/^>\s*[—-]\s*(.+)$/)[1];
      }
      
      blocks.push({
        type: 'quote',
        data: {
          text,
          caption
        }
      });
      return;
    }
    
    // Code blocks
    const codeMatch = line.match(/^```(.*?)\n([\s\S]*?)```$/);
    if (codeMatch) {
      blocks.push({
        type: 'code',
        data: {
          language: codeMatch[1] || '',
          code: codeMatch[2]
        }
      });
      return;
    }
    
    // Lists
    if (line.match(/^[-*+]\s+/) || line.match(/^\d+\.\s+/)) {
      const items = line.split('\n').map(item => item.replace(/^[-*+\d.]\s+/, ''));
      const isOrdered = line.match(/^\d+\.\s+/) !== null;
      
      // Check if this might be a nested list
      if (items.some(item => item.includes('* ') || item.includes('- ') || item.includes('+ ') || item.match(/^\d+\.\s/))) {
        // For nested lists, use nestedList instead of list
        blocks.push({
          type: 'nestedList',
          data: {
            style: isOrdered ? 'ordered' : 'unordered',
            items: items.map(item => ({ content: item, items: [] }))
          }
        });
      } else {
        // Regular list
        blocks.push({
          type: 'list',
          data: {
            style: isOrdered ? 'ordered' : 'unordered',
            items
          }
        });
      }
      return;
    }
    
    // Table parsing
    if (line.includes('|') && line.includes('-|-') || line.includes('|--') || line.includes('--|')) {
      const rows = line.split('\n').filter(row => row.trim().length > 0);
      if (rows.length >= 2) { // Need at least header and separator
        // Process the table rows
        const tableData: string[][] = [];
        
        rows.forEach((row) => {
          if (!row.includes('---')) { // Skip separator row with dashes
            // Clean up the row data
            const cells = row.split('|')
              .map(cell => cell.trim())
              .filter((cell, idx, arr) => idx === 0 ? cell !== '' : true) // Keep first cell only if not empty
              .filter((cell, idx, arr) => idx === arr.length - 1 ? cell !== '' : true); // Keep last cell only if not empty
              
            tableData.push(cells);
          }
        });
        
        if (tableData.length > 0) {
          blocks.push({
            type: 'table',
            data: {
              content: tableData
            }
          });
          return;
        }
      }
    }
    
    // Horizontal rule
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      blocks.push({
        type: 'delimiter',
        data: {}
      });
      return;
    }
    
    // Images
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      blocks.push({
        type: 'image',
        data: {
          caption: imageMatch[1] === 'Image' ? '' : imageMatch[1],
          file: {
            url: imageMatch[2]
          },
          withBorder: false,
          stretched: false,
          withBackground: false
        }
      });
      return;
    }
    
    // Default to paragraph
    blocks.push({
      type: 'paragraph',
      data: {
        text: line
      }
    });
  });
  
  // Ensure we always have at least one block for editor functionality
  if (blocks.length === 0) {
    blocks.push({
      type: 'paragraph',
      data: {
        text: ''
      }
    });
  }
  
  return { blocks };
};