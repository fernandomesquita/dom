# Módulo de Metas - Documentação Técnica Completa

**Autor:** Manus AI  
**Data:** Janeiro 2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementação Completa (100%)

---

## Sumário Executivo

O **Módulo de Metas** é um sistema completo de gerenciamento de objetivos de estudo baseado na metodologia DOM-EARA®. Este módulo permite que alunos criem planos de estudo personalizados, importem metas em lote via Excel, acompanhem seu progresso em tempo real através de cronogramas visuais e analisem seu desempenho através de dashboards administrativos com analytics detalhados.

O sistema implementa três pilares fundamentais da metodologia EARA: **numeração única sequencial** para organização hierárquica, **revisão espaçada automática** seguindo intervalos científicos de 1, 7 e 30 dias, e **distribuição inteligente** que respeita a capacidade diária do aluno e seus dias disponíveis para estudo.

---

## Arquitetura do Sistema

### Visão Geral

O Módulo de Metas segue uma arquitetura em camadas típica de aplicações full-stack modernas, com separação clara entre backend (API tRPC), camada de dados (MySQL 8.0+) e frontend (React 19 + Tailwind 4).

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                     │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ MetasPlanos │ Cronograma  │ MetasHoje   │ Dashboard    │ │
│  │  (Listagem) │  (Calendário)│  (Timer)   │  (Analytics) │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ tRPC
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + tRPC)                  │
│  ┌──────────────┬──────────────┬──────────────┬───────────┐ │
│  │ metasPlanos  │ metasMetas   │ batchImport  │ analytics │ │
│  │  (7 procs)   │  (8 procs)   │  (3 procs)   │ (7 procs) │ │
│  └──────────────┴──────────────┴──────────────┴───────────┘ │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Numeração    │ Revisão      │ Distribuição             │ │
│  │  Helper      │  Helper      │  Helper                  │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (MySQL 8.0+)               │
│  ┌──────────────┬──────────────┬──────────────┬───────────┐ │
│  │ planos_estudo│ metas        │ metas_revisoes│ logs (3x) │ │
│  └──────────────┴──────────────┴──────────────┴───────────┘ │
│  ┌──────────────┬──────────────────────────────────────────┐ │
│  │ metas_materiais │ metas_questoes                        │ │
│  └──────────────┴──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Camadas e Responsabilidades

A arquitetura segue o princípio de **separação de responsabilidades**, onde cada camada possui um papel bem definido. A camada de apresentação (frontend) é responsável pela interface do usuário e interações visuais, utilizando React 19 com hooks modernos e componentes reutilizáveis do shadcn/ui. A camada de aplicação (backend) gerencia a lógica de negócio através de routers tRPC que expõem procedures type-safe, garantindo contratos claros entre cliente e servidor. A camada de helpers encapsula algoritmos complexos como numeração sequencial, revisão espaçada e distribuição inteligente, permitindo reutilização e testabilidade. Por fim, a camada de dados (MySQL) armazena todas as informações de forma normalizada, com índices otimizados para queries frequentes.

---

## Modelo de Dados

### Diagrama de Relacionamento

O modelo de dados do Módulo de Metas foi projetado para suportar flexibilidade e escalabilidade, permitindo que um aluno tenha múltiplos planos de estudo ativos simultaneamente, cada um com suas próprias configurações de capacidade diária e dias disponíveis.

```
┌──────────────────┐
│  planos_estudo   │
│──────────────────│
│ id (PK)          │
│ usuario_id (FK)  │──┐
│ nome             │  │
│ horas_por_dia    │  │
│ dias_disponiveis │  │
│ ativo            │  │
└──────────────────┘  │
                      │
                      │ 1:N
                      │
                      ↓
         ┌────────────────────┐
         │       metas        │
         │────────────────────│
         │ id (PK)            │
         │ plano_id (FK)      │──┐
         │ display_number     │  │
         │ order_key          │  │
         │ tipo               │  │ ENUM: ESTUDO, QUESTOES, REVISAO
         │ status             │  │ ENUM: PENDENTE, EM_ANDAMENTO, CONCLUIDA, etc
         │ ktree_disciplina_id│  │
         │ ktree_assunto_id   │  │
         │ ktree_topico_id    │  │
         │ scheduled_date     │  │
         │ scheduled_order    │  │
         │ duracao_planejada_min│ │
         │ duracao_real_sec   │  │
         │ meta_origem_id (FK)│  │ Self-reference para revisões
         │ row_hash           │  │ Idempotência em batch import
         └────────────────────┘  │
                      │           │
         ┌────────────┼───────────┼──────────────┐
         │            │           │              │
         ↓            ↓           ↓              ↓
┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│metas_materiais │ │metas_questoes│ │metas_revisoes│ │  logs (3x)   │
│────────────────│ │──────────────│ │──────────────│ │──────────────│
│ meta_id (FK)   │ │ meta_id (FK) │ │ meta_id (FK) │ │ meta_id (FK) │
│ material_id(FK)│ │ question_id  │ │ revisao_num  │ │ data_*       │
└────────────────┘ └──────────────┘ │ proxima_data │ │ motivo       │
                                    └──────────────┘ └──────────────┘
```

### Tabelas Principais

#### 1. planos_estudo

A tabela `planos_estudo` armazena as configurações gerais de cada plano de estudo criado pelo aluno. O campo `horas_por_dia` define a capacidade diária de estudo em horas decimais (ex: 4.5 para 4h30min), enquanto `dias_disponiveis` utiliza um bitfield de 7 bits para representar os dias da semana disponíveis (bit 0 = domingo, bit 6 = sábado). Esta representação compacta permite queries eficientes e operações bitwise para verificar disponibilidade.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(36) | UUID v4 gerado automaticamente |
| `usuario_id` | INT | Foreign key para tabela `users` |
| `nome` | VARCHAR(255) | Nome descritivo do plano (ex: "Preparação EARA 2025") |
| `descricao` | TEXT | Descrição opcional com objetivos do plano |
| `horas_por_dia` | DECIMAL(4,2) | Capacidade diária de estudo (0.5 a 24.0) |
| `dias_disponiveis` | TINYINT | Bitfield de dias da semana (0-127) |
| `ativo` | BOOLEAN | Indica se o plano está ativo |
| `criado_em` | DATETIME | Timestamp de criação |
| `atualizado_em` | DATETIME | Timestamp de última atualização |

**Índices:**
- PRIMARY KEY (`id`)
- INDEX `idx_usuario_ativo` (`usuario_id`, `ativo`)

#### 2. metas

