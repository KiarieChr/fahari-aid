-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 12, 2026 at 02:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jen`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_seo`
--

CREATE TABLE `about_seo` (
  `id` int(11) NOT NULL,
  `metatitle` varchar(200) NOT NULL,
  `metadescription` varchar(200) NOT NULL,
  `keywords` varchar(200) NOT NULL,
  `metatitlef` varchar(250) NOT NULL,
  `metadescriptionf` varchar(250) NOT NULL,
  `linkf` varchar(200) NOT NULL,
  `metatitlet` varchar(200) NOT NULL,
  `metadescriptiont` varchar(250) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `id` int(11) NOT NULL,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(150) NOT NULL,
  `account_type` enum('Asset','Liability','Equity','Revenue','Expense') NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `fund_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `normal_balance` enum('Debit','Credit') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `accounting_period`
--

CREATE TABLE `accounting_period` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `closed_by` int(11) DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `note` varchar(100) NOT NULL,
  `add_date` datetime NOT NULL DEFAULT current_timestamp(),
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `age_categories`
--

CREATE TABLE `age_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `min_age` int(11) NOT NULL DEFAULT 0,
  `max_age` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `application`
--

CREATE TABLE `application` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `phone` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `message` varchar(200) NOT NULL,
  `file` varchar(200) NOT NULL,
  `exp` varchar(200) NOT NULL,
  `post` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset`
--

CREATE TABLE `asset` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `assettype` varchar(100) NOT NULL,
  `valuation_date` date NOT NULL,
  `value_amount` text NOT NULL,
  `purchase_date` date NOT NULL,
  `purchase_price` text NOT NULL,
  `replace_value` text NOT NULL,
  `photo1` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assettype`
--

CREATE TABLE `assettype` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assimilation_followups`
--

CREATE TABLE `assimilation_followups` (
  `id` int(11) NOT NULL,
  `assimilation_id` int(11) NOT NULL,
  `logged_by` int(11) NOT NULL COMMENT 'users.id of person who made contact',
  `contact_type` enum('phone_call','sms_whatsapp','home_visit','coffee_meetup') NOT NULL,
  `reached` tinyint(1) DEFAULT 0 COMMENT '1=Successfully reached, 0=Not reached/attempted',
  `outcome_tags` text DEFAULT NULL COMMENT 'JSON array e.g. ["Prayed together","Invited to cell group"]',
  `next_steps` text DEFAULT NULL COMMENT 'JSON array e.g. ["Schedule another call","Connect to Cell Leader"]',
  `cell_leader_id` int(11) DEFAULT NULL COMMENT 'member.id if being assigned to a cell leader',
  `notes` text DEFAULT NULL,
  `logged_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int(11) NOT NULL,
  `action` enum('create','update','delete','post','reverse','close') NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batch`
--

CREATE TABLE `batch` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `member` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `note` varchar(100) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `amount` text NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` int(11) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `bill_number` varchar(100) NOT NULL,
  `bill_date` date NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `balance_due` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `gl_account_id` int(11) NOT NULL,
  `status` enum('unpaid','partially_paid','paid') DEFAULT 'unpaid',
  `event_id` int(11) DEFAULT NULL,
  `event_budget_item_id` int(11) DEFAULT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `recorded_by` int(11) NOT NULL,
  `recorded_on` datetime DEFAULT current_timestamp(),
  `delete_status` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bill_payments`
--

CREATE TABLE `bill_payments` (
  `id` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `recorded_by` int(11) NOT NULL,
  `recorded_on` datetime DEFAULT current_timestamp(),
  `delete_status` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `b_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `notes` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budget`
--

CREATE TABLE `budget` (
  `id` int(11) NOT NULL,
  `budget_name` varchar(100) NOT NULL,
  `budget_purpose` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `accounting_period_id` int(11) DEFAULT NULL,
  `fund_id` int(11) DEFAULT NULL,
  `reference_doc` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL DEFAULT 8,
  `update_by` int(11) NOT NULL DEFAULT 8,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budget_category`
--

CREATE TABLE `budget_category` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_on` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budget_details`
--

CREATE TABLE `budget_details` (
  `id` int(11) NOT NULL,
  `budget_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_on` timestamp NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  `updated_on` timestamp NULL DEFAULT NULL,
  `category` int(11) NOT NULL,
  `account_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendar`
--

CREATE TABLE `calendar` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `personnel` int(11) DEFAULT NULL,
  `facilitator` int(11) DEFAULT NULL,
  `calendar_label` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaign`
--

CREATE TABLE `campaign` (
  `id` int(11) NOT NULL,
  `cam_name` varchar(100) NOT NULL,
  `goal` decimal(10,0) NOT NULL,
  `sdate` datetime NOT NULL DEFAULT current_timestamp(),
  `edate` datetime NOT NULL DEFAULT current_timestamp(),
  `notes` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `career`
--

CREATE TABLE `career` (
  `id` int(11) NOT NULL,
  `heading` longtext NOT NULL,
  `location` longtext NOT NULL,
  `department` longtext NOT NULL,
  `description` longtext NOT NULL,
  `time` int(11) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cashflow_report`
--

CREATE TABLE `cashflow_report` (
  `id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `fromdate` date NOT NULL,
  `todate` date NOT NULL,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cells`
--

CREATE TABLE `cells` (
  `id` int(11) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'General',
  `meeting_day` varchar(20) DEFAULT NULL,
  `meeting_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `capacity` int(11) DEFAULT 15,
  `cell_leader` int(11) NOT NULL,
  `leader_in_training_id` int(11) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_attendance`
--

CREATE TABLE `cell_attendance` (
  `id` int(11) NOT NULL,
  `cell_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `meeting_date` date NOT NULL,
  `present` tinyint(1) DEFAULT 1,
  `recorded_by` int(11) DEFAULT NULL,
  `recorded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_dc_sessions`
--

CREATE TABLE `cell_dc_sessions` (
  `id` int(11) NOT NULL,
  `disciple_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `quiet_time_rating` int(11) DEFAULT NULL COMMENT '1 to 5 scale',
  `scripture_memory` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_disciples`
--

CREATE TABLE `cell_disciples` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `discipler_id` int(11) NOT NULL,
  `stage` enum('New Birth','Foundation','Character','Ministry','Multiplication') NOT NULL DEFAULT 'New Birth',
  `status` enum('active','graduated','paused') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_followup_tasks`
--

CREATE TABLE `cell_followup_tasks` (
  `id` int(11) NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `member_id` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `task_type` enum('first_timer','absentee','pastoral_care','other') NOT NULL,
  `description` text NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `completed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_reports`
--

CREATE TABLE `cell_reports` (
  `id` int(11) NOT NULL,
  `cell_id` int(11) NOT NULL,
  `meeting_id` int(11) DEFAULT NULL,
  `meeting_date` date NOT NULL,
  `meeting_type` varchar(50) DEFAULT 'Weekly Cell Meeting',
  `topic` varchar(150) DEFAULT NULL,
  `total_attendance` int(11) DEFAULT 0,
  `new_converts` int(11) DEFAULT 0,
  `holy_spirit_baptism` int(11) DEFAULT 0,
  `salvations` int(11) DEFAULT 0,
  `first_timer_followups_48h` int(11) DEFAULT 0,
  `absentee_followups` int(11) DEFAULT 0,
  `testimonies` text DEFAULT NULL,
  `prayer_requests` text DEFAULT NULL,
  `challenges_support_needed` text DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `published_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_report_attendance`
--

CREATE TABLE `cell_report_attendance` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `present` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_report_first_timers`
--

CREATE TABLE `cell_report_first_timers` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone_no` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `invited_by` int(11) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cell_report_pastoral_care`
--

CREATE TABLE `cell_report_pastoral_care` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `challenge_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` mediumint(8) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `state_id` mediumint(8) UNSIGNED NOT NULL,
  `state_code` varchar(255) NOT NULL,
  `country_id` mediumint(8) UNSIGNED NOT NULL,
  `country_code` char(2) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT '2014-01-01 12:01:01',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` tinyint(1) NOT NULL DEFAULT 1,
  `wikiDataId` varchar(255) DEFAULT NULL COMMENT 'Rapid API GeoDB Cities'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Table structure for table `collections`
--

CREATE TABLE `collections` (
  `id` int(11) NOT NULL,
  `payee` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `doc_reference` varchar(200) NOT NULL,
  `payment_mode` varchar(200) NOT NULL,
  `payment_for` varchar(200) NOT NULL,
  `cancelled` tinyint(4) NOT NULL,
  `recorded_on` datetime NOT NULL DEFAULT current_timestamp(),
  `reference` varchar(100) NOT NULL,
  `actual_date` datetime NOT NULL DEFAULT current_timestamp(),
  `collection_type` varchar(50) NOT NULL DEFAULT 'giving',
  `recorded_by` int(11) NOT NULL,
  `transaction_id` varchar(200) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `committed_members`
--

CREATE TABLE `committed_members` (
  `id` bigint(20) NOT NULL,
  `member_id` bigint(20) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `residence` varchar(150) DEFAULT NULL,
  `committed_on` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `communications`
--

CREATE TABLE `communications` (
  `id` int(11) NOT NULL,
  `communication` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contactus`
--

CREATE TABLE `contactus` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(300) NOT NULL,
  `contact` varchar(200) NOT NULL,
  `message` varchar(200) NOT NULL,
  `delete_status` tinyint(4) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_seo`
--

CREATE TABLE `contact_seo` (
  `id` int(11) NOT NULL,
  `metatitle` varchar(200) NOT NULL,
  `metadescription` varchar(200) NOT NULL,
  `keywords` varchar(200) NOT NULL,
  `metatitlef` varchar(250) NOT NULL,
  `metadescriptionf` varchar(250) NOT NULL,
  `linkf` varchar(200) NOT NULL,
  `metatitlet` varchar(200) NOT NULL,
  `metadescriptiont` varchar(250) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contribution`
--

CREATE TABLE `contribution` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `member` varchar(100) NOT NULL,
  `amount` int(11) NOT NULL,
  `batch` varchar(100) NOT NULL,
  `contritype` varchar(100) NOT NULL,
  `fund` varchar(100) NOT NULL,
  `paymentmethod` varchar(100) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `payment_id` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `delete_status` tinyint(4) NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contribution_details`
--

CREATE TABLE `contribution_details` (
  `contribution_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `batch` varchar(100) NOT NULL,
  `contritype` varchar(100) NOT NULL,
  `fund` varchar(100) NOT NULL,
  `paymentmethod` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contritype`
--

CREATE TABLE `contritype` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` mediumint(8) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `iso3` char(3) DEFAULT NULL,
  `numeric_code` char(3) DEFAULT NULL,
  `iso2` char(2) DEFAULT NULL,
  `phonecode` varchar(255) DEFAULT NULL,
  `capital` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `currency_name` varchar(255) DEFAULT NULL,
  `currency_symbol` varchar(255) DEFAULT NULL,
  `tld` varchar(255) DEFAULT NULL,
  `native` varchar(255) DEFAULT NULL,
  `region` varchar(255) DEFAULT NULL,
  `region_id` mediumint(8) UNSIGNED DEFAULT NULL,
  `subregion` varchar(255) DEFAULT NULL,
  `subregion_id` mediumint(8) UNSIGNED DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `timezones` text DEFAULT NULL,
  `translations` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `emoji` varchar(191) DEFAULT NULL,
  `emojiU` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` tinyint(1) NOT NULL DEFAULT 1,
  `wikiDataId` varchar(255) DEFAULT NULL COMMENT 'Rapid API GeoDB Cities'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `delete_status` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devotionals`
--

CREATE TABLE `devotionals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `devotional_date` date NOT NULL,
  `scripture_reference` varchar(255) DEFAULT NULL,
  `scripture_text` text DEFAULT NULL,
  `message` text NOT NULL,
  `kingdom_insight` text DEFAULT NULL,
  `prayer` text DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devotional_authors`
--

CREATE TABLE `devotional_authors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devotional_categories`
--

CREATE TABLE `devotional_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devotional_category_map`
--

CREATE TABLE `devotional_category_map` (
  `devotional_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donar`
--

CREATE TABLE `donar` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobileno` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emailsetting`
--

CREATE TABLE `emailsetting` (
  `id` int(11) NOT NULL,
  `smtp_server` varchar(255) NOT NULL,
  `smtp_username` varchar(255) NOT NULL,
  `smtp_password` varchar(255) NOT NULL,
  `stmp_port` varchar(255) NOT NULL,
  `smtp_type` varchar(255) NOT NULL,
  `email` varchar(300) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `id` int(11) NOT NULL,
  `ename` varchar(100) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `notes` longtext DEFAULT NULL,
  `delete_status` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `target_attendees` int(11) NOT NULL DEFAULT 100,
  `facilitation_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_budget` decimal(10,2) NOT NULL DEFAULT 0.00,
  `type` varchar(50) DEFAULT 'general',
  `image` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'published',
  `start_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_attendance`
--

CREATE TABLE `event_attendance` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `registration_id` int(11) NOT NULL,
  `check_in_time` datetime NOT NULL DEFAULT current_timestamp(),
  `check_in_method` enum('manual','qr') NOT NULL DEFAULT 'manual',
  `checked_in_by` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_budget`
--

CREATE TABLE `event_budget` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `budget_name` varchar(255) NOT NULL,
  `status` enum('draft','pending_approval','approved','rejected','closed') NOT NULL DEFAULT 'draft',
  `total_estimated` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_actual` decimal(15,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `budget_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_budget_audit`
--

CREATE TABLE `event_budget_audit` (
  `id` int(11) NOT NULL,
  `event_budget_id` int(11) NOT NULL,
  `action` enum('created','updated','submitted','approved','rejected','expense_recorded','expense_cancelled','receipt_uploaded','receipt_verified','closed') NOT NULL,
  `details` text DEFAULT NULL,
  `performed_by` int(11) NOT NULL,
  `performed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_budget_item`
--

CREATE TABLE `event_budget_item` (
  `id` int(11) NOT NULL,
  `event_budget_id` int(11) NOT NULL,
  `category` enum('venue','catering','transport','sound_av','printing','decoration','speaker_honorarium','marketing','accommodation','miscellaneous') NOT NULL DEFAULT 'miscellaneous',
  `description` varchar(500) NOT NULL,
  `estimated_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `actual_amount` decimal(15,2) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `receipt_ref` varchar(100) DEFAULT NULL,
  `receipt_ref_verified` tinyint(1) DEFAULT 0,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `gl_account_id` int(11) DEFAULT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `status` enum('planned','paid','cancelled') NOT NULL DEFAULT 'planned',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `budget_details_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_budget_receipt`
--

CREATE TABLE `event_budget_receipt` (
  `id` int(11) NOT NULL,
  `budget_item_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL DEFAULT 0,
  `ocr_text` text DEFAULT NULL,
  `ocr_receipt_number` varchar(100) DEFAULT NULL,
  `ocr_verified` tinyint(1) DEFAULT 0,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registration`
--

CREATE TABLE `event_registration` (
  `id` int(11) NOT NULL,
  `names` varchar(200) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `serve` tinyint(1) DEFAULT 0,
  `attendees` varchar(20) DEFAULT NULL,
  `phone_no` varchar(200) NOT NULL,
  `residence` varchar(200) NOT NULL,
  `category` varchar(200) NOT NULL,
  `travelling_from` varchar(200) NOT NULL,
  `prayer` longtext DEFAULT NULL,
  `special_needs` longtext DEFAULT NULL,
  `guardian_telno` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `event_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `sponsorship` varchar(100) DEFAULT NULL,
  `qr_token` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `registered_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registration_data`
--

CREATE TABLE `event_registration_data` (
  `id` int(11) NOT NULL,
  `registration_id` int(11) DEFAULT NULL,
  `field_id` int(11) DEFAULT NULL,
  `value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registration_fields`
--

CREATE TABLE `event_registration_fields` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `field_label` varchar(255) DEFAULT NULL,
  `field_type` enum('text','email','number','date','select','textarea') DEFAULT NULL,
  `field_options` text DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `field_order` int(11) DEFAULT 0,
  `field_class` varchar(100) DEFAULT NULL,
  `is_unique_identifier` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_schedule`
--

CREATE TABLE `event_schedule` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL DEFAULT 1,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `speaker` varchar(255) DEFAULT NULL,
  `session_type` enum('worship','teaching','prayer','break','meal','registration','panel','activity','announcement','other') NOT NULL DEFAULT 'other',
  `location` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `expensetype` varchar(100) NOT NULL,
  `amount` text NOT NULL,
  `date` datetime NOT NULL,
  `recurring` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `photo1` varchar(100) NOT NULL,
  `total_expense` int(11) NOT NULL,
  `delete_status` tinyint(4) NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `fund_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expensetype`
--

CREATE TABLE `expensetype` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL,
  `gl_account_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fasting_commitments`
--

CREATE TABLE `fasting_commitments` (
  `id` int(11) NOT NULL,
  `member_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `monday` tinyint(1) DEFAULT 0,
  `tuesday` tinyint(1) DEFAULT 0,
  `wednesday` tinyint(1) DEFAULT 0,
  `thursday` tinyint(1) DEFAULT 0,
  `friday` tinyint(1) DEFAULT 0,
  `saturday` tinyint(1) DEFAULT 0,
  `sunday` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_year`
--

CREATE TABLE `financial_year` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `starts` datetime DEFAULT NULL,
  `ends` datetime DEFAULT NULL,
  `closes` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `followups`
--

CREATE TABLE `followups` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `followup_type` enum('general','attendance','welfare','new_member') DEFAULT 'general',
  `sent_by` int(11) DEFAULT NULL,
  `sent_via_sms` tinyint(1) DEFAULT 0,
  `sent_via_email` tinyint(1) DEFAULT 0,
  `status` enum('pending','completed','no_response') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `sent_at` datetime DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `followup_category`
--

CREATE TABLE `followup_category` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `day` int(11) NOT NULL,
  `note` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follow_up`
--

CREATE TABLE `follow_up` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `member` varchar(100) NOT NULL,
  `user` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `description` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fund`
--

CREATE TABLE `fund` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `note` varchar(100) NOT NULL,
  `total` text NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hierarchy_levels`
--

CREATE TABLE `hierarchy_levels` (
  `id` int(11) NOT NULL,
  `level_order` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hierarchy_nodes`
--

CREATE TABLE `hierarchy_nodes` (
  `id` int(11) NOT NULL,
  `level_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `home_seo`
--

CREATE TABLE `home_seo` (
  `id` int(11) NOT NULL,
  `metatitle` varchar(200) NOT NULL,
  `metadescription` varchar(200) NOT NULL,
  `keywords` varchar(200) NOT NULL,
  `metatitlef` varchar(250) NOT NULL,
  `metadescriptionf` varchar(250) NOT NULL,
  `linkf` varchar(200) NOT NULL,
  `metatitlet` varchar(200) NOT NULL,
  `metadescriptiont` varchar(250) NOT NULL,
  `keywordst` varchar(200) NOT NULL,
  `conical` varchar(200) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `incometype` varchar(100) NOT NULL,
  `amount` text NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `description` varchar(100) NOT NULL,
  `photo1` varchar(100) NOT NULL,
  `total_income` int(11) NOT NULL,
  `delete_status` tinyint(4) NOT NULL,
  `journal_entry_id` int(11) DEFAULT NULL,
  `fund_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incometype`
--

CREATE TABLE `incometype` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL,
  `gl_account_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `instapayment`
--

CREATE TABLE `instapayment` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `amount` int(11) NOT NULL,
  `purpose` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invitees`
--

CREATE TABLE `invitees` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `contact` varchar(100) NOT NULL,
  `gender` tinyint(4) NOT NULL,
  `residence` varchar(100) NOT NULL,
  `invited_by` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified_on` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entry`
--

CREATE TABLE `journal_entry` (
  `id` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `reference_no` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `source_type` enum('income','expense','contribution','pledge','pledge_redeem','payroll','transfer','adjustment','opening_balance','event_expense') NOT NULL,
  `source_id` int(11) DEFAULT NULL,
  `accounting_period_id` int(11) DEFAULT NULL,
  `is_posted` tinyint(1) DEFAULT 1,
  `is_reversed` tinyint(1) DEFAULT 0,
  `reversed_by_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entry_line`
--

CREATE TABLE `journal_entry_line` (
  `id` int(11) NOT NULL,
  `journal_entry_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `fund_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL,
  `username` varchar(150) NOT NULL,
  `mobileno` varchar(150) NOT NULL,
  `role` varchar(100) NOT NULL,
  `image` varchar(150) NOT NULL,
  `otp` varchar(100) NOT NULL,
  `random` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manage_web`
--

CREATE TABLE `manage_web` (
  `id` int(11) NOT NULL,
  `photo1` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `photos` varchar(255) NOT NULL,
  `sitekey` varchar(255) NOT NULL,
  `secretkey` varchar(255) NOT NULL,
  `contact` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `address` varchar(200) NOT NULL,
  `instance` varchar(100) NOT NULL,
  `access_token` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext NOT NULL,
  `type` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `material_type`
--

CREATE TABLE `material_type` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting`
--

CREATE TABLE `meeting` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `facilitator` int(11) NOT NULL,
  `meeting_link` varchar(200) DEFAULT NULL,
  `meeting_type` int(11) DEFAULT 1,
  `description` longtext DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `meeting_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_minutes`
--

CREATE TABLE `meeting_minutes` (
  `id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `minutes` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `personnel` int(11) NOT NULL,
  `update_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_types`
--

CREATE TABLE `meeting_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `id` int(11) NOT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `cell_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `marital` varchar(100) DEFAULT NULL,
  `emp_status` varchar(200) DEFAULT NULL,
  `phone_no` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `bod` date DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `photo` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `photo1` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `country_code` varchar(100) DEFAULT NULL,
  `testfield` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `study_level` varchar(100) DEFAULT NULL,
  `delete_status` varchar(100) DEFAULT 'Active',
  `department_id` int(11) DEFAULT NULL,
  `sub_ministerial` int(11) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `joined_on` datetime DEFAULT current_timestamp(),
  `branch_id` varchar(100) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mpesa_stk_requests`
--

CREATE TABLE `mpesa_stk_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `checkout_request_id` varchar(100) NOT NULL,
  `merchant_request_id` varchar(100) DEFAULT NULL,
  `pledge_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `result_code` int(11) DEFAULT NULL,
  `mpesa_code` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `new_member_assimilation`
--

CREATE TABLE `new_member_assimilation` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `decision_type` enum('raised_hand','connection_card','personal_invite','online_form','salvation_decision','other') DEFAULT 'connection_card',
  `assimilation_status` enum('uncontacted','attempted','contacted','cell_assigned') DEFAULT 'uncontacted',
  `assigned_to` int(11) DEFAULT NULL COMMENT 'users.id of assigned follow-up person',
  `assigned_role_id` int(11) DEFAULT NULL COMMENT 'roles.id of the assigned role (configurable)',
  `assigned_on` datetime DEFAULT NULL,
  `first_contact_at` datetime DEFAULT NULL COMMENT 'When status first became contacted',
  `cell_assigned_at` datetime DEFAULT NULL,
  `sla_breached` tinyint(1) DEFAULT 0 COMMENT '1 if 48hr SLA was not met',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `type` enum('info','warning','danger','success') DEFAULT 'info',
  `role_based` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization_settings`
--

CREATE TABLE `organization_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `org_name` varchar(255) DEFAULT NULL,
  `head_office` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'KES',
  `church_type` varchar(50) DEFAULT 'Interdenominational',
  `denomination_name` varchar(255) DEFAULT NULL,
  `denomination_desc` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `token` longtext NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pastoral_care`
--

CREATE TABLE `pastoral_care` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `member_id` int(11) NOT NULL,
  `branch_id` varchar(50) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `opened_on` date NOT NULL,
  `status` varchar(20) DEFAULT 'open',
  `confidential` tinyint(1) DEFAULT 0,
  `summary` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` int(11) NOT NULL,
  `member` varchar(100) NOT NULL,
  `amount` int(11) NOT NULL,
  `date` date NOT NULL,
  `paymentmethod` varchar(100) NOT NULL,
  `notes` varchar(100) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymentmethod`
--

CREATE TABLE `paymentmethod` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_account_map`
--

CREATE TABLE `payment_account_map` (
  `id` int(11) NOT NULL,
  `payment_method_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `payroll_date` datetime NOT NULL DEFAULT current_timestamp(),
  `extra_time` text NOT NULL,
  `Timein_late` text NOT NULL,
  `total_pay` int(11) NOT NULL,
  `total_deduction` int(11) NOT NULL,
  `net_pay` int(11) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `acc_no` varchar(100) NOT NULL,
  `decription` varchar(100) NOT NULL,
  `paid_amount` int(11) NOT NULL,
  `comment` varchar(100) NOT NULL,
  `recurring` tinyint(4) NOT NULL,
  `recur_frequency` int(11) NOT NULL,
  `recur_type` varchar(100) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total_payroll` int(11) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_item`
--

CREATE TABLE `payroll_item` (
  `id` int(11) NOT NULL,
  `payroll_run_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `employee_name` varchar(150) NOT NULL,
  `basic_salary` decimal(15,2) DEFAULT 0.00,
  `allowances` decimal(15,2) DEFAULT 0.00,
  `deductions` decimal(15,2) DEFAULT 0.00,
  `net_pay` decimal(15,2) DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_run`
--

CREATE TABLE `payroll_run` (
  `id` int(11) NOT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('draft','approved','paid') DEFAULT 'draft',
  `total_gross` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) DEFAULT 0.00,
  `total_net` decimal(15,2) DEFAULT 0.00,
  `journal_entry_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `operation` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission_category`
--

CREATE TABLE `permission_category` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pledges`
--

CREATE TABLE `pledges` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `purpose` varchar(100) DEFAULT NULL,
  `member` varchar(100) DEFAULT NULL,
  `pledges_amount` decimal(10,2) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `recurring` tinyint(1) DEFAULT 0,
  `notes` varchar(100) DEFAULT NULL,
  `phone_no` varchar(20) DEFAULT NULL,
  `total_pledges` decimal(10,2) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `member_id` int(11) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `pledge_type` varchar(40) DEFAULT NULL,
  `attendees_sponsored` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pledges_redeem`
--

CREATE TABLE `pledges_redeem` (
  `id` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `mpesa_code` varchar(10) NOT NULL,
  `pledge_id` int(11) NOT NULL,
  `phone_no` varchar(10) NOT NULL,
  `redeemed_amount` decimal(10,2) NOT NULL,
  `recorded_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_by` int(11) NOT NULL DEFAULT 8,
  `journal_entry_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pledge_verifications`
--

CREATE TABLE `pledge_verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `search_term` varchar(255) DEFAULT NULL,
  `token` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prophecies`
--

CREATE TABLE `prophecies` (
  `id` int(11) NOT NULL,
  `purpose` int(11) NOT NULL,
  `prophecy` longtext NOT NULL,
  `dates` date DEFAULT NULL,
  `status` varchar(100) DEFAULT 'Not Fulfilled',
  `title` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prophecy_purpose`
--

CREATE TABLE `prophecy_purpose` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `revoked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `id` mediumint(8) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `translations` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` tinyint(1) NOT NULL DEFAULT 1,
  `wikiDataId` varchar(255) DEFAULT NULL COMMENT 'Rapid API GeoDB Cities'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `registration_fee`
--

CREATE TABLE `registration_fee` (
  `id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `transaction_id` varchar(50) NOT NULL,
  `registration_id` int(11) NOT NULL,
  `phone_no` varchar(12) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `recorded_on` timestamp NULL DEFAULT current_timestamp(),
  `recorded_by` int(11) DEFAULT NULL,
  `actual_date` timestamp NULL DEFAULT current_timestamp(),
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reset_logs`
--

CREATE TABLE `reset_logs` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `ip_address` varchar(100) NOT NULL,
  `user_agent` text NOT NULL,
  `request_time` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `delete_status` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `send_email`
--

CREATE TABLE `send_email` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `to_member` varchar(100) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `message` varchar(100) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service`
--

CREATE TABLE `service` (
  `id` int(11) NOT NULL,
  `heading` varchar(200) NOT NULL,
  `photo` varchar(200) NOT NULL,
  `short_content` varchar(200) NOT NULL,
  `content` longtext DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `amount` varchar(200) NOT NULL,
  `metatitle` varchar(200) NOT NULL,
  `metadescription` varchar(200) NOT NULL,
  `keywords` varchar(200) NOT NULL,
  `robots` varchar(200) NOT NULL,
  `photo1` varchar(200) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_seo`
--

CREATE TABLE `service_seo` (
  `id` int(11) NOT NULL,
  `metatitle` varchar(200) NOT NULL,
  `metadescription` varchar(200) NOT NULL,
  `keywords` varchar(200) NOT NULL,
  `metatitlef` varchar(250) NOT NULL,
  `metadescriptionf` varchar(250) NOT NULL,
  `linkf` varchar(200) NOT NULL,
  `metatitlet` varchar(200) NOT NULL,
  `metadescriptiont` varchar(250) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `slider`
--

CREATE TABLE `slider` (
  `id` int(11) NOT NULL,
  `photo` varchar(300) NOT NULL,
  `heading` varchar(300) NOT NULL,
  `heading1` varchar(200) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_gateway`
--

CREATE TABLE `sms_gateway` (
  `id` int(11) NOT NULL,
  `fromname` varchar(100) NOT NULL,
  `toname` varchar(100) NOT NULL,
  `message` varchar(100) NOT NULL,
  `url` varchar(100) NOT NULL,
  `note` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_gateway1`
--

CREATE TABLE `sms_gateway1` (
  `id` int(11) NOT NULL,
  `phone` text NOT NULL,
  `message` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `solutions_seo`
--

CREATE TABLE `solutions_seo` (
  `id` int(11) NOT NULL,
  `metatitle` varchar(200) NOT NULL,
  `metadescription` varchar(200) NOT NULL,
  `keywords` varchar(200) NOT NULL,
  `metatitlef` varchar(250) NOT NULL,
  `metadescriptionf` varchar(250) NOT NULL,
  `linkf` varchar(200) NOT NULL,
  `metatitlet` varchar(200) NOT NULL,
  `metadescriptiont` varchar(250) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `soul_winning`
--

CREATE TABLE `soul_winning` (
  `id` int(11) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` varchar(100) NOT NULL,
  `marital` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `phone_no` text NOT NULL,
  `email` varchar(100) NOT NULL,
  `bod` date NOT NULL,
  `address` varchar(100) NOT NULL,
  `photo` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `photo1` varchar(100) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` mediumint(8) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `country_id` mediumint(8) UNSIGNED NOT NULL,
  `country_code` char(2) NOT NULL,
  `fips_code` varchar(255) DEFAULT NULL,
  `iso2` varchar(255) DEFAULT NULL,
  `type` varchar(191) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` tinyint(1) NOT NULL DEFAULT 1,
  `wikiDataId` varchar(255) DEFAULT NULL COMMENT 'Rapid API GeoDB Cities'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Table structure for table `subregions`
--

CREATE TABLE `subregions` (
  `id` mediumint(8) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `translations` text DEFAULT NULL,
  `region_id` mediumint(8) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `flag` tinyint(1) NOT NULL DEFAULT 1,
  `wikiDataId` varchar(255) DEFAULT NULL COMMENT 'Rapid API GeoDB Cities'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_departments`
--

CREATE TABLE `sub_departments` (
  `id` int(11) NOT NULL,
  `department` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `db_name` varchar(255) NOT NULL,
  `db_user` varchar(255) DEFAULT 'root',
  `db_pass` varchar(255) DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','suspended') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `totals`
--

CREATE TABLE `totals` (
  `id` int(11) NOT NULL,
  `total_contri` int(11) NOT NULL,
  `delete_status` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_assignment_submissions`
--

CREATE TABLE `trn_assignment_submissions` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `media_url` varchar(500) DEFAULT NULL,
  `status` enum('pending_review','evaluated','needs_resubmission') DEFAULT 'pending_review',
  `submitted_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_coaches`
--

CREATE TABLE `trn_coaches` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `track_id` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_coach_evaluations`
--

CREATE TABLE `trn_coach_evaluations` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `coach_id` int(11) NOT NULL,
  `total_score` int(11) DEFAULT NULL,
  `rubric_scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubric_scores_json`)),
  `feedback_text` text DEFAULT NULL,
  `evaluated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_learning_modules`
--

CREATE TABLE `trn_learning_modules` (
  `id` int(11) NOT NULL,
  `track_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `sequence_no` int(11) NOT NULL,
  `content_type` enum('video','pdf','audio') DEFAULT 'video',
  `media_url` varchar(500) DEFAULT NULL,
  `drip_days` int(11) DEFAULT 0,
  `requires_practical` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_learning_tracks`
--

CREATE TABLE `trn_learning_tracks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `badge_icon` varchar(100) DEFAULT 'bx bx-book',
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_mentors`
--

CREATE TABLE `trn_mentors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `max_mentees` int(11) DEFAULT 3,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_mentorship_assignments`
--

CREATE TABLE `trn_mentorship_assignments` (
  `id` int(11) NOT NULL,
  `mentor_id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `status` enum('pending','active','graduated') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_mentorship_sessions`
--

CREATE TABLE `trn_mentorship_sessions` (
  `id` int(11) NOT NULL,
  `mentor_id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `session_date` date NOT NULL,
  `duration_mins` int(11) DEFAULT 60,
  `session_type` enum('in-person','call','video') DEFAULT 'in-person',
  `key_points` text DEFAULT NULL,
  `prayer_requests` text DEFAULT NULL,
  `action_items` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_module_progress`
--

CREATE TABLE `trn_module_progress` (
  `id` int(11) NOT NULL,
  `enrollment_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `status` enum('locked','unlocked','completed') DEFAULT 'locked',
  `unlocked_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_module_reflections`
--

CREATE TABLE `trn_module_reflections` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `mentor_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `reflection_text` text NOT NULL,
  `mentor_response` text DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_practical_assignments`
--

CREATE TABLE `trn_practical_assignments` (
  `id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `rubric_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubric_json`)),
  `requires_live_eval` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_shared_journals`
--

CREATE TABLE `trn_shared_journals` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `mentor_id` int(11) NOT NULL,
  `entry_text` text NOT NULL,
  `author_type` enum('trainee','mentor') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trn_track_enrollments`
--

CREATE TABLE `trn_track_enrollments` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `track_id` int(11) NOT NULL,
  `coach_id` int(11) DEFAULT NULL,
  `progress_pct` int(11) DEFAULT 0,
  `status` enum('active','completed','dropped') DEFAULT 'active',
  `enrolled_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `update_date` datetime NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) DEFAULT 1,
  `bio` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_timeline`
--

CREATE TABLE `user_timeline` (
  `id` int(11) NOT NULL,
  `detail` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `title` varchar(50) NOT NULL,
  `detail_img` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_seo`
--
ALTER TABLE `about_seo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_code` (`account_code`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `idx_account_type` (`account_type`),
  ADD KEY `idx_account_code` (`account_code`);

--
-- Indexes for table `accounting_period`
--
ALTER TABLE `accounting_period`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `age_categories`
--
ALTER TABLE `age_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_name` (`name`);

--
-- Indexes for table `application`
--
ALTER TABLE `application`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `asset`
--
ALTER TABLE `asset`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assettype`
--
ALTER TABLE `assettype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assimilation_followups`
--
ALTER TABLE `assimilation_followups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `logged_by` (`logged_by`),
  ADD KEY `idx_assimilation` (`assimilation_id`),
  ADD KEY `idx_logged_at` (`logged_at`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `meeting_id` (`meeting_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_table` (`table_name`,`record_id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_date` (`created_at`);

--
-- Indexes for table `batch`
--
ALTER TABLE `batch`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gl_account_id` (`gl_account_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `event_budget_item_id` (`event_budget_item_id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`);

--
-- Indexes for table `bill_payments`
--
ALTER TABLE `bill_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bill_id` (`bill_id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`b_id`);

--
-- Indexes for table `budget`
--
ALTER TABLE `budget`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `budget_category`
--
ALTER TABLE `budget_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `budget_details`
--
ALTER TABLE `budget_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `calendar`
--
ALTER TABLE `calendar`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `campaign`
--
ALTER TABLE `campaign`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `career`
--
ALTER TABLE `career`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cashflow_report`
--
ALTER TABLE `cashflow_report`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cells`
--
ALTER TABLE `cells`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cell_leader` (`cell_leader`);

--
-- Indexes for table `cell_attendance`
--
ALTER TABLE `cell_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cell_member_date` (`cell_id`,`member_id`,`meeting_date`),
  ADD KEY `idx_cell_date` (`cell_id`,`meeting_date`),
  ADD KEY `idx_member` (`member_id`);

--
-- Indexes for table `cell_dc_sessions`
--
ALTER TABLE `cell_dc_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disciple_id` (`disciple_id`);

--
-- Indexes for table `cell_disciples`
--
ALTER TABLE `cell_disciples`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `member_active` (`member_id`,`status`),
  ADD KEY `discipler_id` (`discipler_id`);

--
-- Indexes for table `cell_followup_tasks`
--
ALTER TABLE `cell_followup_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `idx_fu_tasks_member` (`member_id`),
  ADD KEY `idx_fu_tasks_assigned` (`assigned_to`),
  ADD KEY `idx_fu_tasks_status` (`status`);

--
-- Indexes for table `cell_reports`
--
ALTER TABLE `cell_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cell_date_type` (`cell_id`,`meeting_date`,`meeting_type`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_cell_reports_cell` (`cell_id`),
  ADD KEY `idx_cell_reports_date` (`meeting_date`),
  ADD KEY `idx_cell_reports_status` (`status`),
  ADD KEY `fk_cell_reports_meeting` (`meeting_id`);

--
-- Indexes for table `cell_report_attendance`
--
ALTER TABLE `cell_report_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_report_member` (`report_id`,`member_id`),
  ADD KEY `idx_report_att_report` (`report_id`),
  ADD KEY `idx_report_att_member` (`member_id`);

--
-- Indexes for table `cell_report_first_timers`
--
ALTER TABLE `cell_report_first_timers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invited_by` (`invited_by`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `idx_rep_ft_report` (`report_id`);

--
-- Indexes for table `cell_report_pastoral_care`
--
ALTER TABLE `cell_report_pastoral_care`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rep_pc_report` (`report_id`),
  ADD KEY `idx_rep_pc_member` (`member_id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cities_test_ibfk_1` (`state_id`),
  ADD KEY `cities_test_ibfk_2` (`country_id`);

--
-- Indexes for table `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `committed_members`
--
ALTER TABLE `committed_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_committed_members_phone` (`phone`),
  ADD KEY `idx_committed_members_email` (`email`),
  ADD KEY `idx_committed_members_member_id` (`member_id`),
  ADD KEY `idx_committed_members_created_at` (`created_at`);

--
-- Indexes for table `communications`
--
ALTER TABLE `communications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contactus`
--
ALTER TABLE `contactus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_seo`
--
ALTER TABLE `contact_seo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contribution`
--
ALTER TABLE `contribution`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contritype`
--
ALTER TABLE `contritype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `country_continent` (`region_id`),
  ADD KEY `country_subregion` (`subregion_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `devotionals`
--
ALTER TABLE `devotionals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `devotional_authors`
--
ALTER TABLE `devotional_authors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `devotional_categories`
--
ALTER TABLE `devotional_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `devotional_category_map`
--
ALTER TABLE `devotional_category_map`
  ADD PRIMARY KEY (`devotional_id`,`category_id`);

--
-- Indexes for table `donar`
--
ALTER TABLE `donar`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emailsetting`
--
ALTER TABLE `emailsetting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_attendance`
--
ALTER TABLE `event_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`event_id`,`registration_id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `event_budget`
--
ALTER TABLE `event_budget`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_version` (`event_id`,`version`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `budget_id` (`budget_id`);

--
-- Indexes for table `event_budget_audit`
--
ALTER TABLE `event_budget_audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_budget_audit` (`event_budget_id`,`performed_at`);

--
-- Indexes for table `event_budget_item`
--
ALTER TABLE `event_budget_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_budget` (`event_budget_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `budget_details_id` (`budget_details_id`);

--
-- Indexes for table `event_budget_receipt`
--
ALTER TABLE `event_budget_receipt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_item` (`budget_item_id`);

--
-- Indexes for table `event_registration`
--
ALTER TABLE `event_registration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `event_registration_data`
--
ALTER TABLE `event_registration_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`),
  ADD KEY `field_id` (`field_id`);

--
-- Indexes for table `event_registration_fields`
--
ALTER TABLE `event_registration_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `event_schedule`
--
ALTER TABLE `event_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_day` (`event_id`,`day_number`,`sort_order`);

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expensetype`
--
ALTER TABLE `expensetype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fasting_commitments`
--
ALTER TABLE `fasting_commitments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `financial_year`
--
ALTER TABLE `financial_year`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `followups`
--
ALTER TABLE `followups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_member` (`member_id`),
  ADD KEY `idx_sent_by` (`sent_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `followup_category`
--
ALTER TABLE `followup_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `follow_up`
--
ALTER TABLE `follow_up`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fund`
--
ALTER TABLE `fund`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hierarchy_levels`
--
ALTER TABLE `hierarchy_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `level_order` (`level_order`);

--
-- Indexes for table `hierarchy_nodes`
--
ALTER TABLE `hierarchy_nodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `level_id` (`level_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `home_seo`
--
ALTER TABLE `home_seo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `incometype`
--
ALTER TABLE `incometype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `instapayment`
--
ALTER TABLE `instapayment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invitees`
--
ALTER TABLE `invitees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `journal_entry`
--
ALTER TABLE `journal_entry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reversed_by_id` (`reversed_by_id`),
  ADD KEY `idx_je_date` (`entry_date`),
  ADD KEY `idx_je_source` (`source_type`,`source_id`),
  ADD KEY `idx_je_period` (`accounting_period_id`);

--
-- Indexes for table `journal_entry_line`
--
ALTER TABLE `journal_entry_line`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`),
  ADD KEY `idx_jel_account` (`account_id`),
  ADD KEY `idx_jel_fund` (`fund_id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `manage_web`
--
ALTER TABLE `manage_web`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `type` (`type`);

--
-- Indexes for table `material_type`
--
ALTER TABLE `material_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meeting`
--
ALTER TABLE `meeting`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facilitator` (`facilitator`),
  ADD KEY `meeting_type` (`meeting_type`);

--
-- Indexes for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meeting_id` (`meeting_id`),
  ADD KEY `personnel` (`personnel`);

--
-- Indexes for table `meeting_types`
--
ALTER TABLE `meeting_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type` (`name`);

--
-- Indexes for table `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `sub_ministerial` (`sub_ministerial`);

--
-- Indexes for table `mpesa_stk_requests`
--
ALTER TABLE `mpesa_stk_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `checkout_request_id` (`checkout_request_id`),
  ADD KEY `idx_pledge` (`pledge_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_mpesa_code` (`mpesa_code`);

--
-- Indexes for table `new_member_assimilation`
--
ALTER TABLE `new_member_assimilation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_member` (`member_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`assimilation_status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organization_settings`
--
ALTER TABLE `organization_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pastoral_care`
--
ALTER TABLE `pastoral_care`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `paymentmethod`
--
ALTER TABLE `paymentmethod`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_account_map`
--
ALTER TABLE `payment_account_map`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payroll_item`
--
ALTER TABLE `payroll_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payroll_run_id` (`payroll_run_id`);

--
-- Indexes for table `payroll_run`
--
ALTER TABLE `payroll_run`
  ADD PRIMARY KEY (`id`),
  ADD KEY `journal_entry_id` (`journal_entry_id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `category` (`category`);

--
-- Indexes for table `permission_category`
--
ALTER TABLE `permission_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pledges`
--
ALTER TABLE `pledges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `pledge_verifications`
--
ALTER TABLE `pledge_verifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prophecies`
--
ALTER TABLE `prophecies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purpose` (`purpose`);

--
-- Indexes for table `prophecy_purpose`
--
ALTER TABLE `prophecy_purpose`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_expires` (`user_id`,`expires_at`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `registration_fee`
--
ALTER TABLE `registration_fee`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reset_logs`
--
ALTER TABLE `reset_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `send_email`
--
ALTER TABLE `send_email`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service`
--
ALTER TABLE `service`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_seo`
--
ALTER TABLE `service_seo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `slider`
--
ALTER TABLE `slider`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sms_gateway`
--
ALTER TABLE `sms_gateway`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sms_gateway1`
--
ALTER TABLE `sms_gateway1`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `solutions_seo`
--
ALTER TABLE `solutions_seo`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `soul_winning`
--
ALTER TABLE `soul_winning`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`),
  ADD KEY `country_region` (`country_id`);

--
-- Indexes for table `subregions`
--
ALTER TABLE `subregions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subregion_continent` (`region_id`);

--
-- Indexes for table `sub_departments`
--
ALTER TABLE `sub_departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department` (`department`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `domain` (`domain`),
  ADD UNIQUE KEY `db_name` (`db_name`);

--
-- Indexes for table `totals`
--
ALTER TABLE `totals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trn_assignment_submissions`
--
ALTER TABLE `trn_assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `assignment_id` (`assignment_id`);

--
-- Indexes for table `trn_coaches`
--
ALTER TABLE `trn_coaches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `track_id` (`track_id`);

--
-- Indexes for table `trn_coach_evaluations`
--
ALTER TABLE `trn_coach_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `coach_id` (`coach_id`);

--
-- Indexes for table `trn_learning_modules`
--
ALTER TABLE `trn_learning_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `track_id` (`track_id`);

--
-- Indexes for table `trn_learning_tracks`
--
ALTER TABLE `trn_learning_tracks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trn_mentors`
--
ALTER TABLE `trn_mentors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trn_mentorship_assignments`
--
ALTER TABLE `trn_mentorship_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mentor_id` (`mentor_id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `trn_mentorship_sessions`
--
ALTER TABLE `trn_mentorship_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mentor_id` (`mentor_id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `trn_module_progress`
--
ALTER TABLE `trn_module_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollment_id` (`enrollment_id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `trn_module_reflections`
--
ALTER TABLE `trn_module_reflections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `mentor_id` (`mentor_id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `trn_practical_assignments`
--
ALTER TABLE `trn_practical_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `trn_shared_journals`
--
ALTER TABLE `trn_shared_journals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `mentor_id` (`mentor_id`);

--
-- Indexes for table `trn_track_enrollments`
--
ALTER TABLE `trn_track_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `track_id` (`track_id`),
  ADD KEY `coach_id` (`coach_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_timeline`
--
ALTER TABLE `user_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_seo`
--
ALTER TABLE `about_seo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounting_period`
--
ALTER TABLE `accounting_period`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity`
--
ALTER TABLE `activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `age_categories`
--
ALTER TABLE `age_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `application`
--
ALTER TABLE `application`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset`
--
ALTER TABLE `asset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assettype`
--
ALTER TABLE `assettype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assimilation_followups`
--
ALTER TABLE `assimilation_followups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batch`
--
ALTER TABLE `batch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bill_payments`
--
ALTER TABLE `bill_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `b_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `budget`
--
ALTER TABLE `budget`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `budget_category`
--
ALTER TABLE `budget_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `budget_details`
--
ALTER TABLE `budget_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `calendar`
--
ALTER TABLE `calendar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campaign`
--
ALTER TABLE `campaign`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `career`
--
ALTER TABLE `career`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cashflow_report`
--
ALTER TABLE `cashflow_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cells`
--
ALTER TABLE `cells`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_attendance`
--
ALTER TABLE `cell_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_dc_sessions`
--
ALTER TABLE `cell_dc_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_disciples`
--
ALTER TABLE `cell_disciples`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_followup_tasks`
--
ALTER TABLE `cell_followup_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_reports`
--
ALTER TABLE `cell_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_report_attendance`
--
ALTER TABLE `cell_report_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_report_first_timers`
--
ALTER TABLE `cell_report_first_timers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cell_report_pastoral_care`
--
ALTER TABLE `cell_report_pastoral_care`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `committed_members`
--
ALTER TABLE `committed_members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `communications`
--
ALTER TABLE `communications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contactus`
--
ALTER TABLE `contactus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_seo`
--
ALTER TABLE `contact_seo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contribution`
--
ALTER TABLE `contribution`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contritype`
--
ALTER TABLE `contritype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `devotionals`
--
ALTER TABLE `devotionals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `devotional_authors`
--
ALTER TABLE `devotional_authors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `devotional_categories`
--
ALTER TABLE `devotional_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donar`
--
ALTER TABLE `donar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emailsetting`
--
ALTER TABLE `emailsetting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_attendance`
--
ALTER TABLE `event_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_budget`
--
ALTER TABLE `event_budget`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_budget_audit`
--
ALTER TABLE `event_budget_audit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_budget_item`
--
ALTER TABLE `event_budget_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_budget_receipt`
--
ALTER TABLE `event_budget_receipt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_registration`
--
ALTER TABLE `event_registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_registration_data`
--
ALTER TABLE `event_registration_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_registration_fields`
--
ALTER TABLE `event_registration_fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_schedule`
--
ALTER TABLE `event_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expensetype`
--
ALTER TABLE `expensetype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fasting_commitments`
--
ALTER TABLE `fasting_commitments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_year`
--
ALTER TABLE `financial_year`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `followups`
--
ALTER TABLE `followups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `followup_category`
--
ALTER TABLE `followup_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `follow_up`
--
ALTER TABLE `follow_up`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fund`
--
ALTER TABLE `fund`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hierarchy_levels`
--
ALTER TABLE `hierarchy_levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hierarchy_nodes`
--
ALTER TABLE `hierarchy_nodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `home_seo`
--
ALTER TABLE `home_seo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `incometype`
--
ALTER TABLE `incometype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `instapayment`
--
ALTER TABLE `instapayment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invitees`
--
ALTER TABLE `invitees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_entry`
--
ALTER TABLE `journal_entry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_entry_line`
--
ALTER TABLE `journal_entry_line`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `manage_web`
--
ALTER TABLE `manage_web`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `material_type`
--
ALTER TABLE `material_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting`
--
ALTER TABLE `meeting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_types`
--
ALTER TABLE `meeting_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mpesa_stk_requests`
--
ALTER TABLE `mpesa_stk_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `new_member_assimilation`
--
ALTER TABLE `new_member_assimilation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pastoral_care`
--
ALTER TABLE `pastoral_care`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymentmethod`
--
ALTER TABLE `paymentmethod`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_account_map`
--
ALTER TABLE `payment_account_map`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_item`
--
ALTER TABLE `payroll_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_run`
--
ALTER TABLE `payroll_run`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission_category`
--
ALTER TABLE `permission_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission_role`
--
ALTER TABLE `permission_role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pledges`
--
ALTER TABLE `pledges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pledge_verifications`
--
ALTER TABLE `pledge_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prophecies`
--
ALTER TABLE `prophecies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prophecy_purpose`
--
ALTER TABLE `prophecy_purpose`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_fee`
--
ALTER TABLE `registration_fee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reset_logs`
--
ALTER TABLE `reset_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `send_email`
--
ALTER TABLE `send_email`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service`
--
ALTER TABLE `service`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_seo`
--
ALTER TABLE `service_seo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `slider`
--
ALTER TABLE `slider`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_gateway`
--
ALTER TABLE `sms_gateway`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_gateway1`
--
ALTER TABLE `sms_gateway1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `solutions_seo`
--
ALTER TABLE `solutions_seo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `soul_winning`
--
ALTER TABLE `soul_winning`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subregions`
--
ALTER TABLE `subregions`
  MODIFY `id` mediumint(8) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_departments`
--
ALTER TABLE `sub_departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `totals`
--
ALTER TABLE `totals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_assignment_submissions`
--
ALTER TABLE `trn_assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_coaches`
--
ALTER TABLE `trn_coaches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_coach_evaluations`
--
ALTER TABLE `trn_coach_evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_learning_modules`
--
ALTER TABLE `trn_learning_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_learning_tracks`
--
ALTER TABLE `trn_learning_tracks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_mentors`
--
ALTER TABLE `trn_mentors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_mentorship_assignments`
--
ALTER TABLE `trn_mentorship_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_mentorship_sessions`
--
ALTER TABLE `trn_mentorship_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_module_progress`
--
ALTER TABLE `trn_module_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_module_reflections`
--
ALTER TABLE `trn_module_reflections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_practical_assignments`
--
ALTER TABLE `trn_practical_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_shared_journals`
--
ALTER TABLE `trn_shared_journals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trn_track_enrollments`
--
ALTER TABLE `trn_track_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_timeline`
--
ALTER TABLE `user_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `account_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `account` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assimilation_followups`
--
ALTER TABLE `assimilation_followups`
  ADD CONSTRAINT `assimilation_followups_ibfk_1` FOREIGN KEY (`assimilation_id`) REFERENCES `new_member_assimilation` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assimilation_followups_ibfk_2` FOREIGN KEY (`logged_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`gl_account_id`) REFERENCES `account` (`id`),
  ADD CONSTRAINT `bills_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  ADD CONSTRAINT `bills_ibfk_3` FOREIGN KEY (`event_budget_item_id`) REFERENCES `event_budget_item` (`id`),
  ADD CONSTRAINT `bills_ibfk_4` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entry` (`id`);

--
-- Constraints for table `bill_payments`
--
ALTER TABLE `bill_payments`
  ADD CONSTRAINT `bill_payments_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`),
  ADD CONSTRAINT `bill_payments_ibfk_2` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entry` (`id`);

--
-- Constraints for table `cells`
--
ALTER TABLE `cells`
  ADD CONSTRAINT `cells_ibfk_1` FOREIGN KEY (`cell_leader`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cell_attendance`
--
ALTER TABLE `cell_attendance`
  ADD CONSTRAINT `cell_attendance_ibfk_1` FOREIGN KEY (`cell_id`) REFERENCES `cells` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cell_attendance_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cell_followup_tasks`
--
ALTER TABLE `cell_followup_tasks`
  ADD CONSTRAINT `cell_followup_tasks_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `cell_reports` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cell_followup_tasks_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cell_followup_tasks_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cell_reports`
--
ALTER TABLE `cell_reports`
  ADD CONSTRAINT `cell_reports_ibfk_1` FOREIGN KEY (`cell_id`) REFERENCES `cells` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cell_reports_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cell_reports_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cell_report_attendance`
--
ALTER TABLE `cell_report_attendance`
  ADD CONSTRAINT `cell_report_attendance_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `cell_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cell_report_attendance_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cell_report_first_timers`
--
ALTER TABLE `cell_report_first_timers`
  ADD CONSTRAINT `cell_report_first_timers_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `cell_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cell_report_first_timers_ibfk_2` FOREIGN KEY (`invited_by`) REFERENCES `member` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cell_report_first_timers_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cell_report_pastoral_care`
--
ALTER TABLE `cell_report_pastoral_care`
  ADD CONSTRAINT `cell_report_pastoral_care_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `cell_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cell_report_pastoral_care_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`),
  ADD CONSTRAINT `cities_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`);

--
-- Constraints for table `countries`
--
ALTER TABLE `countries`
  ADD CONSTRAINT `country_continent_final` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`),
  ADD CONSTRAINT `country_subregion_final` FOREIGN KEY (`subregion_id`) REFERENCES `subregions` (`id`);

--
-- Constraints for table `event_attendance`
--
ALTER TABLE `event_attendance`
  ADD CONSTRAINT `event_attendance_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_attendance_ibfk_2` FOREIGN KEY (`registration_id`) REFERENCES `event_registration` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_budget`
--
ALTER TABLE `event_budget`
  ADD CONSTRAINT `event_budget_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_budget_ibfk_2` FOREIGN KEY (`budget_id`) REFERENCES `budget` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `event_budget_audit`
--
ALTER TABLE `event_budget_audit`
  ADD CONSTRAINT `event_budget_audit_ibfk_1` FOREIGN KEY (`event_budget_id`) REFERENCES `event_budget` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_budget_item`
--
ALTER TABLE `event_budget_item`
  ADD CONSTRAINT `event_budget_item_ibfk_1` FOREIGN KEY (`event_budget_id`) REFERENCES `event_budget` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_budget_item_ibfk_2` FOREIGN KEY (`budget_details_id`) REFERENCES `budget_details` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `event_budget_receipt`
--
ALTER TABLE `event_budget_receipt`
  ADD CONSTRAINT `event_budget_receipt_ibfk_1` FOREIGN KEY (`budget_item_id`) REFERENCES `event_budget_item` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_registration`
--
ALTER TABLE `event_registration`
  ADD CONSTRAINT `event_registration_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`);

--
-- Constraints for table `event_registration_data`
--
ALTER TABLE `event_registration_data`
  ADD CONSTRAINT `event_registration_data_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `event_registrations` (`id`),
  ADD CONSTRAINT `event_registration_data_ibfk_2` FOREIGN KEY (`field_id`) REFERENCES `event_registration_fields` (`id`);

--
-- Constraints for table `event_registration_fields`
--
ALTER TABLE `event_registration_fields`
  ADD CONSTRAINT `event_registration_fields_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`);

--
-- Constraints for table `event_schedule`
--
ALTER TABLE `event_schedule`
  ADD CONSTRAINT `event_schedule_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `followups`
--
ALTER TABLE `followups`
  ADD CONSTRAINT `followups_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hierarchy_nodes`
--
ALTER TABLE `hierarchy_nodes`
  ADD CONSTRAINT `hierarchy_nodes_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `hierarchy_levels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hierarchy_nodes_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `hierarchy_nodes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `journal_entry`
--
ALTER TABLE `journal_entry`
  ADD CONSTRAINT `journal_entry_ibfk_1` FOREIGN KEY (`accounting_period_id`) REFERENCES `accounting_period` (`id`),
  ADD CONSTRAINT `journal_entry_ibfk_2` FOREIGN KEY (`reversed_by_id`) REFERENCES `journal_entry` (`id`);

--
-- Constraints for table `journal_entry_line`
--
ALTER TABLE `journal_entry_line`
  ADD CONSTRAINT `journal_entry_line_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entry` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `journal_entry_line_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`);

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `materials_ibfk_2` FOREIGN KEY (`type`) REFERENCES `material_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meeting`
--
ALTER TABLE `meeting`
  ADD CONSTRAINT `meeting_ibfk_1` FOREIGN KEY (`facilitator`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_ibfk_2` FOREIGN KEY (`meeting_type`) REFERENCES `meeting_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  ADD CONSTRAINT `meeting_minutes_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_minutes_ibfk_2` FOREIGN KEY (`personnel`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `member`
--
ALTER TABLE `member`
  ADD CONSTRAINT `member_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `member_ibfk_2` FOREIGN KEY (`sub_ministerial`) REFERENCES `sub_departments` (`id`);

--
-- Constraints for table `new_member_assimilation`
--
ALTER TABLE `new_member_assimilation`
  ADD CONSTRAINT `new_member_assimilation_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `new_member_assimilation_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pastoral_care`
--
ALTER TABLE `pastoral_care`
  ADD CONSTRAINT `pastoral_care_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`),
  ADD CONSTRAINT `pastoral_care_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`);

--
-- Constraints for table `payment_account_map`
--
ALTER TABLE `payment_account_map`
  ADD CONSTRAINT `payment_account_map_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`);

--
-- Constraints for table `payroll_item`
--
ALTER TABLE `payroll_item`
  ADD CONSTRAINT `payroll_item_ibfk_1` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_run` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll_run`
--
ALTER TABLE `payroll_run`
  ADD CONSTRAINT `payroll_run_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entry` (`id`);

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`category`) REFERENCES `permission_category` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pledges`
--
ALTER TABLE `pledges`
  ADD CONSTRAINT `pledges_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`);

--
-- Constraints for table `prophecies`
--
ALTER TABLE `prophecies`
  ADD CONSTRAINT `prophecies_ibfk_1` FOREIGN KEY (`purpose`) REFERENCES `prophecy_purpose` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `states`
--
ALTER TABLE `states`
  ADD CONSTRAINT `country_region_final` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`);

--
-- Constraints for table `subregions`
--
ALTER TABLE `subregions`
  ADD CONSTRAINT `subregion_continent_final` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`);

--
-- Constraints for table `sub_departments`
--
ALTER TABLE `sub_departments`
  ADD CONSTRAINT `sub_departments_ibfk_1` FOREIGN KEY (`department`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_assignment_submissions`
--
ALTER TABLE `trn_assignment_submissions`
  ADD CONSTRAINT `trn_assignment_submissions_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_assignment_submissions_ibfk_2` FOREIGN KEY (`assignment_id`) REFERENCES `trn_practical_assignments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_coaches`
--
ALTER TABLE `trn_coaches`
  ADD CONSTRAINT `trn_coaches_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_coaches_ibfk_2` FOREIGN KEY (`track_id`) REFERENCES `trn_learning_tracks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_coach_evaluations`
--
ALTER TABLE `trn_coach_evaluations`
  ADD CONSTRAINT `trn_coach_evaluations_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `trn_assignment_submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_coach_evaluations_ibfk_2` FOREIGN KEY (`coach_id`) REFERENCES `trn_coaches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_learning_modules`
--
ALTER TABLE `trn_learning_modules`
  ADD CONSTRAINT `trn_learning_modules_ibfk_1` FOREIGN KEY (`track_id`) REFERENCES `trn_learning_tracks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_mentors`
--
ALTER TABLE `trn_mentors`
  ADD CONSTRAINT `trn_mentors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_mentorship_assignments`
--
ALTER TABLE `trn_mentorship_assignments`
  ADD CONSTRAINT `trn_mentorship_assignments_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `trn_mentors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_mentorship_assignments_ibfk_2` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_mentorship_sessions`
--
ALTER TABLE `trn_mentorship_sessions`
  ADD CONSTRAINT `trn_mentorship_sessions_ibfk_1` FOREIGN KEY (`mentor_id`) REFERENCES `trn_mentors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_mentorship_sessions_ibfk_2` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_module_progress`
--
ALTER TABLE `trn_module_progress`
  ADD CONSTRAINT `trn_module_progress_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `trn_track_enrollments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_module_progress_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `trn_learning_modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_module_reflections`
--
ALTER TABLE `trn_module_reflections`
  ADD CONSTRAINT `trn_module_reflections_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_module_reflections_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `trn_mentors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_module_reflections_ibfk_3` FOREIGN KEY (`module_id`) REFERENCES `trn_learning_modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_practical_assignments`
--
ALTER TABLE `trn_practical_assignments`
  ADD CONSTRAINT `trn_practical_assignments_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `trn_learning_modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_shared_journals`
--
ALTER TABLE `trn_shared_journals`
  ADD CONSTRAINT `trn_shared_journals_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_shared_journals_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `trn_mentors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trn_track_enrollments`
--
ALTER TABLE `trn_track_enrollments`
  ADD CONSTRAINT `trn_track_enrollments_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_track_enrollments_ibfk_2` FOREIGN KEY (`track_id`) REFERENCES `trn_learning_tracks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trn_track_enrollments_ibfk_3` FOREIGN KEY (`coach_id`) REFERENCES `trn_coaches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_timeline`
--
ALTER TABLE `user_timeline`
  ADD CONSTRAINT `user_timeline_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
