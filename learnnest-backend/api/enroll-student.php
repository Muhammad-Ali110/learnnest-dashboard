<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get and validate input
$input = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    die(json_encode(["success" => false, "message" => "Invalid JSON input"]));
}

// Check required fields
$required = ['name', 'email', 'course_id', 'payment_method', 'amount'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        die(json_encode(["success" => false, "message" => "Missing required field: $field"]));
    }
}

try {
    $conn->begin_transaction();

    // 1. Add or find student
    $stmt = $conn->prepare("SELECT id FROM students WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $input['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $student = $result->fetch_assoc();
        $studentId = $student['id'];
        // Update existing student's course
        $stmt = $conn->prepare("UPDATE students SET course_id = ? WHERE id = ?");
        $stmt->bind_param("ii", $input['course_id'], $studentId);
        $stmt->execute();
    } else {
        // Create new student
        $stmt = $conn->prepare("INSERT INTO students (name, email, course_id) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $input['name'], $input['email'], $input['course_id']);
        $stmt->execute();
        $studentId = $conn->insert_id;
    }

    // 2. Record payment
    $invoice = 'INV-' . time() . '-' . $studentId;
    $stmt = $conn->prepare("INSERT INTO earnings (
        student_id, course_id, amount, 
        payment_method, status, invoice_number
    ) VALUES (?, ?, ?, ?, 'completed', ?)");
    $stmt->bind_param("iidss", $studentId, $input['course_id'], $input['amount'], 
        $input['payment_method'], $invoice);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Enrollment successful",
        "student_id" => $studentId,
        "invoice" => $invoice,
        "payment_id" => $conn->insert_id
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}