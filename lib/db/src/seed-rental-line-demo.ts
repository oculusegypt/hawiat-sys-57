import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { packagesTable } from "./schema/packages.js";
import { containerSystemAuditTable, containerSystemRecordsTable } from "./schema/containerSystem.js";

const categoryName = (category: string) =>
  category === "debris" ? "حاويات الأنقاض ومخلفات البناء"
    : category === "waste" ? "حاويات النفايات والمكابس"
      : "عقود النظافة ورخص بلدي";

const parsePayload = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

const activeTypes = db.select().from(packagesTable).all().filter(type => type.isActive);
const records = db.select().from(containerSystemRecordsTable).all();
const now = new Date().toISOString();

for (const customer of records.filter(record => record.kind === "customer" && record.status !== "archived")) {
  const payload = parsePayload(customer.payload);
  const name = String(payload.name ?? payload.customerName ?? "");
  const identifiers = name === "شركة البناء المتين"
    ? { commercialRegistration: "1010123456", taxNumber: "310123456700003" }
    : name === "مؤسسة مدار للمقاولات"
      ? { commercialRegistration: "2050112233", taxNumber: "310987654300003" }
      : undefined;
  if (identifiers && (!payload.commercialRegistration || !payload.taxNumber)) {
    const nextPayload = { ...payload, ...identifiers };
    db.update(containerSystemRecordsTable)
      .set({ payload: JSON.stringify(nextPayload), updatedAt: now })
      .where(eq(containerSystemRecordsTable.id, customer.id))
      .run();
  }
}

let createdAssets = 0;
let createdLines = 0;

for (const type of activeTypes.filter(item => item.category === "waste")) {
  const isCompactor = type.name.includes("مكبس");
  const codePrefix = isCompactor ? "CMP" : "WST";
  for (let index = 0; index < 10; index += 1) {
    const assetCode = `${codePrefix}-${String(index + 1).padStart(3, "0")}`;
    const demoSeedKey = `waste-asset-${type.id}-${index + 1}`;
    const legacySeedKey = index === 0 ? `waste-asset-${type.id}` : "";
    const payload = {
      demoSeedKey,
      assetCode,
      typeName: type.name,
      containerTypeId: type.id,
      containerType: type.name,
      category: type.category,
      categoryName: categoryName(type.category),
      size: type.size,
      containerSize: type.size,
      capacity: type.capacity,
      pricePerDay: type.pricePerDay,
      dailyRate: type.pricePerDay,
      priceText: type.priceText,
      location: "مستودع الرياض",
      status: "available",
      lastInspection: now.slice(0, 10),
    };
    const existing = records.find(record => {
      if (!["container", "container_asset"].includes(record.kind)) return false;
      const recordPayload = parsePayload(record.payload);
      const seedKey = String(recordPayload.demoSeedKey ?? "");
      return seedKey === demoSeedKey || Boolean(legacySeedKey) && seedKey === legacySeedKey;
    });
    if (existing) {
      db.update(containerSystemRecordsTable)
        .set({
          status: "active",
          reference: assetCode,
          payload: JSON.stringify({ ...parsePayload(existing.payload), ...payload }),
          updatedAt: now,
        })
        .where(eq(containerSystemRecordsTable.id, existing.id))
        .run();
      continue;
    }
    const created = db.insert(containerSystemRecordsTable).values({
      kind: "container",
      status: "active",
      reference: assetCode,
      payload: JSON.stringify(payload),
    }).returning().get();
    db.insert(containerSystemAuditTable).values({
      recordId: created.id,
      kind: "container",
      action: "seed_demo",
      afterPayload: created.payload,
    }).run();
    createdAssets += 1;
  }
}

for (const type of activeTypes) {
  const unitPrice = type.category === "debris"
    ? Math.max(type.pricePerDay, 450)
    : type.category === "waste"
      ? (type.name.includes("مكبس") ? 850 : 550)
      : 3200;
  const serviceType = type.category === "debris"
    ? "توصيل ورفع حاوية أنقاض"
    : type.category === "waste"
      ? "تجميع ورفع حاوية نفايات"
      : "عقد نظافة وتشغيل حاويات";
  const payload = {
    demoSeedKey: `rental-line-${type.id}`,
    lineName: `${serviceType} — ${type.name}`,
    serviceType,
    billingFrequency: type.category === "contract" ? "monthly" : "per_trip",
    quantity: 1,
    unitPrice,
    amount: unitPrice,
    taxRate: 15,
    taxEnabled: false,
    taxAmount: 0,
    lineTotal: unitPrice,
    total: unitPrice,
    isTemplate: true,
    notes: type.category === "waste" ? "يتطلب السجل التجاري والرقم الضريبي للعميل عند إنشاء العقد." : "",
    containerTypeId: type.id,
    typeName: type.name,
    containerType: type.name,
    category: type.category,
    categoryName: categoryName(type.category),
    size: type.size,
    containerSize: type.size,
    capacity: type.capacity,
    pricePerDay: type.pricePerDay,
    dailyRate: type.pricePerDay,
    priceText: type.priceText,
  };
  const existing = records.find(record =>
    record.kind === "contract_line" &&
    String(parsePayload(record.payload).demoSeedKey ?? "") === payload.demoSeedKey,
  );
  if (existing) {
    db.update(containerSystemRecordsTable)
      .set({ status: "active", payload: JSON.stringify({ ...parsePayload(existing.payload), ...payload }), updatedAt: now })
      .where(eq(containerSystemRecordsTable.id, existing.id))
      .run();
    continue;
  }
  const created = db.insert(containerSystemRecordsTable).values({
    kind: "contract_line",
    status: "active",
    reference: `LINE-${String(type.id).padStart(3, "0")}`,
    payload: JSON.stringify(payload),
  }).returning().get();
  db.insert(containerSystemAuditTable).values({
    recordId: created.id,
    kind: "contract_line",
    action: "seed_demo",
    afterPayload: created.payload,
  }).run();
  createdLines += 1;
}

console.log(`✅ Added/updated waste assets and central rental-line demos. New assets: ${createdAssets}; new lines: ${createdLines}.`);