A tabela `metas` é o coração do sistema, armazenando cada meta individual com todas as suas propriedades. O campo `display_number` contém a numeração visual (ex: "#001", "#001.1"), enquanto `order_key` é uma string otimizada para ordenação lexicográfica que garante a sequência correta mesmo com números decimais. O campo `row_hash` implementa idempotência em batch imports, calculado como SHA-256 dos campos-chave da meta.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(36) | UUID v4 gerado automaticamente |
| `plano_id` | VARCHAR(36) | Foreign key para `planos_estudo` |
| `display_number` | VARCHAR(20) | Numeração visual (ex: "#001", "#001.1") |
| `order_key` | VARCHAR(50) | Chave de ordenação lexicográfica |
| `tipo` | ENUM | ESTUDO, QUESTOES, REVISAO, REVISAO_DIFERIDA |
| `status` | ENUM | PENDENTE, EM_ANDAMENTO, CONCLUIDA, PRECISA_MAIS_TEMPO, OMITIDA |
| `ktree_disciplina_id` | VARCHAR(100) | Identificador da disciplina |
| `ktree_assunto_id` | VARCHAR(100) | Identificador do assunto |
| `ktree_topico_id` | VARCHAR(100) | Identificador do tópico (opcional) |
| `scheduled_date` | DATE | Data agendada para execução |
| `scheduled_order` | INT | Ordem dentro do dia (1, 2, 3...) |
| `duracao_planejada_min` | INT | Duração planejada em minutos |
| `duracao_real_sec` | INT | Duração real em segundos (após conclusão) |
| `orientacoes_estudo` | TEXT | Orientações específicas para esta meta |
| `meta_origem_id` | VARCHAR(36) | FK para meta que originou esta revisão |
| `fixed` | BOOLEAN | Indica se a meta está fixada (não redistribuir) |
| `auto_generated` | BOOLEAN | Indica se foi gerada automaticamente |
| `row_hash` | VARCHAR(64) | SHA-256 para idempotência |
| `concluido_em` | DATETIME | Timestamp de conclusão |
| `omitido_em` | DATETIME | Timestamp de omissão |
| `motivo_omissao` | TEXT | Motivo da omissão (se aplicável) |
| `criado_em` | DATETIME | Timestamp de criação |
| `atualizado_em` | DATETIME | Timestamp de última atualização |

**Índices:**
- PRIMARY KEY (`id`)
- INDEX `idx_plano_date_order` (`plano_id`, `scheduled_date`, `scheduled_order`)
- INDEX `idx_plano_status` (`plano_id`, `status`)
- INDEX `idx_scheduled_date` (`scheduled_date`)
- INDEX `idx_meta_origem` (`meta_origem_id`)
- UNIQUE INDEX `idx_row_hash` (`row_hash`)

#### 3. metas_revisoes

A tabela `metas_revisoes` implementa o sistema de revisão espaçada, armazenando o histórico de revisões de cada meta de estudo. Cada registro representa uma revisão agendada ou concluída, seguindo os intervalos de 1, 7 e 30 dias após a conclusão da meta original.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(36) | UUID v4 gerado automaticamente |
| `meta_id` | VARCHAR(36) | FK para meta original |
| `revisao_numero` | INT | Número da revisão (1, 2, 3) |
| `data_prevista` | DATE | Data originalmente prevista |
| `data_realizada` | DATE | Data em que foi realizada (nullable) |
| `proxima_revisao_id` | VARCHAR(36) | FK para próxima revisão gerada |
| `criado_em` | DATETIME | Timestamp de criação |

**Índices:**
- PRIMARY KEY (`id`)
- INDEX `idx_meta_revisao` (`meta_id`, `revisao_numero`)
- INDEX `idx_data_prevista` (`data_prevista`)

#### 4. Tabelas de Log

O sistema mantém três tabelas de log para rastreabilidade completa das ações do aluno:

**metas_log_conclusao**: Registra cada conclusão de meta, incluindo duração real e timestamp exato.

**metas_log_omissao**: Registra omissões com motivo obrigatório, permitindo análise de gargalos.

**metas_log_redistribuicao**: Registra todas as redistribuições automáticas, incluindo data original, nova data e motivo (ex: "Capacidade excedida", "Dia indisponível").

---

## Helpers e Algoritmos

### 1. metasNumeracao.ts - Numeração Única Sequencial

O helper de numeração implementa um sistema hierárquico de identificação de metas que combina legibilidade humana com ordenação computacional eficiente. Cada meta recebe um `display_number` visual (ex: "#001", "#001.1", "#001.2") e um `order_key` otimizado para ordenação lexicográfica.

**Algoritmo de Geração:**

