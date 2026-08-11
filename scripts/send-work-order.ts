import { sendInboxEmail } from "../src/infrai_email.ts";
import { inboxMessage, prepareDispatch } from "../src/work_order.ts";
const inbox = process.env.FIELD_SERVICE_INBOX;
if (!inbox) throw new Error("FIELD_SERVICE_INBOX is required");
const dispatch = prepareDispatch({ customer: "Mina Chen", email: "mina@example.com", address: "18 River Road", summary: "Outdoor unit is noisy", photos: ["front-panel.jpg", "serial-plate.jpg"] });
const result = await sendInboxEmail({ to: inbox, subject: `[${dispatch.status}] ${dispatch.customer}: ${dispatch.summary}`, text: inboxMessage(dispatch), requestId: `field-service-${dispatch.email}-${dispatch.photos.length}` });
console.log(`inbox message sent: ${result.message_id}`);
