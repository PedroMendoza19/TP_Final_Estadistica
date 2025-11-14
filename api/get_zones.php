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

$zones = [];
$sql = "SELECT zone_id, zone_name FROM zones";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $zones[] = $row;
    }
    http_response_code(200);
    echo json_encode([
        "status" => "ok",
        "data" => $zones
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "No zones found"
    ]);
}

$conn->close();
?>