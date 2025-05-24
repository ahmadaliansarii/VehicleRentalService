-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2025 at 09:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tempprojectvrs`
--

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comments` text DEFAULT NULL,
  `feedback_date` date NOT NULL,
  `read_status` enum('Unread','Read') NOT NULL DEFAULT 'Unread'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `reservation_id` int(11) DEFAULT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('Pending','Confirmed') DEFAULT NULL,
  `message` text DEFAULT NULL,
  `reservation_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `refund_status` enum('','In Process') DEFAULT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_status` enum('Pending','Completed') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`history_id`, `reservation_id`, `vehicle_id`, `user_id`, `start_date`, `end_date`, `status`, `message`, `reservation_date`, `refund_status`, `payment_id`, `amount`, `payment_date`, `payment_status`) VALUES
(5, 12, 42, 2, '2025-05-03', '2025-05-10', 'Confirmed', '', '2025-04-30 10:06:43', '', 12, 4400.00, '2025-04-30', 'Completed'),
(7, 13, 45, 2, '2025-05-03', '2025-05-10', 'Confirmed', '', '2025-04-30 10:43:53', '', 13, 10800.00, '2025-04-30', 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `insurance`
--

CREATE TABLE `insurance` (
  `insurance_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `insurance_provider` varchar(255) NOT NULL,
  `coverage_details` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `claim_status` varchar(100) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_status` enum('Pending','Completed') NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `reservation_id`, `amount`, `payment_date`, `payment_status`) VALUES
(12, 12, 4400.00, '2025-04-30', 'Completed'),
(13, 13, 10800.00, '2025-04-30', 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `reservation`
--

CREATE TABLE `reservation` (
  `reservation_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Pending','Confirmed') NOT NULL DEFAULT 'Pending',
  `message` text DEFAULT NULL,
  `reservation_date` timestamp NULL DEFAULT current_timestamp(),
  `refund_status` enum('','In Process') DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation`
--

INSERT INTO `reservation` (`reservation_id`, `vehicle_id`, `user_id`, `start_date`, `end_date`, `status`, `message`, `reservation_date`, `refund_status`) VALUES
(12, 42, 2, '2025-05-03', '2025-05-10', 'Confirmed', '', '2025-04-30 10:04:05', ''),
(13, 45, 2, '2025-05-03', '2025-05-10', 'Confirmed', '', '2025-04-30 10:43:31', '');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `role` enum('Admin','Customer') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `LoggedIn` enum('Yes','No') NOT NULL DEFAULT 'No',
  `registration_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `role`, `first_name`, `last_name`, `email`, `phone_number`, `password`, `LoggedIn`, `registration_date`) VALUES
(1, 'Admin', 'A', 'B', 'A@abc.com', '123', '$2b$10$rdNZnJTAY1OJidMaYgUeeuspz4E.25y1fDHpsqZzUepup2.OYwFmq', 'Yes', '2025-04-19 19:37:49'),
(2, 'Customer', 'A', 'B', 'B@1234.com', '123', '$2b$10$IbbItcQ9bMWCYr5UvAh6DezQFsFaYCUgo3jfgtW2KvQj8.j5V.MDi', 'Yes', '2025-04-29 14:27:04');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle`
--

CREATE TABLE `vehicle` (
  `vehicle_id` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `year` year(4) NOT NULL,
  `capacity` int(11) NOT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `comfort_quality` varchar(50) DEFAULT NULL,
  `availability_status` tinyint(1) NOT NULL DEFAULT 1,
  `mileage` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle`
--

INSERT INTO `vehicle` (`vehicle_id`, `brand`, `model`, `year`, `capacity`, `price_per_day`, `comfort_quality`, `availability_status`, `mileage`) VALUES
(41, 'Toyota', 'Camry', '2022', 5, 650.00, '3', 1, 25000.00),
(42, 'Honda', 'Civic', '2023', 5, 550.00, '2', 0, 12000.00),
(43, 'Ford', 'F-150', '2021', 5, 850.00, '2', 0, 45000.00),
(44, 'BMW', '3 Series', '2023', 5, 1200.00, '4', 0, 9500.00),
(45, 'Mercedes-Benz', 'C-Class', '2022', 5, 1350.00, '5', 0, 15000.00),
(46, 'Toyota', 'RAV4', '2023', 5, 750.00, '3', 0, 11000.00),
(47, 'Honda', 'CR-V', '2022', 5, 720.00, '3', 0, 19500.00),
(48, 'Nissan', 'Altima', '2021', 5, 600.00, '2', 0, 33000.00),
(49, 'Hyundai', 'Elantra', '2023', 5, 500.00, '2', 1, 8000.00),
(50, 'Kia', 'Sorento', '2022', 7, 900.00, '3', 0, 22000.00),
(51, 'Subaru', 'Outback', '2023', 5, 800.00, '3', 1, 5000.00),
(52, 'Volkswagen', 'Jetta', '2021', 5, 580.00, '2', 0, 29000.00),
(53, 'Ford', 'Mustang', '2022', 4, 1100.00, '4', 1, 13000.00),
(54, 'Chevrolet', 'Silverado', '2022', 5, 950.00, '2', 0, 28000.00),
(55, 'Jeep', 'Wrangler', '2021', 4, 1000.00, '1', 1, 35000.00),
(56, 'Tesla', 'Model 3', '2023', 5, 1500.00, '4', 1, 6000.00),
(57, 'Toyota', 'Sienna', '2022', 8, 1050.00, '3', 0, 24000.00),
(58, 'Mazda', 'CX-5', '2022', 5, 700.00, '3', 0, 18000.00),
(59, 'Lexus', 'ES', '2023', 5, 1400.00, '5', 1, 7000.00),
(60, 'Kia', 'Rio', '2020', 5, 400.00, '1', 0, 65000.00);

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_maintenance`
--

CREATE TABLE `vehicle_maintenance` (
  `maintenance_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `service_date` date NOT NULL,
  `details` text NOT NULL,
  `cost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `fk_feedback_vehicle_idx` (`vehicle_id`),
  ADD KEY `fk_feedback_user_idx` (`user_id`),
  ADD KEY `idx_feedback_read_status` (`read_status`,`feedback_date`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`);

--
-- Indexes for table `insurance`
--
ALTER TABLE `insurance`
  ADD PRIMARY KEY (`insurance_id`),
  ADD KEY `fk_insurance_vehicle_idx` (`vehicle_id`),
  ADD KEY `idx_insurance_dates` (`start_date`,`end_date`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `reservation_id` (`reservation_id`);

--
-- Indexes for table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `fk_reservation_vehicle_idx` (`vehicle_id`),
  ADD KEY `fk_reservation_user_idx` (`user_id`),
  ADD KEY `idx_reservation_status` (`status`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_role` (`role`),
  ADD KEY `idx_user_email` (`email`);

--
-- Indexes for table `vehicle`
--
ALTER TABLE `vehicle`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD KEY `idx_vehicle_brand_model` (`brand`,`model`),
  ADD KEY `idx_vehicle_availability` (`availability_status`);

--
-- Indexes for table `vehicle_maintenance`
--
ALTER TABLE `vehicle_maintenance`
  ADD PRIMARY KEY (`maintenance_id`),
  ADD KEY `fk_maintenance_vehicle_idx` (`vehicle_id`),
  ADD KEY `idx_maintenance_service_date` (`service_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `insurance`
--
ALTER TABLE `insurance`
  MODIFY `insurance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `vehicle`
--
ALTER TABLE `vehicle`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `vehicle_maintenance`
--
ALTER TABLE `vehicle_maintenance`
  MODIFY `maintenance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feedback_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `insurance`
--
ALTER TABLE `insurance`
  ADD CONSTRAINT `fk_insurance_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reservation_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON UPDATE CASCADE;

--
-- Constraints for table `vehicle_maintenance`
--
ALTER TABLE `vehicle_maintenance`
  ADD CONSTRAINT `fk_maintenance_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
