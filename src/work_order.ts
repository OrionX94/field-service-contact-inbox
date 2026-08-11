export type WorkOrder = { customer: string; email: string; address: string; summary: string; photos: string[] };
export type Dispatch = WorkOrder & { status: "ready_for_dispatch" | "needs_photo" };
export function prepareDispatch(order: WorkOrder): Dispatch { return { ...order, status: order.photos.length > 0 ? "ready_for_dispatch" : "needs_photo" }; }
export function inboxMessage(dispatch: Dispatch): string { return [`Customer: ${dispatch.customer}`, `Email: ${dispatch.email}`, `Address: ${dispatch.address}`, `Issue: ${dispatch.summary}`, `Photos: ${dispatch.photos.join(", ") || "none"}`, `Dispatch status: ${dispatch.status}`, "Technician follow-up: confirm arrival window with the customer."].join("\n"); }
