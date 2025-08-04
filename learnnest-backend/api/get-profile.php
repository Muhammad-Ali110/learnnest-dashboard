<?php
// File: learnnest-backend/api/get-profile.php

header("Content-Type: application/json");
require_once("../includes/db.php");

try {
    // For now, we use static user ID 1 (later you can connect it with login system)
    $userId = 1;

    $stmt = $pdo->prepare("
        SELECT 
            id, 
            name, 
            email, 
            bio, 
            contact_number, 
            location, 
            linkedin, 
            github, 
            website, 
            avatar, 
            courses_created, 
            students_enrolled, 
            updated_at 
        FROM users 
        WHERE id = ?
    ");
    
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Format the avatar path if it exists
        if ($user['avatar'] && !filter_var($user['avatar'], FILTER_VALIDATE_URL)) {
            $user['avatar'] = '../learnnest/' . $user['avatar'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $user
        ]);
    } else {
        // Return empty profile structure instead of error
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $userId,
                'name' => '',
                'email' => '',
                'bio' => '',
                'contact_number' => '',
                'location' => '',
                'linkedin' => '',
                'github' => '',
                'website' => '',
                'avatar' => '../learnnest/assets/img/user-default.png',
                'courses_created' => 0,
                'students_enrolled' => 0,
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>