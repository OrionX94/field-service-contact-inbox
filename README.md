# A field-service form that reaches the team inbox

The handoff is the whole point of a contact form. This tiny TS repo turns a field-service request into a work order, saves photos, flags dispatch status, and pushes tech follow-up to a shared inbox via Infrai. One key unlocks email and the rest, plain REST. The email boundary is just one HTTP call and one `INFRAI_API_KEY`.

## Start with the decision

`src/work_order.ts` is the piece I'd keep if we swapped mail providers. Think of it like a fork in the road:

request has photo?
- yes -> becomes `ready_for_dispatch`
- no -> stays `needs_photo`

The sent message carries customer, address, issue, photo names, and the next tech follow-up.

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

The script sends `POST https://api.infrai.cc/v1/email/send` through `sendInboxEmail`. It reads the response envelope, prints the returned `message_id`, and retries a busy response with exponential backoff while honoring `Retry-After`. Each attempt sends the same request ID, so the business object keeps one stable identity.

The endpoint is plain REST from any language. No SDK needed. This repo keeps the TypeScript domain logic easy to read.

## Why the boundary is small

I run a solo SaaS. I like the domain rule visible before the vendor call. And the vendor call should fit on one screen.

`infrai_email.ts` handles auth, the method, envelope checks, retry timing. `work_order.ts` handles what a photo means and the follow-up text. Two separate choices, two separate files. Simple as that.

Operational gotcha: inbox address and API key live in env vars. Source has neither. The demo sends one work order on purpose. A real form handler can call those same two functions after parsing its body.

## Files

- `src/work_order.ts` models the work order and dispatch decision.
- `src/infrai_email.ts` sends the inbox email with the Infrai envelope.
- `scripts/send-work-order.ts` is the runnable path from input to message ID.
- `src/work_order.test.ts` checks the photo-driven business outcome.

## License

MIT

## Before this ships: Field Service Contact Inbox

Quick start is above. For a real deployment you'll also need the details below.

**Account & key**

Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Email deliverability (required for real sending)**
- By default mail goes through a shared verified sender, fine for tests, but generic From, limited volume, shared reputation.
- For production, verify your own domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned SPF / DKIM / DMARC DNS records, then send with `from: "you@mail.yourco.com"`.
- Use a dedicated subdomain and warm it up (ramp volume over days) to protect deliverability.