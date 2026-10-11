import assert from "node:assert/strict";
import { db, sqlite } from "./index.js";
import { containerSystemRecordsTable } from "./schema/containerSystem.js";
import { closeFinancialPeriod, financialTruth, postToFinancialCore, postToFinancialCoreInTransaction, reverseInFinancialCore } from "./financial-core.js";

const invoice = postToFinancialCore({
  sourceKind: "invoice", sourceId: 91001, reference: "INV-TEST-01", amount: 100,
  date: "2026-08-10", createdBy: 1,
});
assert.equal(invoice.idempotent, false);
const payment = postToFinancialCore({
  sourceKind: "payment", sourceId: 91002, reference: "PAY-TEST-01", amount: 100,
  date: "2026-08-11", operationKey: "test-payment-91002", createdBy: 1,
  paymentMethod: "نقدي", allocations: [{ contractId: 1, invoiceId: 91001, amount: 100 }],
});
assert.equal(payment.idempotent, false);
assert.equal(postToFinancialCore({
  sourceKind: "payment", sourceId: 91002, reference: "PAY-TEST-01", amount: 100,
  date: "2026-08-11", operationKey: "test-payment-91002", createdBy: 1,
}).idempotent, true);

const bankFee = postToFinancialCore({
  sourceKind: "bank_fee", sourceId: 91004, reference: "BANK-FEE-TEST-01", amount: 12,
  date: "2026-08-12", operationKey: "test-bank-fee-91004", createdBy: 1,
  paymentMethod: "بنكي",
});
assert.equal(bankFee.idempotent, false);
assert.equal(postToFinancialCore({
  sourceKind: "bank_fee", sourceId: 91004, reference: "BANK-FEE-TEST-01", amount: 12,
  date: "2026-08-12", operationKey: "test-bank-fee-91004", createdBy: 1,
}).idempotent, true);
const totalsAfterBankFee = financialTruth().totals as {
  bankFees: number; totalDebit: number; totalCredit: number;
};
assert.equal(Number(totalsAfterBankFee.bankFees), 12);
assert.ok(Math.abs(Number(totalsAfterBankFee.totalDebit) - Number(totalsAfterBankFee.totalCredit)) < 0.01);

const totalsBeforeReverse = financialTruth().totals as { totalDebit: number; totalCredit: number };
assert.ok(Math.abs(Number(totalsBeforeReverse.totalDebit) - Number(totalsBeforeReverse.totalCredit)) < 0.01);
assert.equal(reverseInFinancialCore({ sourceKind: "payment", sourceId: 91002, amount: 100 }, "اختبار العكس", 1)?.idempotent, false);
const totals = financialTruth().totals as { totalDebit: number; totalCredit: number };
assert.ok(Math.abs(Number(totals.totalDebit) - Number(totals.totalCredit)) < 0.01);

const atomicPosting = db.transaction(tx => {
  const paymentRecord = tx.insert(containerSystemRecordsTable).values({
    kind: "payment",
    status: "posted",
    reference: "PAY-TEST-ATOMIC-91005",
    payload: "{}",
  }).returning().get();
  const posted = postToFinancialCoreInTransaction({
    sourceKind: "payment", sourceId: paymentRecord.id, reference: paymentRecord.reference, amount: 25,
    date: "2026-08-15", operationKey: "test-payment-atomic-91005", createdBy: 1,
  });
  const retry = postToFinancialCoreInTransaction({
    sourceKind: "payment", sourceId: paymentRecord.id, reference: paymentRecord.reference, amount: 25,
    date: "2026-08-15", operationKey: "test-payment-atomic-91005", createdBy: 1,
  });
  return { paymentRecord, posted, retry };
});
assert.equal(atomicPosting.posted.idempotent, false);
assert.equal(atomicPosting.retry.idempotent, true);

closeFinancialPeriod("2026-08", 1);
assert.throws(() => postToFinancialCore({
  sourceKind: "expense", sourceId: 91003, amount: 10, date: "2026-08-20", createdBy: 1,
}), /مغلقة/);
assert.equal(postToFinancialCore({
  sourceKind: "payment",
  sourceId: atomicPosting.paymentRecord.id,
  reference: atomicPosting.paymentRecord.reference,
  amount: 25,
  date: "2026-08-15",
  operationKey: "test-payment-atomic-91005",
  createdBy: 1,
}).idempotent, true, "an exact retry should remain idempotent after the posting period closes");

let rolledBackPaymentId = 0;
assert.throws(() => db.transaction(tx => {
  const paymentRecord = tx.insert(containerSystemRecordsTable).values({
    kind: "payment",
    status: "posted",
    reference: "PAY-TEST-ROLLBACK-91006",
    payload: "{}",
  }).returning().get();
  rolledBackPaymentId = paymentRecord.id;
  postToFinancialCoreInTransaction({
    sourceKind: "payment",
    sourceId: paymentRecord.id,
    reference: paymentRecord.reference,
    amount: 10,
    date: "2026-08-20",
    operationKey: "test-payment-rollback-91006",
    createdBy: 1,
  });
}), /مغلقة/);
assert.equal(
  sqlite.prepare("SELECT id FROM container_system_records WHERE id = ?").get(rolledBackPaymentId),
  undefined,
  "a failed financial posting must roll back its operational payment record",
);
console.log("financial-core assertions passed");