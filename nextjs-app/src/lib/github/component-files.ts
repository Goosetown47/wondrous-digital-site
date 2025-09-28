import { Octokit } from '@octokit/rest';
import type { CoreComponent } from '@/types/builder';

/**
 * Represents a file change to be committed to GitHub
 */
export interface FileChange {
  path: string;
  content: string;
}

/**
 * Result of creating a pull request
 */
export interface PullRequestResult {
  number: number;
  url: string;
  branch: string;
}

/**
 * Service for managing component files in GitHub repository
 * Handles file creation, registry updates, and PR creation
 */

export class GitHubComponentService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private defaultBranch: string;

  constructor() {
    // Validate environment variables
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const defaultBranch = process.env.GITHUB_DEFAULT_BRANCH || 'staging';

    if (!token) throw new Error('GITHUB_TOKEN is required');
    if (!owner) throw new Error('GITHUB_OWNER is required');
    if (!repo) throw new Error('GITHUB_REPO is required');

    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
    this.defaultBranch = defaultBranch;
  }

  async createComponentFile(component: CoreComponent): Promise<FileChange> {
    if (!component.code_name) {
      throw new Error('Component must have code_name');
    }

    const componentType = this.getComponentType(component);
    const fileName = component.code_name.toLowerCase();
    const path = `src/components/core/${componentType}/${fileName}.tsx`;
    const content = this.generateComponentFile(component);

    // Check for rate limiting
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: `Add ${component.name} component`,
        content: Buffer.from(content).toString('base64'),
        branch: this.defaultBranch
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 403 && 'message' in error && typeof error.message === 'string' && error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw error;
    }

    return { path, content };
  }

  async updateRegistryFile(components: CoreComponent[]): Promise<FileChange> {
    const path = 'src/lib/register-components-generated.tsx';
    const content = this.generateRegistryFile(components);

    try {
      // Check if file exists to get SHA
      let sha: string | undefined;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path,
          ref: this.defaultBranch
        });
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch {
        // File doesn't exist, that's okay
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: 'Update component registry',
        content: Buffer.from(content).toString('base64'),
        branch: this.defaultBranch,
        sha
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 403 && 'message' in error && typeof error.message === 'string' && error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw error;
    }

    return { path, content };
  }

  async createPullRequest(
    files: FileChange[],
    targetBranch: string,
    title: string
  ): Promise<PullRequestResult> {
    // For now, we're directly committing to the target branch
    // In a real implementation, we'd create a feature branch first

    const pr = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title,
      head: this.defaultBranch,
      base: targetBranch,
      body: `Auto-generated PR for component pipeline\n\nFiles changed:\n${files.map(f => `- ${f.path}`).join('\n')}`
    });

    return {
      number: pr.data.number,
      url: pr.data.html_url,
      branch: this.defaultBranch
    };
  }

  async checkFileExists(path: string, branch: string): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch
      });
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  private getComponentType(component: CoreComponent): string {
    // Determine directory based on component type
    const baseType = component.base_type?.toLowerCase();

    if (baseType?.includes('nav')) return 'navigation';
    if (baseType?.includes('footer')) return 'sections';
    if (baseType?.includes('header')) return 'sections';

    // Default to sections for most components
    return 'sections';
  }

  private generateComponentFile(component: CoreComponent): string {
    const componentName = component.code_name;
    const configName = componentName!.toLowerCase() + 'Config';
    // Escape special characters in component name for comments
    const safeName = component.name.replace(/&/g, 'and').replace(/</g, '').replace(/>/g, '');

    return `// Auto-generated component: ${safeName}
// Generated at: ${new Date().toISOString()}
// Do not edit directly - edit in Core UI instead

'use client';

import { EditableSectionWrapper } from '@/components/shared/content-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';

// Original component code
${component.code}

// Base component (renamed for wrapping)
const ${componentName}Base = ${componentName};

// Editable wrapper for LAB/BUILDER
export function ${componentName}(props: any) {
  const { editable = false, onContentUpdate, ...content } = props;

  // Production mode - return static component
  if (!editable) {
    return <${componentName}Base {...content} />;
  }

  // Edit mode - wrap with editing capabilities
  return (
    <EditableSectionWrapper
      componentName="${componentName}"
      content={content}
      editable={true}
      onContentUpdate={onContentUpdate}
    >
      <${componentName}Base {...content} />
    </EditableSectionWrapper>
  );
}

// Export configuration for registry
export const ${configName} = {
  editableFields: ${JSON.stringify(component.editable_fields || [], null, 2)} as EditableFieldConfig[],
  defaultContent: ${JSON.stringify(component.default_content || {}, null, 2)}
};
`;
  }

  private generateRegistryFile(components: CoreComponent[]): string {
    const timestamp = new Date().toISOString();
    const imports = components
      .filter(c => c.code_name)
      .map(c => {
        const fileName = c.code_name!.toLowerCase();
        const configName = fileName + 'Config';
        const componentType = this.getComponentType(c);
        return `import { ${c.code_name}, ${configName} } from '@/components/core/${componentType}/${fileName}';`;
      })
      .join('\n');

    const registrations = components
      .filter(c => c.code_name)
      .map(c => {
        const configName = c.code_name!.toLowerCase() + 'Config';
        return `  ComponentRegistry.register('${c.code_name}', {
    component: ${c.code_name},
    type: '${c.type}',
    defaultContent: ${configName}.defaultContent,
    editableFields: ${configName}.editableFields,
    source: '${c.source}'
  });`;
      })
      .join('\n\n');

    return `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Generated at: ${timestamp}
// Components: ${components.length}

import { ComponentRegistry } from '@/lib/component-registry';

${imports}

export function registerGeneratedComponents() {
${registrations || '  // No components to register'}
}
`;
  }
}