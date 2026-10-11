<?php
declare(strict_types=1);

require __DIR__ . '/container-system.php';

function expectSame($expected, $actual, string $message): void {
    if ($expected !== $actual) {
        throw new RuntimeException($message . ': expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

$pdo = new PDO('sqlite::memory:');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$methods = [
    ['نقدي', 'CASH-001'],
    ['نقد', 'CASH-001'],
    ['cash', 'CASH-001'],
    ['cash payment', 'CASH-001'],
    ['تحويل بنكي', 'BANK-001'],
    ['تحويل', 'BANK-001'],
    ['شبكة', 'BANK-001'],
    ['مدى', 'BANK-001'],
    ['فيزا', 'BANK-001'],
    ['ماستركارد', 'BANK-001'],
    ['Visa', 'BANK-001'],
    ['Mastercard', 'BANK-001'],
    ['Master card', 'BANK-001'],
    ['بطاقة', 'BANK-001'],
    ['POS', 'BANK-001'],
];

foreach ($methods as $index => [$method, $expectedAccount]) {
    $sourceId = 100 + $index;
    $payload = ['amount' => 10, 'paymentMethod' => $method, 'date' => '2026-10-12'];
    hsPostFinancialCore($pdo, 'payment', $sourceId, $payload, 'PAY-TEST-' . $sourceId, 1);
    $debit = $pdo->query("SELECT jl.account_code FROM financial_transactions ft
        JOIN financial_journal_entries je ON je.transaction_id = ft.id
        JOIN financial_journal_lines jl ON jl.journal_entry_id = je.id
        WHERE ft.source_kind = 'payment' AND ft.source_id = {$sourceId} AND jl.debit > 0")->fetchColumn();
    expectSame($expectedAccount, $debit, "Payment method {$method} must debit its settlement account");

    $returnId = 500 + $index;
    hsPostFinancialCore($pdo, 'payment_return', $returnId, $payload, 'RETURN-TEST-' . $returnId, 1);
    $credit = $pdo->query("SELECT jl.account_code FROM financial_transactions ft
        JOIN financial_journal_entries je ON je.transaction_id = ft.id
        JOIN financial_journal_lines jl ON jl.journal_entry_id = je.id
        WHERE ft.source_kind = 'payment_return' AND ft.source_id = {$returnId} AND jl.credit > 0")->fetchColumn();
    expectSame($expectedAccount, $credit, "Payment return method {$method} must credit the original settlement account");
}

$unknownRejected = false;
try {
    hsPostFinancialCore($pdo, 'payment', 9001, [
        'amount' => 10,
        'paymentMethod' => 'DEMO — no real payment',
        'date' => '2026-10-12',
    ], 'PAY-UNKNOWN-9001', 1);
} catch (RuntimeException $error) {
    $unknownRejected = true;
}
expectSame(true, $unknownRejected, 'Unknown payment methods must be rejected');
expectSame(0, (int)$pdo->query("SELECT COUNT(*) FROM financial_transactions WHERE source_id = 9001")->fetchColumn(), 'Rejected methods must not leave a financial transaction');

hsPostFinancialCore($pdo, 'receipt', 9002, [
    'amount' => 10,
    'sourcePaymentId' => 1,
], 'RCV-LINKED-9002', 1);
expectSame(0, (int)$pdo->query("SELECT COUNT(*) FROM financial_transactions WHERE source_id = 9002")->fetchColumn(), 'A receipt linked to a payment must not create a duplicate posting');

expectSame('draft', hsInitialFinancialStatus(''), 'New financial records default to draft');
expectSame('draft', hsInitialFinancialStatus('draft'), 'Draft may be selected at creation');
expectSame('pending_approval', hsInitialFinancialStatus('pending_approval'), 'Pending approval may be selected at creation');
foreach (['approved', 'posted', 'rejected', 'cancelled', 'active'] as $invalidInitialStatus) {
    $statusRejected = false;
    try {
        hsInitialFinancialStatus($invalidInitialStatus);
    } catch (RuntimeException $error) {
        $statusRejected = true;
    }
    expectSame(true, $statusRejected, "Financial status {$invalidInitialStatus} must not be assigned at creation");
}

echo "PHP financial-method and initial-status assertions passed\n";
