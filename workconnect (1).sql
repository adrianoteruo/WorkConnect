-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 09/11/2025 às 19:45
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `workconnect`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `contatos`
--

CREATE TABLE `contatos` (
  `id` int(11) NOT NULL,
  `contratante_id` int(11) NOT NULL,
  `profissional_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `contatos`
--

INSERT INTO `contatos` (`id`, `contratante_id`, `profissional_id`, `created_at`) VALUES
(1, 2, 1, '2025-11-05 15:45:25'),
(5, 4, 3, '2025-11-06 23:26:56'),
(7, 2, 3, '2025-11-06 23:40:53'),
(8, 4, 1, '2025-11-08 17:22:55'),
(9, 2, 5, '2025-11-08 17:55:04'),
(10, 2, 56, '2025-11-08 17:56:12'),
(11, 2, 59, '2025-11-08 18:08:28'),
(12, 4, 5, '2025-11-08 18:14:30'),
(14, 4, 60, '2025-11-08 19:29:04'),
(15, 4, 71, '2025-11-08 19:32:05'),
(16, 106, 1, '2025-11-08 20:52:14'),
(17, 106, 5, '2025-11-08 21:22:55'),
(18, 106, 3, '2025-11-08 21:24:13');

-- --------------------------------------------------------

--
-- Estrutura para tabela `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `evaluated_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL COMMENT 'Nota de 1 a 5',
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `evaluations`
--

INSERT INTO `evaluations` (`id`, `evaluator_id`, `evaluated_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 2, 5, 'serviço excelente!', '2025-11-05 16:25:59'),
(2, 2, 1, 5, 'profissional de respeito!', '2025-11-07 23:20:10'),
(4, 1, 4, 4, 'top!', '2025-11-08 17:24:14'),
(5, 4, 1, 4, 'top!', '2025-11-08 17:24:46'),
(6, 1, 106, 5, 'top!', '2025-11-08 21:03:43'),
(7, 106, 1, 5, 'top!', '2025-11-08 21:04:43'),
(8, 106, 3, 5, 'top!', '2025-11-08 21:25:08'),
(9, 3, 106, 5, 'ggente boa!', '2025-11-08 21:25:43'),
(10, 2, 5, 4, 'gente boa', '2025-11-09 17:31:55'),
(11, 5, 2, 4, 'cara gente fina', '2025-11-09 17:32:22');

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message_text`, `created_at`) VALUES
(1, 2, 1, 'ola', '2025-11-05 15:45:54'),
(2, 1, 2, 'ola', '2025-11-05 15:46:12'),
(3, 3, 4, 'ola', '2025-11-06 23:27:48'),
(4, 4, 3, 'ola', '2025-11-06 23:28:20'),
(5, 2, 1, 'odf]', '2025-11-06 23:40:30'),
(6, 1, 4, 'ola', '2025-11-08 17:23:27'),
(7, 4, 1, 'ola', '2025-11-08 17:23:48'),
(8, 106, 1, 'ola', '2025-11-08 20:52:20'),
(9, 106, 5, 'ola', '2025-11-08 21:23:00'),
(10, 106, 3, 'ola', '2025-11-08 21:24:18'),
(11, 2, 5, 'ola', '2025-11-09 17:31:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `contratante_id` int(11) NOT NULL,
  `profissional_id` int(11) NOT NULL,
  `status` enum('pending','active','completion_requested','completed','cancelled') NOT NULL DEFAULT 'pending',
  `requested_by_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `services`
--

