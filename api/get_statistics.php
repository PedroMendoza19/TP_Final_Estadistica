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

echo getAverages($conn);


function getAverages($conn)
{
    $averages = [];
    $sql = "SELECT
  s.sale_id,
  s.sale_date,
  c.first_name,
  c.last_name,
  c.client_id,
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
    $result = mysqli_fetch_all($result, MYSQLI_ASSOC);

    if (count($result) <= 0) {
        return -1;
    }
    $averages["Average by day"] = averageByDay($result);
    $averages["Average by product"] = averageByProduct($result);
    $averages["Average by client"] = averageByClient($result);
    return json_encode(["status" => "ok", "data" => $averages]);
}

function averageByDay($result)
{
    $statsByDay = [];

    foreach ($result as $sale) {
        $sale_date = (new DateTime($sale["sale_date"]))->format("d m y");
        $day_total = floatval($sale["total"]);

        if (!isset($statsByDay[$sale_date])) {
            $statsByDay[$sale_date] = [
                'total' => $day_total,
                'count' => 1          
            ];
        } else {
            $statsByDay[$sale_date]['total'] += $day_total;
            $statsByDay[$sale_date]['count']++;
        }
    }
    
    $finalAverages = [];
    
    foreach ($statsByDay as $day => $stats) {
        if ($stats['count'] > 0) {
            $finalAverages[$day] = $stats['total'] / $stats['count'];
        }
    }
    
    return $finalAverages;
}

function averageByProduct($result)
{
    $statsByProduct = [];

    foreach ($result as $sale) {
        $product = $sale["name"]; 
        $day_total = floatval($sale["total"]);

        if (!isset($statsByProduct[$product])) {
            $statsByProduct[$product] = [
                'total' => $day_total,
                'count' => 1          
            ];
        } else {
            $statsByProduct[$product]['total'] += $day_total;
            $statsByProduct[$product]['count']++;
        }
    }
    
    $finalAverages = [];
    
    foreach ($statsByProduct as $product => $stats) {
        if ($stats['count'] > 0) {
            $finalAverages[$product] = $stats['total'] / $stats['count'];
        }
    }
    
    return $finalAverages;
}

function averageByClient($result)
{
    $statsByClient = [];

    foreach ($result as $sale) {
        $client = $sale["first_name"]." ".$sale["last_name"]; 
        $day_total = floatval($sale["total"]);

        if (!isset($statsByClient[$client])) {
            $statsByClient[$client] = [
                'total' => $day_total,
                'count' => 1          
            ];
        } else {
            $statsByClient[$client]['total'] += $day_total;
            $statsByClient[$client]['count']++;
        }
    }
    
    $finalAverages = [];
    
    foreach ($statsByClient as $client => $stats) {
        if ($stats['count'] > 0) {
            $finalAverages[$client] = $stats['total'] / $stats['count'];
        }
    }
    
    return $finalAverages;
}

?>