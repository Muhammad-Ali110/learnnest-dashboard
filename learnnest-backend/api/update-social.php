<?php
// File: learnnest-backend/api/update-social.php

header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // Static user ID for now
    $userId = 1;

    // Get and validate input
    $platform = trim($_POST['platform'] ?? '');
    $url = trim($_POST['url'] ?? '');

    if (empty($platform)) {
        throw new Exception("Platform parameter is required.");
    }

    // Validate platform type
    $allowedPlatforms = ['linkedin', 'github', 'website'];
    if (!in_array($platform, $allowedPlatforms)) {
        throw new Exception("Invalid platform type.");
    }

    // Validate URL format if not empty
    if (!empty($url)) {
        // Add protocol if missing
        if (!preg_match('/^https?:\/\//', $url)) {
            $url = 'https://' . $url;
        }

        // Validate URL format
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new Exception("Please enter a valid URL.");
        }

        // Platform-specific validation
        switch ($platform) {
            case 'linkedin':
                if (!preg_match('/linkedin\.com/', $url)) {
                    throw new Exception("Please enter a valid LinkedIn URL.");
                }
                break;
            case 'github':
                if (!preg_match('/github\.com/', $url)) {
                    throw new Exception("Please enter a valid GitHub URL.");
                }
                break;
            case 'website':
                // Website can be any valid URL
                break;
        }

        // Limit URL length
        if (strlen($url) > 255) {
            throw new Exception("URL cannot exceed 255 characters.");
        }
    }

    // Update the specific social platform
    $query = "UPDATE users SET {$platform} = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $success = $stmt->execute([$url, $userId]);

    if ($success) {
        $message = empty($url) 
            ? ucfirst($platform) . " profile removed successfully."
            : ucfirst($platform) . " profile updated successfully.";
            
        echo json_encode([
            "success" => true,
            "message" => $message
        ]);
    } else {
        throw new Exception("Failed to update " . $platform . " profile.");
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>