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

echo getAverage($conn);


function getAverage($conn) {
$sql = "SELECT
  s.sale_id,
  s.sale_date,
  c.first_name,
  c.last_name,
  p.name,
  s.quantity,
  s.unit_price,
  pay.payment_name,
  s.total
FROM sales s
INNER JOIN clients c     ON s.client_id   = c.client_id
INNER JOIN products p    ON s.product_id  = p.product_id
INNER JOIN payment_methods pay  ON s.payment_id  = pay.payment_id;";
$result = $conn->query($sql);
$count = 0;
$suma = 0;
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $suma+=floatval($row["total"]);
        $count++;
    }
    return $suma/$count;
} else {
    return -1;
}

}
?>