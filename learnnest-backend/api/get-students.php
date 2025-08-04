<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Read GET parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$course = isset($_GET['course']) ? trim($_GET['course']) : '';
$sortBy = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'enrolled_on';
$sortOrder = isset($_GET['sort_order']) && strtolower($_GET['sort_order']) === 'asc' ? 'ASC' : 'DESC';

// Whitelist sortable columns
$allowedSort = ['name', 'email', 'enrolled_on', 'course_name'];
if (!in_array($sortBy, $allowedSort)) {
    $sortBy = 'enrolled_on';
}

try {
    // Build WHERE clause
    $conditions = [];
    $params = [];
    $types = '';

    if ($search !== '') {
        $conditions[] = "(students.name LIKE ? OR students.email LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $types .= 'ss';
    }

    if ($course !== '') {
        $conditions[] = "courses.name = ?";
        $params[] = $course;
        $types .= 's';
    }

    $where = count($conditions) > 0 ? "WHERE " . implode(" AND ", $conditions) : "";

    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM students LEFT JOIN courses ON students.course_id = courses.id $where";
    $countStmt = $conn->prepare($countQuery);

    if ($params) {
        $countStmt->bind_param($types, ...$params);
    }

    $countStmt->execute();
    $totalRows = $countStmt->get_result()->fetch_assoc()['total'] ?? 0;
    $countStmt->close();

    // Main data query
    $sql = "SELECT 
        students.id,
        students.name,
        students.email,
        DATE_FORMAT(students.enrolled_on, '%Y-%m-%d') as enrolled_on,
        courses.name AS course_name
    FROM students
    LEFT JOIN courses ON students.course_id = courses.id
    $where
    ORDER BY $sortBy $sortOrder
    LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    if ($params) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $students = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Get all unique courses for the filter dropdown
    $coursesQuery = "SELECT DISTINCT name FROM courses WHERE name IS NOT NULL AND name != '' ORDER BY name";
    $coursesResult = $conn->query($coursesQuery);
    $allCourses = $coursesResult ? $coursesResult->fetch_all(MYSQLI_ASSOC) : [];

    // Return JSON response
    echo json_encode([
        "success" => true,
        "students" => $students,
        "total" => (int)$totalRows,
        "page" => $page,
        "limit" => $limit,
        "all_courses" => $allCourses
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}

$conn->close();
?>