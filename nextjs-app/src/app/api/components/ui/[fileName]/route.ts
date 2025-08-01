import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await params;
    
    // Security check - only allow specific files
    const allowedFiles = [
      'button.tsx',
      'input.tsx',
      'card.tsx',
      'alert.tsx',
      'dialog.tsx',
      'tabs.tsx',
      'accordion.tsx',
      'avatar.tsx',
      'breadcrumb.tsx',
      'tooltip.tsx',
    ];
    
    if (!allowedFiles.includes(fileName)) {
      return NextResponse.json({ error: 'File not allowed' }, { status: 403 });
    }
    
    const filePath = join(process.cwd(), 'src', 'components', 'ui', fileName);
    const code = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(code, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}