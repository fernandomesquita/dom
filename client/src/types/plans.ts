// ========================================
// TIPOS DE PLANOS
// Baseados no schema REAL do backend
// ========================================

// ===== ENUMS =====

export type PlanCategory = 'Pago' | 'Gratuito';

export type EditalStatus = 'Pré-edital' | 'Pós-edital' | 'N/A';

// ===== INTERFACE PRINCIPAL =====

export interface Plan {
  // Identificação
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  
  // Classificação
  category: PlanCategory;
  entity?: string | null;
  role?: string | null;
  editalStatus: EditalStatus;
  
  // Imagens e links
  featuredImageUrl?: string | null;
  landingPageUrl?: string | null;
  
  // Modelo de negócio
  price?: string | null;
  durationDays?: number | null;
  
  // Tags
  tags?: string[] | null;
  
  // Controle de visibilidade
  isFeatured: boolean;
  isHidden: boolean;
  disponivel: boolean;
  
  // Auditoria
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ===== FILTROS =====

export interface PlanFilters {
  entity?: string;
  role?: string;
  editalStatus?: Exclude<EditalStatus, 'N/A'>; // Público nunca filtra por N/A
  category?: PlanCategory;
  page?: number;
  limit?: number;
}

// ===== RESPONSES =====

export interface PlanListResponse {
  plans: Plan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EnrollResponse {
  success: boolean;
  enrollmentId: string;
  expiresAt: Date | string;
  message: string;
  redirectTo: string;
}

export interface UserEnrollment {
  id: string;
  planId: string;
  enrolledAt: Date | string;
  expiresAt: Date | string;
  status: string;
  // Dados do plano (LEFT JOIN)
  planName?: string;
  planSlug?: string;
  planCategory?: PlanCategory;
}

// ===== HELPERS =====

// Verifica se plano está visível para o público
export function isPlanVisible(plan: Plan): boolean {
  return !plan.isHidden && plan.disponivel;
}

// Formata preço para exibição
export function formatPrice(price?: string | null): string {
  if (!price) return 'Gratuito';
  return price;
}

// Formata duração para exibição
export function formatDuration(days?: number | null): string {
  if (!days) return 'Acesso vitalício';
  if (days === 30) return '1 mês';
  if (days === 90) return '3 meses';
  if (days === 180) return '6 meses';
  if (days === 365) return '1 ano';
  return `${days} dias`;
}

// Badge de categoria
export function getCategoryBadgeColor(category: PlanCategory): string {
  return category === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
}

// Badge de status de edital
export function getEditalStatusBadgeColor(status: EditalStatus): string {
  switch (status) {
    case 'Pré-edital':
      return 'bg-yellow-100 text-yellow-800';
    case 'Pós-edital':
      return 'bg-purple-100 text-purple-800';
    case 'N/A':
      return 'bg-gray-100 text-gray-800';
  }
}
