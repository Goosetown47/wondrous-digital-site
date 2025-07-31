# Email Service

This email service provides a comprehensive solution for sending transactional emails using Resend, with queuing, retry logic, and template support.

## Features

- **Email Queue**: Asynchronous email processing with retry logic
- **React Email Templates**: Beautiful, responsive email templates using @react-email/components
- **Development Mode**: Console logging instead of sending emails in development
- **Template System**: Reusable email templates with variable substitution
- **Delivery Tracking**: Email logs for tracking delivery status
- **Automatic Retries**: Failed emails are automatically retried up to 3 times

## Usage

### Sending Email Directly

```typescript
import { sendEmail } from '@/lib/services/email';
import { InvitationEmail } from '@/emails/invitation';

// Send with React component
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  react: <InvitationEmail {...props} />,
});

// Send with HTML
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome!</h1>',
});
```

### Queuing Emails

```typescript
import { queueEmail } from '@/lib/services/email';

// Queue email for asynchronous processing
await queueEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome!</h1>',
  scheduledAt: new Date(Date.now() + 3600000), // Send in 1 hour
});

// Queue with template
await queueEmail({
  to: 'user@example.com',
  templateId: 'invitation',
  templateData: {
    inviter_name: 'John Doe',
    account_name: 'Acme Corp',
  },
});
```

### Processing Email Queue

The email queue is automatically processed every 5 minutes via Vercel cron job. You can also manually trigger processing:

```bash
# In development
curl http://localhost:3000/api/email/process-queue

# In production (requires CRON_SECRET)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://app.wondrousdigital.com/api/email/process-queue
```

## API Endpoints

### POST /api/email/process-queue
Process pending emails in the queue.

### GET /api/email/stats
Get email queue statistics (requires platform admin).

### POST /api/email/retry-failed
Retry failed emails (requires platform admin).

### POST /api/email/test
Send test emails (development only).

## Email Templates

Email templates are stored in `/src/emails/` and use React Email components.

### Base Template
All emails extend from `base-template.tsx` which provides:
- Consistent header with logo
- Responsive layout
- Footer with unsubscribe link
- Brand customization support

### Creating New Templates

1. Create a new file in `/src/emails/`
2. Import and extend BaseEmailTemplate
3. Export the template component

Example:
```tsx
import { BaseEmailTemplate } from './base-template';

export const WelcomeEmail = ({ userName }) => (
  <BaseEmailTemplate preview="Welcome to Wondrous Digital">
    <h1>Welcome, {userName}!</h1>
    <p>Thanks for joining us.</p>
  </BaseEmailTemplate>
);
```

## Environment Variables

```env
RESEND_API_KEY=your_resend_api_key
CRON_SECRET=your_cron_secret # Optional, for securing cron endpoints
```

## Development

In development mode, emails are logged to the console instead of being sent. This allows you to test email functionality without actually sending emails.

To test email rendering:
1. Use the test endpoint: `POST /api/email/test`
2. Check the console for email content
3. Use React Email's preview server (if needed)

## Monitoring

- Check queue status: `/api/email/stats`
- View failed emails in Supabase: `email_queue` table where `status = 'failed'`
- Check delivery logs: `email_logs` table