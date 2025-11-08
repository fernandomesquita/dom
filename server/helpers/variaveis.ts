import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Variáveis disponíveis para templates
 */
export const VARIAVEIS_DISPONIVEIS = [
  { nome: "{{nome}}", descricao: "Nome completo do usuário" },
  { nome: "{{primeiroNome}}", descricao: "Primeiro nome do usuário" },
  { nome: "{{email}}", descricao: "Email do usuário" },
  { nome: "{{plano}}", descricao: "Nome do plano atual" },
  { nome: "{{dataInscricao}}", descricao: "Data de inscrição formatada" },
] as const;

/**
 * Interface de dados do usuário para substituição
 */
interface DadosUsuario {
  id: string;
  nomeCompleto: string;
  email: string;
  plano?: string;
  dataInscricao?: Date;
}

/**
 * Processar template substituindo variáveis por dados reais
 */
export async function processarVariaveis(
  template: string,
  userId: string
): Promise<string> {
  const db = await getDb();
  if (!db) return template;

  // Buscar dados do usuário
  const [usuario] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!usuario) return template;

  // Extrair primeiro nome
  const primeiroNome = usuario.nomeCompleto.split(' ')[0];

  // Formatar data de inscrição
  const dataInscricao = usuario.createdAt
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(usuario.createdAt))
    : '';

  // Mapa de substituições
  const substituicoes: Record<string, string> = {
    '{{nome}}': usuario.nomeCompleto,
    '{{primeiroNome}}': primeiroNome,
    '{{email}}': usuario.email,
    '{{plano}}': 'Gratuito', // TODO: Buscar plano real
    '{{dataInscricao}}': dataInscricao,
  };

  // Substituir todas as variáveis
  let resultado = template;
  for (const [variavel, valor] of Object.entries(substituicoes)) {
    resultado = resultado.replace(new RegExp(variavel, 'g'), valor);
  }

  return resultado;
}

/**
 * Extrair variáveis usadas em um template
 */
export function extrairVariaveis(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variaveis: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variavel = `{{${match[1]}}}`;
    if (!variaveis.includes(variavel)) {
      variaveis.push(variavel);
    }
  }

  return variaveis;
}

/**
 * Validar se todas as variáveis usadas são suportadas
 */
export function validarVariaveis(template: string): {
  valido: boolean;
  variaveisInvalidas: string[];
} {
  const variaveisUsadas = extrairVariaveis(template);
  const variaveisSuportadas = VARIAVEIS_DISPONIVEIS.map(v => v.nome);
  
  const variaveisInvalidas = variaveisUsadas.filter(
    v => !variaveisSuportadas.includes(v as any)
  );

  return {
    valido: variaveisInvalidas.length === 0,
    variaveisInvalidas,
  };
}

/**
 * Gerar preview de template com dados de exemplo
 */
export function gerarPreviewExemplo(template: string): string {
  const exemplos: Record<string, string> = {
    '{{nome}}': 'João Silva',
    '{{primeiroNome}}': 'João',
    '{{email}}': 'joao.silva@example.com',
    '{{plano}}': 'Premium',
    '{{dataInscricao}}': '15 de janeiro de 2024',
  };

  let resultado = template;
  for (const [variavel, valor] of Object.entries(exemplos)) {
    resultado = resultado.replace(new RegExp(variavel, 'g'), valor);
  }

  return resultado;
}
