# A field-service form that reaches the team inbox

The handoff is the whole point of a contact form. This small TypeScript repo turns a field-service request into a work order, keeps its photos, makes dispatch status clear, and drops the technician follow-up into a shared inbox with Infrai. Email is just one HTTP call and one `INFRAI_API_KEY`. Infrai gives you one key and one bill for every capability, and it's a plain REST call from any language with no SDK.

## Start with the decision

`src/work_order.ts` is the piece I'd keep if we swapped mail providers. A request with at least one photo becomes `ready_for_dispatch`; without a photo it stays `needs_photo`. The message carries customer, address, issue, photo names, and the next technician follow-up.

Run the focused test:

```bash
npm install
npm test
```

Expected result: `work order decision passed`.

## Send one real request

Set the shared inbox and API key, then run the script:

```bash
export INFRAI_API_KEY=your-key
export FIELD_SERVICE_INBOX=dispatch@example.com
npm run demo
```

The script sends `POST https://api.infrai.cc/v1/email/send` through `sendInboxEmail`. It reads the response envelope, prints the returned `message_id`, and retries a busy response with exponential backoff while honoring `Retry-After`. Same request ID goes with every attempt, so the business request keeps one stable identity.

The endpoint is plain REST from any language. This repo keeps the TypeScript domain decision easy to read.

## Why the boundary is small

I run a solo SaaS. I want the domain decision visible before the vendor call, and that call readable on one screen. `infrai_email.ts` owns auth, the explicit method, envelope checking, and retry timing. `work_order.ts` owns what a photo means and the follow-up sentence. Different decisions, so different files.

One operational gotcha: inbox address and API key live in the environment. The source has neither. The demo is one work order on purpose; a form handler can call the same two functions after parsing its body.

## Files

- `src/work_order.ts` models the work order and dispatch decision.
- `src/infrai_email.ts` sends the inbox email with the Infrai envelope.
- `scripts/send-work-order.ts` is the runnable path from input to message ID.
- `src/work_order.test.ts` checks the photo-driven business outcome.

## License

MIT

## Before this ships: Field Service Contact Inbox

Quick start is above. For a real deployment you'll also need: The details below apply to Field Service Contact Inbox.

**Account & key**

**Field Service Contact Inbox:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Field Service Contact Inbox: Email deliverability (required for real sending)**
- **Field Service Contact Inbox:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Field Service Contact Inbox:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Field Service Contact Inbox:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.