import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');

// Add global test utilities
(global as Record<string, unknown>).vi = vi;