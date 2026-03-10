#!/usr/bin/env node

/**
 * Pactra MCP Server CLI entry point.
 * Usage: npx pactra-mcp
 *
 * Environment variables:
 *   PACTRA_API_KEY - Your Pactra API key (required)
 *   PACTRA_BASE_URL - Custom API base URL (optional)
 */

import { createPactraMcpServer } from './server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function main() {
  const apiKey = process.env.PACTRA_API_KEY;
  if (!apiKey) {
    console.error('Error: PACTRA_API_KEY environment variable is required');
    console.error('Set it in your MCP config or shell environment.');
    process.exit(1);
  }

  const baseUrl = process.env.PACTRA_BASE_URL || 'https://pactra.dev';
  const server = createPactraMcpServer(apiKey, baseUrl);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Failed to start Pactra MCP server:', err);
  process.exit(1);
});
