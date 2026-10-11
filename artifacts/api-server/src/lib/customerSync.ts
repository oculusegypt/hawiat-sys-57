import { db, containerSystemRecordsTable, serviceRequestsTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";

type ServiceRequest = typeof serviceRequestsTable.$inferSelect;

/**
 * Gives an unverified public request its own provisional customer/site records.
 * A phone number alone is not proof of identity: public forms cannot safely
 * merge requests into an existing customer profile.
 */
export async function syncCustomerFromRequest(request: ServiceRequest) {
  if (!request.phone.trim()) return { request, customer: null, site: null };

  return db.transaction((tx) => {
    const currentRequest = tx.select().from(serviceRequestsTable)
      .where(eq(serviceRequestsTable.id, request.id)).get();
    if (!currentRequest) return { request, customer: null, site: null };

    // A prior explicit link is authoritative; public intake must not replace it.
    if (currentRequest.customerRecordId) {
      const customer = tx.select().from(containerSystemRecordsTable)
        .where(eq(containerSystemRecordsTable.id, currentRequest.customerRecordId)).get() ?? null;
      return { request: currentRequest, customer, site: null };
    }

    const now = new Date().toISOString();
    const customerReference = `CUS-${String(request.id).padStart(5, "0")}`;
    const existingCustomer = tx.select().from(containerSystemRecordsTable)
      .where(and(
        eq(containerSystemRecordsTable.kind, "customer"),
        eq(containerSystemRecordsTable.reference, customerReference),
      )).get();
    const customerPayload = {
      name: request.clientName,
      phone: request.phone,
      email: request.email ?? "",
      source: "service_request",
      firstRequestId: request.id,
      lastRequestId: request.id,
      identityVerification: "unverified",
      identityReviewStatus: "pending",
    };
    const savedCustomer = existingCustomer ?? tx.insert(containerSystemRecordsTable).values({
      kind: "customer",
      status: "active",
      reference: customerReference,
      payload: JSON.stringify(customerPayload),
      createdAt: now,
      updatedAt: now,
    }).returning().get();

    const location = String(request.location ?? "").trim();
    let site = null;
    if (location && location !== "غير محدد") {
      const siteReference = `SITE-${String(request.id).padStart(5, "0")}`;
      site = tx.select().from(containerSystemRecordsTable)
        .where(and(
          eq(containerSystemRecordsTable.kind, "customer_site"),
          eq(containerSystemRecordsTable.reference, siteReference),
        )).get() ?? null;
      if (!site) {
        site = tx.insert(containerSystemRecordsTable).values({
          kind: "customer_site",
          status: "active",
          reference: siteReference,
          payload: JSON.stringify({
            customerRecordId: savedCustomer.id,
            name: `${request.clientName} — عنوان الطلب #${request.id}`,
            address: location,
            location,
            source: "service_request",
            requestId: request.id,
            serviceType: request.serviceType,
          }),
          createdAt: now,
          updatedAt: now,
        }).returning().get();
      }
    }

    const linkedRequest = tx.update(serviceRequestsTable)
      .set({ customerRecordId: savedCustomer.id, updatedAt: now })
      .where(and(
        eq(serviceRequestsTable.id, request.id),
        isNull(serviceRequestsTable.customerRecordId),
      )).returning().get();

    return { request: linkedRequest ?? currentRequest, customer: savedCustomer, site };
  });
}