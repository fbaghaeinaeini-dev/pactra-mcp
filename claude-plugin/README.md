# Pactra Claude Code Plugin

This directory contains the Claude Code plugin configuration for Pactra.

## Installation

### Option 1: Manual MCP configuration (recommended)

Add this to your `~/.claude/mcp.json`:

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

### Option 2: Copy plugin directory

1. Copy this `claude-plugin/` directory to your Claude Code plugins path
2. Set your API key in `mcp.json`
3. Restart Claude Code

## Configuration

Edit the `PACTRA_API_KEY` value in `mcp.json` with your API key from [pactra.dev/settings/api-keys](https://pactra.dev/settings/api-keys).

Use `pk_test_...` keys for development (no real emails sent).
