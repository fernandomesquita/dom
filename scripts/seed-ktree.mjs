#!/usr/bin/env node

/**
 * Seed de Taxonomia (KTree) - Disciplinas, Assuntos e Tópicos
 * 
 * Popula as tabelas disciplinas, assuntos e topicos com dados realistas
 * de concursos públicos para testar o autocomplete do Módulo de Metas.
 * 
 * Uso: node scripts/seed-ktree.mjs
 */

import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

// Função para gerar slug
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

// Dados de disciplinas
const disciplinas = [
  { nome: "Direito Constitucional", codigo: "DIR001", cor: "#FF6B6B" },
  { nome: "Direito Administrativo", codigo: "DIR002", cor: "#4ECDC4" },
  { nome: "Direito Penal", codigo: "DIR003", cor: "#45B7D1" },
  { nome: "Direito Civil", codigo: "DIR004", cor: "#96CEB4" },
  { nome: "Direito Processual Civil", codigo: "DIR005", cor: "#FFEAA7" },
  { nome: "Direito Processual Penal", codigo: "DIR006", cor: "#DFE6E9" },
  { nome: "Português", codigo: "POR001", cor: "#74B9FF" },
  { nome: "Matemática", codigo: "MAT001", cor: "#A29BFE" },
  { nome: "Raciocínio Lógico", codigo: "RAC001", cor: "#FD79A8" },
  { nome: "Informática", codigo: "INF001", cor: "#FDCB6E" },
  { nome: "Administração Pública", codigo: "ADM001", cor: "#6C5CE7" },
  { nome: "Economia", codigo: "ECO001", cor: "#00B894" },
  { nome: "Contabilidade", codigo: "CON001", cor: "#E17055" },
];

// Dados de assuntos por disciplina
const assuntosPorDisciplina = {
  "Direito Constitucional": [
    "Princípios Fundamentais",
    "Direitos e Garantias Fundamentais",
    "Organização do Estado",
    "Organização dos Poderes",
    "Controle de Constitucionalidade",
    "Defesa do Estado e das Instituições",
  ],
  "Direito Administrativo": [
    "Princípios da Administração Pública",
    "Organização Administrativa",
    "Atos Administrativos",
    "Licitações e Contratos",
    "Serviços Públicos",
    "Responsabilidade Civil do Estado",
    "Processo Administrativo",
  ],
  "Direito Penal": [
    "Aplicação da Lei Penal",
    "Crime e Imputabilidade",
    "Concurso de Pessoas",
    "Penas e Medidas de Segurança",
    "Crimes contra a Pessoa",
    "Crimes contra o Patrimônio",
    "Crimes contra a Administração Pública",
  ],
  "Direito Civil": [
    "Lei de Introdução às Normas",
    "Pessoas Naturais e Jurídicas",
    "Bens e Fatos Jurídicos",
    "Negócio Jurídico",
    "Obrigações",
    "Contratos",
    "Responsabilidade Civil",
  ],
  "Direito Processual Civil": [
    "Normas Processuais",
    "Jurisdição e Competência",
    "Atos Processuais",
    "Tutela Provisória",
    "Procedimento Comum",
    "Recursos",
    "Cumprimento de Sentença",
  ],
  "Direito Processual Penal": [
    "Inquérito Policial",
    "Ação Penal",
    "Competência",
    "Provas",
    "Prisão e Liberdade Provisória",
    "Procedimentos",
    "Recursos",
  ],
  "Português": [
    "Ortografia e Acentuação",
    "Classes de Palavras",
    "Sintaxe",
    "Pontuação",
    "Concordância Verbal e Nominal",
    "Regência Verbal e Nominal",
    "Interpretação de Textos",
  ],
  "Matemática": [
    "Conjuntos Numéricos",
    "Razão e Proporção",
    "Porcentagem",
    "Equações e Inequações",
    "Funções",
    "Geometria Plana",
    "Estatística Básica",
  ],
  "Raciocínio Lógico": [
    "Lógica Proposicional",
    "Lógica de Argumentação",
    "Diagramas Lógicos",
    "Sequências e Padrões",
    "Verdades e Mentiras",
    "Associação Lógica",
  ],
  "Informática": [
    "Conceitos de Hardware",
    "Sistemas Operacionais",
    "Microsoft Office",
    "LibreOffice",
    "Internet e Navegadores",
    "Segurança da Informação",
    "Redes de Computadores",
  ],
  "Administração Pública": [
    "Princípios da Administração",
    "Estrutura Administrativa",
    "Gestão de Pessoas",
    "Gestão de Materiais",
    "Orçamento Público",
    "Controle Interno e Externo",
  ],
  "Economia": [
    "Microeconomia",
    "Macroeconomia",
    "Economia do Setor Público",
    "Economia Internacional",
    "Desenvolvimento Econômico",
  ],
  "Contabilidade": [
    "Contabilidade Geral",
    "Contabilidade Pública",
    "Análise de Balanços",
    "Custos",
    "Auditoria",
  ],
};

