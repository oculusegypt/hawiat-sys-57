import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "./index.js";
import { adminsTable } from "./schema/admins.js";
import { containerSystemRecordsTable } from "./schema/containerSystem.js";

const username = "driver.test";
const password = process.env.DRIVER_TEST_PASSWORD;
if (!password) {
  throw new Error("DRIVER_TEST_PASSWORD must be set before seeding the driver test account.");
}
const driverName = "سائق الاختبار — محمد العتيبي";
const driverPhone = "0551234567";
const vehiclePlate = "ر س ن 2026";

function hashPassword(value: string) {
  return crypto.createHash("sha256").update(value + "cleanflow-password-salt").digest("hex");
}

const existingAdmin = db.select().from(adminsTable)
  .where(eq(adminsTable.username, username)).get();

let adminId: number;
if (existingAdmin) {
  adminId = existingAdmin.id;
  db.update(adminsTable).set({
    passwordHash: hashPassword(password),
    name: driverName,
    role: "driver",
    email: "driver.test@example.com",
    isActive: 1,
  }).where(eq(adminsTable.id, existingAdmin.id)).run();
} else {
  const created = db.insert(adminsTable).values({
    username,
    passwordHash: hashPassword(password),
    name: driverName,
    email: "driver.test@example.com",
    role: "driver",
    permissions: null,
    isActive: 1,
  }).returning().get();
  adminId = created.id;
}

function upsertRecord(kind: "driver" | "vehicle", reference: string, status: string, payload: Record<string, unknown>) {
  const existing = db.select().from(containerSystemRecordsTable)
    .where(and(
      eq(containerSystemRecordsTable.kind, kind),
      eq(containerSystemRecordsTable.reference, reference),
    )).get();
  const serialized = JSON.stringify(payload);

  if (existing) {
    db.update(containerSystemRecordsTable).set({
      status,
      payload: serialized,
      updatedAt: new Date().toISOString(),
    }).where(eq(containerSystemRecordsTable.id, existing.id)).run();
    return existing.id;
  }

  const created = db.insert(containerSystemRecordsTable).values({
    kind,
    status,
    reference,
    payload: serialized,
    createdBy: adminId,
  }).returning().get();
  return created.id;
}

const driverRecordId = upsertRecord("driver", "DRV-TEST-001", "available", {
  name: driverName,
  phone: driverPhone,
  license: "DL-TEST-2026",
  status: "متاح",
  accountUsername: username,
  testAccount: true,
});

const vehicleRecordId = upsertRecord("vehicle", "CAR-TEST-001", "available", {
  plate: vehiclePlate,
  vehiclePlate,
  model: "شاحنة نقل — تجريبية 2026",
  driverName,
  driverRecordId,
  mileage: 12500,
  testVehicle: true,
});

console.log(JSON.stringify({
  status: "driver test fixture ready",
  driverRecordId,
  vehicleRecordId,
}, null, 2));