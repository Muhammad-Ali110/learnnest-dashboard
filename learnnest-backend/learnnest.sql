-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 04, 2025 at 09:41 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learnnest`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `students` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `description`, `duration`, `students`, `status`, `price`, `updated_at`) VALUES
(1, 'MERN STACK', 'Web Development', '10 Hours', 10, 'Draft', 12.00, '2025-07-19 22:15:00'),
(12, 'Graphic Designing', 'This is a Graphic Designing Course.', '10', 100, 'Published', 12.00, NULL),
(13, 'Python Programming', 'Python code', '20', 20, 'Draft', 20.00, '2025-07-19 22:13:39'),
(15, 'Prompt Engineering', 'Prompting ', '2 hours', 10, 'Published', 5.00, '2025-07-19 22:13:20'),
(17, 'AI', 'Artificial Intelligence', '8', 28, 'Draft', 50.00, '2025-07-19 19:17:13'),
(18, 'AI/ML', 'Artificial Intelligence', '11', 20, 'Draft', 200.00, '2025-07-19 22:13:06'),
(20, 'AI/ML (2)', 'Machine Learning', '10', 10, 'Draft', 29.00, '2025-07-19 22:12:47'),
(21, 'IELTS', 'English Language', '20', 10, 'Published', 35.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `earnings`
--

CREATE TABLE `earnings` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `payment_method` enum('credit_card','paypal','bank_transfer','crypto') NOT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
  `invoice_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `earnings`
--

INSERT INTO `earnings` (`id`, `student_id`, `course_id`, `amount`, `transaction_date`, `payment_method`, `status`, `invoice_number`) VALUES
(1, 6, 17, 50.00, '2025-07-17 00:18:58', 'bank_transfer', 'completed', 'INV-1752693538-6'),
(2, 7, 15, 5.00, '2025-07-17 00:20:30', 'crypto', 'completed', 'INV-1752693630-7'),
(3, 8, 17, 50.00, '2025-07-18 22:30:42', 'crypto', 'completed', 'INV-1752859842-8'),
(4, 13, 15, 5.00, '2025-07-19 21:39:25', 'paypal', 'completed', 'INV-1752943165-13');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `course_id` int(10) UNSIGNED DEFAULT NULL,
  `enrolled_on` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `email`, `course_id`, `enrolled_on`) VALUES
(1, 'Muhammad Alee Mughal', 'muhammadalimughal905@gmail.com', 12, '2025-07-11 23:27:26'),
(5, 'Hussain Raza', 'abc123@gmail.com', 13, '2025-07-12 21:15:03'),
(6, 'Mudassir', 'mudassir123@gmail.com', 17, '2025-07-17 00:18:58'),
(7, 'Zafar Ali', 'zafarali123@gmail.com', 15, '2025-07-17 00:20:30'),
(8, 'M. Talha Bhatti', 'talha123@gmail.com', 18, '2025-07-18 22:30:42'),
(9, 'Syed Naveed Ali Shah', 'naveed123@gmail.com', 20, '2025-07-19 19:24:31'),
(11, 'Umm e Habiba', 'ummehabiba123@gmail.com', 1, '2025-07-19 20:20:17'),
(12, 'Abdul Wasay', 'arshad123@gmail.com', 21, '2025-07-19 21:10:19'),
(13, 'Hayan Haider', 'hayanmirza@gmail.com', 15, '2025-07-19 21:39:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `bio` text DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `courses_created` int(11) DEFAULT 0,
  `students_enrolled` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `bio`, `contact_number`, `location`, `linkedin`, `github`, `website`, `avatar`, `courses_created`, `students_enrolled`, `created_at`, `updated_at`) VALUES
(1, 'Muhammad Ali Mughal', 'muhammadalimughal905@gmail.com', 'I am a administrator at LearnNest', '0319-6619650', 'Hyderabad', '', '', '', 'assets/avatars/user_1_1753528806.jpg', 0, 0, '2025-07-25 16:40:57', '2025-07-26 16:22:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `earnings`
--
ALTER TABLE `earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `transaction_date` (`transaction_date`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `earnings`
--
ALTER TABLE `earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
