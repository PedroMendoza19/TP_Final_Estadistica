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
    $row['unit_price'] = (float) $row['unit_price'];
    $row['quantity'] = (int) $row['quantity'];
    $row['total'] = (float) $row['total'];
    $row['payment_id'] = (int) $row['payment_id'];
    
    $row['day_of_week'] = (int) date('w', strtotime($row['sale_date']));
    
    $sales[] = $row;
}

function calculatePearson(array $data, string $keyX, string $keyY): ?float
{
    $n = count($data);
    if ($n === 0) {
        return null;
    }

    $sumX = 0;
    $sumY = 0;
    foreach ($data as $row) {
        $sumX += $row[$keyX];
        $sumY += $row[$keyY];
    }
    $meanX = $sumX / $n;
    $meanY = $sumY / $n;


    
    $sumCovariance = 0;  
    $sumSqDevX = 0;      
    $sumSqDevY = 0;     

    foreach ($data as $row) {
        $devX = $row[$keyX] - $meanX;
        $devY = $row[$keyY] - $meanY;
        
        $sumCovariance += $devX * $devY;
        $sumSqDevX += pow($devX, 2);
        $sumSqDevY += pow($devY, 2);
    }
    

    $stdDevX = sqrt($sumSqDevX / $n);
    $stdDevY = sqrt($sumSqDevY / $n);
    
    if ($stdDevX == 0 || $stdDevY == 0) {
        return 0.0; 
    }

    $covariance = $sumCovariance / $n;
    $correlation = $covariance / ($stdDevX * $stdDevY);

    return $correlation;
}

$corrPriceQuantity = calculatePearson($sales, 'unit_price', 'quantity');
$corrQuantityDay = calculatePearson($sales, 'quantity', 'day_of_week');
$corrTotalPayment = calculatePearson($sales, 'total', 'payment_id');


echo json_encode([
    'status' => 'success',
    'sales_count' => count($sales),
    'correlations' => [
        'price_vs_quantity' => $corrPriceQuantity,
        'quantity_vs_day_of_week' => $corrQuantityDay,
        'total_vs_payment_method' => $corrTotalPayment
    ]
]);

?>