# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do NOT open a public issue.**

Email: **hello@pactra.dev** with subject "Security: [brief description]"

We will:
- Acknowledge receipt within 48 hours
- Provide an initial assessment within 5 business days
- Work with you on a fix and coordinated disclosure

## Scope

This policy covers:
- The Pactra MCP server (`@pactra.dev/mcp`)
- The Pactra TypeScript SDK (`@pactra.dev/sdk`)
- The Pactra React embed (`@pactra.dev/react`)
- The Pactra API (https://pactra.dev/api/v1/*)

## Security Measures

- All API communication uses HTTPS
- API keys are transmitted via Authorization header (never in URLs)
- Signature receipts use SHA-256 hash chains for tamper detection
- The MCP server never stores credentials — they're passed via environment variables
- No data is cached or persisted by the MCP server
