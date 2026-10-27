import { db, containerSystemAuditTable, containerSystemRecordsTable, serviceRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

type DispatchPayload = Record<string, unknown>;

function parsePayload(payload: string): DispatchPayload {
  try {
    const value: unknown = JSON.parse(payload);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as DispatchPayload
      : {};
  } catch {
    return {};
  }
}

function numericId(value: unknown): number {
  const id = Number(value ?? 0);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

function normalizedOperation(value: unknown): string | null {
  const text = String(value ?? "").trim().toUpperCase();
  if (["DELIVER_CONTAINER", "EMPTY_CONTAINER", "PICKUP_CONTAINER"].includes(text)) return text;
  const emptying = /تفريغ|empty|unload/i.test(text);
  const pickup = /استرجاع|سحب|رفع|pickup|return|withdraw/i.test(text);
  if (emptying && pickup) return null;
  if (emptying) return "EMPTY_CONTAINER";
  if (pickup) return "PICKUP_CONTAINER";
  return text ? "DELIVER_CONTAINER" : null;
}

function requestOperation(request: typeof serviceRequestsTable.$inferSelect): string | null {
  if (!request.contractRecordId || !request.containerRecordId) return null;
  return normalizedOperation(`${request.serviceType} ${request.notes ?? ""}`);
}

function scheduledAtFromAppointment(payload: DispatchPayload): string {
  const scheduledAt = String(payload.scheduledAt ?? "").trim();
  if (scheduledAt) return scheduledAt;
  const date = String(payload.appointmentDate ?? "").trim();
  const time = String(payload.appointmentTime ?? "").trim();
  return date ? `${date}T${time || "00:00"}:00` : "";
}

function driverStatusFromAppointment(payload: DispatchPayload, status: string): string {
  const candidate = String(payload.driverStatus ?? status).trim().toLowerCase();
  if (["assigned", "accepted", "started", "en_route", "arrived", "completed", "rejected"].includes(candidate)) {
    return candidate;
  }
  return numericId(payload.assignedDriverId) ? "assigned" : "unassigned";
}

function sameReferencesAndSchedule(
  payload: DispatchPayload,
  request: typeof serviceRequestsTable.$inferSelect,
): boolean {
  const scheduledAt = String(request.scheduledAt ?? "").trim();
  return Boolean(
    scheduledAt &&
    request.contractRecordId &&
    request.containerRecordId &&
    numericId(payload.contractRecordId) === request.contractRecordId &&
    numericId(payload.containerRecordId) === request.containerRecordId &&
    String(payload.scheduledAt ?? "").trim() === scheduledAt,
  );
}

function sameDriverState(
  payload: DispatchPayload,
  request: typeof serviceRequestsTable.$inferSelect,
): boolean {
  return String(payload.driverStatus ?? "unassigned") === String(request.driverStatus ?? "unassigned") &&
    numericId(payload.assignedDriverId) === numericId(request.assignedDriverId) &&
    numericId(payload.assignedVehicleId) === numericId(request.assignedVehicleId);
}

function appointmentWorkOrderPayload(appointment: typeof containerSystemRecordsTable.$inferSelect) {
  const source = parsePayload(appointment.payload);
  const type = String(source.appointmentType ?? "scheduled");
  const operationType = normalizedOperation(type);
  return {
    operationKey: `legacy-appointment-${appointment.id}`,
    workOrderNumber: `APT-WO-${appointment.id}`,
    legacyAppointmentId: appointment.id,
    appointmentRecordId: appointment.id,
    customerRecordId: numericId(source.customerRecordId) || null,
    customerName: String(source.customerName ?? source.clientName ?? ""),
    phone: String(source.phone ?? ""),
    email: String(source.email ?? ""),
    contractRecordId: numericId(source.contractRecordId) || null,
    containerRecordId: numericId(source.containerRecordId) || null,
    containerCode: String(source.containerCode ?? ""),
    serviceType: String(source.serviceType ?? source.operationType ?? type),
    operationType: operationType ?? "APPOINTMENT",
    location: String(source.location ?? "يحدد لاحقًا"),
    duration: String(source.duration ?? ""),
    notes: String(source.notes ?? ""),
    appointmentType: type,
    scheduledAt: scheduledAtFromAppointment(source),
    assignedDriverId: numericId(source.assignedDriverId) || null,
    assignedVehicleId: numericId(source.assignedVehicleId) || null,
    assignedVehiclePlate: String(source.assignedVehiclePlate ?? ""),
    assignedAt: source.assignedAt ?? null,
    driverStatus: driverStatusFromAppointment(source, appointment.status),
    driverResponseAt: source.driverResponseAt ?? null,
    driverStartedAt: source.driverStartedAt ?? null,
    driverCompletedAt: source.driverCompletedAt ?? null,
    driverNotes: String(source.driverNotes ?? ""),
    driverLocationLat: String(source.driverLocationLat ?? ""),
    driverLocationLng: String(source.driverLocationLng ?? ""),
    driverProofPhotoUrl: String(source.driverProofPhotoUrl ?? ""),
    driverSignatureData: String(source.driverSignatureData ?? ""),
    driverReceiverName: String(source.driverReceiverName ?? ""),
    status: String(source.status ?? appointment.status ?? "new"),
    source: "appointment_migration",
  };
}

/**
 * Promote legacy service requests and standalone appointments into the
 * canonical work_order record type. Existing records are retained as source
 * history; ambiguous duplicate requests are copied and flagged for review
 * rather than silently merged.
 */
export function ensureCanonicalDispatchTasks(): void {
  db.transaction((tx) => {
    const requests = tx.select().from(serviceRequestsTable).all();
    const allRows = tx.select().from(containerSystemRecordsTable).all();
    const workOrders = allRows.filter((row) => row.kind === "work_order");
    const appointments = allRows.filter((row) => row.kind === "appointment" && row.status !== "archived");

    for (const request of requests) {
      if (/(?:عقد|عقود)\s*(?:ال)?(?:نظافة|تنظيف)/u.test(String(request.serviceType ?? "").trim())) continue;
      const existingLink = workOrders.find((row) =>
        numericId(parsePayload(row.payload).legacyRequestId) === request.id,
      );
      if (existingLink) continue;

      const candidates = workOrders.filter((row) => sameReferencesAndSchedule(parsePayload(row.payload), request));
      const operation = requestOperation(request);
      const safeMatch = candidates.length === 1 &&
        !numericId(parsePayload(candidates[0].payload).legacyRequestId) &&
        sameDriverState(parsePayload(candidates[0].payload), request) &&
        normalizedOperation(parsePayload(candidates[0].payload).operationType ?? parsePayload(candidates[0].payload).serviceType) === operation;

      if (safeMatch) {
        const existing = candidates[0];
        const beforePayload = existing.payload;
        const nextPayload = {
          ...parsePayload(beforePayload),
          legacyRequestId: request.id,
          sourceServiceRequestId: request.id,
        };
        tx.update(containerSystemRecordsTable).set({
          payload: JSON.stringify(nextPayload),
          updatedAt: new Date().toISOString(),
        }).where(eq(containerSystemRecordsTable.id, existing.id)).run();
        tx.insert(containerSystemAuditTable).values({
          recordId: existing.id,
          kind: "work_order",
          action: "legacy_request_linked",
          beforePayload,
          afterPayload: JSON.stringify(nextPayload),
        }).run();
        continue;
      }

      const payload = {
        operationKey: `legacy-service-request-${request.id}`,
        workOrderNumber: `SR-WO-${request.id}`,
        legacyRequestId: request.id,
        sourceServiceRequestId: request.id,
        customerRecordId: request.customerRecordId,
        contractRecordId: request.contractRecordId,
        containerRecordId: request.containerRecordId,
        customerName: request.clientName,
        clientName: request.clientName,
        phone: request.phone,
        email: request.email ?? "",
        serviceType: request.serviceType,
        operationType: operation,
        containerSize: request.containerSize ?? "",
        containerCount: request.containerCount,
        location: request.location,
        duration: request.duration ?? "",
        notes: request.notes ?? "",
        appointmentType: request.appointmentType,
        scheduledAt: request.scheduledAt ?? "",
        assignedDriverId: request.assignedDriverId,
        assignedVehicleId: request.assignedVehicleId,
        assignedVehiclePlate: request.assignedVehiclePlate ?? "",
        assignedAt: request.assignedAt,
        driverStatus: request.driverStatus,
        driverResponseAt: request.driverResponseAt,
        driverStartedAt: request.driverStartedAt,
        driverCompletedAt: request.driverCompletedAt,
        driverNotes: request.driverNotes ?? "",
        driverLocationLat: request.driverLocationLat ?? "",
        driverLocationLng: request.driverLocationLng ?? "",
        driverProofPhotoUrl: request.driverProofPhotoUrl ?? "",
        driverSignatureData: request.driverSignatureData ?? "",
        driverReceiverName: request.driverReceiverName ?? "",
        status: request.status,
        source: "legacy_service_request",
        ...(candidates.length ? {
          reconciliationRequired: true,
          reconciliationReason: "توجد مهمة مرتبطة بالموعد أو العقد نفسه بحالة مختلفة؛ يلزم مراجعة الإدارة",
        } : {}),
      };
      const created = tx.insert(containerSystemRecordsTable).values({
        kind: "work_order",
        status: request.status,
        reference: payload.workOrderNumber,
        payload: JSON.stringify(payload),
        operationKey: String(payload.operationKey),
      }).returning().get();
      workOrders.push(created);
      tx.insert(containerSystemAuditTable).values({
        recordId: created.id,
        kind: "work_order",
        action: "legacy_request_promoted",
        beforePayload: null,
        afterPayload: JSON.stringify(payload),
      }).run();
    }

    for (const appointment of appointments) {
      const source = parsePayload(appointment.payload);
      const appointmentId = appointment.id;
      const alreadyLinked = workOrders.find((row) => {
        const payload = parsePayload(row.payload);
        return numericId(payload.appointmentRecordId) === appointmentId ||
          numericId(payload.legacyAppointmentId) === appointmentId ||
          numericId(payload.workOrderRecordId) === row.id;
      });
      if (alreadyLinked) continue;

      const referencedWorkOrderId = numericId(source.workOrderRecordId);
      const explicitlyLinked = referencedWorkOrderId
        ? workOrders.find((row) => row.id === referencedWorkOrderId)
        : undefined;
      const requestId = numericId(source.serviceRequestId ?? source.requestId);
      const linkedRequestOrder = requestId
        ? workOrders.find((row) => numericId(parsePayload(row.payload).legacyRequestId) === requestId)
        : undefined;
      const scheduledAt = scheduledAtFromAppointment(source);
      const contractId = numericId(source.contractRecordId);
      const containerId = numericId(source.containerRecordId);
      const matchingOrders = workOrders.filter((row) => {
        const payload = parsePayload(row.payload);
        return contractId > 0 && containerId > 0 && scheduledAt !== "" &&
          numericId(payload.contractRecordId) === contractId &&
          numericId(payload.containerRecordId) === containerId &&
          String(payload.scheduledAt ?? "").trim() === scheduledAt &&
          !numericId(payload.appointmentRecordId);
      });
      const linked = explicitlyLinked ?? linkedRequestOrder ?? (matchingOrders.length === 1 ? matchingOrders[0] : undefined);
      if (linked) {
        const beforePayload = linked.payload;
        const nextPayload = {
          ...parsePayload(beforePayload),
          appointmentRecordId: appointmentId,
          legacyAppointmentId: appointmentId,
          appointmentType: source.appointmentType ?? parsePayload(beforePayload).appointmentType,
          scheduledAt: scheduledAt || parsePayload(beforePayload).scheduledAt,
        };
        tx.update(containerSystemRecordsTable).set({
          payload: JSON.stringify(nextPayload),
          updatedAt: new Date().toISOString(),
        }).where(eq(containerSystemRecordsTable.id, linked.id)).run();
        tx.insert(containerSystemAuditTable).values({
          recordId: linked.id,
          kind: "work_order",
          action: "legacy_appointment_linked",
          beforePayload,
          afterPayload: JSON.stringify(nextPayload),
        }).run();
        continue;
      }

      const payload = {
        ...appointmentWorkOrderPayload(appointment),
        ...(matchingOrders.length > 1 ? {
          reconciliationRequired: true,
          reconciliationReason: "تعذر ربط الموعد بأمر تشغيل واحد بشكل آمن؛ يلزم مراجعة الإدارة",
        } : {}),
      };
      const created = tx.insert(containerSystemRecordsTable).values({
        kind: "work_order",
        status: appointment.status,
        reference: String(payload.workOrderNumber),
        payload: JSON.stringify(payload),
        operationKey: String(payload.operationKey),
      }).returning().get();
      workOrders.push(created);
      tx.insert(containerSystemAuditTable).values({
        recordId: created.id,
        kind: "work_order",
        action: "legacy_appointment_promoted",
        beforePayload: appointment.payload,
        afterPayload: JSON.stringify(payload),
      }).run();
    }
  });
}