INSERT INTO `services` (`id`, `contratante_id`, `profissional_id`, `status`, `requested_by_id`, `created_at`, `started_at`, `completed_at`) VALUES
(1, 2, 1, 'completed', NULL, '2025-11-07 23:16:42', '2025-11-07 20:17:02', '2025-11-07 20:18:40'),
(2, 4, 3, 'pending', NULL, '2025-11-08 17:23:00', NULL, NULL),
(3, 4, 1, 'completed', NULL, '2025-11-08 17:23:42', '2025-11-08 14:24:01', '2025-11-08 14:24:05'),
(4, 106, 1, 'completed', NULL, '2025-11-08 20:52:22', '2025-11-08 18:03:19', '2025-11-08 18:03:25'),
(5, 106, 5, 'completed', NULL, '2025-11-08 21:23:01', '2025-11-08 18:23:18', '2025-11-08 18:23:22'),
(6, 106, 3, 'completed', 3, '2025-11-08 21:24:19', '2025-11-08 18:24:34', '2025-11-08 18:24:50'),
(7, 2, 5, 'completed', 5, '2025-11-09 17:31:07', '2025-11-09 14:31:26', '2025-11-09 14:31:43');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('Contratante','Profissional','Admin') NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `rua` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `servico_oferecido` varchar(255) DEFAULT NULL,
  `descricao_servico` text DEFAULT NULL,
  `busca_servico` varchar(255) DEFAULT NULL,
  `lgpd_consent` tinyint(1) NOT NULL DEFAULT 0,
  `lgpd_consent_timestamp` timestamp NULL DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `nome_completo`, `telefone`, `cep`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `servico_oferecido`, `descricao_servico`, `busca_servico`, `lgpd_consent`, `lgpd_consent_timestamp`, `reset_token`, `reset_token_expires`, `created_at`) VALUES
