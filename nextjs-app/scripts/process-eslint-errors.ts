#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

interface EslintError {
  file: string;
  line: number;
  column: number;
  severity: 'Error' | 'Warning';
  message: string;
  rule: string;
}

function parseEslintOutput(): Map<string, EslintError[]> {
  const errorsByFile = new Map<string, EslintError[]>();
  
  try {
    // Run npm lint and capture output
    const output = execSync('npm run lint 2>&1', { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });

    // Split by lines and process
    const lines = output.split('\n');
    let currentFile = '';

    for (const line of lines) {
      // Match file path
      if (line.startsWith('./src/')) {
        currentFile = line.trim();
        if (!errorsByFile.has(currentFile)) {
          errorsByFile.set(currentFile, []);
        }
      }
      // Match error/warning lines (format: "line:column  Severity: Message  rule-name")
      else if (currentFile && /^\d+:\d+\s+(Error|Warning):/.test(line)) {
        const match = line.match(/^(\d+):(\d+)\s+(Error|Warning):\s+(.+?)\s\s+(.+)$/);
        if (match) {
          const [, lineNum, colNum, severity, message, rule] = match;
          errorsByFile.get(currentFile)!.push({
            file: currentFile,
            line: parseInt(lineNum),
            column: parseInt(colNum),
            severity: severity as 'Error' | 'Warning',
            message: message.trim(),
            rule: rule.trim()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error running npm lint:', error);
  }

  return errorsByFile;
}

function formatOutput(errorsByFile: Map<string, EslintError[]>): string {
  let output = '# ESLint Error Report\n\n';
  let totalErrors = 0;
  let totalWarnings = 0;

  // Sort files alphabetically
  const sortedFiles = Array.from(errorsByFile.keys()).sort();

  for (const file of sortedFiles) {
    const errors = errorsByFile.get(file)!;
    if (errors.length === 0) continue;

    output += `## ${file}\n\n`;
    
    // Sort errors by line number
    errors.sort((a, b) => a.line - b.line);

    for (const error of errors) {
      output += `- **Line ${error.line}:${error.column}** [${error.severity}] ${error.message} \`${error.rule}\`\n`;
      
      if (error.severity === 'Error') {
        totalErrors++;
      } else {
        totalWarnings++;
      }
    }
    
    output += '\n';
  }

  output = `**Total: ${totalErrors} errors, ${totalWarnings} warnings**\n\n` + output;

  return output;
}

// Main execution
console.log('Processing ESLint errors...');
const errorsByFile = parseEslintOutput();
const formattedOutput = formatOutput(errorsByFile);

// Write to file
const outputPath = './eslint-errors-report.md';
writeFileSync(outputPath, formattedOutput);

// Also output to console
console.log(formattedOutput);
console.log(`\nReport saved to: ${outputPath}`);