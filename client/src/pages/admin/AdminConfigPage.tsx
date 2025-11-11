import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

/**
 * Página de Configurações Gerais do Sistema
 * 
 * Permite configurar:
 * - Informações da plataforma
 * - Configurações de email
 * - Limites e quotas
 * - Manutenção
 */
export default function AdminConfigPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implementar mutation para salvar configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Configurações"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Configurações' },
      ]}
    >
      <div className="space-y-6">
        {/* Informações da Plataforma */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Plataforma</CardTitle>
            <CardDescription>
              Configure as informações básicas da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Nome da Plataforma</Label>
                <Input
                  id="platform-name"
                  defaultValue="DOM-EARA"
                  placeholder="Nome da plataforma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">URL da Plataforma</Label>
                <Input
                  id="platform-url"
                  defaultValue="https://domv4.up.railway.app"
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-description">Descrição</Label>
              <Textarea
                id="platform-description"
                defaultValue="Plataforma completa de mentoria com metodologia EARA® para organizar seus estudos e alcançar sua aprovação."
                placeholder="Descrição da plataforma"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Email</CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">Servidor SMTP</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Porta</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-user">Usuário</Label>
                <Input
                  id="smtp-user"
                  placeholder="noreply@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-from">Email Remetente</Label>
                <Input
                  id="smtp-from"
                  placeholder="DOM-EARA <noreply@exemplo.com>"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Usar TLS/SSL</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar criptografia para conexão SMTP
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Limites e Quotas */}
        <Card>
          <CardHeader>
            <CardTitle>Limites e Quotas</CardTitle>
            <CardDescription>
              Configure limites de uso da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="max-upload-size">Tamanho Máximo de Upload (MB)</Label>
                <Input
                  id="max-upload-size"
                  type="number"
                  defaultValue="10"
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-questions-per-exam">Questões por Simulado</Label>
                <Input
                  id="max-questions-per-exam"
                  type="number"
                  defaultValue="100"
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-forum-posts-per-day">Posts no Fórum/Dia</Label>
                <Input
                  id="max-forum-posts-per-day"
                  type="number"
                  defaultValue="20"
                  placeholder="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modo Manutenção */}
        <Card>
          <CardHeader>
            <CardTitle>Modo Manutenção</CardTitle>
            <CardDescription>
              Ative para exibir mensagem de manutenção aos usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Modo Manutenção Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Usuários verão uma página de manutenção
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
              <Textarea
                id="maintenance-message"
                defaultValue="Estamos realizando uma manutenção programada. Voltaremos em breve!"
                placeholder="Mensagem exibida durante manutenção"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
