import mysql from 'mysql2/promise';

async function createAvisosTables() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('[Avisos] Criando tabelas...\n');
    
    // 1. Tabela avisos_tipos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos_tipos (
        id VARCHAR(20) PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        cor VARCHAR(7) NOT NULL,
        icone VARCHAR(50) NOT NULL,
        prioridade INT NOT NULL,
        dismissavel_padrao BOOLEAN DEFAULT TRUE NOT NULL,
        formato_exibicao_padrao VARCHAR(20) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos_tipos');
    
    // Inserir tipos padrão
    await connection.query(`
      INSERT INTO avisos_tipos (id, nome, cor, icone, prioridade, dismissavel_padrao, formato_exibicao_padrao) VALUES
        ('informativo', 'Informativo', '#10B981', 'Info', 3, TRUE, 'toast'),
        ('importante', 'Importante', '#F59E0B', 'AlertCircle', 2, TRUE, 'modal'),
        ('urgente', 'Urgente', '#EF4444', 'AlertTriangle', 1, FALSE, 'modal'),
        ('individual', 'Individual', '#3B82F6', 'Mail', 1, TRUE, 'modal'),
        ('premium', 'Premium', '#8B5CF6', 'Crown', 2, TRUE, 'banner')
      ON DUPLICATE KEY UPDATE nome=VALUES(nome)
    `);
    console.log('✅ Tipos padrão inseridos');
    
    // 2. Tabela avisos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos (
        id VARCHAR(36) PRIMARY KEY,
        tipo VARCHAR(20) NOT NULL,
        formato_exibicao VARCHAR(20) NOT NULL,
        titulo VARCHAR(100) NOT NULL,
        subtitulo VARCHAR(150),
        conteudo TEXT NOT NULL,
        midia_tipo VARCHAR(20),
        midia_url TEXT,
        midia_thumbnail TEXT,
        cta_texto VARCHAR(50),
        cta_url TEXT,
        cta_estilo VARCHAR(20),
        cta_secundario_texto VARCHAR(50),
        cta_secundario_url TEXT,
        cta_secundario_estilo VARCHAR(20),
        links_adicionais JSON,
        prioridade INT DEFAULT 5 NOT NULL,
        dismissavel BOOLEAN DEFAULT TRUE NOT NULL,
        reaparece_pos_dispensar BOOLEAN DEFAULT FALSE NOT NULL,
        frequencia_reexibicao VARCHAR(20),
        limite_exibicoes INT,
        data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        data_fim TIMESTAMP NULL,
        horario_exibicao VARCHAR(20) DEFAULT 'qualquer' NOT NULL,
        status VARCHAR(20) DEFAULT 'rascunho' NOT NULL,
        sensivel BOOLEAN DEFAULT FALSE NOT NULL,
        grupo_teste VARCHAR(10),
        criado_por VARCHAR(36),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tipo) REFERENCES avisos_tipos(id),
        INDEX idx_avisos_status (status),
        INDEX idx_avisos_data_inicio (data_inicio),
        INDEX idx_avisos_data_fim (data_fim),
        INDEX idx_avisos_prioridade (prioridade),
        INDEX idx_avisos_tipo (tipo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos');
    
    // 3. Tabela avisos_segmentacao
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos_segmentacao (
        id VARCHAR(36) PRIMARY KEY,
        aviso_id VARCHAR(36) NOT NULL,
        tipo_segmentacao VARCHAR(50) NOT NULL,
        criterios JSON NOT NULL,
        alunos_elegiveis_cache JSON,
        total_alunos_impactados INT,
        cache_gerado_em TIMESTAMP NULL,
        FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_segmentacao_aviso (aviso_id),
        INDEX idx_segmentacao_aviso (aviso_id),
        INDEX idx_segmentacao_tipo (tipo_segmentacao)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos_segmentacao');
    
    // 4. Tabela avisos_visualizacoes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos_visualizacoes (
        aviso_id VARCHAR(36) NOT NULL,
        aluno_id VARCHAR(36) NOT NULL,
        visualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        dispositivo VARCHAR(20),
        dismissado BOOLEAN DEFAULT FALSE NOT NULL,
        dismissado_em TIMESTAMP NULL,
        clicou_cta BOOLEAN DEFAULT FALSE NOT NULL,
        clicou_cta_em TIMESTAMP NULL,
        tempo_visualizacao INT DEFAULT 0 NOT NULL,
        total_visualizacoes INT DEFAULT 1 NOT NULL,
        ultima_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY (aviso_id, aluno_id),
        FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
        INDEX idx_visualizacoes_aviso (aviso_id),
        INDEX idx_visualizacoes_aluno (aluno_id),
        INDEX idx_visualizacoes_dismissado (dismissado),
        INDEX idx_visualizacoes_cta (clicou_cta)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos_visualizacoes');
    
    // 5. Tabela avisos_templates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos_templates (
        id VARCHAR(36) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        tipo VARCHAR(20) NOT NULL,
        conteudo_template TEXT NOT NULL,
        variaveis_disponiveis JSON,
        criado_por VARCHAR(36),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        usado_count INT DEFAULT 0 NOT NULL,
        FOREIGN KEY (tipo) REFERENCES avisos_tipos(id),
        INDEX idx_templates_tipo (tipo),
        INDEX idx_templates_nome (nome)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos_templates');
    
    // 6. Tabela avisos_fila_entrega
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos_fila_entrega (
        id VARCHAR(36) PRIMARY KEY,
        aviso_id VARCHAR(36) NOT NULL,
        aluno_id VARCHAR(36) NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente' NOT NULL,
        tentativas INT DEFAULT 0 NOT NULL,
        max_tentativas INT DEFAULT 3 NOT NULL,
        erro_mensagem TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        processado_em TIMESTAMP NULL,
        FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_fila_entrega (aviso_id, aluno_id),
        INDEX idx_fila_status (status),
        INDEX idx_fila_aviso (aviso_id),
        INDEX idx_fila_aluno (aluno_id),
        INDEX idx_fila_tentativas (tentativas)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos_fila_entrega');
    
    // 7. Tabela avisos_analytics
    await connection.query(`
      CREATE TABLE IF NOT EXISTS avisos_analytics (
        aviso_id VARCHAR(36) PRIMARY KEY,
        total_enviados INT DEFAULT 0 NOT NULL,
        total_visualizados INT DEFAULT 0 NOT NULL,
        total_dismissados INT DEFAULT 0 NOT NULL,
        total_cliques_cta INT DEFAULT 0 NOT NULL,
        taxa_visualizacao INT DEFAULT 0 NOT NULL,
        taxa_dismiss INT DEFAULT 0 NOT NULL,
        taxa_conversao INT DEFAULT 0 NOT NULL,
        tempo_medio_visualizacao INT DEFAULT 0 NOT NULL,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (aviso_id) REFERENCES avisos(id) ON DELETE CASCADE,
        INDEX idx_analytics_taxa_vis (taxa_visualizacao),
        INDEX idx_analytics_taxa_conv (taxa_conversao)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ avisos_analytics');
    
    console.log('\n[Avisos] ✅ Todas as 7 tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('[Avisos] ❌ Erro:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createAvisosTables();
