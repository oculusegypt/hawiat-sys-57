<?php
declare(strict_types=1);

require __DIR__ . '/container-system.php';

function lifecycleExpectSame($expected, $actual, string $message): void {
    if ($expected !== $actual) {
        throw new RuntimeException($message . ': expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
}

function lifecycleExpectFailure(callable $callback, int $expectedCode, string $message): void {
    try {
        $callback();
    } catch (RuntimeException $error) {
        lifecycleExpectSame($expectedCode, (int)$error->getCode(), $message);
        return;
    }
    throw new RuntimeException($message . ': operation unexpectedly succeeded');
}

$pdo = new PDO('sqlite::memory:');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
hsPrepareServiceRequestsTable($pdo);
$serviceRequestColumns = array_column($pdo->query("PRAGMA table_info(service_requests)")->fetchAll(PDO::FETCH_ASSOC), 'name');
lifecycleExpectSame(true, in_array('assigned_vehicle_id', $serviceRequestColumns, true),
    'service request preparation must create the full current schema before migrations run');
lifecycleExpectSame(true, in_array('attribution_gclid', $serviceRequestColumns, true),
    'service request preparation must include attribution columns');
hsEnsureSchema($pdo);

$insertRecord = static function (string $kind, string $status, string $reference, array $payload) use ($pdo): int {
    $now = date('c');
    $stmt = $pdo->prepare("INSERT INTO container_system_records
        (kind, status, reference, payload, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, ?)");
    $stmt->execute([
        $kind, $status, $reference,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE),
        $now, $now,
    ]);
    return (int)$pdo->lastInsertId();
};

$containerId = $insertRecord('container_asset', 'available', 'TEST-ONLY-ASSET-1', [
    'assetCode' => 'TEST-ONLY-ASSET-1',
    'status' => 'available',
    'location' => 'TEST ONLY — warehouse',
]);
$contractId = $insertRecord('contract', 'active', 'TEST-ONLY-CONTRACT-1', [
    'contractNumber' => 'TEST-ONLY-CONTRACT-1',
    'containerRecordId' => $containerId,
    'containerCode' => 'TEST-ONLY-ASSET-1',
    'total' => 100,
    'location' => 'TEST ONLY — customer site',
]);
$pdo->prepare("INSERT INTO service_requests
    (client_name, phone, service_type, location, created_at, updated_at, status, container_record_id, contract_record_id, driver_status)
    VALUES ('TEST ONLY — lifecycle fixture', 'TEST ONLY', 'تسليم حاوية', 'TEST ONLY', ?, ?, 'pending', ?, ?, 'assigned')")
    ->execute([date('c'), date('c'), $containerId, $contractId]);
$requestId = (int)$pdo->lastInsertId();
$lineId = $insertRecord('contract_line', 'active', 'TEST-ONLY-LINE-1', [
    'contractRecordId' => $contractId,
    'status' => 'active',
]);
$assignmentId = $insertRecord('container_assignment', 'active', 'TEST-ONLY-ASSIGNMENT-1', [
    'contractRecordId' => $contractId,
    'assignmentStatus' => 'active',
]);
$manager = ['id' => 1, 'role' => 'manager'];

lifecycleExpectFailure(
    static fn() => hsUpdateContainerContractLifecycle($pdo, $contractId, 'deliver', '', 1, $manager),
    422,
    'an open delivery request must prevent contract delivery',
);
lifecycleExpectSame('active', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$contractId}")->fetchColumn(),
    'a blocked delivery must leave the contract unchanged');
lifecycleExpectSame(0, (int)$pdo->query("SELECT COUNT(*) FROM container_system_records WHERE kind = 'container_movement'")->fetchColumn(),
    'a blocked delivery must not create a movement');

$pdo->prepare("UPDATE service_requests SET status = 'completed', driver_status = 'completed' WHERE id = ?")->execute([$requestId]);
$delivery = hsUpdateContainerContractLifecycle($pdo, $contractId, 'deliver', 'TEST ONLY — delivery location', 1, $manager);
lifecycleExpectSame('delivered', (string)$delivery['contract']['status'], 'delivery must advance the contract');
lifecycleExpectSame('rented', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$containerId}")->fetchColumn(),
    'delivery must mark the asset as rented');
lifecycleExpectSame('deliver', (string)hsPayload($delivery['movement']['payload'])['movementType'], 'delivery must write its movement');

$return = hsUpdateContainerContractLifecycle($pdo, $contractId, 'return', '', 1, $manager);
lifecycleExpectSame('returned', (string)$return['contract']['status'], 'return must advance the contract');
lifecycleExpectSame('available', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$containerId}")->fetchColumn(),
    'return must make the asset available');

