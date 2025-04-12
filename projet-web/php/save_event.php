<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Validate input data
        if (empty($_POST['eventName']) || empty($_POST['eventDate']) || 
            empty($_POST['eventTime']) || empty($_POST['eventLocation'])) {
            throw new Exception('All required fields must be filled');
        }

        $stmt = $pdo->prepare("INSERT INTO events (name, date, time, location, description) VALUES (?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $_POST['eventName'],
            $_POST['eventDate'],
            $_POST['eventTime'],
            $_POST['eventLocation'],
            $_POST['eventDescription'] ?? ''
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Event saved successfully'
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