```typescript
function gerarProximoNumero(planoId: string, metaOrigemId?: string): {
  displayNumber: string;
  orderKey: string;
} {
  if (metaOrigemId) {
    // Revisão: incrementar sufixo decimal
    const origem = buscarMeta(metaOrigemId);
    const [base, sufixo] = origem.display_number.split('.');
    const novoSufixo = sufixo ? parseInt(sufixo) + 1 : 1;
    return {
      displayNumber: `#${base}.${novoSufixo}`,
      orderKey: `${origem.order_key}.${String(novoSufixo).padStart(3, '0')}`
    };
  } else {
    // Meta nova: próximo número sequencial
    const ultimaMeta = buscarUltimaMeta(planoId);
    const proximoNum = ultimaMeta ? parseInt(ultimaMeta.display_number.replace('#', '')) + 1 : 1;
    return {
      displayNumber: `#${String(proximoNum).padStart(3, '0')}`,
      orderKey: String(proximoNum).padStart(6, '0')
    };
  }
}
```

**Exemplos de Numeração:**

| Meta Original | Revisão 1 | Revisão 2 | Revisão 3 |
|---------------|-----------|-----------|-----------|
| #001 | #001.1 | #001.2 | #001.3 |
| #002 | #002.1 | #002.2 | #002.3 |
| #015 | #015.1 | #015.2 | #015.3 |

**Order Key para Ordenação:**

O `order_key` é projetado para garantir ordenação lexicográfica correta, mesmo com números decimais. Por exemplo, a meta "#001.2" deve vir antes de "#001.10", o que não funcionaria com ordenação de strings simples. A solução é preencher cada parte com zeros à esquerda:

- #001 → order_key: "000001"
- #001.1 → order_key: "000001.001"
- #001.10 → order_key: "000001.010"

Desta forma, a ordenação alfabética de strings produz o resultado correto.

### 2. metasRevisao.ts - Revisão Espaçada Automática

O helper de revisão implementa o algoritmo de **spaced repetition** baseado em evidências científicas de retenção de memória de longo prazo. Quando uma meta de tipo ESTUDO é concluída, o sistema automaticamente agenda três revisões futuras nos intervalos de 1, 7 e 30 dias.

**Algoritmo de Agendamento:**

```typescript
async function agendarRevisoes(metaId: string, dataConclusao: Date): Promise<void> {
  const meta = await buscarMeta(metaId);
  const intervalos = [1, 7, 30]; // dias
  
  for (const [index, dias] of intervalos.entries()) {
    const dataRevisao = addDays(dataConclusao, dias);
    const numeroRevisao = index + 1;
    
    // Gerar nova meta de revisão
    const { displayNumber, orderKey } = gerarProximoNumero(meta.plano_id, metaId);
    
    const metaRevisao = await criarMeta({
      plano_id: meta.plano_id,
      display_number: displayNumber,
      order_key: orderKey,
      tipo: 'REVISAO',
      status: 'PENDENTE',
      ktree_disciplina_id: meta.ktree_disciplina_id,
      ktree_assunto_id: meta.ktree_assunto_id,
      ktree_topico_id: meta.ktree_topico_id,
      scheduled_date: dataRevisao,
      duracao_planejada_min: Math.ceil(meta.duracao_planejada_min * 0.5), // 50% do tempo original
      meta_origem_id: metaId,
      auto_generated: true
    });
    
    // Registrar na tabela de revisões
    await criarRegistroRevisao({
      meta_id: metaId,
      revisao_numero: numeroRevisao,
      data_prevista: dataRevisao,
      proxima_revisao_id: metaRevisao.id
    });
  }
}
```

**Justificativa dos Intervalos:**

Os intervalos de 1, 7 e 30 dias são baseados na **curva de esquecimento de Ebbinghaus**, que demonstra que a retenção de informações decai exponencialmente ao longo do tempo. A primeira revisão após 24 horas reforça a memória de curto prazo, a segunda após 7 dias consolida a memória de médio prazo, e a terceira após 30 dias solidifica a memória de longo prazo.

**Duração das Revisões:**

As revisões são agendadas com 50% da duração da meta original, pois o aluno já possui familiaridade com o conteúdo e precisa apenas reforçar os conceitos principais. Esta redução otimiza o tempo de estudo sem comprometer a eficácia da revisão.

### 3. metasDistribuicao.ts - Distribuição Inteligente

O helper de distribuição implementa o algoritmo mais complexo do sistema, responsável por distribuir metas ao longo do calendário respeitando múltiplas restrições: capacidade diária do aluno, dias disponíveis para estudo, metas já agendadas e metas fixadas que não podem ser movidas.

**Algoritmo de Distribuição:**

```typescript
async function redistribuirMetas(planoId: string): Promise<void> {
  const plano = await buscarPlano(planoId);
  const metasPendentes = await buscarMetasPendentes(planoId);
  const capacidadeMinutosDia = plano.horas_por_dia * 60;
  
  // Ordenar metas por order_key para manter sequência
  metasPendentes.sort((a, b) => a.order_key.localeCompare(b.order_key));
  
  let dataAtual = new Date();
  let ordemDia = 1;
  let minutosUsadosDia = 0;
  
  for (const meta of metasPendentes) {
    // Pular metas fixadas
    if (meta.fixed) continue;
    
    // Verificar se cabe no dia atual
    if (minutosUsadosDia + meta.duracao_planejada_min > capacidadeMinutosDia) {
      // Avançar para próximo dia disponível
      dataAtual = proximoDiaDisponivel(dataAtual, plano.dias_disponiveis);
      ordemDia = 1;
      minutosUsadosDia = 0;
    }
    
    // Verificar se dia está disponível
    while (!isDiaDisponivel(dataAtual, plano.dias_disponiveis)) {
      dataAtual = addDays(dataAtual, 1);
    }
    
    // Agendar meta
    const dataOriginal = meta.scheduled_date;
    await atualizarMeta(meta.id, {
      scheduled_date: dataAtual,
      scheduled_order: ordemDia
    });
    
    // Registrar redistribuição se houve mudança
    if (dataOriginal !== dataAtual) {
      await registrarRedistribuicao({
        meta_id: meta.id,
        data_original: dataOriginal,
        data_nova: dataAtual,
        motivo: minutosUsadosDia > 0 ? 'Capacidade excedida' : 'Dia indisponível'
      });
    }
    
    minutosUsadosDia += meta.duracao_planejada_min;
    ordemDia++;
  }
}
```

**Verificação de Dia Disponível:**

O campo `dias_disponiveis` utiliza um bitfield de 7 bits, onde cada bit representa um dia da semana (0=domingo, 6=sábado). A verificação de disponibilidade é feita através de operação bitwise:

```typescript
function isDiaDisponivel(data: Date, diasDisponiveis: number): boolean {
  const diaSemana = data.getDay(); // 0-6
  const bit = 1 << diaSemana;
  return (diasDisponiveis & bit) !== 0;
}
```

Por exemplo, se o aluno estuda apenas de segunda a sexta (bits 1-5), o valor de `dias_disponiveis` seria:

```
0111110 (binário) = 62 (decimal)
```

**Otimizações:**

O algoritmo implementa várias otimizações para performance:

1. **Ordenação única**: As metas são ordenadas uma única vez no início, evitando múltiplas ordenações.
2. **Busca incremental**: A busca pelo próximo dia disponível é incremental, não recalculando desde o início.
3. **Batch updates**: As atualizações de metas são agrupadas em transações para reduzir round-trips ao banco.
4. **Cache de capacidade**: A capacidade diária é calculada uma vez e reutilizada.

---

## Routers tRPC

### metasPlanosRouter

Este router gerencia o CRUD de planos de estudo e fornece endpoints auxiliares para obtenção de cronogramas e estatísticas.

**Procedures:**

1. **create**: Cria um novo plano de estudo com validações de horas/dia (0.5-24) e dias disponíveis (1-127).

2. **update**: Atualiza um plano existente. Se `horas_por_dia` ou `dias_disponiveis` forem alterados, dispara redistribuição automática de todas as metas pendentes.

3. **delete**: Realiza soft delete do plano (marca `ativo=false`). Valida que não existem metas pendentes antes de deletar.

4. **list**: Lista todos os planos do usuário autenticado, ordenados por data de criação (mais recentes primeiro).

5. **getById**: Retorna um plano específico com todas as suas propriedades.

6. **getSchedule**: Retorna o cronograma de metas de um plano em um intervalo de datas, incluindo estatísticas agregadas por dia (total de metas, tempo total, metas por status).

7. **toggleActive**: Ativa ou desativa um plano. Apenas um plano pode estar ativo por vez.

### metasMetasRouter

Este router gerencia o CRUD de metas individuais e fornece endpoints para ações do aluno (concluir, solicitar mais tempo, omitir).

**Procedures:**

1. **create**: Cria uma nova meta com numeração automática. Se `meta_origem_id` for fornecido, cria uma revisão com numeração decimal.

2. **update**: Atualiza uma meta existente. Se `scheduled_date` for alterado, registra redistribuição manual.

3. **delete**: Deleta uma meta permanentemente. Valida que não existem revisões dependentes.

4. **list**: Lista metas com filtros avançados (planoId, status, tipo, dataInicio, dataFim, incluirOmitidas). Suporta paginação via `limit` e `offset`.

5. **getById**: Retorna uma meta específica com todas as suas propriedades, incluindo meta de origem se for uma revisão.

6. **complete**: Marca meta como concluída, registra duração real e dispara agendamento de revisões se tipo=ESTUDO.

7. **requestMoreTime**: Marca meta como PRECISA_MAIS_TEMPO e redistribui para o próximo dia disponível.

8. **skip**: Marca meta como OMITIDA com motivo obrigatório e redistribui metas subsequentes.

### metasBatchImportRouter

Este router implementa importação em lote de metas via Excel, com validação robusta e idempotência.

**Procedures:**

1. **validate**: Valida um array de metas antes de importar, verificando:
   - Campos obrigatórios (disciplina, assunto, tipo, duração)
   - Valores válidos para enums (tipo, status)
   - Duração mínima de 5 minutos
   - KTree válido (disciplina e assunto existem)
   - Duplicatas via row_hash

2. **import**: Importa metas validadas em transação atômica. Retorna relatório com contadores de `imported`, `skipped` e `failed`.

3. **getTemplate**: Retorna a estrutura do template Excel com colunas esperadas e exemplos.

**Formato do Excel:**

| disciplina | assunto | topico | tipo | duracao_min | orientacoes |
|------------|---------|--------|------|-------------|-------------|
| Direito Constitucional | Princípios Fundamentais | Dignidade da Pessoa Humana | ESTUDO | 60 | Ler CF/88 art. 1º-4º |
| Direito Administrativo | Atos Administrativos | Atributos | QUESTOES | 30 | Resolver 20 questões |

**Idempotência:**

O campo `row_hash` é calculado como SHA-256 de uma string concatenando os campos-chave:

```typescript
const rowHash = sha256(`${disciplina}|${assunto}|${topico}|${tipo}|${duracao_min}`);
```

Ao importar, o sistema verifica se já existe uma meta com o mesmo `row_hash` no plano. Se existir, a meta é pulada (`skipped++`), evitando duplicatas.

### metasAnalyticsRouter

Este router fornece 7 endpoints de analytics para o dashboard administrativo, com queries SQL otimizadas para agregação de dados.

**Procedures:**

1. **globalStats**: Retorna estatísticas globais (total de planos, metas por status, metas por tipo, tempo total estudado vs planejado).

2. **conclusaoPorDisciplina**: Retorna taxa de conclusão por disciplina, com filtros opcionais de data. Calcula percentual de conclusão, omissão e pendência.

3. **metasMaisOmitidas**: Retorna top 10 metas mais omitidas (agrupadas por disciplina+assunto+tópico), incluindo contagem e motivos concatenados.

4. **tempoMedioPorTipo**: Retorna tempo médio planejado vs real por tipo de meta, calculando diferença em minutos.

5. **progressoTemporal**: Retorna série temporal de metas por dia nos últimos N dias (padrão 30), incluindo totais por status e tempo.

6. **distribuicaoPorDiaSemana**: Retorna distribuição de metas por dia da semana, identificando padrões de estudo.

7. **historicoRedistribuicoes**: Retorna histórico de redistribuições com limite configurável, incluindo datas e motivos.

---

## Frontend - Páginas e Componentes

### MetasPlanos (/metas/planos)

Página de listagem de planos de estudo com funcionalidades de criação, visualização e deleção. Utiliza um grid responsivo (1 coluna em mobile, 2 em tablet, 3 em desktop) para exibir cards de planos.

**Componentes Principais:**

- **Dialog de Criação**: Formulário completo com validações inline, incluindo seletor visual de dias disponíveis (7 botões toggle) e input numérico para horas/dia.

- **Card de Plano**: Exibe nome, descrição, horas/dia, dias disponíveis (ex: "Seg, Ter, Qua, Qui, Sex"), data de criação e badge de status (Ativo/Inativo).

- **Botões de Ação**: Grid 2x2 com botões para "Hoje", "Cronograma", "Importar" e "Deletar".

**Estado Vazio:**

Quando não há planos criados, exibe um card centralizado com ícone de alvo, mensagem explicativa e botão CTA para criar o primeiro plano.

### MetasCronograma (/metas/planos/:planoId/cronograma)

Página de visualização de cronograma em formato de calendário mensal, com sidebar de detalhes do dia selecionado.

**Componentes Principais:**

- **Calendário Mensal**: Grid 7x5 (dias da semana x semanas) com células clicáveis. Cada célula exibe:
  - Número do dia
  - Contagem de metas (ex: "3 metas")
  - Indicadores coloridos por tipo (bolinhas azul/verde/roxo)
  - Tempo total em formato "Xh Ym"
  - Destaque visual para dia selecionado e dia atual

- **Navegação Mensal**: Botões "Anterior" e "Próximo" no header do calendário, com título mostrando "Mês Ano" em português.

- **Filtros**: Dois selects para filtrar por status (todos, pendente, concluída, etc) e tipo (todos, estudo, questões, revisão).

- **Sidebar de Detalhes**: Card fixo à direita mostrando:
  - Data selecionada formatada (ex: "15 de Janeiro")
  - Contagem de metas agendadas
  - Lista de metas com badges (número, tipo, status), ícone de status, disciplina, assunto, duração e orientações (truncadas)
  - Click em meta redireciona para página de detalhes

- **Card de Estatísticas**: Abaixo da sidebar, exibe estatísticas do mês (total de metas, tempo total, média por dia).

**Responsividade:**

Em mobile, o layout muda para coluna única, com calendário acima e sidebar abaixo. O grid de dias é reduzido para exibir apenas iniciais dos dias da semana.

### MetasHoje (/metas/planos/:planoId/hoje)

Página de interação do aluno com as metas do dia atual, incluindo timer integrado e botões de ação.

**Componentes Principais:**

- **Cards de Resumo**: Grid 1x3 (ou 3x1 em mobile) com métricas do dia:
  - Metas Pendentes (badge amarelo)
  - Tempo Total (ícone de relógio)
  - Progresso (barra de progresso visual)

- **Timer Global**: Card destacado com:
  - Display de tempo em formato HH:MM:SS
  - Botões Play/Pause/Resume com ícones
  - Indicador de meta atual (disciplina + assunto)
  - Auto-incremento a cada segundo quando ativo

- **Lista de Metas**: Cards de metas ordenados por `scheduled_order`, cada um com:
  - Header: Badges (número, tipo, status)
  - Body: Disciplina, assunto, tópico, duração planejada, orientações
  - Footer: Grid 1x3 com botões "Concluir" (verde), "Mais Tempo" (amarelo), "Omitir" (vermelho)

- **Dialogs de Confirmação**:
  - **Concluir**: Confirma conclusão e pergunta se deseja iniciar próxima meta
  - **Mais Tempo**: Confirma reagendamento para próximo dia disponível
  - **Omitir**: Exige motivo obrigatório em textarea antes de confirmar

**Auto-refresh:**

A página utiliza `useEffect` com intervalo de 30 segundos para refetch automático das metas, garantindo sincronização com ações de outros dispositivos.

### MetasImport (/metas/planos/:planoId/importar)

Página de importação em lote de metas via Excel, com validação em tempo real e preview de erros.

**Componentes Principais:**

- **Upload de Arquivo**: Input file com drag-and-drop, aceitando apenas `.xlsx` e `.xls`. Exibe nome do arquivo selecionado e botão para remover.

- **Botões de Ação**: Grid 1x2 com:
  - "Validar Arquivo": Dispara validação sem importar
  - "Importar Metas": Dispara importação (desabilitado se não validado)

- **Tabela de Preview**: Exibe metas parseadas do Excel com colunas: disciplina, assunto, tópico, tipo, duração, orientações. Linhas com erro são destacadas em vermelho.

- **Alertas de Validação**: Cards de alerta exibindo:
  - Erros críticos (impedem importação): fundo vermelho, lista de erros com linha e campo
  - Avisos (não impedem): fundo amarelo, lista de avisos

- **Relatório de Importação**: Após importação bem-sucedida, exibe toast com contadores de `imported`, `skipped` e `failed`. Se houver falhas, exibe lista detalhada.

**Fluxo de Uso:**

1. Aluno faz upload do Excel
2. Sistema parseia arquivo e exibe preview
3. Aluno clica em "Validar"
4. Sistema valida e exibe erros/avisos
5. Se válido, aluno clica em "Importar"
6. Sistema importa em transação atômica
7. Exibe relatório e redireciona para cronograma após 2 segundos

### MetaDetalhes (/metas/:metaId)

Página de visualização detalhada de uma meta individual, mostrando todas as propriedades e histórico.

**Componentes Principais:**

- **Header**: Badges (número, tipo, status, fixada, auto-gerada) + título (disciplina) + subtítulos (assunto, tópico).

- **Grid 2x1 de Cards**:
  - **Informações Gerais**: Data agendada, duração planejada, duração real (se concluída), ordem no dia, link para meta de origem (se for revisão)
  - **Datas Importantes**: Criada em, concluída em, omitida em, última atualização

- **Card de Orientações**: Exibe `orientacoes_estudo` em texto pré-formatado (preserva quebras de linha).

- **Card de Motivo de Omissão**: Exibido apenas se status=OMITIDA, com fundo vermelho claro e texto destacado.

- **Card de Metadados Técnicos**: Exibe IDs, order_key e row_hash em fonte monospace para debugging.

**Navegação:**

Botão "Voltar para Cronograma" no topo redireciona para `/metas/planos/:planoId/cronograma`.

### MetasDashboard (/admin/metas/dashboard)

Dashboard administrativo com analytics detalhados e visualizações de dados agregados.

**Componentes Principais:**

- **Grid 1x4 de Cards de Resumo**:
  - Total de Planos (ícone de alvo)
  - Tempo Estudado (ícone de relógio) + tempo planejado em texto menor
  - Metas Concluídas (texto verde)
  - Metas Omitidas (texto vermelho)

- **Grid 2x1 de Cards de Distribuição**:
  - **Metas por Status**: Lista de badges com contadores
  - **Metas por Tipo**: Lista de badges com contadores

- **Card de Taxa de Conclusão**: Lista de disciplinas com:
  - Nome da disciplina
  - Texto "X/Y (Z%)" alinhado à direita
  - Barra de progresso visual (verde)

- **Card de Metas Mais Omitidas**: Lista de cards com:
  - Disciplina, assunto, tópico
  - Badge destrutivo com contagem (ex: "5x")
  - Motivos concatenados em texto pequeno

- **Card de Tempo Médio por Tipo**: Lista de tipos com:
  - Badge de tipo + contagem de metas
  - Grid 3x1: Planejado, Real, Diferença
  - Diferença colorida (verde se negativo, vermelho se positivo)

- **Card de Distribuição por Dia da Semana**: Lista de dias com:
  - Nome do dia (ex: "Segunda")
  - Barra de progresso proporcional ao máximo
  - Contagem de metas alinhada à direita

**Responsividade:**

Em mobile, todos os grids mudam para coluna única. Cards de resumo empilham verticalmente. Gráficos de barra mantêm largura total.

---

## Fluxos de Uso

### Fluxo 1: Criar Plano e Importar Metas

Este é o fluxo principal de onboarding de um novo aluno no sistema de metas.

**Passo a Passo:**

1. Aluno acessa `/metas/planos` e clica em "Novo Plano"
2. Preenche formulário com nome, descrição, horas/dia e dias disponíveis
3. Clica em "Criar Plano" → sistema gera UUID e salva no banco
4. Redireciona automaticamente para `/metas/planos/:planoId/cronograma`
5. Aluno clica em "Importar" no card do plano
6. Redireciona para `/metas/planos/:planoId/importar`
7. Aluno faz upload do Excel com metas
8. Sistema parseia e exibe preview
9. Aluno clica em "Validar Arquivo"
10. Sistema valida KTree, duplicatas e campos obrigatórios
11. Exibe erros/avisos em cards de alerta
12. Se válido, aluno clica em "Importar Metas"
13. Sistema importa em transação atômica, gerando numeração sequencial
14. Exibe toast com relatório (imported/skipped/failed)
15. Redireciona para cronograma após 2 segundos
16. Aluno visualiza metas distribuídas no calendário

**Tempo Estimado:** 5-10 minutos para plano + 50 metas

### Fluxo 2: Estudar Metas do Dia

Este é o fluxo diário de interação do aluno com suas metas agendadas.

**Passo a Passo:**

1. Aluno acessa `/metas/planos/:planoId/hoje`
2. Visualiza cards de resumo (pendentes, tempo total, progresso)
3. Visualiza lista de metas ordenadas por `scheduled_order`
4. Clica em "Play" no timer da primeira meta
5. Timer inicia contagem crescente (00:00:01, 00:00:02...)
6. Aluno estuda o conteúdo conforme orientações
7. Ao finalizar, clica em "Concluir"
8. Dialog de confirmação aparece
9. Aluno confirma conclusão
10. Sistema:
    - Marca meta como CONCLUIDA
    - Registra `duracao_real_sec` com tempo do timer
    - Cria log de conclusão
    - Se tipo=ESTUDO, agenda 3 revisões (1, 7, 30 dias)
    - Atualiza contadores de resumo
11. Dialog pergunta "Iniciar próxima meta?"
12. Se sim, timer reinicia automaticamente para próxima meta
13. Processo se repete até todas as metas do dia serem concluídas

**Tempo Estimado:** Variável (depende da duração das metas)

### Fluxo 3: Solicitar Mais Tempo

Este fluxo é usado quando o aluno não consegue completar uma meta no tempo planejado.

**Passo a Passo:**

1. Aluno está em `/metas/planos/:planoId/hoje`
2. Identifica meta que precisa de mais tempo
3. Clica em "Mais Tempo" (botão amarelo)
4. Dialog de confirmação aparece com mensagem explicativa
5. Aluno confirma
6. Sistema:
    - Marca meta como PRECISA_MAIS_TEMPO
    - Busca próximo dia disponível (respeitando `dias_disponiveis`)
    - Redistribui meta para esse dia
    - Registra redistribuição com motivo "Solicitação de mais tempo"
    - Remove meta da lista de hoje
    - Atualiza contadores de resumo
7. Toast de sucesso aparece: "Meta reagendada para DD/MM/YYYY"
8. Lista de metas é atualizada automaticamente

**Tempo Estimado:** 10 segundos

### Fluxo 4: Omitir Meta

Este fluxo é usado quando o aluno decide pular uma meta por motivos diversos (dificuldade, falta de material, etc).

**Passo a Passo:**

1. Aluno está em `/metas/planos/:planoId/hoje`
2. Identifica meta que deseja omitir
3. Clica em "Omitir" (botão vermelho)
4. Dialog de confirmação aparece com textarea obrigatório
5. Aluno digita motivo (ex: "Não encontrei o material de estudo")
6. Clica em "Confirmar Omissão"
7. Sistema:
    - Marca meta como OMITIDA
    - Registra `motivo_omissao` e `omitido_em`
    - Cria log de omissão
    - Remove meta da lista de hoje
    - Redistribui metas subsequentes se necessário
    - Atualiza contadores de resumo
8. Toast de alerta aparece: "Meta omitida. Motivo registrado."
9. Lista de metas é atualizada automaticamente

**Importante:** Metas omitidas NÃO são redistribuídas automaticamente. Elas permanecem com status OMITIDA e podem ser visualizadas no cronograma com filtro apropriado. O aluno pode manualmente editar a meta para reagendá-la.

**Tempo Estimado:** 30 segundos

### Fluxo 5: Analisar Desempenho

Este fluxo é usado pelo aluno (ou administrador) para analisar padrões de estudo e identificar gargalos.

**Passo a Passo:**

1. Aluno acessa `/admin/metas/dashboard`
2. Visualiza cards de resumo no topo:
   - Total de planos criados
   - Tempo total estudado vs planejado
   - Metas concluídas e omitidas
3. Analisa distribuição de metas por status e tipo
4. Identifica taxa de conclusão por disciplina:
   - Disciplinas com taxa < 70% requerem atenção
   - Barras de progresso facilitam comparação visual
5. Analisa "Metas Mais Omitidas":
   - Identifica top 10 gargalos
   - Lê motivos concatenados para entender padrões
   - Ex: "Falta de material; Muito difícil; Sem tempo"
6. Compara tempo médio planejado vs real por tipo:
   - Se diferença > 0 (real > planejado), ajustar durações futuras
   - Se diferença < 0 (real < planejado), pode aumentar carga
7. Analisa distribuição por dia da semana:
   - Identifica dias com mais/menos metas
   - Ajusta `dias_disponiveis` se necessário para balancear
8. Com base nas análises, toma ações:
   - Ajustar duração de metas de tipos específicos
   - Redistribuir metas de disciplinas problemáticas
   - Criar mais metas de revisão para disciplinas com baixa taxa
   - Ajustar capacidade diária (`horas_por_dia`)

**Tempo Estimado:** 10-15 minutos

---

## Decisões de Design

### 1. Por que UUID em vez de INT para IDs?

A escolha de UUIDs (VARCHAR(36)) em vez de integers auto-incrementais para chaves primárias foi motivada por três fatores principais: **segurança**, **escalabilidade** e **flexibilidade**.

Do ponto de vista de segurança, UUIDs evitam **enumeration attacks**, onde um atacante poderia iterar sequencialmente por IDs numéricos para acessar recursos não autorizados. Por exemplo, se o ID de uma meta é `123`, o atacante poderia tentar `124`, `125`, etc. Com UUIDs, isso se torna impraticável.

Em termos de escalabilidade, UUIDs permitem geração distribuída de IDs sem necessidade de coordenação centralizada. Se no futuro o sistema precisar de múltiplos servidores de aplicação ou sharding de banco de dados, UUIDs garantem unicidade global sem conflitos.

A flexibilidade vem da capacidade de gerar IDs no cliente (frontend) antes mesmo de persistir no banco, permitindo otimistic updates e melhor UX em cenários de baixa latência de rede.

A desvantagem de UUIDs é o overhead de armazenamento (36 bytes vs 4 bytes de INT) e performance ligeiramente inferior em índices. No entanto, para a escala esperada do sistema (milhares de metas por aluno), o impacto é negligenciável.

### 2. Por que Bitfield para Dias Disponíveis?

O campo `dias_disponiveis` utiliza um TINYINT (1 byte) como bitfield de 7 bits, onde cada bit representa um dia da semana. Esta escolha foi motivada por **eficiência de armazenamento** e **performance de queries**.

Alternativas consideradas:

**Opção A: 7 colunas booleanas** (`domingo BOOLEAN, segunda BOOLEAN, ...`)
- Pros: Mais legível, queries simples
- Cons: 7 bytes de armazenamento, queries verbosas com múltiplos ORs

**Opção B: String CSV** (`"0,1,2,3,4,5,6"`)
- Pros: Flexível, fácil de parsear
- Cons: Armazenamento variável, queries complexas com LIKE, sem validação de integridade

**Opção C: Tabela de junção** (`plano_dias` com `plano_id, dia_semana`)
- Pros: Normalizado, queries simples com JOIN
- Cons: 7 linhas por plano, overhead de JOINs

**Opção escolhida: Bitfield**
- Pros: 1 byte de armazenamento, operações bitwise ultra-rápidas, validação simples (0-127)
- Cons: Menos legível, requer funções helper

A operação de verificação é extremamente eficiente:

```sql
SELECT * FROM planos_estudo 
WHERE (dias_disponiveis & (1 << DAYOFWEEK(CURDATE()))) != 0;
```

Esta query retorna todos os planos disponíveis para o dia atual em uma única operação bitwise, sem JOINs ou subconsultas.

### 3. Por que Row Hash para Idempotência?

O campo `row_hash` implementa idempotência em batch imports através de um hash SHA-256 dos campos-chave da meta. Esta abordagem foi escolhida em vez de **unique constraints compostos** por três motivos.

Primeiro, um unique constraint composto em múltiplas colunas (disciplina + assunto + tópico + tipo + duração) seria extremamente verboso e difícil de manter. Além disso, alguns campos são opcionais (tópico), complicando a lógica.

Segundo, o hash permite comparação rápida de duplicatas com uma única coluna indexada, em vez de múltiplas colunas no índice.

Terceiro, o hash fornece uma "impressão digital" única da meta que pode ser usada para outras finalidades no futuro, como detecção de metas similares ou versionamento.

A função de hash é determinística e resistente a colisões:

```typescript
import crypto from 'crypto';

