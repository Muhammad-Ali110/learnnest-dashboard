<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    $stmt = $pdo->query("
        SELECT 
            n.id,
            n.message,
            n.type,
            n.icon,
            n.link,
            n.created_at,
            TIMESTAMPDIFF(HOUR, n.created_at, NOW()) as hours_ago
        FROM notifications n
        WHERE n.is_read = 0
        ORDER BY n.created_at DESC
        LIMIT 10
    ");
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format time
    foreach ($notifications as &$notification) {
        if ($notification['hours_ago'] < 24) {
            $notification['time'] = $notification['hours_ago'] . " hours ago";
        } else {
            $days = floor($notification['hours_ago'] / 24);
            $notification['time'] = $days . " days ago";
        }
    }
    
    echo json_encode([
        "success" => true,
        "notifications" => $notifications
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>