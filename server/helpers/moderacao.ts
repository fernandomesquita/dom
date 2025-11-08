/**
 * Helper de Moderação Automática
 * Detecta conteúdo suspeito (links, emails, telefones)
 */

interface ResultadoModeracao {
  aprovado: boolean;
  motivosSuspeitos: string[];
}

/**
 * Verifica se o conteúdo contém padrões suspeitos
 */
export function verificarConteudo(conteudo: string): ResultadoModeracao {
  const motivosSuspeitos: string[] = [];

  // Remover tags HTML para análise
  const textoLimpo = conteudo.replace(/<[^>]*>/g, '');

  // Detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = textoLimpo.match(urlRegex);
  if (urls && urls.length > 0) {
    motivosSuspeitos.push(`Contém ${urls.length} link(s)`);
  }

  // Detectar emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = textoLimpo.match(emailRegex);
  if (emails && emails.length > 0) {
    motivosSuspeitos.push(`Contém ${emails.length} email(s)`);
  }

  // Detectar telefones (brasileiro)
  const telefoneRegex = /(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g;
  const telefones = textoLimpo.match(telefoneRegex);
  if (telefones && telefones.length > 0) {
    motivosSuspeitos.push(`Contém ${telefones.length} telefone(s)`);
  }

  // Detectar WhatsApp
  if (textoLimpo.toLowerCase().includes('whatsapp') || textoLimpo.toLowerCase().includes('whats')) {
    motivosSuspeitos.push('Menciona WhatsApp');
  }

  // Detectar palavras spam comuns
  const palavrasSpam = [
    'compre agora',
    'clique aqui',
    'ganhe dinheiro',
    'renda extra',
    'trabalhe em casa',
    'promoção imperdível',
  ];

  for (const palavra of palavrasSpam) {
    if (textoLimpo.toLowerCase().includes(palavra)) {
      motivosSuspeitos.push(`Contém palavra suspeita: "${palavra}"`);
      break;
    }
  }

  return {
    aprovado: motivosSuspeitos.length === 0,
    motivosSuspeitos,
  };
}

/**
 * Verifica se um domínio está na whitelist
 */
export async function verificarDominioWhitelist(
  url: string,
  whitelist: string[]
): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const dominio = urlObj.hostname;

    return whitelist.some((d) => dominio.includes(d));
  } catch {
    return false;
  }
}

/**
 * Sanitiza HTML removendo scripts e tags perigosas
 */
export function sanitizarHTML(html: string): string {
  // Remove scripts
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  html = html.replace(/on\w+="[^"]*"/gi, '');
  html = html.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: e vbscript:
  html = html.replace(/javascript:/gi, '');
  html = html.replace(/vbscript:/gi, '');

  // Remove iframes
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove embeds e objects
  html = html.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  return html;
}

/**
 * Verifica se usuário pode postar (não está suspenso)
 */
export function verificarSuspensao(
  suspensoes: Array<{ fimSuspensao: Date; isAtiva: boolean }>
): { suspenso: boolean; fimSuspensao?: Date } {
  const agora = new Date();

  const suspensaoAtiva = suspensoes.find(
    (s) => s.isAtiva && new Date(s.fimSuspensao) > agora
  );

  if (suspensaoAtiva) {
    return {
      suspenso: true,
      fimSuspensao: new Date(suspensaoAtiva.fimSuspensao),
    };
  }

  return { suspenso: false };
}