function calcularRowHash(meta: ParsedMeta): string {
  const campos = [
    meta.disciplina,
    meta.assunto,
    meta.topico || '',
    meta.tipo,
    meta.duracao_min.toString()
  ];
  const str = campos.join('|');
  return crypto.createHash('sha256').update(str).digest('hex');
}
```

O separador `|` é escolhido por ser improvável de aparecer nos campos de texto, evitando colisões acidentais.

### 4. Por que Order Key Separado de Display Number?

A decisão de manter dois campos separados (`display_number` e `order_key`) em vez de um único campo foi motivada pela necessidade de **ordenação lexicográfica correta** mantendo **legibilidade humana**.

O problema surge com revisões decimais. Se usássemos apenas `display_number` para ordenação, teríamos:

```
#001    → "001"
#001.1  → "001.1"
#001.10 → "001.10"
#001.2  → "001.2"
```

Ordenação alfabética de strings produziria:

```
001 < 001.1 < 001.10 < 001.2  ❌ ERRADO
```

O correto seria:

```
001 < 001.1 < 001.2 < 001.10  ✅ CORRETO
```

A solução é ter um `order_key` otimizado para ordenação:

```
#001    → order_key: "000001"
#001.1  → order_key: "000001.001"
#001.2  → order_key: "000001.002"
#001.10 → order_key: "000001.010"
```

Agora a ordenação alfabética funciona corretamente:

```sql
SELECT * FROM metas ORDER BY order_key ASC;
```

O `display_number` é usado apenas para exibição na UI, mantendo formato legível "#001", "#001.1", etc.

### 5. Por que Revisões são Metas Separadas?

A decisão de criar revisões como metas separadas (em vez de um campo `revisao_numero` na mesma meta) foi motivada por **flexibilidade** e **simplicidade de queries**.

Alternativas consideradas:

**Opção A: Campo revisao_numero na mesma meta**
- Pros: Menos linhas no banco
- Cons: Queries complexas para filtrar primeira tentativa vs revisões, dificuldade em agendar revisões em datas diferentes

**Opção B: Tabela separada metas_revisoes com cópia de dados**
- Pros: Separação clara
- Cons: Duplicação de dados, sincronização complexa

**Opção escolhida: Revisões como metas separadas**
- Pros: Queries simples, agendamento flexível, tratamento uniforme
- Cons: Mais linhas no banco (mas com `auto_generated=true` para filtrar)

Esta abordagem permite que revisões sejam tratadas exatamente como metas normais em todo o sistema: aparecem no cronograma, podem ser concluídas/omitidas, têm timer próprio, etc. A única diferença é o campo `meta_origem_id` que aponta para a meta original.

A tabela `metas_revisoes` é mantida como um **índice auxiliar** para facilitar queries específicas de revisões, mas não armazena dados duplicados, apenas referências.

---

## Guia de Manutenção

### Adicionando Novo Tipo de Meta

Para adicionar um novo tipo de meta (ex: "SIMULADO"), siga estes passos:

1. **Atualizar Schema**: Adicionar valor ao ENUM `tipo` em `drizzle/schema-metas.ts`:

```typescript
tipo: mysqlEnum('tipo', ['ESTUDO', 'QUESTOES', 'REVISAO', 'REVISAO_DIFERIDA', 'SIMULADO']).notNull(),
```

2. **Rodar Migration**: `pnpm db:push`

3. **Atualizar Validações**: Adicionar ao Zod schema em `server/routers/metasMetas.ts`:

```typescript
const tipoEnum = z.enum(['ESTUDO', 'QUESTOES', 'REVISAO', 'REVISAO_DIFERIDA', 'SIMULADO']);
```

4. **Atualizar Frontend**: Adicionar cor ao objeto `TIPO_COLORS` em componentes:

```typescript
const TIPO_COLORS = {
  ESTUDO: 'bg-blue-500',
  QUESTOES: 'bg-green-500',
  REVISAO: 'bg-purple-500',
  REVISAO_DIFERIDA: 'bg-orange-500',
  SIMULADO: 'bg-pink-500', // NOVO
};
```

5. **Atualizar Lógica de Revisão**: Se o novo tipo deve gerar revisões automáticas, adicionar condição em `metasRevisao.ts`:

```typescript
if (meta.tipo === 'ESTUDO' || meta.tipo === 'SIMULADO') {
  await agendarRevisoes(metaId, dataConclusao);
}
```

### Modificando Intervalos de Revisão

Para modificar os intervalos de revisão espaçada (atualmente 1, 7, 30 dias), edite o array em `server/helpers/metasRevisao.ts`:

```typescript
const intervalos = [1, 7, 30]; // dias

