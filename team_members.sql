-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 23, 2026 at 11:52 PM
-- Server version: 8.0.41
-- PHP Version: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nprfojqc_jenc`
--

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `bio` text,
  `image_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `name`, `role`, `bio`, `image_url`, `twitter_url`, `facebook_url`, `instagram_url`, `linkedin_url`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Benjamin Kimani', 'Director', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', '2026-04-28 09:16:50', '2026-04-28 09:16:50'),
(2, 'Paul Muteti', 'Deputy Director', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', '2026-04-28 09:16:50', '2026-04-28 09:16:50'),
(3, 'Naomi Mwihaki', 'Executive Secretary', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', '2026-04-28 09:16:50', '2026-04-28 09:16:50'),
(4, 'James Kiarie', 'Media Director', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', '2026-04-28 09:16:50', '2026-04-28 09:16:50'),
(5, 'Benjamin Kimani', 'Director', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'active', '2026-04-28 10:03:15', '2026-04-28 10:03:15'),
(6, 'Paul Muteti', 'Deputy Director', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'active', '2026-04-28 10:03:15', '2026-04-28 10:03:15'),
(7, 'Naomi Mwihaki', 'Executive Secretary', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'active', '2026-04-28 10:03:15', '2026-04-28 10:03:15'),
(8, 'James Kiarie', 'Media Director', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'active', '2026-04-28 10:03:15', '2026-04-28 10:03:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
