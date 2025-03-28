#!/bin/bash

# Read email content from stdin
email_content=$(cat)

# Extract recipient and sender from command line arguments
recipient="$1"
sender="$2"
original_recipient="$3"

# Extract subject from email content
subject=$(echo "$email_content" | grep -i "^Subject:" | sed 's/^Subject:\s*//')

# Forward to webhook
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "recipient=$original_recipient" \
  --data-urlencode "sender=$sender" \
  --data-urlencode "subject=$subject" \
  --data-urlencode "body=$email_content" \
  https://temp-email-backend.onrender.com/webhook/email/incoming