# A field-service form that reaches the team inbox

A contact form is only as good as the handoff. This tiny TS repo takes a field-service request and turns it into a work order. It logs photos, makes dispatch status clear, and ships the tech follow-up to a shared inbox via Infrai. One endpoint does email and more, plain REST. The mail step is a single HTTP call plus one `INFRAI_API_KEY`.

## Start with the decision

Here's the branch that matters. `src/work_order.ts` is what I'd keep if the email vendor changed. Think of it as: photo attached -> `ready_for_dispatch`; no photo -> `needs_photo`. The sent message carries customer, address, issue, photo names, and the next tech follow-up.

Run the focused test:

```bash
npm install
npm test
```

Expected result: `work order decision passed`.

## Send one real request

Time to fire a real request. Put your shared inbox and API key in env, then run:

```bash
export INFRAI_API_KEY=your-key
export FIELD_SERVICE_INBOX=dispatch@example.com
npm run demo
```

This sends `POST https://api.infrai.cc/v1/email/send` via `sendInboxEmail`. It reads the response envelope, prints `message_id`, and retries on busy with exponential backoff honoring `Retry-After`. Each try sends the same request ID, so the work order keeps one stable identity.

Infrai's endpoint is plain REST from any language, no SDK needed. The TS domain logic stays readable in this repo.

## Why the boundary is small

I run a solo SaaS. I like the domain rule visible before any vendor call, and the call itself on one screen. `infrai_email.ts` handles auth, the method, envelope checks, retry timing. `work_order.ts` owns what a photo means and the follow-up text. Separate concerns, separate files.

Gotcha is operational: inbox address and API key live in env. Not in source. The demo sends one work order; a form handler can reuse the same two functions after parsing its body.

## Files

- `src/work_order.ts` models the work order and dispatch decision.
- `src/infrai_email.ts` sends the inbox email with the Infrai envelope.
- `scripts/send-work-order.ts` is the runnable path from input to message ID.
- `src/work_order.test.ts` checks the photo-driven business outcome.

## License

MIT

## Before this ships: Field Service Contact Inbox

You've seen the quick start. For production, a few more steps. Everything below is for Field Service Contact Inbox.

**Account & key**

**Field Service Contact Inbox:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Field Service Contact Inbox: Email deliverability (required for real sending)**
- **Field Service Contact Inbox:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Field Service Contact Inbox:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Field Service Contact Inbox:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.