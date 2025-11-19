<?php
require_once 'conn.php';

header("Access-Control-Allow-Methods: POST,OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers:*");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}


$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON format"
    ]);
    exit();
}


$requiredFields = ['client_id', 'product_id', 'sale_quantity', 'unit_price', 'payment_id'];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Missing required field: $field"
        ]);
        exit();
    }
}

$client_id = intval($data['client_id']);
if ($client_id === 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Empty client_id"
    ]);
    exit();
}

$client_id = intval($data['client_id']);
$product_id = intval($data['product_id']);
$sale_quantity = intval($data['sale_quantity']);
$unit_price = floatval($data['unit_price']);
$payment_id = intval($data['payment_id']);
$sale_date = date('Y-m-d H:i:s');


$stmt = $conn->prepare("SELECT stock FROM products WHERE product_id = ?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Product not found"
    ]);
    exit();
}

$product = $result->fetch_assoc();

if ($product['stock'] < $sale_quantity) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Insufficient stock"
    ]);
    exit();
}

$stmt = $conn->prepare("
    INSERT INTO sales (client_id, product_id, quantity, unit_price, payment_id, sale_date)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("iiidss", $client_id, $product_id, $sale_quantity, $unit_price, $payment_id, $sale_date);

if ($stmt->execute()) {
    $newStock = $product['stock'] - $sale_quantity;
    $update = $conn->prepare("UPDATE products SET stock = ? WHERE product_id = ?");
    $update->bind_param("ii", $newStock, $product_id);
    $update->execute();

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Sale registered successfully",
        "data" => [
            "sale_id" => $conn->insert_id,
            "sale_date" => $sale_date,
            "product_id" => $product_id,
            "quantity" => $sale_quantity,
            "total" => $sale_quantity * $unit_price
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error saving sale"
    ]);
}
?>
