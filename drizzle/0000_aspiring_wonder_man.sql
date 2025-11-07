CREATE TABLE `assinaturas` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`plano_id` varchar(36) NOT NULL,
	`status` enum('ATIVA','CANCELADA','EXPIRADA','SUSPENSA','PENDENTE') NOT NULL DEFAULT 'PENDENTE',
	`data_inicio` date NOT NULL,
	`data_fim` date NOT NULL,
	`renovacao_automatica` boolean NOT NULL DEFAULT true,
	`pagarme_subscription_id` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assinaturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assuntos` (
	`id` varchar(36) NOT NULL,
	`disciplina_id` varchar(36) NOT NULL,
	`nome` varchar(150) NOT NULL,
	`descricao` text,
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assuntos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cronograma` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`data` date NOT NULL,
	`atividade` varchar(255) NOT NULL,
	`tipo` enum('ESTUDO','QUESTOES','REVISAO') NOT NULL,
	`disciplina_id` varchar(36),
	`concluido` boolean NOT NULL DEFAULT false,
	`tempo_planejado` int,
	`tempo_realizado` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cronograma_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disciplinas` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`cor_hex` varchar(7) NOT NULL DEFAULT '#4F46E5',
	`icone` varchar(50),
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `disciplinas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `estatisticas_diarias` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`data` date NOT NULL,
	`questoes_resolvidas` int NOT NULL DEFAULT 0,
	`questoes_corretas` int NOT NULL DEFAULT 0,
	`tempo_estudo` int NOT NULL DEFAULT 0,
	`materiais_estudados` int NOT NULL DEFAULT 0,
	`streak_ativo` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `estatisticas_diarias_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_data` UNIQUE(`user_id`,`data`)
);
--> statement-breakpoint
CREATE TABLE `forum_respostas` (
	`id` varchar(36) NOT NULL,
	`topico_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`conteudo` text NOT NULL,
	`melhor_resposta` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_respostas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_topicos` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`disciplina_id` varchar(36),
	`visualizacoes` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_topicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materiais` (
	`id` varchar(36) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('PDF','VIDEO','AUDIO','LINK') NOT NULL,
	`disciplina_id` varchar(36) NOT NULL,
	`assunto_id` varchar(36),
	`topico_id` varchar(36),
	`url_arquivo` varchar(500),
	`file_key` varchar(500),
	`duracao` int,
	`tamanho` int,
	`mime_type` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materiais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materiais_acessos` (
	`id` varchar(36) NOT NULL,
	`material_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`dispositivo_id` varchar(255),
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materiais_acessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materiais_estudados` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`material_id` varchar(36) NOT NULL,
	`progresso` int NOT NULL DEFAULT 0,
	`tempo_estudo` int NOT NULL DEFAULT 0,
	`ultima_visualizacao` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materiais_estudados_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_material` UNIQUE(`user_id`,`material_id`)
);
--> statement-breakpoint
CREATE TABLE `metas` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('QUESTOES','MATERIAIS','HORAS') NOT NULL,
	`valor_alvo` int NOT NULL,
	`valor_atual` int NOT NULL DEFAULT 0,
	`prazo` date NOT NULL,
	`concluida` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` varchar(36) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`tipo` enum('INFO','ALERTA','URGENTE') NOT NULL DEFAULT 'INFO',
	`publicado` boolean NOT NULL DEFAULT false,
	`data_publicacao` timestamp,
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos` (
	`id` varchar(36) NOT NULL,
	`assinatura_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`status` enum('PENDENTE','PAGO','CANCELADO','ESTORNADO','FALHOU') NOT NULL DEFAULT 'PENDENTE',
	`metodo_pagamento` enum('CREDIT_CARD','BOLETO','PIX') NOT NULL,
	`pagarme_transaction_id` varchar(100),
	`pagarme_charge_id` varchar(100),
	`data_vencimento` date,
	`data_pagamento` timestamp,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pagamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planos` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`preco` decimal(10,2) NOT NULL,
	`duracao_meses` int NOT NULL,
	`recursos` json NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`destaque` boolean NOT NULL DEFAULT false,
	`ordem` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progresso_assuntos` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`assunto_id` varchar(36) NOT NULL,
	`nivel_dominio` int NOT NULL DEFAULT 0,
	`questoes_resolvidas` int NOT NULL DEFAULT 0,
	`questoes_corretas` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `progresso_assuntos_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_assunto` UNIQUE(`user_id`,`assunto_id`)
);
--> statement-breakpoint
CREATE TABLE `progresso_disciplinas` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`disciplina_id` varchar(36) NOT NULL,
	`nivel_dominio` int NOT NULL DEFAULT 0,
	`questoes_resolvidas` int NOT NULL DEFAULT 0,
	`questoes_corretas` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `progresso_disciplinas_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_disciplina` UNIQUE(`user_id`,`disciplina_id`)
);
--> statement-breakpoint
CREATE TABLE `questoes` (
	`id` varchar(36) NOT NULL,
	`enunciado` text NOT NULL,
	`alternativas` json NOT NULL,
	`gabarito` varchar(1) NOT NULL,
	`disciplina_id` varchar(36) NOT NULL,
	`assunto_id` varchar(36),
	`topico_id` varchar(36),
	`banca` varchar(100),
	`ano` int,
	`dificuldade` enum('FACIL','MEDIO','DIFICIL'),
	`explicacao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questoes_resolvidas` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`questao_id` varchar(36) NOT NULL,
	`resposta` varchar(1) NOT NULL,
	`correta` boolean NOT NULL,
	`tempo_resolucao` int,
	`data_resolucao` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questoes_resolvidas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`revoked` boolean NOT NULL DEFAULT false,
	`dispositivo_id` varchar(255),
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_token_hash_unique` UNIQUE(`token_hash`),
	CONSTRAINT `idx_token_hash` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `streak_questoes` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`streak_atual` int NOT NULL DEFAULT 0,
	`melhor_streak` int NOT NULL DEFAULT 0,
	`ultima_data` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streak_questoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `streak_questoes_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `idx_user_id` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(500) NOT NULL,
	`type` enum('EMAIL_VERIFICATION','PASSWORD_RESET') NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `topicos` (
	`id` varchar(36) NOT NULL,
	`assunto_id` varchar(36) NOT NULL,
	`nome` varchar(200) NOT NULL,
	`descricao` text,
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`nome_completo` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`password_version` int NOT NULL DEFAULT 1,
	`data_nascimento` date NOT NULL,
	`email_verificado` boolean NOT NULL DEFAULT false,
	`role` enum('ALUNO','ADMIN') NOT NULL DEFAULT 'ALUNO',
	`avatar_url` varchar(500),
	`telefone` varchar(20),
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_cpf_unique` UNIQUE(`cpf`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `webhooks_pagarme` (
	`id` varchar(36) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`event_id` varchar(100) NOT NULL,
	`payload` json NOT NULL,
	`processed` boolean NOT NULL DEFAULT false,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`processed_at` timestamp,
	CONSTRAINT `webhooks_pagarme_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `assinaturas` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_plano_id` ON `assinaturas` (`plano_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `assinaturas` (`status`);--> statement-breakpoint
CREATE INDEX `idx_data_fim` ON `assinaturas` (`data_fim`);--> statement-breakpoint
CREATE INDEX `idx_pagarme_sub` ON `assinaturas` (`pagarme_subscription_id`);--> statement-breakpoint
CREATE INDEX `idx_disciplina_id` ON `assuntos` (`disciplina_id`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `assuntos` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_ordem` ON `assuntos` (`ordem`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `cronograma` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_data` ON `cronograma` (`data`);--> statement-breakpoint
CREATE INDEX `idx_disciplina_id` ON `cronograma` (`disciplina_id`);--> statement-breakpoint
CREATE INDEX `idx_concluido` ON `cronograma` (`concluido`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `disciplinas` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_ordem` ON `disciplinas` (`ordem`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `estatisticas_diarias` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_data` ON `estatisticas_diarias` (`data`);--> statement-breakpoint
CREATE INDEX `idx_topico_id` ON `forum_respostas` (`topico_id`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `forum_respostas` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `forum_respostas` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `forum_topicos` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_disciplina_id` ON `forum_topicos` (`disciplina_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `forum_topicos` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_disciplina_id` ON `materiais` (`disciplina_id`);--> statement-breakpoint
CREATE INDEX `idx_assunto_id` ON `materiais` (`assunto_id`);--> statement-breakpoint
CREATE INDEX `idx_topico_id` ON `materiais` (`topico_id`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `materiais` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_material_id` ON `materiais_acessos` (`material_id`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `materiais_acessos` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `materiais_acessos` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `materiais_estudados` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_material_id` ON `materiais_estudados` (`material_id`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `metas` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_prazo` ON `metas` (`prazo`);--> statement-breakpoint
CREATE INDEX `idx_concluida` ON `metas` (`concluida`);--> statement-breakpoint
CREATE INDEX `idx_publicado` ON `notices` (`publicado`);--> statement-breakpoint
CREATE INDEX `idx_data_publicacao` ON `notices` (`data_publicacao`);--> statement-breakpoint
CREATE INDEX `idx_assinatura_id` ON `pagamentos` (`assinatura_id`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `pagamentos` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `pagamentos` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pagarme_transaction` ON `pagamentos` (`pagarme_transaction_id`);--> statement-breakpoint
CREATE INDEX `idx_pagarme_charge` ON `pagamentos` (`pagarme_charge_id`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `planos` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_ordem` ON `planos` (`ordem`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `progresso_assuntos` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_assunto_id` ON `progresso_assuntos` (`assunto_id`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `progresso_disciplinas` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_disciplina_id` ON `progresso_disciplinas` (`disciplina_id`);--> statement-breakpoint
CREATE INDEX `idx_disciplina_id` ON `questoes` (`disciplina_id`);--> statement-breakpoint
CREATE INDEX `idx_assunto_id` ON `questoes` (`assunto_id`);--> statement-breakpoint
CREATE INDEX `idx_topico_id` ON `questoes` (`topico_id`);--> statement-breakpoint
CREATE INDEX `idx_banca` ON `questoes` (`banca`);--> statement-breakpoint
CREATE INDEX `idx_ano` ON `questoes` (`ano`);--> statement-breakpoint
CREATE INDEX `idx_dificuldade` ON `questoes` (`dificuldade`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `questoes` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `questoes_resolvidas` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_questao_id` ON `questoes_resolvidas` (`questao_id`);--> statement-breakpoint
CREATE INDEX `idx_data_resolucao` ON `questoes_resolvidas` (`data_resolucao`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_expires` ON `refresh_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_token` ON `tokens` (`token`);--> statement-breakpoint
CREATE INDEX `idx_expires` ON `tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_assunto_id` ON `topicos` (`assunto_id`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `topicos` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_ordem` ON `topicos` (`ordem`);--> statement-breakpoint
CREATE INDEX `idx_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_cpf` ON `users` (`cpf`);--> statement-breakpoint
CREATE INDEX `idx_role` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `idx_ativo` ON `users` (`ativo`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `webhooks_pagarme` (`event_type`);--> statement-breakpoint
CREATE INDEX `idx_event_id` ON `webhooks_pagarme` (`event_id`);--> statement-breakpoint
CREATE INDEX `idx_processed` ON `webhooks_pagarme` (`processed`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `webhooks_pagarme` (`created_at`);