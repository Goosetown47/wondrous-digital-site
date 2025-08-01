export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password: string) => /\d/.test(password),
  },
  {
    id: 'symbol',
    label: 'One special character',
    test: (password: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  },
];

export interface PasswordValidationResult {
  isValid: boolean;
  requirements: Array<{
    id: string;
    label: string;
    met: boolean;
  }>;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const requirements = passwordRequirements.map(req => ({
    id: req.id,
    label: req.label,
    met: req.test(password),
  }));

  const errors: string[] = [];
  
  // Check each requirement
  requirements.forEach(req => {
    if (!req.met) {
      errors.push(`Password must contain at least ${req.label.toLowerCase()}`);
    }
  });

  return {
    isValid: requirements.every(req => req.met),
    requirements,
    errors,
  };
}

export function getPasswordStrengthMessage(password: string): string {
  const result = validatePassword(password);
  
  if (result.isValid) {
    return 'Password meets all requirements';
  }
  
  const unmetRequirements = result.requirements
    .filter(req => !req.met)
    .map(req => req.label.toLowerCase());
  
  if (unmetRequirements.length === 1) {
    return `Password must contain ${unmetRequirements[0]}`;
  }
  
  const lastRequirement = unmetRequirements.pop();
  return `Password must contain ${unmetRequirements.join(', ')} and ${lastRequirement}`;
}

export function isValidEmail(email: string): boolean {
  // More strict email validation regex
  // Ensures proper format with valid characters and structure
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional validation rules
  if (!email || email.length > 254) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('..')) return false;
  if (email.split('@').length !== 2) return false;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) return false;
  
  // Check domain has at least one dot (for TLD)
  if (!domain.includes('.')) return false;
  
  // Check TLD length (2-63 characters)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 63) return false;
  
  return emailRegex.test(email);
}