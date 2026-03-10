# Pactra MCP Server

[![npm](https://img.shields.io/npm/v/@pactra.dev/mcp)](https://www.npmjs.com/package/@pactra.dev/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-compatible-blueviolet)](https://modelcontextprotocol.io)

Give AI agents the ability to create, send, and sign agreements. This [Model Context Protocol](https://modelcontextprotocol.io) server connects Claude (and any MCP-compatible client) to the [Pactra](https://pactra.dev) agreement platform.

```
"Create an NDA for alice@example.com and send it for signing"
→ Claude uses Pactra MCP tools to execute the entire flow
```

## Quick Start

### 1. Get your API key

Sign up at [pactra.dev](https://pactra.dev) and create an API key in **Settings > API Keys**.

### 2. Add to Claude Code

Add this to your Claude Code MCP config (`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "pactra": {
      "command": "npx",
      "args": ["-y", "@pactra.dev/mcp"],
      "env": {
        "PACTRA_API_KEY": "pk_live_your_key_here"
      }
    }
  }
}
```

### 3. Use it

Open Claude Code and ask:

```
Create a new agreement titled "Consulting Agreement" and add john@example.com as a signer
```

Claude will use the Pactra tools automatically.

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_agreements` | List agreements with optional status filter and pagination |
| `create_agreement` | Create a new draft agreement |
| `get_agreement` | Get details of a specific agreement |
| `add_signer` | Add a signer (human or AI agent) to a draft agreement |
| `send_agreement` | Send a draft agreement for signature |
| `detect_fields` | Detect signature fields in a document using AI |
| `add_fields` | Add signature fields (signature, initials, date, text, checkbox) |
| `get_fields` | Get all signature fields for an agreement |
| `sign_agreement` | Sign as an AI agent (programmatic signing with audit trail) |
| `get_signed_document` | Get the download URL for a completed signed document |
| `get_receipt` | Get a cryptographic signature receipt |
| `verify_receipt` | Verify receipt integrity |

## Example Workflows

### Create and send an agreement

```
User: Create an NDA titled "Mutual NDA - Acme Corp" and add two signers:
      Alice (alice@acme.com) and Bob (bob@partner.com), then send it.

Claude: I'll create the agreement and set it up for signing.

→ create_agreement(title: "Mutual NDA - Acme Corp")
→ add_signer(agreement_id: "...", name: "Alice", email: "alice@acme.com")
→ add_signer(agreement_id: "...", name: "Bob", email: "bob@partner.com")
→ send_agreement(agreement_id: "...")

Done! Both signers will receive an email with their signing link.
```

### AI agent signing

```
User: Sign agreement agr_abc123 as signer sgn_def456 — I've reviewed it
      and approve the terms.

Claude: I'll sign this agreement on your behalf with an audit trail.

→ sign_agreement(
    agreement_id: "agr_abc123",
    signer_id: "sgn_def456",
    context: {
      agent_name: "Claude",
      reason: "User reviewed and approved the terms",
      model: "claude-opus-4-6"
    }
  )

Signed! A cryptographic receipt has been generated.
```

### Detect and add signature fields

```
User: Detect where signatures should go in agreement agr_abc123

→ detect_fields(agreement_id: "agr_abc123")
→ Returns detected fields with positions and confidence scores
→ add_fields(agreement_id: "agr_abc123", fields: [...])
```

## Configuration

| Environment Variable | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `PACTRA_API_KEY` | Yes | — | Your Pactra API key (`pk_live_...` or `pk_test_...`) |
| `PACTRA_BASE_URL` | No | `https://pactra.dev` | Custom API base URL |

### Test mode

Use a test API key (`pk_test_...`) for development. Test mode agreements don't send real emails.

## Claude Code Plugin

You can also install this as a Claude Code plugin. Copy the `claude-plugin/` directory:

```bash
# Clone and link
git clone https://github.com/pactra-dev/pactra-mcp.git
cd pactra-mcp/claude-plugin
```

Then add to your Claude Code settings. See [claude-plugin/](./claude-plugin/) for details.

## Error Handling

The server returns clear, actionable error messages:

- **Invalid API key** → `Error: Invalid API key — verify your PACTRA_API_KEY`
- **Not found** → `Error: Not found — the resource does not exist`
- **Rate limited** → `Error: Rate limited — too many requests, try again shortly`
- **Network issues** → `Error: Network error: <details>`
- **Timeout** → `Error: Request timed out after 30 seconds`

## Related Packages

| Package | Description |
|---------|-------------|
| [@pactra.dev/sdk](https://www.npmjs.com/package/@pactra.dev/sdk) | TypeScript SDK for direct API access |
| [@pactra.dev/react](https://www.npmjs.com/package/@pactra.dev/react) | React component for embedded signing |

## Links

- [Pactra Platform](https://pactra.dev)
- [API Documentation](https://pactra.dev/docs)
- [MCP Specification](https://modelcontextprotocol.io)

## License

MIT
