# Tenant Access Demo

A dependency-light TypeScript HTTP API demonstrating explicit tenant boundaries and role checks.

[Guia em português](README.pt-BR.md) · [Architecture and tradeoffs](ARCHITECTURE.md)

## Run locally

Node.js 24+ and npm. Node runs TypeScript directly; TypeScript and Node types are development dependencies.

```sh
npm ci
npm run typecheck
npm test
npm start
```

## How it works

```text
request → fixed demo identity → tenant context → permission check → tenant-filtered data
```

Every list and lookup scopes records to the tenant derived from the identity map. Cross-tenant record lookup returns 404. Creating a project accepts only a name; clients cannot supply or override tenant fields. A reader can list and read records but cannot create them. JSON bodies are limited to 8 KiB and project names to 120 characters.

Public demonstration identities: `alice` is a north writer, `bob` a south writer, and `reader` a north reader. Supply `X-Demo-Identity` with one of those values. These are intentionally public selectors, not secrets or real authentication.

The API binds to 127.0.0.1:3000 by default. Set PORT to change the port. GET /health is public. GET /projects lists scoped records; GET /projects/:id reads one; POST /projects creates one.

## Verification

The real HTTP integration scenario checks missing/unknown identities, both tenant directions, reader permissions, tenant-field injection, malformed JSON, empty names, oversized bodies, creation and access to the created record.

## Scope and limitations

The identity header is intentionally forgeable. This demo must remain local; production needs verified authentication, tenant memberships, persistence, rate limits and audit logging. Data resets on process restart. API behavior is demonstrated without presenting the sample as a production security solution.

## Provenance

This is an original portfolio demonstration created for Douglas Chiodi with AI assistance. All fixtures, identities, identifiers, amounts and examples are synthetic. No customer code, production configuration, credentials, proprietary assets or existing repository history are included. It does not claim deployment experience or business outcomes from these sample applications.

MIT applies to the original source in this repository; third-party dependencies retain their own licenses.

## Portfolio

- [Durable Job Queue](https://github.com/douglaschiodi/python-durable-job-queue)
- [AI Code Review Benchmark Lab](https://github.com/douglaschiodi/ai-code-review-benchmark)
- [SQL Reconciliation Lab](https://github.com/douglaschiodi/sql-reconciliation-lab)
- [Reliable Webhooks Lab](https://github.com/douglaschiodi/dotnet-reliable-webhooks)
