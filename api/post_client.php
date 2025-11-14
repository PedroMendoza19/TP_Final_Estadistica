<?php
require_once 'conn.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (
    json_last_error() !== JSON_ERROR_NONE ||
    empty($data->first_name) ||
    empty($data->last_name) ||
    empty($data->email) ||
    empty($data->age) ||
    empty($data->zone_id)
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid input or missing data. Required: first_name, last_name, email, age, zone_id."
    ]);
    exit();
}


$first_name = $data->first_name;
$last_name = $data->last_name;
$email = $data->email;
$age = $data->age;
$zone_id = $data->zone_id;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid email format."
    ]);
    exit();
}

$sql = "INSERT INTO clients (first_name, last_name, email, age, zone_id) VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt === false) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to prepare statement: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$stmt->bind_param("sssii", $first_name, $last_name, $email, $age, $zone_id);

if ($stmt->execute()) {
    $new_client_id = $stmt->insert_id;
    
    http_response_code(201);
    echo json_encode([
        "status" => "ok",
        "message" => "Client created successfully",
        "data" => [
            "client_id" => $new_client_id,
            "first_name" => $first_name,
            "last_name" => $last_name,
            "email" => $email,
            "age" => $age,
            "zone_id" => $zone_id
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to create client: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>