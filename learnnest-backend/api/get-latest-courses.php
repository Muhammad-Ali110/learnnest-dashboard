<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    $stmt = $pdo->query("SELECT 
        id, 
        name, 
        description, 
        duration, 
        price,
        students, 
        status 
        FROM courses 
        LIMIT 3"); // Increased limit to 3 for better display
    
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format price with 2 decimal places
    foreach ($courses as &$course) {
        $course['price'] = number_format((float)$course['price'], 2);
    }
    
    echo json_encode([
        "success" => true,
        "courses" => $courses
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage(),
        "query" => $stmt->queryString // For debugging
    ]);
}
?>