// Dados de tópicos por assunto (3-5 por assunto)
const topicosPorAssunto = {
  "Princípios Fundamentais": [
    "Fundamentos da República",
    "Objetivos Fundamentais",
    "Princípios das Relações Internacionais",
  ],
  "Direitos e Garantias Fundamentais": [
    "Direitos Individuais e Coletivos",
    "Direitos Sociais",
    "Direitos Políticos",
    "Remédios Constitucionais",
  ],
  "Organização do Estado": [
    "Organização Político-Administrativa",
    "União, Estados e Municípios",
    "Intervenção Federal",
  ],
  "Organização dos Poderes": [
    "Poder Legislativo",
    "Poder Executivo",
    "Poder Judiciário",
    "Funções Essenciais à Justiça",
  ],
  "Controle de Constitucionalidade": [
    "Controle Difuso",
    "Controle Concentrado",
    "ADI, ADC e ADPF",
  ],
  "Princípios da Administração Pública": [
    "LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência)",
    "Princípios Implícitos",
    "Supremacia do Interesse Público",
  ],
  "Atos Administrativos": [
    "Conceito e Elementos",
    "Atributos dos Atos",
    "Classificação dos Atos",
    "Extinção dos Atos",
  ],
  "Licitações e Contratos": [
    "Lei 14.133/2021 (Nova Lei de Licitações)",
    "Modalidades de Licitação",
    "Contratos Administrativos",
  ],
  "Aplicação da Lei Penal": [
    "Princípios do Direito Penal",
    "Lei Penal no Tempo",
    "Lei Penal no Espaço",
  ],
  "Crime e Imputabilidade": [
    "Conceito de Crime",
    "Dolo e Culpa",
    "Erro de Tipo e Erro de Proibição",
    "Causas de Exclusão da Ilicitude",
  ],
  "Crimes contra a Pessoa": [
    "Homicídio",
    "Lesão Corporal",
    "Crimes contra a Honra",
  ],
  "Crimes contra o Patrimônio": [
    "Furto",
    "Roubo",
    "Estelionato",
    "Apropriação Indébita",
  ],
  "Ortografia e Acentuação": [
    "Novo Acordo Ortográfico",
    "Regras de Acentuação",
    "Uso do Hífen",
  ],
  "Sintaxe": [
    "Termos Essenciais da Oração",
    "Termos Integrantes",
    "Termos Acessórios",
    "Período Composto",
  ],
  "Concordância Verbal e Nominal": [
    "Regras de Concordância Verbal",
    "Regras de Concordância Nominal",
    "Casos Especiais",
  ],
  "Conjuntos Numéricos": [
    "Números Naturais",
    "Números Inteiros",
    "Números Racionais",
    "Números Reais",
  ],
  "Razão e Proporção": [
    "Razão",
    "Proporção",
    "Grandezas Proporcionais",
    "Regra de Três",
  ],
  "Porcentagem": [
    "Conceito de Porcentagem",
    "Cálculos com Porcentagem",
    "Acréscimos e Descontos",
  ],
  "Lógica Proposicional": [
    "Proposições Simples e Compostas",
    "Conectivos Lógicos",
    "Tabelas-Verdade",
    "Tautologia e Contradição",
  ],
  "Diagramas Lógicos": [
    "Diagramas de Venn",
    "Silogismos",
    "Relações entre Conjuntos",
  ],
  "Sistemas Operacionais": [
    "Windows 10/11",
    "Linux Básico",
    "Gerenciamento de Arquivos",
  ],
  "Microsoft Office": [
    "Word (Processador de Texto)",
    "Excel (Planilhas)",
    "PowerPoint (Apresentações)",
  ],
  "Segurança da Informação": [
    "Malware e Antivírus",
    "Backup e Recuperação",
    "Criptografia",
    "Autenticação",
  ],
};

