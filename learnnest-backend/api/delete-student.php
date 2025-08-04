<?php
header("Content-Type: application/json");
require_once("../includes/db.php");

// Accept GET request for deletion (or adjust if you prefer DELETE method)
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
  echo json_encode(["success" => false, "message" => "Invalid request method"]);
  exit;
}

// Read student ID from query string
$id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

if ($id <= 0) {
  echo json_encode(["success" => false, "message" => "Invalid student ID"]);
  exit;
}

$query = "DELETE FROM students WHERE id = $id";

if (mysqli_query($conn, $query)) {
  echo json_encode(["success" => true, "message" => "Student deleted successfully"]);
} else {
  echo json_encode(["success" => false, "message" => "Delete failed: " . mysqli_error($conn)]);
}
