# AI Field Detection

Pactra can analyze PDF documents and automatically detect where signature fields should be placed using AI.

## Steps

### 1. Upload a document and create an agreement

First, create an agreement (document upload happens through the Pactra web dashboard or SDK).

```
create_agreement(
  title: "Partnership Agreement",
  document_id: "doc_abc123"    ← ID of an uploaded PDF
)
```

### 2. Detect fields

```
detect_fields(
  agreement_id: "agr_abc123",
  confidence_threshold: 0.7    ← optional, default 0.5
)
```

Returns detected fields with positions and confidence scores:

```json
[
  {
    "type": "signature",
    "page": 3,
    "x": 15.2,
    "y": 78.5,
    "width": 30,
    "height": 5,
    "confidence": 0.92,
    "label": "Client Signature"
  },
  {
    "type": "date",
    "page": 3,
    "x": 60.1,
    "y": 78.5,
    "width": 20,
    "height": 4,
    "confidence": 0.88,
    "label": "Date"
  }
]
```

### 3. Add detected fields (with signer assignment)

```
add_fields(
  agreement_id: "agr_abc123",
  fields: [
    {
      type: "signature",
      signer_id: "sgn_def456",
      page: 3,
      x: 15.2,
      y: 78.5,
      width: 30,
      height: 5,
      required: true,
      label: "Client Signature"
    },
    {
      type: "date",
      signer_id: "sgn_def456",
      page: 3,
      x: 60.1,
      y: 78.5,
      width: 20,
      height: 4,
      label: "Date"
    }
  ]
)
```

### 4. Verify fields were added

```
get_fields(agreement_id: "agr_abc123")
```

## Field Types

| Type | Description |
|------|-------------|
| `signature` | Full signature (draw, type, or click) |
| `initials` | Initials field |
| `date` | Date picker |
| `text` | Free-text input |
| `checkbox` | Checkbox (accept/decline) |

## Coordinates

All coordinates use a percentage system (0-100) relative to the page dimensions:
- `x`, `y` — position of the top-left corner
- `width`, `height` — size of the field
- `page` — 1-indexed page number
