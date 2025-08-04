<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once("../includes/db.php");

$searchQuery = isset($_GET['q']) ? trim($_GET['q']) : '';

try {
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            name, 
            description, 
            duration, 
            price,
            students, 
            status 
        FROM courses 
        WHERE name LIKE :query OR description LIKE :query
        ORDER BY id DESC
    ");
    
    $searchParam = "%$searchQuery%";
    $stmt->execute([':query' => $searchParam]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format price
    foreach ($courses as &$course) {
        $course['price'] = number_format((float)$course['price'], 2);
    }
    
    echo json_encode([
        "success" => true,
        "courses" => $courses,
        "count" => count($courses)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>