// Exemplo: Revisões mais frequentes
const intervalos = [1, 3, 7, 14, 30]; // 5 revisões

// Exemplo: Revisões menos frequentes
const intervalos = [7, 30]; // 2 revisões
```

**Atenção:** Modificar intervalos não afeta revisões já agendadas, apenas novas metas concluídas após a mudança.

### Otimizando Queries de Analytics

As queries de analytics em `metasAnalyticsRouter.ts` podem ser otimizadas para grandes volumes de dados:

1. **Adicionar Índices**: Se uma query específica está lenta, analise o EXPLAIN e adicione índices apropriados:

```sql
-- Exemplo: Query de conclusaoPorDisciplina
CREATE INDEX idx_metas_disciplina_status ON metas(ktree_disciplina_id, status);
```

2. **Usar Materialized Views**: Para dashboards com dados agregados que não mudam frequentemente, considere criar uma tabela de cache:

```sql
CREATE TABLE metas_analytics_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  data_calculo DATE NOT NULL,
  total_metas INT,
  total_concluidas INT,
  tempo_total_sec INT,
  -- ... outros campos agregados
  INDEX idx_usuario_data (usuario_id, data_calculo)
);
```

Atualize o cache diariamente via cron job e consulte a tabela de cache no dashboard.

3. **Paginação**: Para queries que retornam muitos resultados, implemente paginação:

```typescript
conclusaoPorDisciplina: protectedProcedure
  .input(z.object({
    dataInicio: z.string().optional(),
    dataFim: z.string().optional(),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
  }))
  .query(async ({ ctx, input }) => {
    // ... query com LIMIT e OFFSET
  }),
