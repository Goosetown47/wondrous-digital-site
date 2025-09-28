import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubComponentService } from '../component-files';
import type { CoreComponent } from '@/types/builder';

// Mock Octokit
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: {
      createOrUpdateFileContents: vi.fn().mockResolvedValue({
        data: {
          content: { sha: 'mock-sha' },
          commit: { sha: 'mock-commit-sha' }
        }
      }),
      getContent: vi.fn().mockResolvedValue({
        data: { sha: 'existing-sha' }
      })
    },
    pulls: {
      create: vi.fn().mockResolvedValue({
        data: {
          number: 123,
          html_url: 'https://github.com/owner/repo/pull/123'
        }
      })
    }
  }))
}));

describe('GitHubComponentService', () => {
  let service: GitHubComponentService;
  const mockComponent: CoreComponent = {
    id: 'test-id',
    name: 'Epic Hero',
    code_name: 'Hero12',
    type: 'section',
    source: 'shadcn',
    code: `export function Hero12() { return <div>Hero Component</div>; }`,
    dependencies: ['@/components/ui/button'],
    imports: ["import { Button } from '@/components/ui/button'"],
    metadata: {},
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    base_type: 'Hero',
    auto_number: 12,
    deployment_status: {
      dev: false,
      staging: false,
      prod: false,
      files_created: false,
      registry_updated: false,
      github_pr: null,
      last_deployment: null
    },
    pipeline_status: 'created'
  };

  beforeEach(() => {
    // Set up environment variables
    vi.stubEnv('GITHUB_TOKEN', 'test-token');
    vi.stubEnv('GITHUB_OWNER', 'test-owner');
    vi.stubEnv('GITHUB_REPO', 'test-repo');
    vi.stubEnv('GITHUB_DEFAULT_BRANCH', 'staging');

    service = new GitHubComponentService();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('createComponentFile', () => {
    it('should create correct file structure for a component', async () => {
      const result = await service.createComponentFile(mockComponent);

      expect(result).toBeDefined();
      expect(result.path).toBe('src/components/core/sections/hero12.tsx');
      expect(result.content).toContain('Hero12');
      expect(result.content).toContain('export function Hero12');
      expect(result.content).toContain('EditableSectionWrapper');
    });

    it('should include editable wrapper in generated file', async () => {
      const result = await service.createComponentFile(mockComponent);

      expect(result.content).toContain('editable = false');
      expect(result.content).toContain('onContentUpdate');
      expect(result.content).toContain('Hero12Base');
      expect(result.content).toContain('export const hero12Config');
    });

    it('should handle components without code_name gracefully', async () => {
      const componentWithoutCodeName = { ...mockComponent, code_name: undefined };

      await expect(
        service.createComponentFile(componentWithoutCodeName)
      ).rejects.toThrow('Component must have code_name');
    });
  });

  describe('updateRegistryFile', () => {
    it('should generate valid imports for multiple components', async () => {
      const components = [
        mockComponent,
        { ...mockComponent, id: 'test-2', code_name: 'Footer1', base_type: 'Footer' }
      ];

      const result = await service.updateRegistryFile(components);

      expect(result).toBeDefined();
      expect(result.content).toContain("import { Hero12, hero12Config } from '@/components/core/sections/hero12'");
      expect(result.content).toContain("import { Footer1, footer1Config } from '@/components/core/sections/footer1'");
      expect(result.content).toContain('ComponentRegistry.register');
    });

    it('should include auto-generation header with timestamp', async () => {
      const result = await service.updateRegistryFile([mockComponent]);

      expect(result.content).toContain('THIS FILE IS AUTO-GENERATED');
      expect(result.content).toContain('Generated at:');
      expect(result.content).toContain('Components: 1');
    });

    it('should handle empty component list', async () => {
      const result = await service.updateRegistryFile([]);

      expect(result.content).toContain('Components: 0');
      expect(result.content).toContain('export function registerGeneratedComponents()');
    });
  });

  describe('createPullRequest', () => {
    it('should create PR with correct parameters', async () => {
      const files = [
        { path: 'src/components/core/sections/hero12.tsx', content: 'test content' }
      ];

      const result = await service.createPullRequest(
        files,
        'staging',
        'Add Hero12 component'
      );

      expect(result).toBeDefined();
      expect(result.number).toBe(123);
      expect(result.url).toBe('https://github.com/owner/repo/pull/123');
    });

    it('should include file list in PR body', async () => {
      const files = [
        { path: 'test1.tsx', content: 'test1' },
        { path: 'test2.tsx', content: 'test2' }
      ];

      await service.createPullRequest(files, 'main', 'Test PR');

      const mockOctokit = (service as unknown as { octokit: { pulls: { create: { mock: { calls: Array<[Record<string, unknown>]> } } } } }).octokit;
      const callArgs = mockOctokit.pulls.create.mock.calls[0][0];
      expect(callArgs.body).toContain('test1.tsx');
      expect(callArgs.body).toContain('test2.tsx');
    });
  });

  describe('checkFileExists', () => {
    it('should return true if file exists', async () => {
      const exists = await service.checkFileExists(
        'src/components/core/sections/hero1.tsx',
        'staging'
      );

      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const mockOctokit = (service as unknown as { octokit: { repos: { getContent: ReturnType<typeof vi.fn> } } }).octokit;
      mockOctokit.repos.getContent = vi.fn().mockRejectedValue({ status: 404 });

      const exists = await service.checkFileExists(
        'src/components/core/sections/hero999.tsx',
        'staging'
      );

      expect(exists).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle API rate limiting', async () => {
      const mockOctokit = (service as unknown as { octokit: { repos: { createOrUpdateFileContents: ReturnType<typeof vi.fn> } } }).octokit;
      mockOctokit.repos.createOrUpdateFileContents = vi.fn()
        .mockRejectedValue({ status: 403, message: 'API rate limit exceeded' });

      await expect(
        service.createComponentFile(mockComponent)
      ).rejects.toThrow('rate limit');
    });

    it('should handle network failures gracefully', async () => {
      const mockOctokit = (service as unknown as { octokit: { repos: { createOrUpdateFileContents: ReturnType<typeof vi.fn> } } }).octokit;
      mockOctokit.repos.createOrUpdateFileContents = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      await expect(
        service.createComponentFile(mockComponent)
      ).rejects.toThrow('Network error');
    });

    it('should validate environment variables', () => {
      vi.unstubAllEnvs();
      delete process.env.GITHUB_TOKEN;

      expect(() => new GitHubComponentService()).toThrow('GITHUB_TOKEN is required');
    });
  });

  describe('file generation', () => {
    it('should generate correct file path based on component type', async () => {
      const navigationComponent = {
        ...mockComponent,
        code_name: 'Navigation5',
        base_type: 'Navigation'
      };

      const result = await service.createComponentFile(navigationComponent);
      expect(result.path).toBe('src/components/core/navigation/navigation5.tsx');
    });

    it('should handle special characters in component names', async () => {
      const specialComponent = {
        ...mockComponent,
        name: 'Hero & Featured Section',
        code_name: 'HeroFeatured1'
      };

      const result = await service.createComponentFile(specialComponent);
      expect(result.content).not.toContain('&');
      expect(result.content).toContain('HeroFeatured1');
    });
  });
});