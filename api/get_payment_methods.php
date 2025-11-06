<?php

require_once 'conn.php';

header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");


if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}

$payment_methods = [];

$sql = "SELECT payment_id,payment_name FROM payment_methods;";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $payment_methods[] = $row;
    }
    http_response_code(200);
    echo json_encode([
        "status" => "ok",
        "data" => $payment_methods
    ]);
}else {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "No payment methods found"
    ]);
}

$conn->close();
?>
