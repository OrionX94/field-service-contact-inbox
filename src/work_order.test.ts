import assert from "node:assert/strict";
import { inboxMessage, prepareDispatch } from "./work_order.ts";
const order = prepareDispatch({ customer: "Mina Chen", email: "mina@example.com", address: "18 River Road", summary: "Outdoor unit is noisy", photos: ["front-panel.jpg"] });
assert.equal(order.status, "ready_for_dispatch");
assert.match(inboxMessage(order), /Technician follow-up/);
console.log("work order decision passed");