(1, 'adriano', '$2b$10$vA2m05FdxuCSiKb7Gd3UzOK6SuDJOe.qVOAl63H0jsfPU8NkdXVhO', 'adrianoteruo@gmail.com', 'Profissional', 'adriano shibuya', '11 97431-8159', '08710410', 'Rua Braz Cubas', '246', 'comercio', 'Centro', 'Mogi das Cruzes', 'SP', 'encanador', 'serviços rápidos de encanador', '', 0, NULL, NULL, NULL, '2025-11-05 15:43:19'),
(2, 'joão', '$2b$10$8JvT8y5ar/8eBDHfBAUWfeCurMcRdp5yHpvxTiGCQ1xt/8EfO5pwe', 'joao@gmail.com', 'Contratante', 'joão vitor', '11 999888777', '08710000', 'Rua Professor Flaviano de Melo', '213', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'encanador', 0, NULL, NULL, NULL, '2025-11-05 15:45:04'),
(3, 'mario', '$2b$10$0u2U312x/Rg0W/zWlAQQnOB9CydvO7QF7WekOlnukh81neYWT8SXa', 'mario@gmail.com', 'Profissional', 'mario brod', '1231231233', '08710410', 'Rua Braz Cubas', '12', '', 'Centro', 'Mogi das Cruzes', 'SP', 'pedreiro', 'obras', '', 0, NULL, NULL, NULL, '2025-11-06 23:25:15'),
(4, 'ronaldo', '$2b$10$LAveQZnPUxLsPzaFx7Dx6etx7HXAwdDkWwKLDgAalR3x0mxHbzc2W', 'ronaldo@email.com', 'Contratante', 'ronaldo', '1326455', '08710410', 'Rua Braz Cubas', '12', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-06 23:26:40'),
(5, 'leandro', '$2b$10$CuvZTHAO/m/1mH6ClINtv.pjCxuUDcBqNRxZ/Hge9Au3kXFTBNm2.', 'leandro@email.com', 'Profissional', 'leandro leandro', '1232546', '08710410', 'Rua Braz Cubas', '12', '12', 'Centro', 'Mogi das Cruzes', 'SP', 'encanador', 'serviços de encanamento em geral', '', 0, NULL, NULL, NULL, '2025-11-06 23:39:11'),
(6, 'contratante1', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante1@email.com', 'Contratante', 'Contratante 1', '11999990001', '08710001', 'Rua das Flores 1', '1', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(7, 'contratante2', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante2@email.com', 'Contratante', 'Contratante 2', '11999990002', '08710002', 'Rua das Flores 2', '2', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(8, 'contratante3', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante3@email.com', 'Contratante', 'Contratante 3', '11999990003', '08710003', 'Rua das Flores 3', '3', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(9, 'contratante4', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante4@email.com', 'Contratante', 'Contratante 4', '11999990004', '08710004', 'Rua das Flores 4', '4', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(10, 'contratante5', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante5@email.com', 'Contratante', 'Contratante 5', '11999990005', '08710005', 'Rua das Flores 5', '5', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(11, 'contratante6', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante6@email.com', 'Contratante', 'Contratante 6', '11999990006', '08710006', 'Rua das Flores 6', '6', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(12, 'contratante7', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante7@email.com', 'Contratante', 'Contratante 7', '11999990007', '08710007', 'Rua das Flores 7', '7', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(13, 'contratante8', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante8@email.com', 'Contratante', 'Contratante 8', '11999990008', '08710008', 'Rua das Flores 8', '8', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(14, 'contratante9', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante9@email.com', 'Contratante', 'Contratante 9', '11999990009', '08710009', 'Rua das Flores 9', '9', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(15, 'contratante10', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante10@email.com', 'Contratante', 'Contratante 10', '11999990010', '08710010', 'Rua das Flores 10', '10', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(16, 'contratante11', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante11@email.com', 'Contratante', 'Contratante 11', '11999990011', '08710011', 'Rua das Flores 11', '11', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(17, 'contratante12', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante12@email.com', 'Contratante', 'Contratante 12', '11999990012', '08710012', 'Rua das Flores 12', '12', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(18, 'contratante13', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante13@email.com', 'Contratante', 'Contratante 13', '11999990013', '08710013', 'Rua das Flores 13', '13', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(19, 'contratante14', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante14@email.com', 'Contratante', 'Contratante 14', '11999990014', '08710014', 'Rua das Flores 14', '14', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(20, 'contratante15', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante15@email.com', 'Contratante', 'Contratante 15', '11999990015', '08710015', 'Rua das Flores 15', '15', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(21, 'contratante16', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante16@email.com', 'Contratante', 'Contratante 16', '11999990016', '08710016', 'Rua das Flores 16', '16', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(22, 'contratante17', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante17@email.com', 'Contratante', 'Contratante 17', '11999990017', '08710017', 'Rua das Flores 17', '17', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(23, 'contratante18', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante18@email.com', 'Contratante', 'Contratante 18', '11999990018', '08710018', 'Rua das Flores 18', '18', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(24, 'contratante19', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante19@email.com', 'Contratante', 'Contratante 19', '11999990019', '08710019', 'Rua das Flores 19', '19', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(25, 'contratante20', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante20@email.com', 'Contratante', 'Contratante 20', '11999990020', '08710020', 'Rua das Flores 20', '20', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(26, 'contratante21', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante21@email.com', 'Contratante', 'Contratante 21', '11999990021', '08710021', 'Rua das Flores 21', '21', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(27, 'contratante22', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante22@email.com', 'Contratante', 'Contratante 22', '11999990022', '08710022', 'Rua das Flores 22', '22', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(28, 'contratante23', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante23@email.com', 'Contratante', 'Contratante 23', '11999990023', '08710023', 'Rua das Flores 23', '23', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(29, 'contratante24', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante24@email.com', 'Contratante', 'Contratante 24', '11999990024', '08710024', 'Rua das Flores 24', '24', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(30, 'contratante25', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante25@email.com', 'Contratante', 'Contratante 25', '11999990025', '08710025', 'Rua das Flores 25', '25', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(31, 'contratante26', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante26@email.com', 'Contratante', 'Contratante 26', '11999990026', '08710026', 'Rua das Flores 26', '26', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(32, 'contratante27', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante27@email.com', 'Contratante', 'Contratante 27', '11999990027', '08710027', 'Rua das Flores 27', '27', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(33, 'contratante28', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante28@email.com', 'Contratante', 'Contratante 28', '11999990028', '08710028', 'Rua das Flores 28', '28', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(34, 'contratante29', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante29@email.com', 'Contratante', 'Contratante 29', '11999990029', '08710029', 'Rua das Flores 29', '29', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(35, 'contratante30', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante30@email.com', 'Contratante', 'Contratante 30', '11999990030', '08710030', 'Rua das Flores 30', '30', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(36, 'contratante31', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante31@email.com', 'Contratante', 'Contratante 31', '11999990031', '08710031', 'Rua das Flores 31', '31', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(37, 'contratante32', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante32@email.com', 'Contratante', 'Contratante 32', '11999990032', '08710032', 'Rua das Flores 32', '32', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(38, 'contratante33', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante33@email.com', 'Contratante', 'Contratante 33', '11999990033', '08710033', 'Rua das Flores 33', '33', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(39, 'contratante34', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante34@email.com', 'Contratante', 'Contratante 34', '11999990034', '08710034', 'Rua das Flores 34', '34', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(40, 'contratante35', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante35@email.com', 'Contratante', 'Contratante 35', '11999990035', '08710035', 'Rua das Flores 35', '35', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(41, 'contratante36', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante36@email.com', 'Contratante', 'Contratante 36', '11999990036', '08710036', 'Rua das Flores 36', '36', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(42, 'contratante37', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante37@email.com', 'Contratante', 'Contratante 37', '11999990037', '08710037', 'Rua das Flores 37', '37', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(43, 'contratante38', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante38@email.com', 'Contratante', 'Contratante 38', '11999990038', '08710038', 'Rua das Flores 38', '38', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(44, 'contratante39', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante39@email.com', 'Contratante', 'Contratante 39', '11999990039', '08710039', 'Rua das Flores 39', '39', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(45, 'contratante40', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante40@email.com', 'Contratante', 'Contratante 40', '11999990040', '08710040', 'Rua das Flores 40', '40', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(46, 'contratante41', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante41@email.com', 'Contratante', 'Contratante 41', '11999990041', '08710041', 'Rua das Flores 41', '41', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(47, 'contratante42', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante42@email.com', 'Contratante', 'Contratante 42', '11999990042', '08710042', 'Rua das Flores 42', '42', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(48, 'contratante43', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante43@email.com', 'Contratante', 'Contratante 43', '11999990043', '08710043', 'Rua das Flores 43', '43', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(49, 'contratante44', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante44@email.com', 'Contratante', 'Contratante 44', '11999990044', '08710044', 'Rua das Flores 44', '44', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(50, 'contratante45', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante45@email.com', 'Contratante', 'Contratante 45', '11999990045', '08710045', 'Rua das Flores 45', '45', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(51, 'contratante46', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante46@email.com', 'Contratante', 'Contratante 46', '11999990046', '08710046', 'Rua das Flores 46', '46', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(52, 'contratante47', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante47@email.com', 'Contratante', 'Contratante 47', '11999990047', '08710047', 'Rua das Flores 47', '47', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(53, 'contratante48', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante48@email.com', 'Contratante', 'Contratante 48', '11999990048', '08710048', 'Rua das Flores 48', '48', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(54, 'contratante49', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante49@email.com', 'Contratante', 'Contratante 49', '11999990049', '08710049', 'Rua das Flores 49', '49', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(55, 'contratante50', '$2b$10$123456789012345678901u8NkdXVhO', 'contratante50@email.com', 'Contratante', 'Contratante 50', '11999990050', '08710050', 'Rua das Flores 50', '50', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(56, 'profissional1', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional1@email.com', 'Profissional', 'Profissional 1', '11888880001', '08720001', 'Rua dos Trabalhadores 1', '1', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico1', 'Descrição do serviço 1', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(57, 'profissional2', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional2@email.com', 'Profissional', 'Profissional 2', '11888880002', '08720002', 'Rua dos Trabalhadores 2', '2', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico2', 'Descrição do serviço 2', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(58, 'profissional3', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional3@email.com', 'Profissional', 'Profissional 3', '11888880003', '08720003', 'Rua dos Trabalhadores 3', '3', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico3', 'Descrição do serviço 3', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(59, 'profissional4', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional4@email.com', 'Profissional', 'Profissional 4', '11888880004', '08720004', 'Rua dos Trabalhadores 4', '4', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico4', 'Descrição do serviço 4', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(60, 'profissional5', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional5@email.com', 'Profissional', 'Profissional 5', '11888880005', '08720005', 'Rua dos Trabalhadores 5', '5', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico5', 'Descrição do serviço 5', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(61, 'profissional6', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional6@email.com', 'Profissional', 'Profissional 6', '11888880006', '08720006', 'Rua dos Trabalhadores 6', '6', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico6', 'Descrição do serviço 6', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(62, 'profissional7', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional7@email.com', 'Profissional', 'Profissional 7', '11888880007', '08720007', 'Rua dos Trabalhadores 7', '7', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico7', 'Descrição do serviço 7', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(63, 'profissional8', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional8@email.com', 'Profissional', 'Profissional 8', '11888880008', '08720008', 'Rua dos Trabalhadores 8', '8', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico8', 'Descrição do serviço 8', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(64, 'profissional9', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional9@email.com', 'Profissional', 'Profissional 9', '11888880009', '08720009', 'Rua dos Trabalhadores 9', '9', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico9', 'Descrição do serviço 9', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(65, 'profissional10', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional10@email.com', 'Profissional', 'Profissional 10', '11888880010', '08720010', 'Rua dos Trabalhadores 10', '10', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico10', 'Descrição do serviço 10', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(66, 'profissional11', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional11@email.com', 'Profissional', 'Profissional 11', '11888880011', '08720011', 'Rua dos Trabalhadores 11', '11', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico11', 'Descrição do serviço 11', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(67, 'profissional12', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional12@email.com', 'Profissional', 'Profissional 12', '11888880012', '08720012', 'Rua dos Trabalhadores 12', '12', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico12', 'Descrição do serviço 12', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(68, 'profissional13', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional13@email.com', 'Profissional', 'Profissional 13', '11888880013', '08720013', 'Rua dos Trabalhadores 13', '13', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico13', 'Descrição do serviço 13', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(69, 'profissional14', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional14@email.com', 'Profissional', 'Profissional 14', '11888880014', '08720014', 'Rua dos Trabalhadores 14', '14', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico14', 'Descrição do serviço 14', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(70, 'profissional15', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional15@email.com', 'Profissional', 'Profissional 15', '11888880015', '08720015', 'Rua dos Trabalhadores 15', '15', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico15', 'Descrição do serviço 15', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(71, 'profissional16', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional16@email.com', 'Profissional', 'Profissional 16', '11888880016', '08720016', 'Rua dos Trabalhadores 16', '16', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico16', 'Descrição do serviço 16', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(72, 'profissional17', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional17@email.com', 'Profissional', 'Profissional 17', '11888880017', '08720017', 'Rua dos Trabalhadores 17', '17', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico17', 'Descrição do serviço 17', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(73, 'profissional18', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional18@email.com', 'Profissional', 'Profissional 18', '11888880018', '08720018', 'Rua dos Trabalhadores 18', '18', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico18', 'Descrição do serviço 18', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(74, 'profissional19', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional19@email.com', 'Profissional', 'Profissional 19', '11888880019', '08720019', 'Rua dos Trabalhadores 19', '19', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico19', 'Descrição do serviço 19', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(75, 'profissional20', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional20@email.com', 'Profissional', 'Profissional 20', '11888880020', '08720020', 'Rua dos Trabalhadores 20', '20', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico20', 'Descrição do serviço 20', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(76, 'profissional21', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional21@email.com', 'Profissional', 'Profissional 21', '11888880021', '08720021', 'Rua dos Trabalhadores 21', '21', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico21', 'Descrição do serviço 21', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(77, 'profissional22', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional22@email.com', 'Profissional', 'Profissional 22', '11888880022', '08720022', 'Rua dos Trabalhadores 22', '22', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico22', 'Descrição do serviço 22', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(78, 'profissional23', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional23@email.com', 'Profissional', 'Profissional 23', '11888880023', '08720023', 'Rua dos Trabalhadores 23', '23', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico23', 'Descrição do serviço 23', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(79, 'profissional24', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional24@email.com', 'Profissional', 'Profissional 24', '11888880024', '08720024', 'Rua dos Trabalhadores 24', '24', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico24', 'Descrição do serviço 24', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(80, 'profissional25', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional25@email.com', 'Profissional', 'Profissional 25', '11888880025', '08720025', 'Rua dos Trabalhadores 25', '25', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico25', 'Descrição do serviço 25', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(81, 'profissional26', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional26@email.com', 'Profissional', 'Profissional 26', '11888880026', '08720026', 'Rua dos Trabalhadores 26', '26', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico26', 'Descrição do serviço 26', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(82, 'profissional27', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional27@email.com', 'Profissional', 'Profissional 27', '11888880027', '08720027', 'Rua dos Trabalhadores 27', '27', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico27', 'Descrição do serviço 27', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(83, 'profissional28', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional28@email.com', 'Profissional', 'Profissional 28', '11888880028', '08720028', 'Rua dos Trabalhadores 28', '28', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico28', 'Descrição do serviço 28', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(84, 'profissional29', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional29@email.com', 'Profissional', 'Profissional 29', '11888880029', '08720029', 'Rua dos Trabalhadores 29', '29', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico29', 'Descrição do serviço 29', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(85, 'profissional30', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional30@email.com', 'Profissional', 'Profissional 30', '11888880030', '08720030', 'Rua dos Trabalhadores 30', '30', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico30', 'Descrição do serviço 30', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(86, 'profissional31', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional31@email.com', 'Profissional', 'Profissional 31', '11888880031', '08720031', 'Rua dos Trabalhadores 31', '31', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico31', 'Descrição do serviço 31', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(87, 'profissional32', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional32@email.com', 'Profissional', 'Profissional 32', '11888880032', '08720032', 'Rua dos Trabalhadores 32', '32', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico32', 'Descrição do serviço 32', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(88, 'profissional33', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional33@email.com', 'Profissional', 'Profissional 33', '11888880033', '08720033', 'Rua dos Trabalhadores 33', '33', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico33', 'Descrição do serviço 33', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(89, 'profissional34', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional34@email.com', 'Profissional', 'Profissional 34', '11888880034', '08720034', 'Rua dos Trabalhadores 34', '34', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico34', 'Descrição do serviço 34', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(90, 'profissional35', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional35@email.com', 'Profissional', 'Profissional 35', '11888880035', '08720035', 'Rua dos Trabalhadores 35', '35', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico35', 'Descrição do serviço 35', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(91, 'profissional36', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional36@email.com', 'Profissional', 'Profissional 36', '11888880036', '08720036', 'Rua dos Trabalhadores 36', '36', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico36', 'Descrição do serviço 36', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(92, 'profissional37', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional37@email.com', 'Profissional', 'Profissional 37', '11888880037', '08720037', 'Rua dos Trabalhadores 37', '37', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico37', 'Descrição do serviço 37', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(93, 'profissional38', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional38@email.com', 'Profissional', 'Profissional 38', '11888880038', '08720038', 'Rua dos Trabalhadores 38', '38', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico38', 'Descrição do serviço 38', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(94, 'profissional39', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional39@email.com', 'Profissional', 'Profissional 39', '11888880039', '08720039', 'Rua dos Trabalhadores 39', '39', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico39', 'Descrição do serviço 39', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(95, 'profissional40', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional40@email.com', 'Profissional', 'Profissional 40', '11888880040', '08720040', 'Rua dos Trabalhadores 40', '40', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico40', 'Descrição do serviço 40', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(96, 'profissional41', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional41@email.com', 'Profissional', 'Profissional 41', '11888880041', '08720041', 'Rua dos Trabalhadores 41', '41', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico41', 'Descrição do serviço 41', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(97, 'profissional42', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional42@email.com', 'Profissional', 'Profissional 42', '11888880042', '08720042', 'Rua dos Trabalhadores 42', '42', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico42', 'Descrição do serviço 42', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(98, 'profissional43', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional43@email.com', 'Profissional', 'Profissional 43', '11888880043', '08720043', 'Rua dos Trabalhadores 43', '43', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico43', 'Descrição do serviço 43', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(99, 'profissional44', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional44@email.com', 'Profissional', 'Profissional 44', '11888880044', '08720044', 'Rua dos Trabalhadores 44', '44', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico44', 'Descrição do serviço 44', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(100, 'profissional45', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional45@email.com', 'Profissional', 'Profissional 45', '11888880045', '08720045', 'Rua dos Trabalhadores 45', '45', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico45', 'Descrição do serviço 45', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(101, 'profissional46', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional46@email.com', 'Profissional', 'Profissional 46', '11888880046', '08720046', 'Rua dos Trabalhadores 46', '46', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico46', 'Descrição do serviço 46', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(102, 'profissional47', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional47@email.com', 'Profissional', 'Profissional 47', '11888880047', '08720047', 'Rua dos Trabalhadores 47', '47', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico47', 'Descrição do serviço 47', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(103, 'profissional48', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional48@email.com', 'Profissional', 'Profissional 48', '11888880048', '08720048', 'Rua dos Trabalhadores 48', '48', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico48', 'Descrição do serviço 48', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(104, 'profissional49', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional49@email.com', 'Profissional', 'Profissional 49', '11888880049', '08720049', 'Rua dos Trabalhadores 49', '49', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico49', 'Descrição do serviço 49', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(105, 'profissional50', '$2b$10$123456789012345678901u8NkdXVhO', 'profissional50@email.com', 'Profissional', 'Profissional 50', '11888880050', '08720050', 'Rua dos Trabalhadores 50', '50', '', 'Vila Nova', 'Mogi das Cruzes', 'SP', 'servico50', 'Descrição do serviço 50', '', 0, NULL, NULL, NULL, '2025-11-08 20:44:17'),
(106, 'amaral', '$2b$10$01N8hOHZGEKTTor8d8VcxuPlmUVBSbnsinKefGcK94hTGPR2bfBQS', 'amaral@email.com', 'Contratante', 'amaral', '232323', '08710500', 'Avenida Voluntário Fernando Pinheiro Franco', '12', '', 'Centro', 'Mogi das Cruzes', 'SP', '', '', 'pedreiro', 0, NULL, NULL, NULL, '2025-11-08 20:51:50'),
(107, 'admin', '$2b$10$UgAyRRQjXK.aovZwm.okruJ8UeP5BO00lVHupbtnf8/Ah21lyBunW', 'admin@workconnect.com', 'Admin', 'Administrador do Sistema', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-09 18:10:09', NULL, NULL, '2025-11-09 18:10:09');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `contatos`
--
ALTER TABLE `contatos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_contact` (`contratante_id`,`profissional_id`),
  ADD KEY `profissional_id` (`profissional_id`);

--
-- Índices de tabela `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_evaluation` (`evaluator_id`,`evaluated_id`),
  ADD KEY `evaluated_id` (`evaluated_id`);

--
-- Índices de tabela `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Índices de tabela `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contratante_id` (`contratante_id`),
  ADD KEY `profissional_id` (`profissional_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `contatos`
--
ALTER TABLE `contatos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `contatos`
--
ALTER TABLE `contatos`
  ADD CONSTRAINT `contatos_ibfk_1` FOREIGN KEY (`contratante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contatos_ibfk_2` FOREIGN KEY (`profissional_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`evaluated_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`contratante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `services_ibfk_2` FOREIGN KEY (`profissional_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
