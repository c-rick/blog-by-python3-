-- MySQL dump 10.13  Distrib 5.7.19, for osx10.12 (x86_64)
--
-- Host: localhost    Database: awesome
-- ------------------------------------------------------
-- Server version	5.7.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blogs` (
  `id` varchar(50) NOT NULL,
  `author_id` varchar(50) NOT NULL DEFAULT '',
  `title` varchar(200) NOT NULL DEFAULT '',
  `content` mediumtext NOT NULL,
  `created_at` double NOT NULL,
  `type` varchar(11) DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES ('00150656784068527ada2036f8e45bd99ee81f1dd1ba911000','001506504394938343b4741a49541cebaf026d864cd2792000','萨看得见哈就开始大哭','阿森老大看见阿莱克斯家里看得见阿莱克斯觉得克拉就是打开啦就是快乐的阿森肯德基阿莱克斯觉得克拉就是肚脐问题如果哈减肥计划赶快进去Salk 地区给大家卡是打开链接啊阿森来得及哦 i 我花钱大手大脚卡空间阿森，的卡拉斯京的空间',1506567840.685807,'html'),('0015065694170145c9f7d67886c428ba3d56aadd334419a000','00150656926537592a818c1c1c5452f98592dcc69651bc7000','我的乾坤博客','今天是星期哦，金天完成博客的增删改查',1506569417.0141928,'js'),('001506588093029069f687acada4186913966127273f8b1000','001506504394938343b4741a49541cebaf026d864cd2792000','About Portal.js','This library aim at providing a widget mashup UI like netvibes, iGoogle or Java portals. To use the lib, write something like :\n\nvar portal = Portal.bootstrap({\n    userId: \'1234567890\',\n    adminMode: true,\n    apiRootUrl: \'/portal/services\',\n    container: \'myDivContainer\'\n})\ntest\n1',1506588093.029621,'css'),('001507601516692cadcaa4bf44143559675dbe2e6b94396000','001506504394938343b4741a49541cebaf026d864cd2792000','asd','123123',1507601516.692344,'css'),('0015076015229799cd876cbca7e4941bdda2d4ee0ed1571000','001506504394938343b4741a49541cebaf026d864cd2792000','123123','1ase123',1507601522.9790568,NULL),('00150760152835241807f41b2d348ea901947a67ef96bb2000','001506504394938343b4741a49541cebaf026d864cd2792000','asd','12312',1507601528.3529851,'js'),('0015076015339621fe115cd5d9d4eb2a1ccdf2b3ebc53cd000','001506504394938343b4741a49541cebaf026d864cd2792000','sadasd','123123',1507601533.9625971,'js'),('001507606942055473107bf9af44c5bbdabf09014d796ce000','001506504394938343b4741a49541cebaf026d864cd2792000','sa','asd12312312',1507606942.056142,'js');
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` varchar(50) NOT NULL,
  `blog_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `user_image` varchar(500) NOT NULL,
  `content` mediumtext NOT NULL,
  `created_at` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `passwd` varchar(50) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  `name` varchar(50) NOT NULL,
  `image` varchar(500) DEFAULT '',
  `created_at` double NOT NULL,
  `types` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('001505792717905853a137a05094b15bdb3edf129ed0c8c000','test@example.com','1234567890',0,'Test','about:blank',1505792717.90478,NULL),('001506504394938343b4741a49541cebaf026d864cd2792000','1196363729@qq.com','123456',1,'rick','./upload/1506506158421762.jpeg',1506504394.93821,'js,css,html'),('00150656926537592a818c1c1c5452f98592dcc69651bc7000','123123@qq.com','123',1,'撒旦阿斯顿九块九','./upload/15065692822862.png',1506569265.376016,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-10-27 17:32:15
