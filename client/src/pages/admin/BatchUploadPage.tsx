import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BatchUploadPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const planId = params.id as string;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const utils = trpc.useUtils();

  const batchUploadMutation = trpc.admin.goals_v1.batchUpload.useMutation({
    onSuccess: (data) => {
      setUploading(false);
      if (data.errors.length > 0) {
        setErrors(data.errors);
        toast.warning(`${data.success} metas criadas, ${data.errors.length} erros encontrados`);
      } else {
        toast.success(`${data.success} metas criadas com sucesso!`);
        utils.admin.goals_v1.list.invalidate();
        setLocation(`/admin/planos/${planId}/metas`);
      }
    },
    onError: (error) => {
      setUploading(false);
      toast.error(`Erro no upload: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast.error('Apenas arquivos Excel (.xlsx, .xls) são permitidos');
        return;
      }
      setFile(selectedFile);
      setErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:*/*;base64, prefix

        batchUploadMutation.mutate({
          planoId: planId,
          fileBase64: base64Data,
        });
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setUploading(false);
      toast.error(`Erro ao ler arquivo: ${error.message}`);
    }
  };

  const downloadTemplate = () => {
    // Create template CSV content
    const template = `Titulo,Tipo,Duracao,Descricao
Estudar Direito Constitucional,ESTUDO,2h,Estudar os princípios fundamentais
Resolver questões de Direito Administrativo,QUESTOES,1h30min,Resolver 50 questões
Revisar Direito Penal,REVISAO,45min,Revisar anotações da semana`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_metas.csv';
    link.click();
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/admin/planos/${planId}/metas`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload em Lote</h1>
            <p className="text-gray-600 mt-1">
              Importe múltiplas metas de uma vez usando Excel
            </p>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Formato do Arquivo</h3>
              <p className="text-sm text-gray-600">
                O arquivo Excel deve conter as seguintes colunas:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li><strong>Titulo</strong> (obrigatório): Nome da meta</li>
                <li><strong>Tipo</strong> (obrigatório): ESTUDO, QUESTOES ou REVISAO</li>
                <li><strong>Duracao</strong> (obrigatório): Formato "1h30min" ou "45min"</li>
                <li><strong>Descricao</strong> (opcional): Descrição da meta</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Exemplos de Duração Válidos</h3>
              <div className="flex flex-wrap gap-2">
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">1h</code>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">30min</code>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">1h30min</code>
                <code className="px-2 py-1 bg-gray-100 rounded text-sm">2h15min</code>
              </div>
            </div>

            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Template (CSV)
            </Button>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo Excel
                  </span>
                </Button>
              </label>
              {file && (
                <p className="text-sm text-gray-600 mt-4">
                  Arquivo selecionado: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setLocation(`/admin/planos/${planId}/metas`)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Processando...' : 'Fazer Upload'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Erros encontrados durante o upload:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 10 && (
                    <li className="text-gray-600">
                      ... e mais {errors.length - 10} erros
                    </li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AdminLayout>
  );
}
