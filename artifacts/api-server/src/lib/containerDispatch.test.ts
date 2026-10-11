import assert from "node:assert/strict";
import { dispatchConflictMessage, findScheduledDispatchConflict } from "./containerDispatch.js";

const request = {
  id: 8,
  source: "service_request" as const,
  scheduledAt: "2026-10-14T10:00:00.000Z",
  duration: "2 hours",
  assignedDriverId: 31,
  assignedVehicleId: 72,
  driverStatus: "assigned",
  status: "pending",
};
const workOrder = {
  id: 8,
  source: "work_order" as const,
  scheduledAt: "2026-10-14T11:00:00.000Z",
  duration: "60 minutes",
  assignedDriverId: 31,
  assignedVehicleId: 73,
  driverStatus: "accepted",
  status: "assigned",
};

assert.equal(
  findScheduledDispatchConflict(workOrder, [request])?.resource,
  "driver",
  "work orders must conflict with overlapping service requests using the same driver",
);
assert.equal(
  findScheduledDispatchConflict({ ...workOrder, assignedDriverId: null, assignedVehicleId: 72 }, [request])?.resource,
  "vehicle",
  "vehicle conflicts must be detected across both dispatch record types",
);
assert.equal(
  findScheduledDispatchConflict({ ...workOrder, scheduledAt: "2026-10-14T12:00:00.000Z" }, [request]),
  null,
  "adjacent non-overlapping time windows must be accepted",
);
assert.equal(
  findScheduledDispatchConflict({ ...workOrder, scheduledAt: "2026-10-14" }, [
    { ...request, scheduledAt: "2026-10-15T00:00:00.000Z", driverStatus: "completed" },
  ]),
  null,
  "completed work must not block a resource",
);
assert.equal(
  findScheduledDispatchConflict({ ...workOrder, id: 8 }, [workOrder]),
  null,
  "record IDs from different tables are only self-excluded within the same source",
);
assert.match(dispatchConflictMessage("driver"), /السائق/);

process.stdout.write("container dispatch assertions passed\n");
