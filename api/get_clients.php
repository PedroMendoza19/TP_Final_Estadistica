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

$clients = [];

$sql = "SELECT 
  c.client_id,
  c.first_name,
  c.last_name,
  c.email,
  c.age,
  z.zone_id,
  z.zone_name
FROM clients AS c
INNER JOIN zones AS z ON c.zone_id = z.zone_id;";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $clients[] = $row;
    }
    http_response_code(200);
    echo json_encode([
        "status" => "ok",
        "data" => $clients
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "No clients found"
    ]);
}

$conn->close();
?>