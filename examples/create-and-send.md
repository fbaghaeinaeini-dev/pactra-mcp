# Create and Send an Agreement

This example shows the most common workflow: creating a draft agreement, adding signers, and sending it for signature.

## Steps

### 1. Create the agreement

```
create_agreement(
  title: "Service Agreement - Q1 2026",
  description: "Consulting services agreement between Acme Corp and Partner Inc"
)
→ Returns: { id: "agr_abc123", status: "draft", ... }
```

### 2. Add signers

```
add_signer(
  agreement_id: "agr_abc123",
  name: "Jane Smith",
  email: "jane@acme.com",
  role: "signer"
)

add_signer(
  agreement_id: "agr_abc123",
  name: "Bob Johnson",
  email: "bob@partner.com",
  role: "signer"
)
```

### 3. Send for signature

```
send_agreement(agreement_id: "agr_abc123")
→ Agreement status changes to "pending"
→ Both signers receive an email with their unique signing link
```

### 4. Check status later

```
get_agreement(agreement_id: "agr_abc123")
→ Returns current status and signer progress
```

### 5. Get the signed document

Once all signers have signed:

```
get_signed_document(agreement_id: "agr_abc123")
→ Returns: { url: "https://..." }
```

## Natural Language

You can also just tell Claude what you want:

> "Create a service agreement for Q1 2026 between Jane (jane@acme.com) and Bob (bob@partner.com), then send it."

Claude will execute all the steps above automatically.
