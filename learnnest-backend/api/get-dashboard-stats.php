<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Total Students
    $stmt = $pdo->query("SELECT COUNT(*) as total_students FROM students");
    $totalStudents = $stmt->fetchColumn();

    // Active Courses (Published)
    $stmt = $pdo->query("SELECT COUNT(*) as active_courses FROM courses WHERE status = 'Published'");
    $activeCourses = $stmt->fetchColumn();

    // Total Courses
    $stmt = $pdo->query("SELECT COUNT(*) as total_courses FROM courses");
    $totalCourses = $stmt->fetchColumn();

    echo json_encode([
        "success" => true,
        "stats" => [
            "total_students" => $totalStudents,
            "active_courses" => $activeCourses,
            "total_courses" => $totalCourses
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>