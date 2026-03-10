/**
 * Pactra MCP Server — standalone version using API keys.
 * This wraps the Pactra REST API v1 behind MCP tools,
 * allowing AI agents to interact with agreements, signers, and receipts.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const TIMEOUT_MS = 30_000;

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request — check your parameters',
  401: 'Invalid API key — verify your PACTRA_API_KEY',
  403: 'Forbidden — your API key lacks permission for this action',
  404: 'Not found — the resource does not exist',
  409: 'Conflict — the resource is in an invalid state for this action',
  422: 'Validation error — check the field values',
  429: 'Rate limited — too many requests, try again shortly',
  500: 'Server error — Pactra encountered an internal error',
  503: 'Service unavailable — Pactra is temporarily down',
};

interface ApiResult {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
}

function apiClient(apiKey: string, baseUrl: string) {
  return async function request(method: string, path: string, body?: unknown): Promise<ApiResult> {
    const url = `${baseUrl}/api/v1${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const apiMsg = json?.error?.message;
        const fallback = HTTP_ERROR_MESSAGES[response.status] ?? `HTTP ${response.status}`;
        return { ok: false, status: response.status, error: apiMsg || fallback };
      }

      return { ok: true, status: response.status, data: json?.data ?? json };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { ok: false, status: 0, error: 'Request timed out after 30 seconds' };
      }
      const message = err instanceof Error ? err.message : 'Unknown network error';
      return { ok: false, status: 0, error: `Network error: ${message}` };
    } finally {
      clearTimeout(timer);
    }
  };
}

/** Convert an API result to MCP tool response content */
function toMcpResult(result: ApiResult) {
  if (!result.ok) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${result.error}` }],
      isError: true as const,
    };
  }
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }],
  };
}

export function createPactraMcpServer(apiKey: string, baseUrl: string): McpServer {
  const api = apiClient(apiKey, baseUrl);

  const server = new McpServer({
    name: 'pactra',
    version: '0.2.0',
  });

  // ── Tools ──────────────────────────────────

  server.registerTool(
    'list_agreements',
    {
      description: 'List agreements in the workspace',
      inputSchema: {
        status: z.enum(['draft', 'pending', 'completed', 'cancelled', 'expired']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      },
    },
    async (params) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      query.set('limit', String(params.limit));
      query.set('offset', String(params.offset));
      return toMcpResult(await api('GET', `/agreements?${query}`));
    }
  );

  server.registerTool(
    'create_agreement',
    {
      description: 'Create a new draft agreement',
      inputSchema: {
        title: z.string().describe('Agreement title'),
        description: z.string().optional().describe('Agreement description'),
        document_id: z.string().optional().describe('Document ID to attach'),
      },
    },
    async (params) => {
      return toMcpResult(await api('POST', '/agreements', params));
    }
  );

  server.registerTool(
    'get_agreement',
    {
      description: 'Get details of a specific agreement',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
      },
    },
    async (params) => {
      return toMcpResult(await api('GET', `/agreements/${params.agreement_id}`));
    }
  );

  server.registerTool(
    'add_signer',
    {
      description: 'Add a signer to a draft agreement',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
        name: z.string().describe('Signer name'),
        email: z.string().email().describe('Signer email'),
        role: z.enum(['signer', 'viewer', 'approver']).default('signer'),
        type: z.enum(['human', 'agent']).optional().describe('Signer type. Default: human'),
      },
    },
    async (params) => {
      const { agreement_id, ...body } = params;
      return toMcpResult(await api('POST', `/agreements/${agreement_id}/signers`, body));
    }
  );

  server.registerTool(
    'send_agreement',
    {
      description: 'Send a draft agreement for signature. Agreement must have at least one signer and one document.',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
      },
    },
    async (params) => {
      return toMcpResult(await api('POST', `/agreements/${params.agreement_id}/send`));
    }
  );

  server.registerTool(
    'get_receipt',
    {
      description: 'Get a signature receipt by ID',
      inputSchema: {
        receipt_id: z.string().describe('Receipt ID'),
      },
    },
    async (params) => {
      return toMcpResult(await api('GET', `/receipts/${params.receipt_id}`));
    }
  );

  server.registerTool(
    'verify_receipt',
    {
      description: 'Verify the cryptographic integrity of a signature receipt',
      inputSchema: {
        receipt_id: z.string().describe('Receipt ID'),
      },
    },
    async (params) => {
      return toMcpResult(await api('POST', `/receipts/${params.receipt_id}/verify`));
    }
  );

  server.registerTool(
    'detect_fields',
    {
      description: 'Detect signature fields in an agreement document using AI',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
        confidence_threshold: z.number().min(0).max(1).optional().describe('Minimum confidence threshold (0-1). Default: 0.5'),
      },
    },
    async (params) => {
      const { agreement_id, ...body } = params;
      return toMcpResult(await api('POST', `/agreements/${agreement_id}/detect-fields`, body));
    }
  );

  server.registerTool(
    'add_fields',
    {
      description: 'Add signature fields to an agreement',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
        fields: z.array(z.object({
          type: z.enum(['signature', 'initials', 'date', 'text', 'checkbox']).describe('Field type'),
          signer_id: z.string().describe('Signer ID this field is assigned to'),
          page: z.number().int().min(1).describe('Page number'),
          x: z.number().describe('X position (0-100 percentage)'),
          y: z.number().describe('Y position (0-100 percentage)'),
          width: z.number().describe('Field width (0-100 percentage)'),
          height: z.number().describe('Field height (0-100 percentage)'),
          required: z.boolean().optional().describe('Whether field is required. Default: true'),
          label: z.string().optional().describe('Field label'),
        })).describe('Array of fields to add'),
      },
    },
    async (params) => {
      const { agreement_id, fields } = params;
      return toMcpResult(await api('POST', `/agreements/${agreement_id}/fields`, { fields }));
    }
  );

  server.registerTool(
    'get_fields',
    {
      description: 'Get all signature fields for an agreement',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
      },
    },
    async (params) => {
      return toMcpResult(await api('GET', `/agreements/${params.agreement_id}/fields`));
    }
  );

  server.registerTool(
    'sign_agreement',
    {
      description: 'Sign an agreement as an agent signer (programmatic signing)',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
        signer_id: z.string().describe('Signer ID'),
        context: z.object({
          agent_name: z.string().describe('Name of the AI agent signing'),
          reason: z.string().describe('Reason for signing'),
          model: z.string().optional().describe('AI model used'),
          tool_call_id: z.string().optional().describe('Tool call ID for audit trail'),
        }).describe('Signing context for audit trail'),
      },
    },
    async (params) => {
      const { agreement_id, signer_id, context } = params;
      return toMcpResult(await api('POST', `/agreements/${agreement_id}/signers/${signer_id}/sign`, { context }));
    }
  );

  server.registerTool(
    'get_signed_document',
    {
      description: 'Get a download URL for the signed document (only available after agreement is completed)',
      inputSchema: {
        agreement_id: z.string().describe('Agreement ID'),
      },
    },
    async (params) => {
      return toMcpResult(await api('GET', `/agreements/${params.agreement_id}/signed-document`));
    }
  );

  // ── Prompts ────────────────────────────────

  server.registerPrompt(
    'create_and_send_agreement',
    {
      description: 'Guide the user through creating and sending an agreement',
    },
    async () => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Help me create and send an agreement using Pactra. I need to:
1. Create a new agreement with a title
2. Add signers (name and email)
3. Send it for signature

Ask me for the details and then use the Pactra tools to execute each step.`,
          },
        },
      ],
    })
  );

  return server;
}
