import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedMeta {
  tipo: 'ESTUDO' | 'QUESTOES' | 'REVISAO';
  ktreeDisciplinaId: string;
  ktreeAssuntoId: string;
  ktreeTopicoId?: string;
  ktreeSubtopicoId?: string;
  duracaoPlanejadaMin: number;
  orientacoesEstudo?: string;
  scheduledDate: string;
  fixed?: boolean;
}

export default function MetasImport() {
  const { planoId } = useParams<{ planoId: string }>();
  const [, setLocation] = useLocation();

  // ✅ TODOS OS HOOKS PRIMEIRO (antes de qualquer return)
  const [file, setFile] = useState<File | null>(null);
  const [parsedMetas, setParsedMetas] = useState<ParsedMeta[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);

  const batchUploadMutation = trpc.admin.goals_v1.batchUpload.useMutation({
    onSuccess: () => {
      toast.success('Metas importadas com sucesso!');
      setLocation(`/admin/metas`);
    },
    onError: (error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
  });

  // ✅ VALIDAÇÃO DEPOIS DOS HOOKS
  if (!planoId) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>Plano não especificado</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/admin/metas/importar')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Seleção de Plano
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadTemplate = () => {
    // Template para batchUpload com schema correto
    const example = [
      { 
        Tipo: 'ESTUDO', 
        DisciplinaId: 'uuid-da-disciplina-aqui', 
        AssuntoId: 'uuid-do-assunto-aqui', 
        TopicoId: '', 
        SubtopicoId: '', 
        DuracaoMin: 60, 
        DataAgendada: '2025-01-15' 
      },
      { 
        Tipo: 'QUESTOES', 
        DisciplinaId: 'uuid-da-disciplina-aqui', 
        AssuntoId: 'uuid-do-assunto-aqui', 
        TopicoId: 'uuid-do-topico-aqui', 
        SubtopicoId: '', 
        DuracaoMin: 45, 
        DataAgendada: '2025-01-16' 
      },
      { 
        Tipo: 'REVISAO', 
        DisciplinaId: 'uuid-da-disciplina-aqui', 
        AssuntoId: 'uuid-do-assunto-aqui', 
        TopicoId: '', 
        SubtopicoId: '', 
        DuracaoMin: 30, 
        DataAgendada: '2025-01-17' 
      },
    ];
    const ws = XLSX.utils.json_to_sheet(example);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Metas');
    XLSX.writeFile(wb, 'template-importacao-metas.xlsx');
    toast.success('Template baixado com sucesso!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    toast.success(`Arquivo selecionado: ${selectedFile.name}`);
  };

  const handleUpload = async () => {
    console.log('🔍 [handleUpload] Iniciando upload');
    console.log('🔍 [handleUpload] planoId:', planoId);
    console.log('🔍 [handleUpload] file:', file?.name);
    
    if (!file || !planoId) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }
    
    setImporting(true);
    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) {
          toast.error('Erro ao processar arquivo');
          setImporting(false);
          return;
        }
        
        console.log('🔍 [handleUpload] Enviando mutation');
        console.log('🔍 [handleUpload] Payload:', {
          planoId: planoId,
          fileBase64Length: base64.length,
        });
        
        // ✅ Enviar com planoId
        batchUploadMutation.mutate({
          planoId: planoId,
          fileBase64: base64,
        });
        setImporting(false);
      };
      reader.onerror = () => {
        toast.error('Erro ao ler arquivo');
        setImporting(false);
      };
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message);
      setImporting(false);
    }
  };



  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => setLocation(`/admin/metas/importar`)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Seleção de Plano
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importar Metas em Lote</h1>
          <p className="text-muted-foreground mt-2">
            Importe múltiplas metas de uma vez usando uma planilha Excel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Baixar Template</CardTitle>
            <CardDescription>
              Baixe o template Excel com a estrutura correta para importação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Template Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Selecionar Arquivo</CardTitle>
            <CardDescription>
              Faça upload do arquivo Excel preenchido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo
                </div>
              </Label>
              {file && (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{file.name}</span>
                </div>
              )}
            </div>

            {file && (
              <Button onClick={handleUpload} disabled={importing} className="mt-4">
                {importing ? 'Importando...' : 'Importar Metas'}
                <Upload className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
