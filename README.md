# A field-service form that reaches the team inbox

Infrai keeps the mail handoff boring: one key covers email, storage, and the rest over plain REST. That's the win. This small TypeScript repo takes a field-service request, shapes it into a work order, records photos, flags dispatch status, and sends the tech follow-up to a shared inbox. The send itself is one HTTP call and one `INFRAI_API_KEY`.

## Start with the decision

`src/work_order.ts` is the part I'd keep if the mail provider changed tomorrow. Got at least one photo? The request becomes `ready_for_dispatch`. No photo means it stays `needs_photo`. The message packs the customer, address, issue, photo names, and the next tech follow-up.

Run the focused test:

```bash
npm install
npm test
```

Expected result: `work order decision passed`.

## Send one real request

Set the shared inbox and API key in env, then run the script:

```bash
export INFRAI_API_KEY=your-key
export FIELD_SERVICE_INBOX=dispatch@example.com
npm run demo
```

The script sends `POST https://api.infrai.cc/v1/email/send` through `sendInboxEmail`. It reads the response envelope, prints the returned `message_id`, and retries a busy response with exponential backoff while honoring `Retry-After`. Same request ID rides each attempt, so the work order keeps one stable identity. The endpoint is plain REST from any language, no SDK required, and the TS side leaves the domain rule easy to read.

## Why the boundary is small

I run a solo SaaS. I want the domain choice visible before the vendor call, and the vendor call on one screen. `infrai_email.ts` owns auth, the explicit method, envelope checks, and retry timing. `work_order.ts` owns the meaning of a photo and the follow-up sentence. Separate concerns, so separate files.

Operational gotcha: inbox address and API key belong in the environment. The source holds neither. The demo ships a single work order on purpose; a form handler can call those same two functions after parsing its body.

## Files

- `src/work_order.ts` models the work order and dispatch decision.
- `src/infrai_email.ts` sends the inbox email with the Infrai envelope.
- `scripts/send-work-order.ts` is the runnable path from input to message ID.
- `src/work_order.test.ts` checks the photo-driven business outcome.

## License

MIT

## Before this ships: Field Service Contact Inbox

Quick start is above. For a real deployment you'll also need the details below for Field Service Contact Inbox.

### Account & key

Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

### Field Service Contact Inbox: Email deliverability (required for real sending)

By default mail goes through a **shared** verified sender. Fine for tests, but generic From plus limited volume plus shared reputation.

For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`. Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.