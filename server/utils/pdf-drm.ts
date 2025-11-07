import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';

/**
 * Dados do usuário para marca d'água
 */
export interface WatermarkData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

/**
 * Gera um fingerprint único para o PDF
 * Usado para auditoria em caso de vazamento
 */
export function generatePDFFingerprint(userData: WatermarkData): string {
  const data = `${userData.name}|${userData.cpf}|${userData.email}|${userData.phone}|${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Adiciona marca d'água invisível em todas as páginas do PDF
 * 
 * A marca d'água contém:
 * - Nome completo do aluno
 * - CPF
 * - Email
 * - Telefone
 * - Data e hora do download
 * - Fingerprint único
 * 
 * A marca é renderizada em fonte pequena (4pt) e cor clara (quase branca)
 * para ser invisível a olho nu, mas detectável em análise forense.
 * 
 * @param pdfBuffer - Buffer do PDF original
 * @param userData - Dados do usuário para a marca d'água
 * @returns Buffer do PDF com marca d'água
 */
export async function addWatermarkToPDF(
  pdfBuffer: Buffer,
  userData: WatermarkData
): Promise<Buffer> {
  // Validar dados obrigatórios
  if (!userData.name || !userData.cpf || !userData.email || !userData.phone) {
    throw new Error('Dados incompletos para marca d\'água. Necessário: nome, CPF, email e telefone.');
  }
  
  // Carregar PDF
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  
  // Gerar fingerprint
  const fingerprint = generatePDFFingerprint(userData);
  const timestamp = new Date().toISOString();
  
  // Preparar texto da marca d'água
  const watermarkText = [
    `Licenciado para: ${userData.name}`,
    `CPF: ${userData.cpf}`,
    `Email: ${userData.email}`,
    `Telefone: ${userData.phone}`,
    `Download: ${timestamp}`,
    `ID: ${fingerprint}`,
  ].join(' | ');
  
  // Carregar fonte
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Adicionar marca d'água em todas as páginas
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    // Marca d'água no rodapé (invisível - cor quase branca, fonte pequena)
    page.drawText(watermarkText, {
      x: 10,
      y: 5,
      size: 4, // Fonte muito pequena
      font,
      color: rgb(0.98, 0.98, 0.98), // Quase branco (invisível a olho nu)
      opacity: 0.3, // Baixa opacidade
    });
    
    // Marca d'água adicional no topo (redundância)
    page.drawText(watermarkText, {
      x: 10,
      y: height - 10,
      size: 4,
      font,
      color: rgb(0.98, 0.98, 0.98),
      opacity: 0.3,
    });
    
    // Marca d'água diagonal no centro (muito sutil)
    const centerX = width / 2;
    const centerY = height / 2;
    
    page.drawText(`${userData.cpf} - ${fingerprint.substring(0, 16)}`, {
      x: centerX - 100,
      y: centerY,
      size: 6,
      font,
      color: rgb(0.97, 0.97, 0.97),
      opacity: 0.15,
    });
  }
  
  // Adicionar metadados ao PDF
  pdfDoc.setTitle('Material Protegido - DOM-EARA');
  pdfDoc.setAuthor('DOM-EARA Plataforma');
  pdfDoc.setSubject(`Licenciado para ${userData.name} - CPF ${userData.cpf}`);
  pdfDoc.setKeywords([fingerprint, userData.cpf, timestamp]);
  pdfDoc.setProducer('DOM-EARA DRM System v1.0');
  pdfDoc.setCreator('DOM-EARA');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());
  
  // Salvar PDF modificado
  const pdfBytes = await pdfDoc.save();
  
  return Buffer.from(pdfBytes);
}

/**
 * Verifica se um PDF contém marca d'água (análise forense)
 * 
 * Esta função pode ser usada para identificar o usuário que baixou
 * um PDF vazado, extraindo os metadados e o fingerprint.
 * 
 * @param pdfBuffer - Buffer do PDF suspeito
 * @returns Dados extraídos da marca d'água (se encontrados)
 */
export async function extractWatermarkData(
  pdfBuffer: Buffer
): Promise<{
  fingerprint?: string;
  cpf?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
} | null> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Extrair metadados
    const title = pdfDoc.getTitle();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    const producer = pdfDoc.getProducer();
    const creator = pdfDoc.getCreator();
    const creationDate = pdfDoc.getCreationDate();
    
    // Tentar extrair fingerprint dos keywords
    const fingerprintMatch = keywords?.match(/[a-f0-9]{64}/);
    const fingerprint = fingerprintMatch ? fingerprintMatch[0] : undefined;
    
    // Tentar extrair CPF do subject
    const cpfMatch = subject?.match(/CPF (\d{11})/);
    const cpf = cpfMatch ? cpfMatch[1] : undefined;
    
    // Retornar dados encontrados
    return {
      fingerprint,
      cpf,
      timestamp: creationDate?.toISOString(),
      metadata: {
        title,
        subject,
        keywords,
        producer,
        creator,
      },
    };
  } catch (error) {
    console.error('Erro ao extrair marca d\'água:', error);
    return null;
  }
}

/**
 * Valida se o perfil do usuário está completo para download de PDF
 * 
 * @param user - Dados do usuário
 * @returns true se o perfil está completo, false caso contrário
 */
export function validateUserProfileForDownload(user: {
  nomeCompleto?: string | null;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
}): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!user.nomeCompleto) missingFields.push('Nome completo');
  if (!user.cpf) missingFields.push('CPF');
  if (!user.email) missingFields.push('Email');
  if (!user.telefone) missingFields.push('Telefone');
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}
