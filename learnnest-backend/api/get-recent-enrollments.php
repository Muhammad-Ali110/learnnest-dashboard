<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    $stmt = $pdo->query("
        SELECT 
            s.name as student_name,
            c.name as course_name,
            s.enrolled_on,
            TIMESTAMPDIFF(HOUR, s.enrolled_on, NOW()) as hours_ago
        FROM students s
        JOIN courses c ON s.course_id = c.id
        ORDER BY s.enrolled_on DESC
        LIMIT 3
    ");
    
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format time ago
    foreach ($enrollments as &$enrollment) {
        if ($enrollment['hours_ago'] < 24) {
            $enrollment['time_ago'] = $enrollment['hours_ago'] . " hours ago";
        } else {
            $days = floor($enrollment['hours_ago'] / 24);
            $enrollment['time_ago'] = $days . " days ago";
        }
    }
    
    echo json_encode([
        "success" => true,
        "enrollments" => $enrollments
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>