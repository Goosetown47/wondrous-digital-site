import { describe, it, expect } from 'vitest';
import {
  validateSlug,
  isReservedSlug,
  getAllReservedPatterns,
  getReservedPatternsByCategory,
} from '../slug-validation';

describe('Slug Validation Service', () => {
  describe('validateSlug', () => {
    describe('Basic validation', () => {
      it('should reject empty slug', () => {
        const result = validateSlug('');
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Slug cannot be empty.');
      });

      it('should reject null or undefined', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result1 = validateSlug(null as any);
        expect(result1.isValid).toBe(false);
        expect(result1.message).toBe('Slug is required and must be a string.');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result2 = validateSlug(undefined as any);
        expect(result2.isValid).toBe(false);
        expect(result2.message).toBe('Slug is required and must be a string.');
      });

      it('should reject slug longer than 63 characters', () => {
        const longSlug = 'a'.repeat(64);
        const result = validateSlug(longSlug);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Slug must be 63 characters or less.');
      });

      it('should reject slugs with invalid characters', () => {
        const invalidSlugs = [
          'test space',
          'test_underscore',
          'test.period',
          'test@at',
          'test#hash',
          'test$dollar',
          'test%percent',
          'test&ampersand',
          'test*asterisk',
          'test(parenthesis',
          'test[bracket',
          'test{brace',
          'test|pipe',
          'test\\backslash',
          'test/slash',
          'test:colon',
          'test;semicolon',
          'test"quote',
          "test'apostrophe",
          'test<less',
          'test>greater',
          'test?question',
          'test=equals',
          'test+plus',
          'test~tilde',
          'test`backtick',
        ];

        invalidSlugs.forEach(slug => {
          const result = validateSlug(slug);
          expect(result.isValid).toBe(false);
          expect(result.message).toBe('Slug can only contain letters, numbers, and hyphens.');
        });
      });

      it('should reject slugs starting or ending with hyphen', () => {
        const result1 = validateSlug('-test');
        expect(result1.isValid).toBe(false);
        expect(result1.message).toBe('Slug cannot start or end with a hyphen.');

        const result2 = validateSlug('test-');
        expect(result2.isValid).toBe(false);
        expect(result2.message).toBe('Slug cannot start or end with a hyphen.');

        const result3 = validateSlug('-test-');
        expect(result3.isValid).toBe(false);
        expect(result3.message).toBe('Slug cannot start or end with a hyphen.');
      });

      it('should accept valid slugs', () => {
        const validSlugs = [
          'my-project',
          'test123',
          'abc-123-xyz',
          'lowercase',
          'UPPERCASE',
          'MixedCase',
          '123numbers',
          'numbers123',
          'with-multiple-hyphens',
          'a',
          '1',
          'ab',
          '12',
        ];

        validSlugs.forEach(slug => {
          const result = validateSlug(slug);
          // Note: some of these might be reserved (like 'a' or '1')
          // but we're testing basic validation here
          if (!result.isReserved) {
            expect(result.isValid).toBe(true);
            expect(result.message).toBeUndefined();
          }
        });
      });
    });

    describe('Reserved slug validation', () => {
      describe('Core Infrastructure', () => {
        const coreInfrastructure = [
          'app', 'www', 'api', 'admin', 'dashboard',
          'console', 'portal', 'platform', 'core', 'hub'
        ];

        coreInfrastructure.forEach(slug => {
          it(`should reject "${slug}" for regular users`, () => {
            const result = validateSlug(slug, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.requiresAdmin).toBe(true);
            expect(result.category).toBe('Core Infrastructure');
            expect(result.message).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
          });

          it(`should allow "${slug}" for admin users`, () => {
            const result = validateSlug(slug, true);
            expect(result.isValid).toBe(true);
            expect(result.isReserved).toBe(true);
            expect(result.requiresAdmin).toBe(true);
            expect(result.message).toContain('Admin privileges are being used');
          });
        });
      });

      describe('Authentication & Security', () => {
        const authSlugs = ['auth', 'login', 'signin', 'logout', 'sso', '2fa', 'mfa'];

        authSlugs.forEach(slug => {
          it(`should reject "${slug}" for regular users`, () => {
            const result = validateSlug(slug, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.category).toBe('Auth Security');
          });
        });
      });

      describe('Single Letter Patterns', () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

        letters.forEach(letter => {
          it(`should reject single letter "${letter}" for regular users`, () => {
            const result = validateSlug(letter, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.category).toBe('Single Letter');
            expect(result.message).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
          });

          it(`should reject uppercase single letter "${letter.toUpperCase()}"`, () => {
            const result = validateSlug(letter.toUpperCase(), false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.category).toBe('Single Letter');
          });
        });
      });

      describe('Numeric Patterns', () => {
        it('should reject pure numbers', () => {
          const numbers = ['1', '12', '456', '1234', '12345', '987654'];
          numbers.forEach(num => {
            const result = validateSlug(num, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            // Some numbers might match specific patterns first
            expect(['Numeric Pattern', 'Emergency Number', 'HTTP Status Code']).toContain(result.category);
            expect(result.message).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
          });
        });

        it('should reject HTTP status codes', () => {
          const statusCodes = ['200', '301', '404', '500', '503'];
          statusCodes.forEach(code => {
            const result = validateSlug(code, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.category).toBe('HTTP Status Code');
            expect(result.message).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
          });
        });

        it('should reject emergency numbers', () => {
          const emergencyNumbers = ['911', '999', '112'];
          emergencyNumbers.forEach(num => {
            const result = validateSlug(num, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.category).toBe('Emergency Number');
            expect(result.message).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
          });
        });
      });

      describe('Phishing & Abuse Prevention', () => {
        const phishingSlugs = [
          'security-alert',
          'verify-account',
          'suspended',
          'locked',
          'winner',
          'prize'
        ];

        phishingSlugs.forEach(slug => {
          it(`should reject phishing pattern "${slug}"`, () => {
            const result = validateSlug(slug, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
            expect(result.category).toBe('Phishing Abuse');
            expect(result.message).toBe('This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.');
          });
        });
      });

      describe('Case insensitive matching', () => {
        it('should match reserved slugs case-insensitively', () => {
          const variations = [
            'APP', 'App', 'aPp', 'ApP',
            'ADMIN', 'Admin', 'aDmIn',
            'API', 'Api', 'aPi',
          ];

          variations.forEach(slug => {
            const result = validateSlug(slug, false);
            expect(result.isValid).toBe(false);
            expect(result.isReserved).toBe(true);
          });
        });
      });
    });

    describe('Admin override', () => {
      it('should allow admins to use reserved slugs', () => {
        const reservedSlugs = ['app', 'admin', 'api', 'auth', 'a', '404'];

        reservedSlugs.forEach(slug => {
          const result = validateSlug(slug, true);
          expect(result.isValid).toBe(true);
          expect(result.isReserved).toBe(true);
          expect(result.requiresAdmin).toBe(true);
          expect(result.message).toContain('Admin privileges are being used');
        });
      });

      it('should still enforce basic validation rules for admins', () => {
        // Even admins can't use invalid characters
        const result1 = validateSlug('test space', true);
        expect(result1.isValid).toBe(false);
        expect(result1.message).toBe('Slug can only contain letters, numbers, and hyphens.');

        // Even admins can't use empty slugs
        const result2 = validateSlug('', true);
        expect(result2.isValid).toBe(false);
        expect(result2.message).toBe('Slug cannot be empty.');
      });
    });
  });

  describe('isReservedSlug', () => {
    it('should correctly identify reserved slugs', () => {
      const reserved = ['app', 'www', 'api', 'admin', 'auth', 'login', 'a', 'z', '404', '911'];
      reserved.forEach(slug => {
        expect(isReservedSlug(slug)).toBe(true);
      });
    });

    it('should correctly identify non-reserved slugs', () => {
      const notReserved = ['my-project', 'test-site', 'hello-world', 'ab', 'abc', 'test123', 'site-2024'];
      notReserved.forEach(slug => {
        expect(isReservedSlug(slug)).toBe(false);
      });
    });

    it('should be case insensitive', () => {
      expect(isReservedSlug('APP')).toBe(true);
      expect(isReservedSlug('Api')).toBe(true);
      expect(isReservedSlug('ADMIN')).toBe(true);
    });
  });

  describe('getAllReservedPatterns', () => {
    it('should return all reserved patterns', () => {
      const patterns = getAllReservedPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(300); // We have 300+ patterns
      expect(patterns).toContain('app');
      expect(patterns).toContain('www');
      expect(patterns).toContain('api');
    });

    it('should not include duplicates', () => {
      const patterns = getAllReservedPatterns();
      const uniquePatterns = [...new Set(patterns)];
      expect(patterns.length).toBe(uniquePatterns.length);
    });
  });

  describe('getReservedPatternsByCategory', () => {
    it('should return patterns organized by category', () => {
      const categories = getReservedPatternsByCategory();
      expect(typeof categories).toBe('object');
      
      // Check that all expected categories exist
      const expectedCategories = [
        'coreInfrastructure',
        'authSecurity',
        'devOps',
        'infrastructureServices',
        'communicationSupport',
        'monitoringAnalytics',
        'businessLegal',
        'userManagement',
        'marketingSales',
        'internalSystem',
        'phishingAbuse',
        'commonVariations',
        'protocolService',
      ];

      expectedCategories.forEach(category => {
        expect(categories).toHaveProperty(category);
        expect(Array.isArray(categories[category])).toBe(true);
        expect(categories[category].length).toBeGreaterThan(0);
      });
    });
  });

  describe('Comprehensive category coverage', () => {
    const categories = getReservedPatternsByCategory();

    it('should have correct count of patterns per category', () => {
      // Verify approximate counts from RESERVED-SUBDOMAINS.md
      expect(categories.coreInfrastructure.length).toBe(10);
      expect(categories.authSecurity.length).toBeGreaterThanOrEqual(20);
      expect(categories.devOps.length).toBeGreaterThanOrEqual(20);
      expect(categories.infrastructureServices.length).toBeGreaterThanOrEqual(25);
      expect(categories.communicationSupport.length).toBeGreaterThanOrEqual(20);
      expect(categories.monitoringAnalytics.length).toBeGreaterThanOrEqual(15);
      expect(categories.businessLegal.length).toBeGreaterThanOrEqual(15);
      expect(categories.userManagement.length).toBeGreaterThanOrEqual(15);
      expect(categories.marketingSales.length).toBeGreaterThanOrEqual(15);
      expect(categories.internalSystem.length).toBeGreaterThanOrEqual(10);
      expect(categories.phishingAbuse.length).toBeGreaterThanOrEqual(15);
    });

    it('should validate all patterns in each category', () => {
      Object.entries(categories).forEach(([, patterns]) => {
        patterns.forEach(pattern => {
          const result = validateSlug(pattern, false);
          expect(result.isReserved).toBe(true);
          expect(result.isValid).toBe(false);
          expect(result.requiresAdmin).toBe(true);
          // Category should be set (except for some that might match special patterns first)
          expect(result.category).toBeDefined();
        });
      });
    });
  });
});