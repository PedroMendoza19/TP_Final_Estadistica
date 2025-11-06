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

$products = [];

$sql = "select p.product_id,p.name,c.category_name,p.unit_price,p.stock,p.description from products as p inner join categories as c on p.category_id = c.category_id;";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    http_response_code(200);
    echo json_encode([
        "status" => "ok",
        "data" => $products
    ]);
}else {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "No products found"
    ]);
}

$conn->close();
?>