# User Invitation System - Manual Testing Checklist

## Test Environment Setup
- [ ] Dev server running (`npm run dev`)
- [ ] Database connected
- [ ] Email service configured (or in dev mode)

## 1. Invitation Creation from AccountUsers Component

### Test Case 1.1: Create Invitation
- [ ] Navigate to Tools > Accounts > [Account ID]
- [ ] Click "Invite User" button
- [ ] Fill in email address
- [ ] Select role (User or Account Owner)
- [ ] Click "Send Invitation"
- [ ] Verify success toast appears
- [ ] Verify invitation appears in Invitations tab

### Test Case 1.2: Duplicate Invitation Prevention
- [ ] Try to invite the same email again
- [ ] Verify error message about existing invitation

### Test Case 1.3: Existing Member Prevention
- [ ] Try to invite an email already in the account
- [ ] Verify error message about existing member

## 2. Invitation Management

### Test Case 2.1: View Invitations
- [ ] Navigate to Invitations tab in AccountUsers
- [ ] Verify all pending invitations are listed
- [ ] Verify invitation details show correctly:
  - Email address
  - Role
  - Status (Pending/Expired)
  - Invited time

### Test Case 2.2: Resend Invitation
- [ ] Click dropdown menu on a pending invitation
- [ ] Click "Resend invitation"
- [ ] Verify success toast
- [ ] Verify expiry date is updated

### Test Case 2.3: Cancel Invitation
- [ ] Click dropdown menu on a pending invitation
- [ ] Click "Cancel invitation"
- [ ] Verify success toast
- [ ] Verify invitation is removed from list

## 3. Invitation Acceptance Flow (Logged Out User)

### Test Case 3.1: Access Invitation Page
- [ ] Open invitation URL: `/invitation?token=[TOKEN]`
- [ ] Verify invitation details display:
  - Account name
  - Inviter information
  - Role being offered
  - Expiration status

### Test Case 3.2: Login to Accept
- [ ] Click "Login to Accept" button
- [ ] Verify redirect to login page with invitation token
- [ ] Log in with existing account
- [ ] Verify auto-acceptance after login
- [ ] Verify redirect to dashboard

### Test Case 3.3: Sign Up to Accept
- [ ] From invitation page, click "Sign up" link
- [ ] Verify redirect to signup with invitation token
- [ ] Verify email is pre-filled from invitation
- [ ] Complete signup process
- [ ] Verify invitation is accepted after signup
- [ ] Verify user is added to account with correct role

## 4. Invitation Acceptance Flow (Logged In User)

### Test Case 4.1: Direct Accept
- [ ] While logged in, visit invitation URL
- [ ] Click "Accept Invitation"
- [ ] Verify success message
- [ ] Verify redirect to dashboard
- [ ] Verify user appears in Members tab

### Test Case 4.2: Decline Invitation
- [ ] While logged in, visit invitation URL
- [ ] Click "Decline Invitation"
- [ ] Verify decline confirmation
- [ ] Verify redirect to login page

## 5. Edge Cases

### Test Case 5.1: Expired Invitation
- [ ] Access an expired invitation URL
- [ ] Verify "Invitation expired" message
- [ ] Verify no action buttons available

### Test Case 5.2: Already Accepted Invitation
- [ ] Try to access an already accepted invitation
- [ ] Verify "Already accepted" message

### Test Case 5.3: Invalid Token
- [ ] Access invitation page with invalid token
- [ ] Verify appropriate error message

### Test Case 5.4: Cancelled Invitation
- [ ] Access a cancelled invitation URL
- [ ] Verify "Invitation cancelled" or not found message

## 6. Role Assignment Verification

### Test Case 6.1: User Role Assignment
- [ ] Accept invitation with "User" role
- [ ] Verify user has limited permissions
- [ ] Cannot access account settings
- [ ] Cannot invite other users

### Test Case 6.2: Account Owner Role Assignment
- [ ] Accept invitation with "Account Owner" role
- [ ] Verify full account permissions
- [ ] Can access account settings
- [ ] Can invite other users
- [ ] Can manage other users

## 7. Email Notifications (if configured)

### Test Case 7.1: Invitation Email
- [ ] Verify email is sent when invitation created
- [ ] Verify email contains:
  - Correct invitation link
  - Account name
  - Inviter name
  - Role information

### Test Case 7.2: Resend Email
- [ ] Verify email is resent when invitation resent
- [ ] Verify new email has updated expiry

## 8. UI/UX Validation

### Test Case 8.1: Loading States
- [ ] Verify loading skeletons appear while fetching
- [ ] Verify smooth transitions

### Test Case 8.2: Error States
- [ ] Verify clear error messages
- [ ] Verify recovery options provided

### Test Case 8.3: Empty States
- [ ] Verify appropriate message when no invitations
- [ ] Verify appropriate message when no members

### Test Case 8.4: Mobile Responsiveness
- [ ] Test invitation page on mobile
- [ ] Test AccountUsers component on mobile
- [ ] Verify all actions accessible on mobile

## Test Results Summary

- **Date Tested**: _________________
- **Tested By**: _________________
- **Version**: v0.1.4
- **Environment**: Development / Staging / Production

### Issues Found:
1. 
2. 
3. 

### Notes:


## Automated Test Coverage
Run these commands to verify automated tests pass:
```bash
npm run test         # Unit tests
npm run build        # TypeScript compilation
npm run lint         # ESLint checks
```