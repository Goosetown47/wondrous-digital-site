import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallCommandsDialog } from '../InstallCommandsDialog';

// Mock fetch
global.fetch = vi.fn();

describe('InstallCommandsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render trigger button', () => {
      render(<InstallCommandsDialog />);
      expect(screen.getByText('Install Commands')).toBeInTheDocument();
    });

    it('should open dialog when trigger clicked', async () => {
      render(<InstallCommandsDialog />);

      const trigger = screen.getByText('Install Commands');
      await userEvent.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/paste your installation commands/i)).toBeInTheDocument();
    });

    it('should show textarea in input step', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).not.toBeDisabled();
    });

    it('should show preview and cancel buttons in input step', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    });
  });

  describe('command input', () => {
    it('should allow typing commands', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      expect(textarea).toHaveValue('npm install framer-motion');
    });

    it('should allow multi-line input', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      const commands = `npm install framer-motion
npx shadcn add button`;

      await userEvent.type(textarea, commands);

      expect(textarea).toHaveValue(commands);
    });

    it('should disable preview button when textarea is empty', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).toBeDisabled();
    });

    it('should enable preview button when text is entered', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).not.toBeDisabled();
    });
  });

  describe('preview functionality', () => {
    it('should call preview API when preview button clicked', async () => {
      const mockResponse = {
        success: true,
        parsed: {
          commands: [
            {
              type: 'npm',
              originalCommand: 'npm install framer-motion',
              packages: ['framer-motion'],
              warnings: [],
            },
          ],
          hasWarnings: false,
          totalCommands: 1,
        },
        preview: {
          npmPackages: [
            { name: 'framer-motion', alreadyInstalled: false, version: undefined },
          ],
          shadcnComponents: [],
        },
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/commands/preview',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ commands: 'npm install framer-motion' }),
        })
      );
    });

    it('should show loading state while fetching preview', async () => {
      vi.mocked(global.fetch).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display preview panel after successful fetch', async () => {
      const mockResponse = {
        success: true,
        parsed: {
          commands: [
            {
              type: 'npm',
              originalCommand: 'npm install framer-motion',
              packages: ['framer-motion'],
              warnings: [],
            },
          ],
          hasWarnings: false,
          totalCommands: 1,
        },
        preview: {
          npmPackages: [
            { name: 'framer-motion', alreadyInstalled: false, version: undefined },
          ],
          shadcnComponents: [],
        },
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText(/framer-motion/i)).toBeInTheDocument();
      });
    });

    it('should show error message if preview fails', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to parse commands' }),
      } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to parse commands/i)).toBeInTheDocument();
      });
    });
  });

  describe('execute functionality', () => {
    it('should show execute button in preview step', async () => {
      const mockResponse = {
        success: true,
        parsed: {
          commands: [
            {
              type: 'npm',
              originalCommand: 'npm install framer-motion',
              packages: ['framer-motion'],
              warnings: [],
            },
          ],
          hasWarnings: false,
          totalCommands: 1,
        },
        preview: {
          npmPackages: [
            { name: 'framer-motion', alreadyInstalled: false, version: undefined },
          ],
          shadcnComponents: [],
        },
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
      });
    });

    it('should call execute API when execute button clicked', async () => {
      const mockPreviewResponse = {
        success: true,
        parsed: {
          commands: [
            {
              type: 'npm',
              originalCommand: 'npm install framer-motion',
              packages: ['framer-motion'],
              warnings: [],
            },
          ],
          hasWarnings: false,
          totalCommands: 1,
        },
        preview: {
          npmPackages: [
            { name: 'framer-motion', alreadyInstalled: false, version: undefined },
          ],
          shadcnComponents: [],
        },
      };

      const mockExecuteResponse = {
        success: true,
        results: [
          {
            command: 'npm install framer-motion',
            type: 'npm',
            success: true,
            output: 'added 1 package',
            errors: [],
          },
        ],
        summary: {
          total: 1,
          succeeded: 1,
          failed: 0,
        },
      };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreviewResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExecuteResponse,
        } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      const previewButton = screen.getByRole('button', { name: /preview/i });
      await userEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
      });

      const executeButton = screen.getByRole('button', { name: /execute/i });
      await userEvent.click(executeButton);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/commands/execute',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ commands: 'npm install framer-motion' }),
        })
      );
    });

    it('should show completion summary after successful execution', async () => {
      const mockPreviewResponse = {
        success: true,
        parsed: {
          commands: [
            {
              type: 'npm',
              originalCommand: 'npm install framer-motion',
              packages: ['framer-motion'],
              warnings: [],
            },
          ],
          hasWarnings: false,
          totalCommands: 1,
        },
        preview: {
          npmPackages: [
            { name: 'framer-motion', alreadyInstalled: false, version: undefined },
          ],
          shadcnComponents: [],
        },
      };

      const mockExecuteResponse = {
        success: true,
        results: [
          {
            command: 'npm install framer-motion',
            type: 'npm',
            success: true,
            output: 'added 1 package',
            errors: [],
          },
        ],
        summary: {
          total: 1,
          succeeded: 1,
          failed: 0,
        },
      };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreviewResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExecuteResponse,
        } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      await userEvent.click(screen.getByRole('button', { name: /preview/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /execute/i }));

      await waitFor(() => {
        expect(screen.getByText(/installation complete/i)).toBeInTheDocument();
        expect(screen.getByText(/1.*succeeded/i)).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('should allow going back from preview to input', async () => {
      const mockResponse = {
        success: true,
        parsed: {
          commands: [
            {
              type: 'npm',
              originalCommand: 'npm install framer-motion',
              packages: ['framer-motion'],
              warnings: [],
            },
          ],
          hasWarnings: false,
          totalCommands: 1,
        },
        preview: {
          npmPackages: [
            { name: 'framer-motion', alreadyInstalled: false, version: undefined },
          ],
          shadcnComponents: [],
        },
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      const textarea = screen.getByPlaceholderText(/paste your installation commands/i);
      await userEvent.type(textarea, 'npm install framer-motion');

      await userEvent.click(screen.getByRole('button', { name: /preview/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /back/i }));

      expect(screen.getByPlaceholderText(/paste your installation commands/i)).toBeInTheDocument();
    });

    it('should close dialog on cancel', async () => {
      render(<InstallCommandsDialog />);

      await userEvent.click(screen.getByText('Install Commands'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});