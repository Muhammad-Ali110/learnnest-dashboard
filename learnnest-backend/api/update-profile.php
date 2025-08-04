<?php
// File: learnnest-backend/api/update-profile.php

header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Static user ID for now (replace with session-based auth later)
    $userId = 1;

    // Validate required fields
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    if ($name === '' || $email === '') {
        throw new Exception("Name and email are required.");
    }

    // Optional fields
    $bio            = trim($_POST['bio'] ?? '');
    $contact_number = trim($_POST['contact_number'] ?? '');
    $location       = trim($_POST['location'] ?? '');
    $linkedin       = trim($_POST['linkedin'] ?? '');
    $github         = trim($_POST['github'] ?? '');
    $website        = trim($_POST['website'] ?? '');

    // Handle avatar upload (optional)
    $avatarPath = null;
    if (!empty($_FILES['avatar']['tmp_name'])) {
        $uploadDir = '../../learnnest/assets/avatars/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $extension = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
        $safeName  = 'user_' . $userId . '_' . time() . '.' . strtolower($extension);
        $target    = $uploadDir . $safeName;

        if (move_uploaded_file($_FILES['avatar']['tmp_name'], $target)) {
            $avatarPath = 'assets/avatars/' . $safeName;
        } else {
            throw new Exception("Failed to upload avatar.");
        }
    }

    // Update query
    $query = "UPDATE users SET name = ?, email = ?, bio = ?, contact_number = ?, location = ?, linkedin = ?, github = ?, website = ?, updated_at = NOW()";
    $params = [$name, $email, $bio, $contact_number, $location, $linkedin, $github, $website];

    if ($avatarPath !== null) {
        $query .= ", avatar = ?";
        $params[] = $avatarPath;
    }

    $query .= " WHERE id = ?";
    $params[] = $userId;

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    echo json_encode(["success" => true, "message" => "Profile updated successfully."]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
