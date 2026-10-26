import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createServer } from "node:net";
import { spawn, type ChildProcess } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  adminsTable,
  containerSystemRecordsTable,
  db,
  serviceRequestsTable,
  sqlite,
} from "@workspace/db";
import { postToFinancialCore } from "@workspace/db";
import { findScheduledDispatchConflict } from "./lib/containerDispatch.js";
import { hashPassword } from "./routes/auth.js";
import { eq } from "drizzle-orm";

const testPhone = "+966500000001";
const testLocation = "TEST ONLY — موقع تجريبي، الرياض";
const testAddress = "TEST ONLY — العنوان مخصص للاختبار ولا يستخدم للتوجيه";
const testSecret: string = process.env.SESSION_SECRET ?? "";
if (!testSecret) throw new Error("SESSION_SECRET must be set to a test-only value");
const testAdminPassword = "cleanflow-container-lifecycle-test-password";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function insertRecord(kind: string, status: string, reference: string, payload: Record<string, unknown>) {
  return db.insert(containerSystemRecordsTable).values({
    kind,
    status,
    reference,
    payload: JSON.stringify(payload),
  }).returning().get();
}

async function main() {
  const admin = db.insert(adminsTable).values({
    username: "container-lifecycle-test-admin",
    passwordHash: hashPassword(testAdminPassword),
    name: "TEST ONLY Admin",
    role: "admin",
  }).returning().get();
  const driver = db.insert(adminsTable).values({
    username: "container-lifecycle-test-driver",
    passwordHash: hashPassword(testAdminPassword),
    name: "TEST ONLY Driver",
    role: "driver",
  }).returning().get();
  const customer = insertRecord("customer", "active", "TEST-CUSTOMER-001", {
    name: "عميل اختبار — لا يستخدم للتشغيل",
    phone: testPhone,
    address: testAddress,
    testData: true,
  });
  const site = insertRecord("customer_site", "active", "TEST-SITE-001", {
    customerRecordId: customer.id,
    name: "موقع اختبار",
    address: testAddress,
    location: testLocation,
    latitude: "24.7136",
    longitude: "46.6753",
    testData: true,
  });
  const request = db.insert(serviceRequestsTable).values({
    clientName: "عميل اختبار — لا يستخدم للتشغيل",
    phone: testPhone,
    serviceType: "TEST ONLY — container delivery",
    containerSize: "12 yd (TEST ONLY)",
    location: testLocation,
    scheduledAt: "2026-10-14T10:00:00.000Z",
    duration: "1 hour",
    appointmentType: "scheduled",
    customerRecordId: customer.id,
    driverStatus: "assigned",
    assignedDriverId: driver.id,
    adminNotes: "TEST ONLY — لا ترسل سائقاً إلى هذا الموقع",
  }).returning().get();
  const vehicle = insertRecord("vehicle", "available", "TEST-VEHICLE-001", {
    vehiclePlate: "TEST-0001",
    testData: true,
  });
  const container = insertRecord("container_asset", "available", "TEST-CONTAINER-001", {
    assetCode: "TEST-CONTAINER-001",
    status: "available",
    testData: true,
  });
  const dispatchConflict = findScheduledDispatchConflict({
    id: 1,
    source: "work_order",
    scheduledAt: "2026-10-14T10:30:00.000Z",
    duration: "1 hour",
    assignedDriverId: driver.id,
    assignedVehicleId: vehicle.id,
    driverStatus: "assigned",
    status: "assigned",
  }, [{
    ...request,
    source: "service_request",
    assignedVehicleId: vehicle.id,
  }]);
  assert.equal(dispatchConflict?.resource, "driver");
  assert.equal(customer && site && request.phone, testPhone);
  assert.match(String(site.payload), /TEST ONLY/);
  const existingCustomerPayload = String(customer.payload);

  const contractNumber = "TEST-CONTRACT-001";
  const contract = insertRecord("contract", "active", contractNumber, {
    contractNumber,
    containerRecordId: container.id,
    containerCode: "TEST-CONTAINER-001",
    amount: 100,
    total: 100,
    paid: 0,
    remaining: 100,
    customerRecordId: customer.id,
    customerName: "عميل اختبار — لا يستخدم للتشغيل",
    customerPhone: testPhone,
    customerAddress: testAddress,
    siteRecordId: site.id,
    location: testLocation,
    serviceRequestId: request.id,
    testData: true,
  });
  db.update(serviceRequestsTable)
    .set({
      contractRecordId: contract.id,
      containerRecordId: container.id,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(serviceRequestsTable.id, request.id))
    .run();
  const invoice = insertRecord("invoice", "draft", "TEST-INVOICE-001", {
    invoiceNumber: "TEST-INVOICE-001",
    contractRecordId: contract.id,
    contractNumber,
    customerRecordId: customer.id,
    customerName: "عميل اختبار — لا يستخدم للتشغيل",
    customerPhone: testPhone,
    customerAddress: testAddress,
    siteRecordId: site.id,
    location: testLocation,
    amount: 100,
    total: 100,
    paid: 0,
    remaining: 100,
    date: "2026-08-10",
    invoiceStatus: "due",
    testData: true,
  });
  insertRecord("work_order", "completed", "TEST-WORK-ORDER-001", {
    contractRecordId: contract.id,
    contractNumber,
    assignedDriverId: driver.id,
    assignedVehicleId: vehicle.id,
    scheduledAt: "2026-10-14T10:00:00.000Z",
    driverStatus: "completed",
    status: "completed",
    customerPhone: testPhone,
    location: testLocation,
    testData: true,
  });

  const multiReturnLocation = "TEST ONLY — 24.7136,46.6753";
  const returnContainers = ["TEST-RETURN-CONTAINER-001", "TEST-RETURN-CONTAINER-002", "TEST-FAR-CONTAINER-003"].map(
    (code, index) => {
      const location = index === 2 ? "TEST ONLY — 25.5000,48.0000" : multiReturnLocation;
      const asset = insertRecord("container_asset", "rented", code, {
        assetCode: code,
        status: "rented",
        location,
        testData: true,
      });
      const returnContract = insertRecord("contract", "delivered", `TEST-RETURN-CONTRACT-00${index + 1}`, {
        contractNumber: `TEST-RETURN-CONTRACT-00${index + 1}`,
        containerRecordId: asset.id,
        containerCode: code,
        customerRecordId: customer.id,
        customerName: "TEST ONLY — عميل لا يستخدم للتشغيل",
        location,
        preservedTestField: `preserve-${index + 1}`,
        testData: true,
      });
      return { asset, contract: returnContract };
    },
  );
  const multiReturnTask = insertRecord("work_order", "assigned", "TEST-MULTI-RETURN-WORK-ORDER", {
    serviceType: "سحب واسترجاع حاوية",
    operationType: "PICKUP_CONTAINER",
    movementType: "سحب",
    contractRecordId: returnContainers[0].contract.id,
    containerRecordId: returnContainers[0].asset.id,
    contractRecordIds: [returnContainers[0].contract.id],
    containerRecordIds: [returnContainers[0].asset.id],
    containerCodes: ["TEST-RETURN-CONTAINER-001"],
    assignedDriverId: driver.id,
    assignedAt: new Date().toISOString(),
    driverStatus: "assigned",
    status: "assigned",
    location: multiReturnLocation,
    scheduledAt: "2026-10-26T10:00:00.000Z",
    testData: true,
  });

  const portProbe = createServer();
  await new Promise<void>(resolve => portProbe.listen(0, "127.0.0.1", resolve));
  const address = portProbe.address() as AddressInfo;
  const port = address.port;
  await new Promise<void>((resolve, reject) => portProbe.close(error => error ? reject(error) : resolve()));
  const apiProcess: ChildProcess = spawn(
    process.execPath,
    ["--enable-source-maps", join(projectRoot, "artifacts/api-server/dist/index.mjs")],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        PORT: String(port),
        NODE_ENV: "test",
        DB_PATH: process.env.DB_PATH!,
        SESSION_SECRET: testSecret,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let startupOutput = "";
  apiProcess.stdout?.on("data", chunk => { startupOutput += String(chunk); });
  apiProcess.stderr?.on("data", chunk => { startupOutput += String(chunk); });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (apiProcess.exitCode !== null) throw new Error(`Test API exited before becoming ready:\n${startupOutput}`);
    try {
      await fetch(`http://127.0.0.1:${port}/api/health`);
      ready = true;
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 125));
    }
  }
  assert.ok(ready, `Test API did not become ready:\n${startupOutput}`);
  let authorization = "";
  const settle = async (operationKey: string, invoiceId: number | null, amount = 50) => fetch(
    `http://127.0.0.1:${port}/api/admin/container-system/financial/settle`,
    {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({
        contractId: contract.id,
        amount,
        paymentMethod: "نقدي",
        date: "2026-08-11",
        operationKey,
        allocations: [{ contractId: contract.id, invoiceId, amount }],
      }),
    },
  );

  try {
    const loginResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "container-lifecycle-test-admin",
        password: testAdminPassword,
      }),
    });
    assert.equal(loginResponse.status, 200, "the isolated admin account must authenticate with the configured admin secret");
    const loginBody = await loginResponse.json() as { token?: string };
    assert.ok(loginBody.token, "admin login must return an authenticated session token");
    authorization = `Bearer ${loginBody.token}`;

    const addedContainerResponse = await fetch(
      `http://127.0.0.1:${port}/api/admin/work-orders/${multiReturnTask.id}/containers`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization },
        body: JSON.stringify({ containerRecordId: returnContainers[1].asset.id }),
      },
    );
    assert.equal(addedContainerResponse.status, 200, await addedContainerResponse.clone().text());
    const addedContainer = await addedContainerResponse.json() as {
      containerRecordIds: number[];
      contractRecordIds: number[];
      containerCount: number;
    };
    assert.deepEqual(addedContainer.containerRecordIds, [
      returnContainers[0].asset.id,
      returnContainers[1].asset.id,
    ]);
    assert.deepEqual(addedContainer.contractRecordIds, [
      returnContainers[0].contract.id,
      returnContainers[1].contract.id,
    ]);
    assert.equal(addedContainer.containerCount, 2);

    const distantContainerResponse = await fetch(
      `http://127.0.0.1:${port}/api/admin/work-orders/${multiReturnTask.id}/containers`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization },
        body: JSON.stringify({ containerRecordId: returnContainers[2].asset.id }),
      },
    );
    assert.equal(distantContainerResponse.status, 409, "a distant contract must not be added to a nearby return route");

    const driverLoginResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "container-lifecycle-test-driver",
        password: testAdminPassword,
      }),
    });
    assert.equal(driverLoginResponse.status, 200, "the test driver must authenticate");
    const driverLoginBody = await driverLoginResponse.json() as { token?: string };
    assert.ok(driverLoginBody.token);
    const driverAuthorization = `Bearer ${driverLoginBody.token}`;
    const updateReturnTask = (status: string, evidence = false) => fetch(
      `http://127.0.0.1:${port}/api/driver/work-orders/${multiReturnTask.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: driverAuthorization },
        body: JSON.stringify({
          status,
          ...(evidence ? {
            receiverName: "TEST ONLY — مستلم الإرجاع",
            proofPhotoUrl: "/uploads/TEST-ONLY-return-proof.webp",
            signatureData: "TEST ONLY — signature proof",
            locationLat: "24.7136",
            locationLng: "46.6753",
          } : {}),
        }),
      },
    );
    for (const status of ["accepted", "started", "en_route", "arrived"]) {
      const response = await updateReturnTask(status);
      assert.equal(response.status, 200, await response.clone().text());
    }

    db.update(containerSystemRecordsTable)
      .set({ status: "available", payload: JSON.stringify({
        assetCode: "TEST-RETURN-CONTAINER-002",
        status: "available",
        location: multiReturnLocation,
        testData: true,
      }) })
      .where(eq(containerSystemRecordsTable.id, returnContainers[1].asset.id))
      .run();
    const blockedMultiReturn = await updateReturnTask("completed", true);
    assert.equal(blockedMultiReturn.status, 422, "one ineligible container must block the whole multi-return");
    const unchangedPrimaryContract = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, returnContainers[0].contract.id)).get();
    const unchangedPrimaryAsset = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, returnContainers[0].asset.id)).get();
    assert.equal(unchangedPrimaryContract?.status, "delivered", "a rejected multi-return must not partially return earlier contracts");
    assert.equal(unchangedPrimaryAsset?.status, "rented", "a rejected multi-return must not partially release earlier containers");

    db.update(containerSystemRecordsTable)
      .set({ status: "rented", payload: JSON.stringify({
        assetCode: "TEST-RETURN-CONTAINER-002",
        status: "rented",
        location: multiReturnLocation,
        testData: true,
      }) })
      .where(eq(containerSystemRecordsTable.id, returnContainers[1].asset.id))
      .run();
    const completedMultiReturn = await updateReturnTask("completed", true);
    assert.equal(completedMultiReturn.status, 200, await completedMultiReturn.clone().text());
    for (const item of returnContainers.slice(0, 2)) {
      const returnedContract = db.select().from(containerSystemRecordsTable)
        .where(eq(containerSystemRecordsTable.id, item.contract.id)).get();
      const availableAsset = db.select().from(containerSystemRecordsTable)
        .where(eq(containerSystemRecordsTable.id, item.asset.id)).get();
      assert.equal(returnedContract?.status, "returned");
      assert.equal(availableAsset?.status, "available");
      const contractPayload = JSON.parse(String(returnedContract?.payload)) as Record<string, unknown>;
      assert.equal(contractPayload.preservedTestField, `preserve-${item.contract.id === returnContainers[0].contract.id ? 1 : 2}`);
      assert.equal(contractPayload.lastWorkOrderId, multiReturnTask.id);
      assert.ok(contractPayload.returnAt);
    }
    const multiReturnMovements = db.select().from(containerSystemRecordsTable).all()
      .filter(record => record.kind === "container_movement" &&
        Number((JSON.parse(record.payload) as Record<string, unknown>).workOrderId) === multiReturnTask.id);
    assert.equal(multiReturnMovements.length, 2, "each contract must receive its own return movement");
    for (const movement of multiReturnMovements) {
      const movementPayload = JSON.parse(movement.payload) as Record<string, unknown>;
      assert.equal(movementPayload.proofPhotoUrl, "/uploads/TEST-ONLY-return-proof.webp");
      assert.equal(movementPayload.signatureData, "TEST ONLY — signature proof");
      assert.equal(movementPayload.receiverName, "TEST ONLY — مستلم الإرجاع");
      assert.equal(movementPayload.driverId, driver.id);
      assert.equal(movementPayload.locationLat, "24.7136");
      assert.equal(movementPayload.locationLng, "46.6753");
    }

    const intakeResponse = await fetch(`http://127.0.0.1:${port}/api/service-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        isQuoteRequest: true,
        clientName: "TEST ONLY — unverified new inquiry",
        phone: "00966 500 000 001",
        email: "new-inquiry@example.invalid",
        serviceType: "TEST ONLY — customer identity regression",
        containerSize: "12 yd (TEST ONLY)",
        location: "TEST ONLY — address submitted by unverified requester",
      }),
    });
    assert.equal(intakeResponse.status, 201);
    const intakeBody = await intakeResponse.json() as {
      id: number;
      customerRecordId: number | null;
    };
    assert.ok(intakeBody.customerRecordId);
    assert.notEqual(intakeBody.customerRecordId, customer.id,
      "an unverified public phone must not claim an existing customer profile");
    const unchangedCustomer = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, customer.id)).get();
    assert.equal(unchangedCustomer?.payload, existingCustomerPayload,
      "public intake must not overwrite a possible existing customer's identity fields");
    const provisionalCustomer = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, intakeBody.customerRecordId!)).get();
    assert.ok(provisionalCustomer);
    const provisionalPayload = JSON.parse(provisionalCustomer.payload) as Record<string, unknown>;
    assert.equal(provisionalPayload.identityVerification, "unverified");
    assert.equal(provisionalPayload.identityReviewStatus, "pending");
    assert.equal(provisionalPayload.firstRequestId, intakeBody.id);
    const intakeSite = db.select().from(containerSystemRecordsTable).all().find(record =>
      record.kind === "customer_site" &&
      Number((JSON.parse(record.payload) as Record<string, unknown>).requestId) === intakeBody.id,
    );
    assert.ok(intakeSite, "the submitted test location must be stored as a request-specific site");
    assert.equal(
      (JSON.parse(intakeSite.payload) as Record<string, unknown>).address,
      "TEST ONLY — address submitted by unverified requester",
    );

    const depositDraftResponse = await fetch(`http://127.0.0.1:${port}/api/admin/container-system/records`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({
        kind: "bank_deposit",
        status: "pending_approval",
        payload: {
          amount: 75,
          date: "2026-10-12",
          reference: "TEST ONLY — bank deposit without statement",
        },
      }),
    });
    assert.equal(depositDraftResponse.status, 201);
    const depositDraft = await depositDraftResponse.json() as { id: number };
    const depositApprovalResponse = await fetch(
      `http://127.0.0.1:${port}/api/admin/container-system/records/${depositDraft.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization },
        body: JSON.stringify({ status: "approved" }),
      },
    );
    assert.equal(depositApprovalResponse.status, 200, await depositApprovalResponse.clone().text());
    const depositPostResponse = await fetch(
      `http://127.0.0.1:${port}/api/admin/container-system/records/${depositDraft.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization },
        body: JSON.stringify({ status: "posted" }),
      },
    );
    assert.equal(depositPostResponse.status, 200, await depositPostResponse.clone().text());
    assert.equal(
      (sqlite.prepare("SELECT status FROM bank_reconciliations WHERE deposit_record_id = ?")
        .get(depositDraft.id) as { status: string } | undefined)?.status,
      "unmatched",
      "posting a deposit must not imply that a bank statement confirmed it",
    );

    const bypassApproval = await fetch(`http://127.0.0.1:${port}/api/admin/container-system/records`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({
        kind: "invoice",
        status: "posted",
        payload: {
          invoiceNumber: "TEST-INVOICE-DIRECT-POST-001",
          contractRecordId: contract.id,
          contractNumber,
          customerRecordId: customer.id,
          amount: 100,
          total: 100,
          date: "2026-08-10",
        },
      }),
    });
    assert.equal(bypassApproval.status, 422, "new financial records must not skip the approval lifecycle");
    assert.equal(
      (sqlite.prepare("SELECT COUNT(*) AS count FROM container_system_records WHERE kind = 'invoice'").get() as { count: number }).count,
      1,
      "a rejected direct posting must not leave an invoice record",
    );

    const lifecycleUrl = `http://127.0.0.1:${port}/api/admin/container-system/contracts/${contract.id}/lifecycle`;
    const blockedDelivery = await fetch(lifecycleUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({ action: "deliver", location: testLocation }),
    });
    assert.equal(blockedDelivery.status, 422, "an open linked delivery request must block container delivery");

    const requestStarted = await fetch(`http://127.0.0.1:${port}/api/service-requests/${request.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({ status: "in_progress" }),
    });
    assert.equal(requestStarted.status, 200, await requestStarted.clone().text());
    const requestCompleted = await fetch(`http://127.0.0.1:${port}/api/service-requests/${request.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({ status: "completed" }),
    });
    assert.equal(requestCompleted.status, 200, await requestCompleted.clone().text());

    const deliveryResponse = await fetch(lifecycleUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({ action: "deliver", location: testLocation }),
    });
    assert.equal(deliveryResponse.status, 201, await deliveryResponse.clone().text());
    const delivered = await deliveryResponse.json() as { contract: { status: string }; movement: { id: number } };
    assert.equal(delivered.contract.status, "delivered");
    assert.ok(delivered.movement.id > 0);
    const rentedContainer = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, container.id)).get();
    assert.equal(rentedContainer?.status, "rented");

    const returnResponse = await fetch(lifecycleUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({ action: "return", location: testLocation }),
    });
    assert.equal(returnResponse.status, 201, await returnResponse.clone().text());
    const returned = await returnResponse.json() as { contract: { status: string }; movement: { id: number } };
    assert.equal(returned.contract.status, "returned");
    assert.ok(returned.movement.id > delivered.movement.id);
    assert.equal(
      (sqlite.prepare("SELECT COUNT(*) AS count FROM container_system_records WHERE kind = 'container_movement' AND json_extract(payload, '$.contractRecordId') = ?")
        .get(contract.id) as { count: number }).count,
      2,
      "delivery and return must each leave one linked movement",
    );

    const missingInvoice = await settle("test-lifecycle-no-invoice-001", null);
    assert.equal(missingInvoice.status, 422, "contracts with invoices must not accept unlinked payments");
    const unpostedInvoice = await settle("test-lifecycle-unposted-invoice-001", invoice.id);
    assert.equal(unpostedInvoice.status, 422, "draft invoices must not accept payment allocations");
    assert.equal(
      (sqlite.prepare("SELECT COUNT(*) AS count FROM container_system_records WHERE kind = 'payment'").get() as { count: number }).count,
      0,
    );

    postToFinancialCore({
      sourceKind: "invoice",
      sourceId: invoice.id,
      reference: invoice.reference,
      amount: 100,
      date: "2026-08-10",
      createdBy: admin.id,
    });
    db.update(containerSystemRecordsTable)
      .set({ status: "posted" })
      .where(eq(containerSystemRecordsTable.id, invoice.id))
      .run();

    const period = sqlite.prepare("UPDATE financial_periods SET status = 'closed' WHERE period_key = '2026-08'");
    period.run();
    const closedPeriod = await settle("test-lifecycle-closed-001", invoice.id);
    assert.equal(closedPeriod.status, 422, "closed financial periods must reject a settlement");
    assert.equal(
      (sqlite.prepare("SELECT COUNT(*) AS count FROM container_system_records WHERE kind = 'payment'").get() as { count: number }).count,
      0,
      "a rejected financial posting must not leave a payment record",
    );

    sqlite.prepare("UPDATE financial_periods SET status = 'open' WHERE period_key = '2026-08'").run();
    const partialResponse = await settle("test-lifecycle-payment-001", invoice.id);
    assert.equal(partialResponse.status, 201);
    const partialBody = await partialResponse.json() as { payment: { id: number }; idempotent: boolean };
    assert.equal(partialBody.idempotent, false);
    assert.equal(
      (sqlite.prepare("SELECT COUNT(*) AS count FROM financial_transactions WHERE source_kind = 'payment' AND source_id = ?").get(partialBody.payment.id) as { count: number }).count,
      1,
    );
    const partialInvoice = db.select().from(containerSystemRecordsTable).where(eq(containerSystemRecordsTable.id, invoice.id)).get();
    assert.equal(partialInvoice?.status, "partially_paid");

    sqlite.prepare("UPDATE financial_periods SET status = 'closed' WHERE period_key = '2026-08'").run();
    const replayResponse = await settle("test-lifecycle-payment-001", invoice.id);
    assert.equal(replayResponse.status, 200, "an exact retry remains idempotent even after its period closes");
    assert.equal((await replayResponse.json() as { idempotent: boolean }).idempotent, true);

    sqlite.prepare("UPDATE financial_periods SET status = 'open' WHERE period_key = '2026-08'").run();
    const finalResponse = await settle("test-lifecycle-payment-002", invoice.id);
    assert.equal(finalResponse.status, 201);
    const settledInvoice = db.select().from(containerSystemRecordsTable).where(eq(containerSystemRecordsTable.id, invoice.id)).get();
    assert.equal(settledInvoice?.status, "paid");

    const closeResponse = await fetch(lifecycleUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization },
      body: JSON.stringify({ action: "close" }),
    });
    assert.equal(closeResponse.status, 201, "a returned contract can close after all linked invoices are paid");
    const closedContract = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, contract.id)).get();
    assert.equal(closedContract?.status, "closed");
    const releasedContainer = db.select().from(containerSystemRecordsTable)
      .where(eq(containerSystemRecordsTable.id, container.id)).get();
    assert.equal(releasedContainer?.status, "available");
    console.log("container lifecycle integration assertions passed using isolated TEST ONLY data and synthetic admin login");
  } finally {
    apiProcess.kill("SIGTERM");
    await new Promise<void>(resolve => {
      if (apiProcess.exitCode !== null) return resolve();
      apiProcess.once("exit", () => resolve());
      setTimeout(() => {
        if (apiProcess.exitCode === null) apiProcess.kill("SIGKILL");
        resolve();
      }, 10_000);
    });
  }
}

main().then(
  () => process.exit(0),
  error => {
    console.error(error);
    process.exit(1);
  },
);
