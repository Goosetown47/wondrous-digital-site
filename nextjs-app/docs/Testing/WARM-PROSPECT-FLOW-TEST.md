# Warm Prospect Flow Testing Guide

## Overview
The warm prospect flow is for users who receive an invitation to join an account. They should have a streamlined signup experience with pre-filled information where applicable.

## Test Setup

### 1. Create an Invitation
First, you need to create an invitation in the database or through the UI:

```sql
-- Create a test invitation in Supabase
INSERT INTO invitations (
  id,
  email,
  account_id,
  role,
  token,
  expires_at,
  created_by
) VALUES (
  gen_random_uuid(),
  'warmprospect@example.com',
  'YOUR_ACCOUNT_ID', -- Replace with actual account ID
  'user',
  'inv_test_' || gen_random_uuid(),
  NOW() + INTERVAL '7 days',
  'YOUR_USER_ID' -- Replace with your user ID
);
```

### 2. Generate Invitation URL
The invitation URL format is:
```
http://localhost:3000/signup?token=inv_test_xxxxx&email=warmprospect@example.com
```

## Test Scenarios

### Scenario 1: Basic Warm Prospect Flow
1. **Navigate to invitation URL**
   - Open browser to: `http://localhost:3000/signup?token=inv_test_xxxxx&email=warmprospect@example.com`
   - ✅ Email field should be pre-filled with `warmprospect@example.com`
   - ✅ Invitation token should be stored in session storage
   - ✅ User can still edit email if needed

2. **Complete Step 1: Create Login**
   - Enter password: `TestPassword123!`
   - Confirm password: `TestPassword123!`
   - Click "Continue"
   - ✅ Should navigate to `/signup/confirm`

3. **Complete Step 2: Confirm Email**
   - Check email for confirmation link
   - Click confirmation link
   - ✅ Should auto-advance to Step 3

4. **Complete Step 3: Account Details**
   - ✅ Account may be pre-populated if invitation is for existing account
   - Fill in/verify:
     - Company Name
     - Phone Number
     - Address
   - Click "Continue"
   - ✅ Should navigate to `/signup/profile`

5. **Complete Step 4: Personal Details**
   - Fill in:
     - Full Name
     - Role/Title
     - Department (optional)
   - Click "Continue"
   - ✅ Should navigate to `/signup/pricing`

6. **Complete Step 5: Payment**
   - ✅ Should see pricing page with invitation context
   - Select a plan (PRO recommended for testing)
   - Complete Stripe checkout
   - ✅ Should redirect back to `/signup/success`

7. **Step 6: Success**
   - ✅ Should see confetti animation
   - ✅ Should see "Way to go!" message
   - Click "To the Dashboard!"
   - ✅ Should navigate to `/dashboard`

8. **Verify Dashboard**
   - ✅ Should be logged in
   - ✅ Should see correct account selected
   - ✅ Should show correct tier (PRO if selected)
   - ✅ Should show correct role (User for invitation)

### Scenario 2: Existing Account Invitation
When invited to an existing account with pre-paid tier:

1. Navigate to invitation URL
2. Complete Steps 1-2 as above
3. **Step 3: Account Details**
   - ✅ Should show existing account information
   - ✅ May be read-only or pre-filled
4. Complete Step 4 as above
5. **Step 5: Payment**
   - ✅ May skip if account already has payment
   - ✅ Or show "Account already has PRO plan" message
6. Complete success flow

### Scenario 3: Edge Cases

#### Test: Expired Invitation
1. Use an invitation with past expiry date
2. ✅ Should show "Invitation expired" error
3. ✅ Should allow regular signup flow

#### Test: Invalid Token
1. Use URL with invalid token: `/signup?token=invalid_token`
2. ✅ Should proceed as cold prospect
3. ✅ No pre-filled email

#### Test: Already Registered Email
1. Use invitation for email that already has account
2. ✅ Should show appropriate error message
3. ✅ Should suggest login instead

#### Test: Abandoned Flow Recovery
1. Start warm prospect flow
2. Close browser after Step 2
3. Return to same URL
4. ✅ Should resume from last completed step
5. ✅ Should retain invitation token

## Verification Checklist

### Session Storage
Check browser DevTools > Application > Session Storage:
- [ ] `invitationToken` is stored
- [ ] `signupEmail` is stored after Step 1
- [ ] `signupUserId` is stored after Step 1
- [ ] `signupAccountId` is stored after Step 3
- [ ] `signupAccountName` is stored after Step 3

### Database Verification
After completion, verify in Supabase:
- [ ] User created in `auth.users`
- [ ] Profile created in `user_profiles`
- [ ] Account relationship in `account_users` with correct role
- [ ] Account tier updated if payment made
- [ ] Invitation marked as accepted

### API Calls
Monitor Network tab for:
- [ ] POST `/api/auth/signup` (Step 1)
- [ ] GET `/api/auth/confirm` (Step 2)
- [ ] POST `/api/accounts/create` or PUT `/api/accounts/[id]` (Step 3)
- [ ] POST `/api/user/profile` (Step 4)
- [ ] POST `/api/stripe/create-checkout-session` (Step 5)

## Common Issues & Solutions

### Issue: Email not pre-filling
- **Check**: URL has both `token` and `email` parameters
- **Solution**: Ensure invitation record has email field

### Issue: Token not persisting
- **Check**: Session storage in DevTools
- **Solution**: Clear session storage and try again

### Issue: Account not linking
- **Check**: Invitation has valid `account_id`
- **Solution**: Verify account exists in database

### Issue: Payment required when shouldn't be
- **Check**: Account tier in database
- **Solution**: May need to update invitation flow logic

## Test Data

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

### Test Emails
- Use `+` addressing: `test+warm1@example.com`, `test+warm2@example.com`
- Or use temporary email service for real confirmation emails

## Reporting Issues

If you encounter issues during testing:

1. **Screenshot** the error or unexpected behavior
2. **Check console** for JavaScript errors (F12 > Console)
3. **Check network** for failed API calls (F12 > Network)
4. **Note the step** where issue occurred
5. **Save session storage** state (F12 > Application > Session Storage)

Document findings in: `/docs/Testing/test-results-[date].md`