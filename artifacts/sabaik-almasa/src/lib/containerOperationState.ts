import type { ContainerSystemRecord, ServiceRequest } from "@workspace/api-client-react"

const TERMINAL_STATUSES = new Set(["completed", "cancelled", "rejected", "closed"])

const payloadOf = (record: ContainerSystemRecord) => (record.payload ?? {}) as Record<string, unknown>

export type ContainerOperationState = {
  id: number
  source: "work_order" | "service_request"
  status: string
  statusLabel: string
  assigned: boolean
  assignedDriverId?: number | null
  assignedVehicleId?: number | null
}

const statusLabel = (status: string) => ({
  new: "جديد",
  scheduled: "مجدول",
  assigned: "بانتظار قبول السائق",
  accepted: "مقبول",
  started: "قيد التنفيذ",
  en_route: "في الطريق",
  arrived: "وصل للموقع",
  unassigned: "غير مسند",
}[status] ?? (status || "قائم"))

export function findOpenContainerOperation(
  records: ContainerSystemRecord[],
  serviceRequests: ServiceRequest[] = [],
  contractId?: number | null,
  containerId?: number | null,
): ContainerOperationState | null {
  const request = serviceRequests.find(item => {
    const row = item as ServiceRequest & { contractRecordId?: number | null; containerRecordId?: number | null }
    const matches = Number(row.contractRecordId ?? 0) === Number(contractId ?? 0) ||
      Number(row.containerRecordId ?? 0) === Number(containerId ?? 0)
    return matches &&
      !TERMINAL_STATUSES.has(String(row.status).toLowerCase()) &&
      !TERMINAL_STATUSES.has(String(row.driverStatus).toLowerCase())
  })
  if (request) {
    const status = String(request.driverStatus || request.status || "unassigned")
    return {
      id: request.id,
      source: "service_request",
      status,
      statusLabel: statusLabel(status),
      assigned: Boolean(request.assignedDriverId || request.assignedVehicleId),
      assignedDriverId: request.assignedDriverId,
      assignedVehicleId: request.assignedVehicleId,
    }
  }
  const workOrder = records.find(record => {
    if (record.kind !== "work_order" || record.status === "archived") return false
    const payload = payloadOf(record)
    const matches = Number(payload.contractRecordId ?? 0) === Number(contractId ?? 0) ||
      Number(payload.containerRecordId ?? 0) === Number(containerId ?? 0)
    const status = String(payload.driverStatus ?? payload.status ?? record.status).toLowerCase()
    return matches && !TERMINAL_STATUSES.has(status) && !TERMINAL_STATUSES.has(String(record.status).toLowerCase())
  })
  if (!workOrder) return null
  const payload = payloadOf(workOrder)
  const status = String(payload.driverStatus ?? payload.status ?? workOrder.status)
  const assignedDriverId = Number(payload.assignedDriverId ?? 0) || null
  const assignedVehicleId = Number(payload.assignedVehicleId ?? 0) || null
  return {
    id: workOrder.id,
    source: "work_order",
    status,
    statusLabel: statusLabel(status),
    assigned: Boolean(assignedDriverId || assignedVehicleId),
    assignedDriverId,
    assignedVehicleId,
  }
}