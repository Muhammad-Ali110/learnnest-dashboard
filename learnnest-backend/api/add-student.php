<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // 1. Get and validate input
    $input = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input");
    }

    // 2. Check required fields
    $required = ['name', 'email', 'course_id'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // 3. Sanitize and validate
    $name = trim($input['name']);
    $email = trim($input['email']);
    $course_id = (int)$input['course_id'];

    if (strlen($name) < 2) {
        throw new Exception("Name must be at least 2 characters");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    if ($course_id <= 0) {
        throw new Exception("Invalid course selection");
    }

    // 4. Check if course exists
    $stmt = $conn->prepare("SELECT id FROM courses WHERE id = ?");
    $stmt->bind_param("i", $course_id);
    $stmt->execute();
    if (!$stmt->get_result()->fetch_assoc()) {
        throw new Exception("Selected course does not exist");
    }
    $stmt->close();

    // 5. Insert student (using prepared statement)
    $stmt = $conn->prepare("INSERT INTO students (name, email, course_id) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $name, $email, $course_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Database error: " . $stmt->error);
    }

    // 6. Return success
    echo json_encode([
        "success" => true,
        "message" => "Student enrolled successfully",
        "student_id" => $conn->insert_id
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>