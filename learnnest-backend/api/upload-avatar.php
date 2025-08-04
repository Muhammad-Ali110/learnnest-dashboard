<?php
// File: learnnest-backend/api/upload-avatar.php

header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Static user ID for now
    $userId = 1;

    // Check if file was uploaded
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("No file uploaded or upload error occurred.");
    }

    $file = $_FILES['avatar'];

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
    }

    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if ($file['size'] > $maxSize) {
        throw new Exception("File size too large. Maximum size is 5MB.");
    }

    // Create upload directory if it doesn't exist
    $uploadDir = '../../learnnest/assets/avatars/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception("Failed to create upload directory.");
        }
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safeName = 'user_' . $userId . '_' . time() . '.' . strtolower($extension);
    $targetPath = $uploadDir . $safeName;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to move uploaded file.");
    }

    // Update database with new avatar path
    $avatarPath = 'assets/avatars/' . $safeName;
    $stmt = $pdo->prepare("UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?");
    $success = $stmt->execute([$avatarPath, $userId]);

    if (!$success) {
        // If database update fails, remove the uploaded file
        unlink($targetPath);
        throw new Exception("Failed to update avatar in database.");
    }

    echo json_encode([
        "success" => true,
        "message" => "Avatar uploaded successfully.",
        "avatar_path" => $avatarPath
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>