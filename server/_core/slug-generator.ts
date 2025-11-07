/**
 * Gerador de Slugs URL-Friendly
 * 
 * Converte texto em slug compatível com URLs:
 * - Remove acentos
 * - Converte para minúsculas
 * - Substitui espaços por hífens
 * - Remove caracteres especiais
 */

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas diacríticas (acentos)
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais (mantém letras, números, espaços e hífens)
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Substitui múltiplos hífens por um único
    .replace(/^-|-$/g, ""); // Remove hífens no início e fim
}

/**
 * Exemplos de uso:
 * 
 * generateSlug("Português") → "portugues"
 * generateSlug("Matemática Avançada") → "matematica-avancada"
 * generateSlug("Direito Constitucional - Teoria") → "direito-constitucional-teoria"
 * generateSlug("Língua Portuguesa & Literatura") → "lingua-portuguesa-literatura"
 */
