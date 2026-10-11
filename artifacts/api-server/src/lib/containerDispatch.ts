export type ScheduledDispatch = {
  id: number;
  source: "service_request" | "work_order";
  scheduledAt?: string | null;
  duration?: string | null;
  assignedDriverId?: number | null;
  assignedVehicleId?: number | null;
  driverStatus?: string | null;
  status?: string | null;
};

const terminalStatuses = new Set(["completed", "rejected", "cancelled", "closed"]);

function durationInMs(value?: string | null) {
  const text = String(value ?? "").toLowerCase();
  const hours = Number(text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|ساعة|ساعات)/)?.[1] ?? 0);
  const minutes = Number(text.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes|دقيقة|دقائق)/)?.[1] ?? 0);
  const total = hours * 60 + minutes;
  return (Number.isFinite(total) && total > 0 ? total : 60) * 60 * 1000;
}

function dispatchWindow(order: ScheduledDispatch) {
  if (!order.scheduledAt) return null;
  const start = Date.parse(order.scheduledAt);
  if (!Number.isFinite(start)) return null;
  const hasTime = /T\d{2}:\d{2}/.test(order.scheduledAt);
  return {
    start,
    end: start + (hasTime ? durationInMs(order.duration) : 24 * 60 * 60 * 1000),
  };
}

export function findScheduledDispatchConflict(
  candidate: ScheduledDispatch,
  existing: ScheduledDispatch[],
) {
  const candidateWindow = dispatchWindow(candidate);
  if (!candidateWindow || (candidate.assignedDriverId == null && candidate.assignedVehicleId == null)) return null;

  for (const order of existing) {
    if (order.source === candidate.source && order.id === candidate.id) continue;
    if (terminalStatuses.has(String(order.driverStatus ?? "").toLowerCase()) ||
        terminalStatuses.has(String(order.status ?? "").toLowerCase())) continue;
    const window = dispatchWindow(order);
    if (!window || candidateWindow.start >= window.end || window.start >= candidateWindow.end) continue;

    if (candidate.assignedDriverId != null && order.assignedDriverId === candidate.assignedDriverId) {
      return { order, resource: "driver" as const };
    }
    if (candidate.assignedVehicleId != null && order.assignedVehicleId === candidate.assignedVehicleId) {
      return { order, resource: "vehicle" as const };
    }
  }
  return null;
}

export function dispatchConflictMessage(resource: "driver" | "vehicle") {
  return resource === "driver"
    ? "السائق مسند إلى أمر عمل آخر في نفس الفترة"
    : "الشاحنة مسندة إلى أمر عمل آخر في نفس الفترة";
}
