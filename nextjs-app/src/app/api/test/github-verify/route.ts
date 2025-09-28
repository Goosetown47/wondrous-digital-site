import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    // Check environment variables
    const config = {
      hasToken: !!env.GITHUB_TOKEN,
      tokenPreview: env.GITHUB_TOKEN ? env.GITHUB_TOKEN.substring(0, 10) + '...' : 'Not set',
      owner: env.GITHUB_OWNER || 'Not set',
      repo: env.GITHUB_REPO || 'Not set',
      branch: env.GITHUB_DEFAULT_BRANCH || 'Not set',
      enabled: env.GITHUB_ENABLED !== 'false'
    };

    // Test GitHub API connection if token exists
    let apiStatus = 'Not tested';
    let repoInfo = null;
    let error = null;

    if (env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO) {
      try {
        const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

        // Test authentication
        await octokit.rest.users.getAuthenticated();

        // Test repo access
        const { data: repo } = await octokit.rest.repos.get({
          owner: env.GITHUB_OWNER,
          repo: env.GITHUB_REPO
        });

        apiStatus = 'Connected';
        repoInfo = {
          fullName: repo.full_name,
          defaultBranch: repo.default_branch,
          private: repo.private,
          permissions: repo.permissions
        };
      } catch (apiError: unknown) {
        apiStatus = 'Failed';
        error = apiError instanceof Error ? apiError.message : 'Unknown error';
      }
    }

    return NextResponse.json({
      success: apiStatus === 'Connected',
      config,
      apiStatus,
      repoInfo,
      error,
      testPath: 'src/components/core/sections/hero1.tsx'
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}