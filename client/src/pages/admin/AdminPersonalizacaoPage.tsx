import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Save, Palette } from 'lucide-react';

/**
 * Página de Personalização Visual do Sistema
 * 
 * Permite personalizar:
 * - Cores e temas
 * - Logo e favicon
 * - Textos personalizados
 * - Layout e aparência
 */
export default function AdminPersonalizacaoPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implementar mutation para salvar personalizações
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Personalizações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar personalizações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Personalização"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Personalização' },
      ]}
    >
      <div className="space-y-6">
        {/* Cores e Tema */}
        <Card>
          <CardHeader>
            <CardTitle>Cores e Tema</CardTitle>
            <CardDescription>
              Personalize as cores principais da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    defaultValue="#3B82F6"
                    className="w-20 h-10"
                  />
                  <Input
                    defaultValue="#3B82F6"
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    defaultValue="#10B981"
                    className="w-20 h-10"
                  />
                  <Input
                    defaultValue="#10B981"
                    placeholder="#10B981"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    defaultValue="#F59E0B"
                    className="w-20 h-10"
                  />
                  <Input
                    defaultValue="#F59E0B"
                    placeholder="#F59E0B"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo e Favicon */}
        <Card>
          <CardHeader>
            <CardTitle>Logo e Favicon</CardTitle>
            <CardDescription>
              Personalize a identidade visual da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logo-url">URL do Logo</Label>
                <Input
                  id="logo-url"
                  placeholder="https://exemplo.com/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: PNG transparente, 200x50px
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon-url">URL do Favicon</Label>
                <Input
                  id="favicon-url"
                  placeholder="https://exemplo.com/favicon.ico"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: ICO ou PNG, 32x32px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Textos Personalizados */}
        <Card>
          <CardHeader>
            <CardTitle>Textos Personalizados</CardTitle>
            <CardDescription>
              Personalize os textos exibidos na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome-message"
                defaultValue="Bem-vindo ao DOM-EARA! Organize seus estudos e alcance sua aprovação."
                placeholder="Digite a mensagem de boas-vindas"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-text">Texto do Rodapé</Label>
              <Input
                id="footer-text"
                defaultValue="© 2025 DOM-EARA. Todos os direitos reservados."
                placeholder="Digite o texto do rodapé"
              />
            </div>
          </CardContent>
        </Card>

        {/* Layout e Aparência */}
        <Card>
          <CardHeader>
            <CardTitle>Layout e Aparência</CardTitle>
            <CardDescription>
              Configure a aparência geral da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="font-family">Família de Fonte</Label>
                <Input
                  id="font-family"
                  defaultValue="Inter, system-ui, sans-serif"
                  placeholder="Nome da fonte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="border-radius">Raio de Borda (px)</Label>
                <Input
                  id="border-radius"
                  type="number"
                  defaultValue="8"
                  placeholder="8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Palette className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Personalizações
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
