<?php

require_once 'conn.php';

header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}

$input = file_get_contents('php://input');
$request = json_decode($input, true);
$requiredFields = ['origin_date', 'end_date'];

foreach ($requiredFields as $field) {
    if (empty($request[$field])) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Missing required field: $field"
        ]);
        exit(); 
    }
}

if ($request['origin_date'] == $request['end_date']) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Origin date and end date cannot be the same"
    ]);
    exit();
    
}

$sql = "SELECT s.sale_id, s.sale_date, s.total
        FROM sales s
        WHERE s.sale_date >= ? AND s.sale_date < ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $request['origin_date'], $request['end_date']);
$stmt->execute();
$result = $stmt->get_result();

$sales = [];

if ($result->num_rows <= 0) {
    http_response_code(404); 
    echo json_encode([
        "status" => "error",
        "message" => "Sales not found"
    ]);
    exit();
}

while ($row = $result->fetch_assoc()) {
    $sales[] = $row;
}

if (count($sales) === 1) {
    http_response_code(400); 
    echo json_encode([
        "status" => "error",
        "message" => "Only one sale on that period, standard deviation cannot be calculated"
    ]);
    exit();
}

$sum = 0;
foreach ($sales as $sale) {
    $sum += $sale['total'];
}

$average = $sum / count($sales);

$sqrSum = 0;
foreach ($sales as $sale) {
    $sqrSum += pow($sale['total'] - $average, 2);
}

$desviation = sqrt($sqrSum / (count($sales) - 1)); 

echo json_encode([
    'status' => 'success',
    'data' => $desviation
]);

?>