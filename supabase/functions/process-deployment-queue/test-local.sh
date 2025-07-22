#!/bin/bash

# Test the deployment queue processor locally

echo "Testing deployment queue processor..."

# Set up test environment variables
export SUPABASE_URL="http://localhost:54321"
export SUPABASE_SERVICE_ROLE_KEY="your-local-service-role-key"
export NETLIFY_ACCESS_TOKEN="test-token"
export NETLIFY_TEAM_ID="test-team"

# Run the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/process-deployment-queue' \
  --header 'Authorization: Bearer your-anon-key' \
  --header 'Content-Type: application/json' \
  --data '{}'

echo -e "\n\nTest complete!"