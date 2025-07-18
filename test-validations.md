# Day 2 Validation Testing Checklist

## Test Scenarios to Verify Parallel Validation

### 1. CreateProjectModal Validation Tests
- [ ] Create project with valid data - should log success
- [ ] Create project with empty name - should log warning but still submit
- [ ] Create project with special characters in name - should log warning but still submit
- [ ] Create template project (no customer required) - should log success
- [ ] Create non-template project without customer - should log warning but still submit

### 2. ProjectsPage Status Transition Tests
- [ ] Valid transition: Draft → Template Internal - should log success
- [ ] Valid transition: Prospect Staging → Live Customer - should log success
- [ ] Invalid transition: Draft → Live Customer - should log warning but still allow
- [ ] Invalid transition: Archived → Draft - should log warning but still allow
- [ ] Maintenance button on Prospect Staging - should work and log success
- [ ] Maintenance button on Live Customer - should work and log success

### 3. Bulk Operations Tests
- [ ] Bulk status change multiple projects - should log validation
- [ ] Bulk archive projects - should log validation
- [ ] Bulk delete archived projects - should log validation

### 4. CreateAccountModal Tests
- [ ] Create account with valid data - should log success
- [ ] Create account with invalid email - should log warning but still submit
- [ ] Create account with empty business name - should log warning but still submit
- [ ] Create account with invalid domain format - should log warning but still submit

### 5. AccountsPage Status Transition Tests
- [ ] Valid transition: Prospect → Customer - should log success
- [ ] Valid transition: Customer → Inactive - should log success
- [ ] Invalid transition: Inactive → Prospect - should log warning but still allow
- [ ] Check that converted_at is set when converting to customer

## Expected Console Output Patterns

### Success Pattern:
```
[Zod Validation] <Operation> data valid ✓
```

### Warning Pattern:
```
[Zod Validation] <Operation> issues: {
  errors: { ... },
  data: { ... },
  issues: [ ... ]
}
```

## Instructions:
1. Open browser console (F12)
2. Navigate to Admin section
3. Perform each test scenario
4. Verify console logs appear as expected
5. Verify operations still complete successfully despite warnings