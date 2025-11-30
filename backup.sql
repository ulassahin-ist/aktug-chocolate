/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.5-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: aktug_chocolate
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Branches`
--

DROP TABLE IF EXISTS `Branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Branches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT 'Europe/Istanbul',
  `currency` varchar(8) DEFAULT 'TRY',
  `menuDefaultStock` int(11) NOT NULL DEFAULT 20,
  `menuDefaultPrice` decimal(10,2) NOT NULL DEFAULT 400.00,
  `stockWarnEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `stockWarnThreshold` int(11) NOT NULL DEFAULT 5,
  `showInactiveMenuItems` tinyint(1) NOT NULL DEFAULT 0,
  `showOutOfStockItems` tinyint(1) NOT NULL DEFAULT 0,
  `ordersAutoRefreshEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `ordersAutoRefreshSeconds` int(11) NOT NULL DEFAULT 15,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Branches`
--

LOCK TABLES `Branches` WRITE;
/*!40000 ALTER TABLE `Branches` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Branches` VALUES
(1,'IST','Istanbul','Turkey','Europe/Istanbul','TRY',20,300.00,1,5,1,1,1,30,1,'2025-11-23 20:30:42'),
(2,'MLA','Malta','Malta','Europe/Malta','EUR',20,400.00,1,5,0,0,1,15,1,'2025-11-23 20:30:42');
/*!40000 ALTER TABLE `Branches` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `branchId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sortOrder` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `u_branch_name` (`branchId`,`name`),
  CONSTRAINT `Categories_ibfk_1` FOREIGN KEY (`branchId`) REFERENCES `Branches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Categories` VALUES
(2,1,'Cheesecakes',2),
(5,2,'Chocolate',5),
(6,2,'Cake',6),
(7,2,'Beverage',7),
(8,2,'Gift Box',8),
(42,1,'Chocolates',5),
(43,1,'Cookies',1),
(47,1,'Cédric Grolet',4),
(52,1,'Pastries',3),
(114,1,'Chocolate',0),
(125,1,'Beverages',6);
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `MenuItems`
--

DROP TABLE IF EXISTS `MenuItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MenuItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `branchId` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `available` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `idx_menu_branch` (`branchId`),
  CONSTRAINT `MenuItems_ibfk_1` FOREIGN KEY (`branchId`) REFERENCES `Branches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MenuItems_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MenuItems`
--

LOCK TABLES `MenuItems` WRITE;
/*!40000 ALTER TABLE `MenuItems` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `MenuItems` VALUES
(1,1,'San Sebastian','A luxuriously creamy basque cheesecake finished with a glossy Belgian chocolate sauce for deep indulgence.','/uploads/menu_1.jpg',2,350.00,5,1),
(3,1,'Belgian Chocolate','Rich, aromatic chocolate drops crafted for perfect balance and a premium cocoa experience.','/uploads/menu_3.png',42,10.00,10,0),
(9,1,'Pain au Chocolat','A buttery, flaky French pastry filled with premium Belgian chocolate for an elegant and indulgent bite.','/uploads/menu_9.png',52,135.00,19,1),
(10,1,'Croissant','Hand-crafted, golden, and delicately layered with a light, airy texture and pure artisanal butter.','/uploads/menu_10.png',52,120.00,19,1),
(12,1,'Mandarin','A luxurious mandarin-inspired piece with vibrant citrus aroma and a velvety, fruit-forward finish.','/uploads/menu_12.png',47,400.00,18,1),
(15,1,'Strawberry Cookie','Soft, gourmet cookies infused with  \nfresh strawberry pieces','/uploads/menu_15.jpg',43,210.00,18,1),
(16,1,'Chocolate Cookie','Soft, gourmet cookies infused with chocolate\n pieces','/uploads/menu_16.jpg',43,210.00,18,1),
(29,1,'Bitter Chocolate','Rich, aromatic chocolate drops crafted for perfect balance and a premium cocoa experience.','/uploads/menu_29.png',42,400.00,17,1),
(36,2,'Yeni Ürün','Açıklama',NULL,NULL,400.00,20,1);
/*!40000 ALTER TABLE `MenuItems` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `OrderItems`
--

DROP TABLE IF EXISTS `OrderItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrderItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `itemId` int(11) DEFAULT NULL,
  `qty` int(11) NOT NULL,
  `priceAtTime` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orderId` (`orderId`),
  KEY `idx_itemId` (`itemId`),
  CONSTRAINT `fk_orderitems_item` FOREIGN KEY (`itemId`) REFERENCES `MenuItems` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orderitems_order` FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=316 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrderItems`
--

LOCK TABLES `OrderItems` WRITE;
/*!40000 ALTER TABLE `OrderItems` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `OrderItems` VALUES
(1,1,1,1,350.00),
(2,2,NULL,5,800.00),
(3,2,9,5,400.00),
(4,2,1,2,350.00),
(5,2,9,2,400.00),
(6,3,NULL,3,400.00),
(7,4,NULL,4,400.00),
(8,5,1,4,350.00),
(9,5,NULL,2,800.00),
(10,6,NULL,3,800.00),
(11,6,9,3,400.00),
(12,7,10,2,400.00),
(13,8,NULL,5,400.00),
(14,9,1,3,350.00),
(15,9,NULL,1,800.00),
(16,9,NULL,3,400.00),
(17,9,3,4,800.00),
(18,10,NULL,5,400.00),
(19,11,10,4,400.00),
(20,11,10,4,400.00),
(21,11,10,4,400.00),
(22,11,3,1,800.00),
(23,12,NULL,3,400.00),
(24,12,NULL,3,400.00),
(25,12,9,4,400.00),
(26,12,NULL,3,400.00),
(27,13,1,1,350.00),
(28,13,9,5,400.00),
(29,13,NULL,2,800.00),
(30,14,9,3,400.00),
(31,15,10,1,400.00),
(32,15,3,5,800.00),
(33,15,3,2,800.00),
(34,16,10,3,400.00),
(35,16,1,2,350.00),
(36,16,10,4,400.00),
(37,16,10,5,400.00),
(38,17,1,5,350.00),
(39,18,10,1,400.00),
(40,19,10,2,400.00),
(41,19,3,3,800.00),
(42,20,NULL,4,400.00),
(43,20,NULL,1,800.00),
(44,21,NULL,5,400.00),
(45,21,9,4,400.00),
(46,21,9,3,400.00),
(47,21,9,2,400.00),
(48,22,NULL,2,800.00),
(49,22,9,1,400.00),
(50,22,3,1,800.00),
(51,22,9,5,400.00),
(52,23,NULL,4,800.00),
(53,23,NULL,4,400.00),
(54,24,NULL,2,400.00),
(55,24,NULL,1,400.00),
(56,24,NULL,5,400.00),
(57,24,NULL,3,400.00),
(58,25,NULL,3,400.00),
(59,26,3,2,800.00),
(60,26,3,5,800.00),
(61,26,10,1,400.00),
(62,27,NULL,1,800.00),
(63,28,NULL,4,400.00),
(64,28,1,1,350.00),
(65,28,1,3,350.00),
(66,28,3,3,800.00),
(67,29,NULL,2,800.00),
(68,29,9,5,400.00),
(69,30,3,1,800.00),
(70,31,1,3,350.00),
(71,32,NULL,4,400.00),
(72,33,1,1,350.00),
(73,34,10,4,400.00),
(74,34,1,4,350.00),
(75,34,1,2,350.00),
(76,35,NULL,3,800.00),
(77,35,NULL,4,800.00),
(78,35,NULL,1,800.00),
(79,35,NULL,5,800.00),
(80,36,10,3,400.00),
(81,36,10,2,400.00),
(82,37,1,2,350.00),
(83,37,1,4,350.00),
(84,38,10,1,400.00),
(85,38,1,2,350.00),
(86,39,9,4,400.00),
(87,39,NULL,3,400.00),
(88,39,9,3,400.00),
(89,40,3,1,800.00),
(90,40,9,1,400.00),
(91,40,3,3,800.00),
(92,40,10,1,400.00),
(93,41,NULL,1,800.00),
(94,41,3,4,800.00),
(95,42,1,5,350.00),
(96,42,NULL,3,400.00),
(97,42,NULL,2,800.00),
(98,43,9,3,400.00),
(99,43,NULL,4,800.00),
(100,43,10,2,400.00),
(101,43,9,2,400.00),
(102,44,NULL,3,400.00),
(103,44,NULL,1,800.00),
(104,44,9,2,400.00),
(105,45,10,2,400.00),
(106,46,NULL,3,400.00),
(107,47,1,3,350.00),
(108,47,NULL,4,800.00),
(109,48,1,1,350.00),
(110,48,NULL,3,800.00),
(111,48,NULL,5,400.00),
(112,48,NULL,3,800.00),
(113,49,NULL,2,400.00),
(114,49,NULL,5,400.00),
(115,50,3,4,800.00),
(116,51,NULL,1,400.00),
(117,51,9,1,400.00),
(118,51,1,3,350.00),
(119,51,9,3,400.00),
(120,52,3,1,800.00),
(121,52,1,5,350.00),
(122,52,10,4,400.00),
(123,52,NULL,2,800.00),
(124,53,NULL,2,800.00),
(125,54,NULL,3,800.00),
(126,54,NULL,4,400.00),
(127,54,3,1,800.00),
(128,55,NULL,3,800.00),
(129,55,9,5,400.00),
(130,55,10,2,400.00),
(131,55,1,3,350.00),
(132,56,10,2,400.00),
(133,57,NULL,5,400.00),
(134,57,9,1,400.00),
(135,57,1,3,350.00),
(136,57,9,3,400.00),
(137,58,1,5,350.00),
(138,58,3,4,800.00),
(139,58,NULL,5,400.00),
(140,58,NULL,4,400.00),
(141,59,NULL,4,400.00),
(142,59,1,5,350.00),
(143,59,1,5,350.00),
(144,59,3,2,800.00),
(145,60,9,4,400.00),
(146,60,NULL,5,800.00),
(147,61,9,1,400.00),
(148,61,1,1,350.00),
(149,61,1,5,350.00),
(150,62,NULL,5,800.00),
(151,63,1,2,350.00),
(152,63,3,4,800.00),
(153,64,3,1,800.00),
(154,64,9,2,400.00),
(155,64,NULL,5,400.00),
(156,65,NULL,5,800.00),
(157,65,1,1,350.00),
(158,65,1,4,350.00),
(159,65,9,1,400.00),
(160,66,NULL,2,400.00),
(161,66,9,4,400.00),
(162,66,NULL,4,400.00),
(163,66,9,1,400.00),
(164,67,NULL,3,800.00),
(165,67,3,3,800.00),
(166,67,9,1,400.00),
(167,67,3,1,800.00),
(168,68,10,3,400.00),
(169,68,10,1,400.00),
(170,69,3,2,800.00),
(171,69,9,1,400.00),
(172,69,3,4,800.00),
(173,69,NULL,3,400.00),
(174,70,NULL,1,400.00),
(175,70,9,5,400.00),
(176,70,NULL,3,400.00),
(177,70,NULL,5,800.00),
(178,71,9,5,400.00),
(179,71,9,4,400.00),
(180,71,NULL,4,800.00),
(181,71,10,4,400.00),
(182,72,1,4,350.00),
(183,73,9,1,400.00),
(184,73,1,2,350.00),
(185,74,NULL,1,400.00),
(186,75,3,2,800.00),
(187,75,NULL,1,400.00),
(188,75,9,2,400.00),
(189,75,NULL,4,800.00),
(190,76,9,4,400.00),
(191,77,NULL,4,400.00),
(192,78,3,2,800.00),
(193,78,1,1,350.00),
(194,78,10,3,400.00),
(195,78,10,3,400.00),
(196,79,9,5,400.00),
(197,79,1,4,350.00),
(198,80,NULL,1,800.00),
(199,80,1,3,350.00),
(200,81,3,2,800.00),
(201,82,1,4,350.00),
(202,82,9,3,400.00),
(203,82,NULL,2,400.00),
(204,83,3,5,800.00),
(205,83,NULL,3,400.00),
(206,84,3,5,800.00),
(207,84,9,5,400.00),
(208,84,NULL,2,800.00),
(209,85,9,3,400.00),
(210,86,NULL,1,400.00),
(211,86,NULL,3,400.00),
(212,86,NULL,4,800.00),
(213,86,NULL,2,400.00),
(214,87,NULL,5,400.00),
(215,87,NULL,1,400.00),
(216,88,NULL,3,400.00),
(217,89,3,3,800.00),
(218,89,10,4,400.00),
(219,89,10,1,400.00),
(220,90,NULL,1,800.00),
(221,90,3,5,800.00),
(222,91,1,4,350.00),
(223,91,3,3,800.00),
(224,91,1,3,350.00),
(225,92,10,3,400.00),
(226,92,NULL,2,400.00),
(227,93,1,3,350.00),
(228,93,NULL,1,800.00),
(229,94,10,1,400.00),
(230,95,1,2,350.00),
(231,95,3,3,800.00),
(232,95,NULL,5,800.00),
(233,96,NULL,5,400.00),
(234,97,10,2,400.00),
(235,97,1,2,350.00),
(236,97,1,4,350.00),
(237,98,10,1,400.00),
(238,98,NULL,4,800.00),
(239,98,1,5,350.00),
(240,99,9,3,400.00),
(241,99,1,4,350.00),
(242,100,NULL,4,400.00),
(243,100,3,4,800.00),
(244,100,9,2,400.00),
(245,100,3,4,800.00),
(246,101,1,2,350.00),
(247,101,1,3,350.00),
(248,102,1,3,350.00),
(249,102,1,3,350.00),
(250,102,1,1,350.00),
(251,102,9,2,400.00),
(252,103,NULL,2,800.00),
(253,104,3,3,800.00),
(254,104,1,2,350.00),
(255,104,9,5,400.00),
(256,105,NULL,1,800.00),
(257,105,NULL,2,800.00),
(258,105,1,2,350.00),
(259,106,NULL,5,800.00),
(260,106,NULL,5,400.00),
(261,106,1,1,350.00),
(262,107,1,2,350.00),
(263,108,9,2,400.00),
(264,108,NULL,5,800.00),
(265,109,3,2,800.00),
(266,109,NULL,2,800.00),
(267,109,9,1,400.00),
(268,109,NULL,2,400.00),
(269,110,9,4,400.00),
(270,110,3,5,800.00),
(271,110,9,4,400.00),
(272,110,3,5,800.00),
(273,111,9,1,400.00),
(274,112,NULL,4,800.00),
(275,112,NULL,4,400.00),
(276,112,NULL,3,800.00),
(277,113,3,2,800.00),
(278,114,3,5,800.00),
(279,114,3,3,800.00),
(280,114,NULL,1,800.00),
(281,115,1,4,350.00),
(282,115,NULL,1,800.00),
(283,116,3,3,800.00),
(284,116,3,4,800.00),
(285,116,10,3,400.00),
(286,117,NULL,5,800.00),
(287,118,9,3,400.00),
(288,118,NULL,2,400.00),
(289,118,1,4,350.00),
(290,119,9,1,400.00),
(291,119,10,5,400.00),
(292,120,NULL,2,800.00),
(293,120,NULL,4,400.00),
(294,120,NULL,1,400.00),
(295,120,9,5,400.00),
(296,121,3,1,800.00),
(297,121,NULL,1,400.00),
(298,121,NULL,1,800.00),
(299,121,1,2,350.00),
(300,122,3,3,800.00),
(301,123,29,2,400.00),
(302,124,29,1,400.00),
(303,124,3,1,800.00),
(304,124,10,1,120.00),
(305,124,9,1,135.00),
(306,124,1,1,350.00),
(307,124,12,1,400.00),
(308,124,NULL,1,400.00),
(309,124,16,1,210.00),
(310,124,15,1,210.00),
(311,125,1,3,350.00),
(312,126,1,2,350.00),
(313,126,12,1,400.00),
(314,127,15,1,210.00),
(315,127,16,1,210.00);
/*!40000 ALTER TABLE `OrderItems` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `branchId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT 0.00,
  `active` tinyint(1) DEFAULT 1,
  `orderTime` datetime DEFAULT current_timestamp(),
  `tableId` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `idx_order_branch` (`branchId`),
  KEY `idx_orderTime` (`orderTime`),
  KEY `idx_active` (`active`),
  CONSTRAINT `Orders_ibfk_1` FOREIGN KEY (`branchId`) REFERENCES `Branches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Orders_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Orders` VALUES
(1,1,NULL,350.00,0,'2025-11-23 21:31:56',NULL,NULL),
(2,1,1,7500.00,0,'2025-09-13 12:52:33',NULL,'seeded order'),
(3,1,1,1200.00,0,'2025-08-01 06:43:10',NULL,NULL),
(4,1,1,1600.00,0,'2025-07-29 16:50:53',NULL,NULL),
(5,1,1,3000.00,0,'2025-08-31 19:04:59',NULL,NULL),
(6,1,1,3600.00,0,'2025-11-22 08:53:55',NULL,NULL),
(7,1,1,800.00,0,'2025-11-18 13:23:35',NULL,NULL),
(8,1,1,2000.00,0,'2025-10-19 10:54:47',NULL,NULL),
(9,1,1,6250.00,0,'2025-11-23 07:30:51',NULL,NULL),
(10,1,1,2000.00,0,'2025-08-15 17:41:47',NULL,NULL),
(11,1,1,5600.00,0,'2025-08-30 17:15:03',NULL,NULL),
(12,1,1,5200.00,0,'2025-07-29 09:35:02',NULL,NULL),
(13,1,1,3950.00,0,'2025-09-10 20:10:01',NULL,NULL),
(14,1,1,1200.00,0,'2025-10-14 06:19:33',NULL,NULL),
(15,1,1,6000.00,0,'2025-09-18 08:59:51',NULL,NULL),
(16,1,1,5500.00,0,'2025-11-17 06:46:23',NULL,NULL),
(17,1,1,1750.00,0,'2025-08-08 11:32:01',NULL,NULL),
(18,1,1,400.00,0,'2025-09-06 09:52:07',NULL,NULL),
(19,1,1,3200.00,0,'2025-10-22 14:54:30',NULL,NULL),
(20,1,1,2400.00,0,'2025-09-14 14:17:11',NULL,NULL),
(21,1,1,5600.00,0,'2025-09-08 09:51:05',NULL,NULL),
(22,1,1,4800.00,0,'2025-08-04 06:57:56',NULL,NULL),
(23,1,1,4800.00,0,'2025-08-25 13:40:39',NULL,NULL),
(24,1,1,4400.00,0,'2025-10-19 20:17:05',NULL,'seeded order'),
(25,1,1,1200.00,0,'2025-07-31 13:01:42',NULL,'seeded order'),
(26,1,1,6000.00,0,'2025-08-01 11:23:20',NULL,NULL),
(27,1,1,800.00,0,'2025-11-05 11:06:47',NULL,NULL),
(28,1,1,5400.00,0,'2025-07-31 10:20:45',NULL,NULL),
(29,1,1,3600.00,0,'2025-08-26 12:29:33',NULL,NULL),
(30,1,1,800.00,0,'2025-10-07 06:03:31',NULL,NULL),
(31,1,1,1050.00,0,'2025-11-15 17:53:54',NULL,NULL),
(32,1,1,1600.00,0,'2025-08-22 10:18:14',NULL,NULL),
(33,1,1,350.00,0,'2025-09-23 06:58:46',NULL,'seeded order'),
(34,1,1,3700.00,0,'2025-10-03 16:52:43',NULL,NULL),
(35,1,1,10400.00,0,'2025-11-10 11:35:16',NULL,NULL),
(36,1,1,2000.00,0,'2025-11-24 09:14:45',NULL,NULL),
(37,1,1,2100.00,0,'2025-10-24 20:58:12',NULL,'seeded order'),
(38,1,1,1100.00,0,'2025-09-11 17:41:11',NULL,NULL),
(39,1,1,4000.00,0,'2025-10-27 07:00:09',NULL,'seeded order'),
(40,1,1,4000.00,0,'2025-11-15 19:39:28',NULL,NULL),
(41,1,1,4000.00,0,'2025-09-30 08:08:14',NULL,NULL),
(42,1,1,4550.00,0,'2025-11-07 14:46:36',NULL,NULL),
(43,1,1,6000.00,0,'2025-10-21 20:22:35',NULL,'seeded order'),
(44,1,1,2800.00,0,'2025-09-29 11:56:52',NULL,'seeded order'),
(45,1,1,800.00,0,'2025-08-26 15:15:23',NULL,NULL),
(46,1,1,1200.00,0,'2025-10-19 16:26:10',NULL,NULL),
(47,1,1,4250.00,0,'2025-08-19 16:34:31',NULL,NULL),
(48,1,1,7150.00,0,'2025-10-25 19:46:06',NULL,NULL),
(49,1,1,2800.00,0,'2025-10-26 15:05:00',NULL,NULL),
(50,1,1,3200.00,0,'2025-08-28 14:27:58',NULL,NULL),
(51,1,1,3050.00,0,'2025-09-12 12:31:00',NULL,NULL),
(52,1,1,5750.00,0,'2025-10-10 18:05:57',NULL,NULL),
(53,1,1,1600.00,0,'2025-08-03 11:37:28',NULL,NULL),
(54,1,1,4800.00,0,'2025-11-16 07:59:56',NULL,NULL),
(55,1,1,6250.00,0,'2025-09-04 20:42:34',NULL,NULL),
(56,1,1,800.00,0,'2025-09-13 11:14:56',NULL,NULL),
(57,1,1,4650.00,0,'2025-11-14 13:59:47',NULL,NULL),
(58,1,1,8550.00,0,'2025-08-17 13:44:24',NULL,NULL),
(59,1,1,6700.00,0,'2025-10-08 12:53:38',NULL,'seeded order'),
(60,1,1,5600.00,0,'2025-11-21 08:59:23',NULL,NULL),
(61,1,1,2500.00,0,'2025-09-18 11:59:20',NULL,'seeded order'),
(62,1,1,4000.00,0,'2025-11-15 10:33:45',NULL,NULL),
(63,1,1,3900.00,0,'2025-08-20 19:48:49',NULL,NULL),
(64,1,1,3600.00,0,'2025-10-30 15:47:15',NULL,NULL),
(65,1,1,6150.00,0,'2025-11-24 12:38:30',NULL,NULL),
(66,1,1,4400.00,0,'2025-10-28 15:56:19',NULL,NULL),
(67,1,1,6000.00,0,'2025-11-09 08:18:19',NULL,NULL),
(68,1,1,1600.00,0,'2025-08-21 15:01:26',NULL,NULL),
(69,1,1,6400.00,0,'2025-11-15 12:25:56',NULL,NULL),
(70,1,1,7600.00,0,'2025-10-15 15:33:28',NULL,NULL),
(71,1,1,8400.00,0,'2025-08-24 11:02:51',NULL,NULL),
(72,1,1,1400.00,0,'2025-10-14 12:10:05',NULL,NULL),
(73,1,1,1100.00,0,'2025-09-16 17:22:15',NULL,NULL),
(74,1,1,400.00,0,'2025-08-14 07:51:42',NULL,NULL),
(75,1,1,6000.00,0,'2025-08-07 18:42:41',NULL,'seeded order'),
(76,1,1,1600.00,0,'2025-08-09 09:53:44',NULL,NULL),
(77,1,1,1600.00,0,'2025-11-07 19:43:40',NULL,NULL),
(78,1,1,4350.00,0,'2025-09-06 06:58:42',NULL,NULL),
(79,1,1,3400.00,0,'2025-10-29 08:21:27',NULL,NULL),
(80,1,1,1850.00,0,'2025-09-27 19:11:49',NULL,NULL),
(81,1,1,1600.00,0,'2025-08-22 07:25:03',NULL,'seeded order'),
(82,1,1,3400.00,0,'2025-09-13 16:28:55',NULL,NULL),
(83,1,1,5200.00,0,'2025-11-02 15:21:27',NULL,'seeded order'),
(84,1,1,7600.00,0,'2025-11-14 08:02:43',NULL,NULL),
(85,1,1,1200.00,0,'2025-10-01 09:38:36',NULL,NULL),
(86,1,1,5600.00,0,'2025-11-21 09:38:59',NULL,NULL),
(87,1,1,2400.00,0,'2025-09-17 14:43:17',NULL,NULL),
(88,1,1,1200.00,0,'2025-10-31 19:58:26',NULL,NULL),
(89,1,1,4400.00,0,'2025-09-28 12:38:51',NULL,'seeded order'),
(90,1,1,4800.00,0,'2025-09-25 18:56:14',NULL,NULL),
(91,1,1,4850.00,0,'2025-10-18 07:16:34',NULL,NULL),
(92,1,1,2000.00,0,'2025-11-11 16:41:45',NULL,NULL),
(93,1,1,1850.00,0,'2025-08-03 10:30:11',NULL,NULL),
(94,1,1,400.00,0,'2025-08-24 18:57:29',NULL,NULL),
(95,1,1,7100.00,0,'2025-08-07 16:22:27',NULL,NULL),
(96,1,1,2000.00,0,'2025-11-12 12:52:56',NULL,NULL),
(97,1,1,2900.00,0,'2025-11-05 17:56:07',NULL,NULL),
(98,1,1,5350.00,0,'2025-10-18 15:11:02',NULL,'seeded order'),
(99,1,1,2600.00,0,'2025-10-13 16:13:34',NULL,NULL),
(100,1,1,8800.00,0,'2025-08-08 11:17:03',NULL,NULL),
(101,1,1,1750.00,0,'2025-08-13 20:18:30',NULL,NULL),
(102,1,1,3250.00,0,'2025-09-12 09:35:09',NULL,NULL),
(103,1,1,1600.00,0,'2025-10-28 15:04:34',NULL,NULL),
(104,1,1,5100.00,0,'2025-10-16 20:40:26',NULL,NULL),
(105,1,1,3100.00,0,'2025-09-17 11:43:19',NULL,NULL),
(106,1,1,6350.00,0,'2025-08-19 17:55:17',NULL,'seeded order'),
(107,1,1,700.00,0,'2025-09-08 06:53:13',NULL,NULL),
(108,1,1,4800.00,0,'2025-08-08 13:40:20',NULL,NULL),
(109,1,1,4400.00,0,'2025-08-23 15:50:02',NULL,NULL),
(110,1,1,11200.00,0,'2025-10-04 10:38:00',NULL,NULL),
(111,1,1,400.00,0,'2025-07-29 12:37:37',NULL,NULL),
(112,1,1,7200.00,0,'2025-08-10 07:10:41',NULL,NULL),
(113,1,1,1600.00,0,'2025-10-31 14:26:34',NULL,NULL),
(114,1,1,7200.00,0,'2025-09-24 16:15:46',NULL,'seeded order'),
(115,1,1,2200.00,0,'2025-10-15 11:28:53',NULL,NULL),
(116,1,1,6800.00,0,'2025-08-17 12:40:40',NULL,NULL),
(117,1,1,4000.00,0,'2025-08-24 10:45:11',NULL,'seeded order'),
(118,1,1,3400.00,0,'2025-09-08 15:08:22',NULL,NULL),
(119,1,1,2400.00,0,'2025-11-03 08:56:22',NULL,NULL),
(120,1,1,5600.00,0,'2025-08-30 09:24:10',NULL,'seeded order'),
(121,1,1,2700.00,0,'2025-10-18 15:35:07',NULL,NULL),
(122,1,NULL,2400.00,0,'2025-11-26 15:04:43',6,'Fındıkj fıstık'),
(123,1,NULL,800.00,0,'2025-11-26 15:07:32',6,NULL),
(124,1,NULL,3025.00,0,'2025-11-26 15:10:08',6,NULL),
(125,1,NULL,1050.00,1,'2025-11-28 00:14:34',7,NULL),
(126,1,NULL,1100.00,0,'2025-11-28 00:15:09',7,NULL),
(127,1,NULL,420.00,1,'2025-11-30 22:55:16',5,'Gorgonzola');
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `PendingUsers`
--

DROP TABLE IF EXISTS `PendingUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PendingUsers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `verificationToken` varchar(255) NOT NULL,
  `tokenExpiry` bigint(20) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `verificationToken` (`verificationToken`),
  KEY `idx_token` (`verificationToken`),
  KEY `idx_expiry` (`tokenExpiry`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PendingUsers`
--

LOCK TABLES `PendingUsers` WRITE;
/*!40000 ALTER TABLE `PendingUsers` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `PendingUsers` VALUES
(1,'ulasahin.666@gmail.com','$2b$10$nebe3JyuxaN9BQ9T4NU65OyRkkLnAs9OJ/A/2rAcr1vEAM8v84g9u','ulas','sahin','c2f625a9e1a9dd18979d1ed384fb35ba051e4895ddb022857f8050121b86d751',1764192719262,'2025-11-26 00:31:59'),
(2,'igokcekarakaya@gmail.com','$2b$10$NF6Y3ubLwubm9A1N2Yyedup22otoU6Aqbd0Az7CPGi5VpfS3GYgA.','gokce','karakaya','dcad8b7592251e7dc5b4335fc2c2e17a94c7ecfafdf9de069652e6fbb2763292',1764192767316,'2025-11-26 00:32:47'),
(5,'kemalfeyizoglu@gmail.com','$2b$10$YCpTueilXGXRus8/t5eE2.Fjdcy616Oz4FZFWIn5QTQZGuq1FgapG','Deniz','Kemal','92cb4f3da48444edc7968096ad338ea6675f9fd206db7f425b892a350853d7a1',1764416972868,'2025-11-26 14:49:32'),
(6,'zıkkım@sdjj.ol','$2b$10$LY32sPNNO7pvItm29qHoj.vxGsakL0ITL/RB3bwCKt7Maju4bFuQC','fhbdf','fdas','87f6eddb07fa02878ae45a323f3c66873b4d7e90522e4f8708fbd9e46d492ce1',1764417139807,'2025-11-26 14:52:19'),
(7,'adasd@dfsd.com','$2b$10$iyIKky47IYw7NTqogdpiaeqKg72CizhhUBwL/e1CPvbXxF.TZM9de','ulaş','şahin','6dad156220914781ba787d72e420e20d87b2626d08e6f173a24e635018b58a97',1764681193434,'2025-11-29 13:13:13');
/*!40000 ALTER TABLE `PendingUsers` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `usertype` enum('customer','staff','admin') DEFAULT 'customer',
  `branchId` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `basket` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT json_array() CHECK (json_valid(`basket`)),
  `refreshToken` varchar(255) DEFAULT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
  `resetTokenExpiry` bigint(20) DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `branchId` (`branchId`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`branchId`) REFERENCES `Branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `Users` VALUES
(1,'admin','$2b$10$FoeEMEDK7gG3x6UfrSpQC.ShHwJqeCYBjhqOt2ZfQtAdKJELWte6q',NULL,NULL,'admin',NULL,1,'[]',NULL,NULL,NULL,NULL,'2025-11-23 20:33:41'),
(7,'ulas.sahin.ist@gmail.com','$2b$10$yqm0idaSC3LP1Z0mp5W8me2PG.JLFOIjkR1o6paDKy1wywjlZC9su','ulas','sahin','customer',NULL,1,'[]',NULL,NULL,NULL,NULL,'2025-11-26 04:32:04');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-11-30 23:09:09
