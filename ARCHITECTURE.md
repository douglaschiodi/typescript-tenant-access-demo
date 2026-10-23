# Architecture and tradeoffs

## Data flow

```text
request → fixed demo identity → tenant context → permission check → tenant-filtered data
```

Every list and lookup scopes records to the tenant derived from the identity map. Cross-tenant record lookup returns 404. Creating a project accepts only a name; clients cannot supply or override tenant fields. A reader can list and read records but cannot create them. JSON bodies are limited to 8 KiB and project names to 120 characters.

Public demonstration identities: `alice` is a north writer, `bob` a south writer, and `reader` a north reader. Supply `X-Demo-Identity` with one of those values. These are intentionally public selectors, not secrets or real authentication.

The API binds to 127.0.0.1:3000 by default. Set PORT to change the port. GET /health is public. GET /projects lists scoped records; GET /projects/:id reads one; POST /projects creates one.

## Why this shape

The repository keeps a small, inspectable core and exercises behavior through real storage or HTTP where applicable. No service account, customer environment or paid API is required.

## Boundaries

The identity header is intentionally forgeable. This demo must remain local; production needs verified authentication, tenant memberships, persistence, rate limits and audit logging. Data resets on process restart. API behavior is demonstrated without presenting the sample as a production security solution.

## Test strategy

The real HTTP integration scenario checks missing/unknown identities, both tenant directions, reader permissions, tenant-field injection, malformed JSON, empty names, oversized bodies, creation and access to the created record.

Tests exercise behavior and failure cases; they do not certify readiness for production. Synthetic examples are intentionally small enough to review in one sitting.
