<?php
// File: learnnest-backend/api/update-contact.php

header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Static user ID for now
    $userId = 1;

    // Get and validate input
    $field = trim($_POST['field'] ?? '');
    $value = trim($_POST['value'] ?? '');

    if (empty($field)) {
        throw new Exception("Field parameter is required.");
    }

    // Validate field type
    $allowedFields = ['phone', 'location'];
    if (!in_array($field, $allowedFields)) {
        throw new Exception("Invalid field type.");
    }

    // Map field names to database columns
    $fieldMap = [
        'phone' => 'contact_number',
        'location' => 'location'
    ];

    $dbField = $fieldMap[$field];

    // Validate phone number format if updating phone
    if ($field === 'phone' && !empty($value)) {
        // Basic phone validation - you can make this more strict
        if (!preg_match('/^[\+]?[\d\s\-\(\)]{10,20}$/', $value)) {
            throw new Exception("Please enter a valid phone number.");
        }
    }

    // Validate location length
    if ($field === 'location' && strlen($value) > 100) {
        throw new Exception("Location cannot exceed 100 characters.");
    }

    // Update the specific field
    $query = "UPDATE users SET {$dbField} = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $success = $stmt->execute([$value, $userId]);

    if ($success) {
        echo json_encode([
            "success" => true,
            "message" => ucfirst($field) . " updated successfully."
        ]);
    } else {
        throw new Exception("Failed to update " . $field . ".");
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>