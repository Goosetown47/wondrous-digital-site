# Errors to check

Supabase Service Key
Open
GitHub
detected a
secret
34 minutes ago
Publicly leaked secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGpjcXFub3p4anlnbGJ1ZXZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE2NDU1MywiZXhwIjoyMDUxNzQwNTUzfQ.i9vGqAhOJ-nqNPQkRJQzYwbYl5E6OFQUuG8-nSDQpyA
Remediation steps
Follow the steps below before you close this alert.
1 (1)Rotate the secret if it's in use to prevent breaking workflows.
2 (2)Revoke this Supabase Service Key through Supabase to prevent unauthorized access. Learn more about Supabase tokens.
3 (3)Check security logs for potential breaches.
4 (4)Close the alert as revoked.

Detected in 1 location
nextjs-app/scripts/check-project-delete.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bldjcqqnozxjyglbuevq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGpjcXFub3p4anlnbGJ1ZXZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE2NDU1MywiZXhwIjoyMDUxNzQwNTUzfQ.i9vGqAhOJ-nqNPQkRJQzYwbYl5E6OFQUuG8-nSDQpyA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);


feat: v0.1.3 - Security Hardening Releaseed752d5



Supabase Service Key
Open
GitHub
detected a
secret
36 minutes ago
Publicly leaked secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscHZ2d2x4anpleHBnaXRzamx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk2MjEzNCwiZXhwIjoyMDcwNTM4MTM0fQ.p5QzbvcRzj0Qv0O2FY6t2ixF6kffbpgIEYc_MMGOlow
Remediation steps
Follow the steps below before you close this alert.
1 (1)Rotate the secret if it's in use to prevent breaking workflows.
2 (2)Revoke this Supabase Service Key through Supabase to prevent unauthorized access. Learn more about Supabase tokens.
3 (3)Check security logs for potential breaches.
4 (4)Close the alert as revoked.
Detected in 1 location
nextjs-app/scripts/analyze-system-data.js

// Dev credentials (hardcoded since we know them)
const devUrl = 'https://hlpvvwlxjzexpgitsjlw.supabase.co';
const devServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscHZ2d2x4anpleHBnaXRzamx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk2MjEzNCwiZXhwIjoyMDcwNTM4MTM0fQ.p5QzbvcRzj0Qv0O2FY6t2ixF6kffbpgIEYc_MMGOlow';

if (!prodUrl || !prodServiceKey) {
  console.error('❌ Missing production environment variables');

feat: v0.1.3 - Security Hardening Releaseed752d5



GitGuardian has detected the following Company Email Password exposed within your GitHub account.
Details

- Secret type: Company Email Password

- Repository: Goosetown47/wondrous-digital-site

- Pushed date: August 14th 2025, 01:14:46 UTC


GitGuardian has detected the following Supabase Service Role JWT exposed within your GitHub account.
Details

- Secret type: Supabase Service Role JWT

- Repository: Goosetown47/wondrous-digital-site

- Pushed date: August 14th 2025, 01:14:46 UTC



GitGuardian has detected the following Generic CLI Option Secret exposed within your GitHub account.
Details

- Secret type: Generic CLI Option Secret

- Repository: Goosetown47/wondrous-digital-site

- Pushed date: August 14th 2025, 01:14:46 UTC


GitGuardian has detected the following PostgreSQL URI exposed within your GitHub account.
Details

- Secret type: PostgreSQL URI

- Repository: Goosetown47/wondrous-digital-site

- Pushed date: August 14th 2025, 01:14:46 UTC