```

### Debugging de Redistribuição

Se metas não estão sendo redistribuídas corretamente, siga este checklist:

1. **Verificar Dias Disponíveis**: Confirme que o bitfield está correto:

```sql
SELECT id, nome, dias_disponiveis, BIN(dias_disponiveis) as binario
FROM planos_estudo
WHERE usuario_id = ?;
```

2. **Verificar Capacidade**: Confirme que `horas_por_dia` está configurado corretamente:

```sql
SELECT id, nome, horas_por_dia, horas_por_dia * 60 as capacidade_minutos
FROM planos_estudo
WHERE usuario_id = ?;
```

3. **Verificar Metas Fixadas**: Metas com `fixed=true` não são redistribuídas:

```sql
SELECT id, display_number, scheduled_date, fixed
FROM metas
WHERE plano_id = ? AND fixed = true;
```

4. **Analisar Logs de Redistribuição**: Verifique o histórico de redistribuições:

```sql
SELECT l.*, m.display_number
FROM metas_log_redistribuicao l
JOIN metas m ON l.meta_id = m.id
WHERE m.plano_id = ?
ORDER BY l.criado_em DESC
LIMIT 20;
```

5. **Forçar Redistribuição Manual**: Via tRPC procedure:

```typescript
await trpc.metasPlanos.update.mutate({
  id: planoId,
  horas_por_dia: plano.horas_por_dia, // Mesmo valor dispara redistribuição
});
```

---

## Roadmap de Melhorias

### Curto Prazo (1-2 meses)

**1. Integração com KTree Real**

Atualmente, os campos `ktree_disciplina_id`, `ktree_assunto_id` e `ktree_topico_id` são strings livres. A integração com o KTree real da plataforma permitirá:

- Validação automática de disciplinas/assuntos/tópicos existentes
- Navegação hierárquica no frontend (ex: selecionar disciplina → assunto → tópico)
- Filtros avançados por taxonomia
- Estatísticas agregadas por hierarquia completa

**Implementação:**

1. Adicionar foreign keys em `metas`:

```sql
ALTER TABLE metas
ADD COLUMN disciplina_id INT,
ADD COLUMN assunto_id INT,
ADD COLUMN topico_id INT,
ADD FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
ADD FOREIGN KEY (assunto_id) REFERENCES assuntos(id),
ADD FOREIGN KEY (topico_id) REFERENCES topicos(id);
```

2. Migrar dados existentes:

```sql
UPDATE metas m
JOIN disciplinas d ON m.ktree_disciplina_id = d.nome
SET m.disciplina_id = d.id;
```

3. Atualizar frontend com selects hierárquicos.

**2. Notificações Push**

Implementar sistema de notificações para engajamento do aluno:

- Lembrete diário de metas (8h e 14h)
- Alerta de meta próxima do prazo (1 dia antes)
- Parabenização por conclusão de streak (7 dias consecutivos)
- Alerta de meta omitida (sugerir reagendamento)

**Implementação:**

Utilizar o sistema de avisos já existente na plataforma, criando avisos automáticos via cron job:

```typescript
// server/jobs/metasNotifications.ts
export async function enviarLembreteDiario() {
  const alunos = await buscarAlunosComMetasHoje();
  
  for (const aluno of alunos) {
    await criarAviso({
      usuario_id: aluno.id,
      tipo: 'individual',
      formato: 'toast',
      titulo: 'Metas de Hoje',
      mensagem: `Você tem ${aluno.total_metas} metas agendadas para hoje!`,
      cta_texto: 'Ver Metas',
      cta_url: `/metas/planos/${aluno.plano_id}/hoje`,
    });
  }
}
```

### Médio Prazo (3-6 meses)

**3. Exportação de Relatórios**

Adicionar funcionalidade de exportação de relatórios em PDF/Excel com gráficos e estatísticas detalhadas.

**Implementação:**

1. Criar novo router `metasRelatorios.ts`:

```typescript
export const metasRelatoriosRouter = router({
  exportarPDF: protectedProcedure
    .input(z.object({
      planoId: z.string(),
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dados = await coletarDadosRelatorio(input);
      const pdf = await gerarPDF(dados);
      return { url: await uploadS3(pdf) };
    }),
});
```

2. Utilizar biblioteca `pdfkit` ou `puppeteer` para geração de PDF.

3. Adicionar botão no dashboard: "Exportar Relatório".

**4. Gamificação**

Adicionar elementos de gamificação para aumentar engajamento:

- **Badges**: Conquistas por marcos (10 metas concluídas, 30 dias de streak, etc)
- **Níveis**: Sistema de XP baseado em tempo de estudo
- **Leaderboard**: Ranking de alunos por tempo de estudo (opcional, opt-in)
- **Streaks**: Contador de dias consecutivos estudando

**Implementação:**

1. Criar tabela `metas_badges`:

```sql
CREATE TABLE metas_badges (
  id VARCHAR(36) PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  conquistado_em DATETIME NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

2. Criar sistema de triggers que detecta conquistas:

```typescript
// Após conclusão de meta
if (totalMetasConcluidas === 10) {
  await criarBadge(userId, 'INICIANTE', 'Primeira Dezena');
}
```

### Longo Prazo (6-12 meses)

**5. IA para Recomendações Personalizadas**

Utilizar machine learning para recomendar ajustes personalizados no plano de estudo:

- Sugerir aumento/redução de duração de metas baseado em histórico
- Identificar horários de maior produtividade
- Recomendar revisões extras para disciplinas com baixa taxa de conclusão
- Prever probabilidade de omissão de uma meta

**Implementação:**

1. Coletar dados históricos de conclusões, omissões e tempos reais.

2. Treinar modelo de regressão para prever `duracao_real_sec` baseado em features:
   - Disciplina, assunto, tipo
   - Hora do dia, dia da semana
   - Histórico do aluno (taxa de conclusão, tempo médio)

3. Expor recomendações via novo endpoint:

```typescript
recomendacoes: protectedProcedure
  .input(z.object({ planoId: z.string() }))
  .query(async ({ ctx, input }) => {
    const modelo = await carregarModelo();
    const historico = await buscarHistorico(ctx.user.id);
    return modelo.prever(historico);
  }),
```

**6. Integração com Calendários Externos**

Permitir sincronização bidirecional com Google Calendar, Outlook, etc:

- Exportar metas como eventos de calendário
- Importar compromissos externos para bloquear horários
- Atualizar status de metas via calendário

**Implementação:**

1. Adicionar OAuth para Google Calendar API.

2. Criar endpoint de sincronização:

```typescript
sincronizarCalendario: protectedProcedure
  .input(z.object({ planoId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const metas = await buscarMetas(input.planoId);
    const calendar = await getGoogleCalendar(ctx.user);
    
    for (const meta of metas) {
      await calendar.events.insert({
        summary: `Meta: ${meta.ktree_disciplina_id}`,
        description: meta.orientacoes_estudo,
        start: { dateTime: meta.scheduled_date },
        end: { dateTime: addMinutes(meta.scheduled_date, meta.duracao_planejada_min) },
      });
    }
  }),
```

---

## Conclusão

O Módulo de Metas representa uma implementação completa e robusta de um sistema de gerenciamento de objetivos de estudo baseado na metodologia DOM-EARA®. Com 8 tabelas de banco de dados, 25 procedures tRPC, 6 páginas frontend e 3 helpers algorítmicos, o sistema oferece uma experiência completa desde a criação de planos até a análise detalhada de desempenho.

Os três pilares fundamentais - numeração única sequencial, revisão espaçada automática e distribuição inteligente - trabalham em conjunto para fornecer uma experiência de estudo otimizada e cientificamente embasada. A arquitetura em camadas garante manutenibilidade e escalabilidade, enquanto as decisões de design priorizaram eficiência, segurança e flexibilidade.

O roadmap de melhorias futuras expande as capacidades do sistema com integrações externas, gamificação e inteligência artificial, mantendo o foco na experiência do aluno e na eficácia do aprendizado.

---

## 📝 Histórico de Mudanças

### Novembro 2025 - Renomeação de Tabelas

**Problema:** Conflito de nomenclatura com tabela `metas` do módulo de gamificação.

**Solução:** Renomeação completa de todas as tabelas do módulo de cronograma:

| Tabela Original | Tabela Nova |
|----------------|-------------|
| `planos_estudo` | `metas_planos_estudo` |
| `metas` | `metas_cronograma` |
| `metas_log_conclusao` | `metas_cronograma_log_conclusao` |
| `metas_log_omissao` | `metas_cronograma_log_omissao` |
| `metas_log_redistribuicao` | `metas_cronograma_log_redistribuicao` |
| `metas_materiais` | `metas_cronograma_materiais` |
| `metas_questoes` | `metas_cronograma_questoes` |
| `metas_revisoes` | `metas_cronograma_revisoes` |

**Arquivos Atualizados:**
- `drizzle/schema-metas.ts` - Schema Drizzle com novos nomes
- `drizzle.config.ts` - Adicionado schema-metas.ts à configuração
- 4 routers: metasPlanos, metasMetas, metasBatchImport, metasAnalytics
- 3 helpers: metasNumeracao, metasRevisao, metasDistribuicao
- 2 scripts de seed: seed-metas.mjs, seed-metas-simple.mjs

**Migração:**
- `drizzle/migrations/001_rename_metas_tables.sql` - Migração completa com ajuste de FKs e índices
- `drizzle/migrations/001_rollback_rename.sql` - Script de rollback para reverter mudanças

**Resultado:** Sistema funcionando com novos nomes de tabelas, sem conflitos com módulo de gamificação. Seed executado com sucesso (1 plano + 10 metas).

---

**Documentação gerada por:** Manus AI  
**Última atualização:** Novembro 2025  
**Versão:** 1.1.0