async function main() {
  console.log("🌱 Iniciando seed de taxonomia (KTree)...\n");

  // Conectar ao banco
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Limpar tabelas existentes (cuidado em produção!)
    console.log("🗑️  Limpando tabelas existentes...");
    await connection.execute("DELETE FROM topicos");
    await connection.execute("DELETE FROM assuntos");
    await connection.execute("DELETE FROM disciplinas");
    console.log("✅ Tabelas limpas\n");

    // Inserir disciplinas
    console.log("📚 Inserindo disciplinas...");
    const disciplinasMap = new Map();
    for (let i = 0; i < disciplinas.length; i++) {
      const disc = disciplinas[i];
      const id = randomUUID();
      await connection.execute(
        `INSERT INTO disciplinas (id, nome, codigo, slug, cor_hex, ativo, sort_order, created_by)
         VALUES (?, ?, ?, ?, ?, 1, ?, 'system')`,
        [id, disc.nome, disc.codigo, slugify(disc.nome), disc.cor, i]
      );
      disciplinasMap.set(disc.nome, id);
      console.log(`  ✓ ${disc.nome} (ID: ${id.substring(0, 8)}...)`);
    }
    console.log(`✅ ${disciplinas.length} disciplinas inseridas\n`);

    // Inserir assuntos
    console.log("📖 Inserindo assuntos...");
    const assuntosMap = new Map();
    let totalAssuntos = 0;
    for (const [disciplinaNome, assuntos] of Object.entries(assuntosPorDisciplina)) {
      const disciplinaId = disciplinasMap.get(disciplinaNome);
      if (!disciplinaId) continue;

      for (let i = 0; i < assuntos.length; i++) {
        const assunto = assuntos[i];
        const codigo = `ASS${String(totalAssuntos + 1).padStart(3, "0")}`;
        const id = randomUUID();
        await connection.execute(
          `INSERT INTO assuntos (id, disciplina_id, nome, codigo, slug, ativo, sort_order, created_by)
           VALUES (?, ?, ?, ?, ?, 1, ?, 'system')`,
          [id, disciplinaId, assunto, codigo, slugify(assunto), i]
        );
        assuntosMap.set(`${disciplinaNome}::${assunto}`, id);
        totalAssuntos++;
      }
      console.log(`  ✓ ${disciplinaNome}: ${assuntos.length} assuntos`);
    }
    console.log(`✅ ${totalAssuntos} assuntos inseridos\n`);

    // Inserir tópicos
    console.log("📝 Inserindo tópicos...");
    let totalTopicos = 0;
    for (const [assuntoNome, topicos] of Object.entries(topicosPorAssunto)) {
      // Encontrar disciplina e assunto
      let disciplinaId = null;
      let assuntoId = null;
      for (const [key, id] of assuntosMap.entries()) {
        if (key.endsWith(`::${assuntoNome}`)) {
          assuntoId = id;
          const disciplinaNome = key.split("::")[0];
          disciplinaId = disciplinasMap.get(disciplinaNome);
          break;
        }
      }

      if (!assuntoId || !disciplinaId) continue;

      for (let i = 0; i < topicos.length; i++) {
        const topico = topicos[i];
        const codigo = `TOP${String(totalTopicos + 1).padStart(3, "0")}`;
        const id = randomUUID();
        await connection.execute(
          `INSERT INTO topicos (id, assunto_id, disciplina_id, nome, codigo, slug, ativo, sort_order, created_by)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, 'system')`,
          [id, assuntoId, disciplinaId, topico, codigo, slugify(topico), i]
        );
        totalTopicos++;
      }
    }
    console.log(`✅ ${totalTopicos} tópicos inseridos\n`);

    // Estatísticas finais
    console.log("📊 Estatísticas finais:");
    console.log(`  • Disciplinas: ${disciplinas.length}`);
    console.log(`  • Assuntos: ${totalAssuntos}`);
    console.log(`  • Tópicos: ${totalTopicos}`);
    console.log(`  • Total: ${disciplinas.length + totalAssuntos + totalTopicos} registros\n`);

    console.log("🎉 Seed de taxonomia concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
