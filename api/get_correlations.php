<?php
require_once 'conn.php';

header("Access-Control-Allow-Methods: POST");
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

$sql = "SELECT * from sales";
$result = $conn->query($sql);
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


function calcPriceCount($sales) {
    $sumPrice = 0;
    $sumQuantity = 0;
    $count = count($sales);
    foreach ($sales as $row) {
        $sumPrice += $row["unit_price"];
        $sumQuantity += $row["quantity"];
    };
    $sumPriceAverage = round($sumPrice / $count,2);
    $sumQuantityAverage = round($sumQuantity / $count,2);

    $EPQ = 0;
    foreach ($sales as $row) {
        $EPQ += ($sales['unit_price']-$sumPriceAverage)*($sales['quantity']-$sumQuantityAverage);
    }
    $covPQ = round($EPQ / $count,2);

    
    //Variante de Precio por unidad
    $sumPowPrice = 0;
    foreach ($sales as $sale) {
        $sumPowPrice+= pow($sale['unit_price'] - $sumPriceAverage ,2);
    }
    
    //Variante de cantidad


    
}

?>