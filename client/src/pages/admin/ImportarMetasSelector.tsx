import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Página intermediária para selecionar plano antes de importar metas
 */
export default function ImportarMetasSelector() {
  const [, setLocation] = useLocation();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Buscar planos de estudo (metas_planos_estudo)
  const { data: plansData, isLoading } = trpc.admin.plans_v1.list.useQuery({});
  const plans = plansData?.plans || [];
  const handleContinue = () => {
    if (!selectedPlanId) {
      toast.error('Selecione um plano primeiro');
      return;
    }
    setLocation(`/admin/metas/importar/${selectedPlanId}`);
  };

  return (
    <AdminLayout
      title="Importar Metas"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Metas', href: '/admin/metas' },
        { label: 'Importar Metas' },
      ]}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Importar Metas em Lote</CardTitle>
          <CardDescription>
            Selecione o plano de estudo para importar múltiplas metas via Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando planos...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plano de Estudo</label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {plans && plans.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum plano ativo encontrado. Crie um plano primeiro em{' '}
                    <a href="/admin/planos" className="text-primary hover:underline">
                      Gestão de Planos
                    </a>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setLocation('/admin/metas')}>
                  Cancelar
                </Button>
                <Button onClick={handleContinue} disabled={!selectedPlanId}>
                  Continuar para Upload
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
