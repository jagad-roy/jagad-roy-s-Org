<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- Database Configuration (Change these with your Hostinger MySQL info) ---
$host = 'localhost';
$db   = 'u123456789_jb_healthcare';
$user = 'u123456789_admin';
$pass = 'your_mysql_password_here';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

// --- Simple API Router ---
switch ($path) {
    case 'doctors':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM doctors");
            echo json_encode($stmt->fetchAll());
        }
        break;
        
    case 'orders':
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO orders (item_name, amount, user_email) VALUES (?, ?, ?)");
            $stmt->execute([$data['item_name'], $data['amount'], $data['user_email']]);
            echo json_encode(['status' => 'success']);
        }
        break;

    default:
        echo json_encode(['status' => 'online', 'message' => 'JB Healthcare API is running on Hostinger']);
        break;
}
?>
