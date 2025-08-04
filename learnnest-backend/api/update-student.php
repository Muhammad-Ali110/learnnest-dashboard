<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

// Get raw POST data
$data = json_decode(file_get_contents('php://input'), true);

try {
    // Validate required fields
    $required = ['id', 'name', 'email', 'course_id'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Prepare and execute update
    $stmt = $conn->prepare("UPDATE students SET name = ?, email = ?, course_id = ? WHERE id = ?");
    $stmt->bind_param("ssii", $data['name'], $data['email'], $data['course_id'], $data['id']);
    
    if (!$stmt->execute()) {
        throw new Exception("Update failed: " . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Student updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>