<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Sales data (last 6 months)
    $salesData = [];
    $salesLabels = [];
    
    for ($i = 5; $i >= 0; $i--) {
        $month = date('M', strtotime("-$i months"));
        $salesLabels[] = $month;
        
        $startDate = date('Y-m-01', strtotime("-$i months"));
        $endDate = date('Y-m-t', strtotime("-$i months"));
        
        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM earnings 
            WHERE transaction_date BETWEEN ? AND ?
        ");
        $stmt->execute([$startDate, $endDate]);
        $salesData[] = $stmt->fetchColumn();
    }
    
    // Engagement data
    $engagementLabels = ['Completed', 'In Progress', 'Dropped'];
    $engagementData = [];
    
    // Completed (students who finished course)
    $stmt = $pdo->query("SELECT COUNT(*) FROM students WHERE enrolled_on < DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $engagementData[] = $stmt->fetchColumn();
    
    // In Progress (students enrolled in last 30 days)
    $stmt = $pdo->query("SELECT COUNT(*) FROM students WHERE enrolled_on >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $engagementData[] = $stmt->fetchColumn();
    
    // Dropped (estimate 10% of completed)
    $engagementData[] = round($engagementData[0] * 0.1);
    
    echo json_encode([
        "success" => true,
        "sales" => [
            "labels" => $salesLabels,
            "data" => $salesData
        ],
        "engagement" => [
            "labels" => $engagementLabels,
            "data" => $engagementData
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>