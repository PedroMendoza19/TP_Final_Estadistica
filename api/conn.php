<?php
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "e_commercedb";
$port = 3306;

$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "error en conexion a db"]);
    exit();
} 

?>