lifecycleExpectFailure(
    static fn() => hsUpdateContainerContractLifecycle($pdo, $contractId, 'close', '', 1, $manager),
    422,
    'a contract with an outstanding balance must not close',
);
$paymentId = $insertRecord('payment', 'posted', 'TEST-ONLY-PAYMENT-1', [
    'contractRecordId' => $contractId,
    'contractNumber' => 'TEST-ONLY-CONTRACT-1',
    'amount' => 100,
    'date' => date('Y-m-d'),
]);
$invoiceId = $insertRecord('invoice', 'draft', 'TEST-ONLY-INVOICE-1', [
    'contractRecordId' => $contractId,
    'contractNumber' => 'TEST-ONLY-CONTRACT-1',
    'total' => 100,
    'remaining' => 100,
]);
lifecycleExpectFailure(
    static fn() => hsUpdateContainerContractLifecycle($pdo, $contractId, 'close', '', 1, $manager),
    422,
    'an unposted invoice must prevent contract closure',
);
lifecycleExpectSame('returned', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$contractId}")->fetchColumn(),
    'a failed close must leave the returned contract unchanged');

$pdo->prepare("UPDATE container_system_records SET status = 'paid', payload = ? WHERE id = ?")->execute([
    json_encode([
        'contractRecordId' => $contractId,
        'contractNumber' => 'TEST-ONLY-CONTRACT-1',
        'total' => 100,
        'paid' => 100,
        'remaining' => 0,
    ], JSON_UNESCAPED_UNICODE),
    $invoiceId,
]);
lifecycleExpectFailure(
    static fn() => hsUpdateContainerContractLifecycle($pdo, $contractId, 'close', '', 1, $manager),
    422,
    'a paid invoice without a posted financial-core transaction must prevent closure',
);
$pdo->prepare("INSERT INTO financial_transactions
    (transaction_number, transaction_type, source_kind, source_id, reference, transaction_date, amount, currency, status)
    VALUES ('TEST-ONLY-INVOICE-POSTING-1', 'invoice', 'invoice', ?, 'TEST ONLY', ?, 100, 'SAR', 'posted')")
    ->execute([$invoiceId, date('Y-m-d')]);

$closed = hsUpdateContainerContractLifecycle($pdo, $contractId, 'close', '', 1, $manager);
lifecycleExpectSame('closed', (string)$closed['contract']['status'], 'a fully settled returned contract may close');
lifecycleExpectSame('closed', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$lineId}")->fetchColumn(),
    'closing the contract must close its linked contract lines');
lifecycleExpectSame('closed', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$assignmentId}")->fetchColumn(),
    'closing the contract must close its linked assignment');
lifecycleExpectSame('available', (string)$pdo->query("SELECT status FROM container_system_records WHERE id = {$containerId}")->fetchColumn(),
    'closing the contract must release its asset');
lifecycleExpectSame(2, (int)$pdo->query("SELECT COUNT(*) FROM container_system_records WHERE kind = 'container_movement'")->fetchColumn(),
    'delivery and return must each create one movement');

$approvalId = $insertRecord('contract', 'pending_approval', 'TEST-ONLY-CONTRACT-APPROVE', [
    'contractNumber' => 'TEST-ONLY-CONTRACT-APPROVE',
]);
$approved = hsUpdateContainerContractLifecycle($pdo, $approvalId, 'approve', '', 1, $manager);
lifecycleExpectSame('approved', (string)$approved['contract']['status'], 'a manager may approve an eligible contract');

$rejectionId = $insertRecord('contract', 'draft', 'TEST-ONLY-CONTRACT-REJECT', [
    'contractNumber' => 'TEST-ONLY-CONTRACT-REJECT',
]);
$rejected = hsUpdateContainerContractLifecycle($pdo, $rejectionId, 'reject', '', 1, $manager);
lifecycleExpectSame('rejected', (string)$rejected['contract']['status'], 'a manager may reject an eligible contract');

echo "PHP contract lifecycle assertions passed using an isolated in-memory database\n";
