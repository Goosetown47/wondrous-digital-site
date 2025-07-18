# Validation Patterns Documentation

## Overview

This document outlines the validation patterns implemented in the Wondrous Digital Site admin system using Zod for runtime validation.

## Core Principles

1. **Single Source of Truth**: Zod schemas define all validation rules
2. **Progressive Enhancement**: Critical errors block, non-critical errors warn
3. **User-Friendly**: Clear error messages with actionable feedback
4. **Type Safety**: Full TypeScript integration with Zod inference
5. **Accessibility**: ARIA attributes for screen reader support

## Implementation Pattern

### 1. Schema Definition

```typescript
// src/schemas/project.ts
export const createProjectSchema = z.object({
  project_name: projectNameSchema,  // Reusable field schema
  project_type: projectTypeSchema,
  customer_id: z.string().uuid().optional().nullable(),
  niche: nicheSchema
}).refine(
  (data) => {
    // Business rule: non-template projects require customer
    if (data.project_type === 'template') return true;
    return !!data.customer_id;
  },
  { message: 'Customer is required for non-template projects' }
);
```

### 2. Form Validation

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate with Zod
  const zodResult = createProjectSchema.safeParse(formData);
  if (!zodResult.success) {
    const zodErrors = zodResult.error.format();
    const newErrors: Record<string, string> = {};
    
    // Map Zod errors to form fields
    if (zodErrors.project_name?._errors?.length > 0) {
      newErrors.project_name = zodErrors.project_name._errors[0];
    }
    
    // Handle top-level business rule errors
    if (zodErrors._errors?.length > 0) {
      newErrors.customer_id = zodErrors._errors[0];
    }
    
    setErrors(newErrors);
    addToast('Please fix the validation errors', 'error');
    return;
  }
  
  // Validation passed - clear errors and proceed
  setErrors({});
  // ... submit logic
};
```

### 3. Form Field UI

```typescript
<div>
  <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
    Project Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    id="project_name"
    value={formData.project_name}
    onChange={(e) => handleInputChange('project_name', e.target.value)}
    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
      errors.project_name ? 'border-red-300' : 'border-gray-300'
    }`}
    placeholder="Enter project name"
    disabled={isSubmitting}
    aria-invalid={!!errors.project_name}
    aria-describedby={errors.project_name ? 'project_name-error' : undefined}
  />
  {errors.project_name && (
    <p id="project_name-error" className="mt-1 text-sm text-red-600">
      {errors.project_name}
    </p>
  )}
</div>
```

## Validation Types

### 1. Field-Level Validation

- **Required Fields**: Empty values blocked with clear message
- **Format Validation**: Email, UUID, domain formats
- **Length Limits**: Min/max character constraints
- **Pattern Matching**: Regex for allowed characters

### 2. Business Rule Validation

- **Status Transitions**: Valid state machine transitions
- **Cross-Field Rules**: e.g., non-template projects need customers
- **Data Integrity**: Prevent invalid data combinations

### 3. Security Validation

- **SQL Injection Prevention**: Special character validation
- **XSS Prevention**: Sanitized inputs
- **UUID Validation**: Prevent invalid database references

## Pre-Commit Validation

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "eslint --cache",
    "bash -c 'tsc --noEmit'"
  ]
}
```

- ESLint catches security issues and code quality
- TypeScript ensures type safety
- Husky prevents commits with validation errors

## Error Handling Strategy

### Critical Errors (Blocking)
- Required fields
- Invalid formats (email, UUID)
- Business rule violations
- Security concerns

### Non-Critical Warnings (Logged)
- Special characters that might be legitimate
- Very long values (edge cases)
- Performance suggestions

## Accessibility Features

1. **ARIA Attributes**
   - `aria-invalid`: Indicates field has error
   - `aria-describedby`: Links field to error message
   - `id` on error messages for screen readers

2. **Visual Indicators**
   - Red borders on invalid fields
   - Red error text below fields
   - Toast notifications for form-level errors

## Testing Validation

### Manual Testing
1. Submit empty required fields → Should show "Required" error
2. Enter invalid email → Should show "Invalid email" error
3. Try invalid status transition → Should block with explanation
4. Enter special characters → Should allow but log warning

### Automated Testing
```typescript
// Example test
it('should validate project creation', () => {
  const result = createProjectSchema.safeParse({
    project_name: '',
    project_type: 'custom',
    customer_id: null
  });
  
  expect(result.success).toBe(false);
  expect(result.error.format().project_name._errors).toContain('Required');
});
```

## Future Enhancements

1. **Async Validation**: Check for duplicate names
2. **Field Dependencies**: Dynamic validation based on other fields
3. **Custom Error Messages**: Per-field custom messages
4. **Validation Levels**: Info, Warning, Error levels
5. **Real-time Validation**: Validate on blur/change