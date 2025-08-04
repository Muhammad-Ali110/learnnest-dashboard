<?php
// File: learnnest-backend/api/create-user.php

header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Basic user data - you can modify these values
    $userData = [
        'name' => 'Admin User',
        'email' => 'admin@learnnest.com',
        'bio' => 'I am the administrator of LearnNest',
        'contact_number' => '+1234567890',
        'location' => 'New York, USA',
        'courses_created' => 0,
        'students_enrolled' => 0
    ];

    // Insert the user
    $stmt = $pdo->prepare("
        INSERT INTO users 
        (name, email, bio, contact_number, location, courses_created, students_enrolled, created_at, updated_at) 
        VALUES 
        (:name, :email, :bio, :contact_number, :location, :courses_created, :students_enrolled, NOW(), NOW())
    ");
    
    $stmt->execute($userData);
    $userId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'User created successfully',
        'user_id' => $userId
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>