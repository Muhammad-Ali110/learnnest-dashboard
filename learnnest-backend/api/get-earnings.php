<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

// Get parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// Filter parameters
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$course_id = isset($_GET['course_id']) ? trim($_GET['course_id']) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : '';
$payment_method = isset($_GET['payment_method']) ? trim($_GET['payment_method']) : '';
$date_from = isset($_GET['date_from']) ? $_GET['date_from'] : '';
$date_to = isset($_GET['date_to']) ? $_GET['date_to'] : '';

// Sorting
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'transaction_date';
$sort_order = isset($_GET['sort_order']) && strtolower($_GET['sort_order']) === 'asc' ? 'ASC' : 'DESC';

// Whitelist sortable columns
$allowed_sort = ['transaction_date', 'amount', 'student_name', 'course_name'];
if (!in_array($sort_by, $allowed_sort)) {
    $sort_by = 'transaction_date';
}

// Build WHERE conditions
$conditions = [];
if ($search !== '') {
    $safe_search = $conn->real_escape_string($search);
    $conditions[] = "(students.name LIKE '%$safe_search%' OR courses.name LIKE '%$safe_search%')";
}
if ($course_id !== '') {
    $course_id = (int)$course_id;
    $conditions[] = "earnings.course_id = $course_id";
}
if ($status !== '') {
    $safe_status = $conn->real_escape_string($status);
    $conditions[] = "earnings.status = '$safe_status'";
}
if ($payment_method !== '') {
    $safe_method = $conn->real_escape_string($payment_method);
    $conditions[] = "earnings.payment_method = '$safe_method'";
}
if ($date_from !== '') {
    $conditions[] = "earnings.transaction_date >= '$date_from'";
}
if ($date_to !== '') {
    $conditions[] = "earnings.transaction_date <= '$date_to 23:59:59'";
}

$where = count($conditions) > 0 ? 'WHERE ' . implode(' AND ', $conditions) : '';

// Get total count
$count_query = "SELECT COUNT(*) as total FROM earnings
                LEFT JOIN students ON earnings.student_id = students.id
                LEFT JOIN courses ON earnings.course_id = courses.id
                $where";
$count_result = $conn->query($count_query);
$total_rows = $count_result ? $count_result->fetch_assoc()['total'] : 0;

// Main query
$query = "SELECT 
            earnings.id,
            earnings.amount,
            earnings.transaction_date,
            earnings.payment_method,
            earnings.status,
            earnings.invoice_number,
            students.name as student_name,
            students.email as student_email,
            courses.name as course_name
          FROM earnings
          LEFT JOIN students ON earnings.student_id = students.id
          LEFT JOIN courses ON earnings.course_id = courses.id
          $where
          ORDER BY $sort_by $sort_order
          LIMIT $limit OFFSET $offset";

$result = $conn->query($query);
$earnings = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $earnings[] = $row;
    }
}

// Get available filters
$filters = [
    'courses' => [],
    'statuses' => ['pending', 'completed', 'refunded', 'failed'],
    'payment_methods' => ['credit_card', 'paypal', 'bank_transfer', 'crypto']
];

$courses_query = "SELECT id, name FROM courses ORDER BY name";
$courses_result = $conn->query($courses_query);
if ($courses_result) {
    while ($row = $courses_result->fetch_assoc()) {
        $filters['courses'][] = $row;
    }
}

echo json_encode([
    'success' => true,
    'earnings' => $earnings,
    'total' => $total_rows,
    'page' => $page,
    'limit' => $limit,
    'filters' => $filters
]);
