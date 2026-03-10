# AI Agent Signing

Pactra supports AI agents as first-class signers. An agent signer can programmatically sign agreements with a full audit trail — no human interaction needed.

## When to use agent signing

- Automated contract acceptance in AI pipelines
- Bot-to-bot agreements (e.g., procurement agents)
- Pre-approved template agreements that need countersigning
- Any workflow where an AI has authorization to sign

## Steps

### 1. Create agreement with an agent signer

```
create_agreement(title: "Automated NDA")

add_signer(
  agreement_id: "agr_abc123",
  name: "AI Procurement Agent",
  email: "agent@company.com",
  type: "agent",          ← marks this as an agent signer
  role: "signer"
)
```

### 2. Send the agreement

```
send_agreement(agreement_id: "agr_abc123")
```

### 3. Sign as the agent

```
sign_agreement(
  agreement_id: "agr_abc123",
  signer_id: "sgn_def456",
  context: {
    agent_name: "Claude",
    reason: "Reviewed terms — standard NDA within policy guidelines",
    model: "claude-opus-4-6",
    tool_call_id: "call_xyz789"    ← optional, for your audit trail
  }
)
```

The `context` object is permanently recorded in the signature receipt for compliance and audit purposes.

### 4. Verify the signature

```
get_receipt(receipt_id: "rec_ghi012")
verify_receipt(receipt_id: "rec_ghi012")
→ { valid: true, receipt: { ... } }
```

## Audit Trail

Every agent signature generates a cryptographic receipt containing:
- The signing context (agent name, reason, model)
- Timestamp and IP address
- Document hash (SHA-256)
- Receipt hash (chained with previous signatures)

This creates a tamper-evident chain of custody for the entire agreement.
