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

  const [file, setFile] = useState<File | null>(null);
  const [parsedMetas, setParsedMetas] = useState<ParsedMeta[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);

  const templateQuery = trpc.metasBatchImport.getTemplate.useQuery();
  const validateMutation = trpc.metasBatchImport.validate.useMutation();
  const importMutation = trpc.metasBatchImport.import.useMutation();

  const handleDownloadTemplate = () => {
    if (!templateQuery.data) return;
    const { headers, example } = templateQuery.data;
    const ws = XLSX.utils.json_to_sheet(example, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Metas');
    XLSX.writeFile(wb, 'template-importacao-metas.xlsx');
    toast.success('Template baixado com sucesso!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsedMetas([]);
    setValidationResult(null);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const metas: ParsedMeta[] = jsonData.map((row: any) => ({
        tipo: row.tipo,
        ktreeDisciplinaId: row.ktreeDisciplinaId,
        ktreeAssuntoId: row.ktreeAssuntoId,
        ktreeTopicoId: row.ktreeTopicoId || undefined,
        ktreeSubtopicoId: row.ktreeSubtopicoId || undefined,
        duracaoPlanejadaMin: Number(row.duracaoPlanejadaMin),
        orientacoesEstudo: row.orientacoesEstudo || undefined,
        scheduledDate: row.scheduledDate,
        fixed: row.fixed === 'true' || row.fixed === true,
      }));
      setParsedMetas(metas);
      toast.success(`${metas.length} linhas lidas do arquivo`);
    } catch (error: any) {
      toast.error('Erro ao ler arquivo: ' + error.message);
    }
  };

  const handleValidate = async () => {
    if (!planoId || parsedMetas.length === 0) return;
    try {
      const result = await validateMutation.mutateAsync({
        planoId,
        metas: parsedMetas,
      });
      setValidationResult(result);
      if (result.valid) {
        toast.success('Validação concluída sem erros!');
      } else {
        toast.error(`Validação encontrou ${result.errors.length} erro(s)`);
      }
    } catch (error: any) {
      toast.error('Erro na validação: ' + error.message);
    }
  };

  const handleImport = async () => {
    if (!planoId || parsedMetas.length === 0) return;
    setImporting(true);
    try {
      const result = await importMutation.mutateAsync({
        planoId,
        metas: parsedMetas,
        skipDuplicates,
      });
      toast.success(`Importação concluída! ${result.imported} importadas, ${result.skipped} puladas, ${result.failed} falhas`);
      if (result.imported > 0) {
        setTimeout(() => setLocation(`/metas/planos/${planoId}`), 2000);
      }
    } catch (error: any) {
      toast.error('Erro na importação: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => setLocation(`/metas/planos/${planoId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Plano
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
            <Button onClick={handleDownloadTemplate} disabled={templateQuery.isLoading}>
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

            {parsedMetas.length > 0 && (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>
                  {parsedMetas.length} metas lidas do arquivo
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {parsedMetas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>3. Validar Dados</CardTitle>
              <CardDescription>
                Valide os dados antes de importar para identificar erros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleValidate} disabled={validateMutation.isPending}>
                {validateMutation.isPending ? 'Validando...' : 'Validar Dados'}
              </Button>

              {validationResult && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Badge variant={validationResult.valid ? 'default' : 'destructive'}>
                      {validationResult.valid ? 'Válido' : 'Erros Encontrados'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Total de linhas: {validationResult.totalRows}
                    </span>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Erros ({validationResult.errors.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {validationResult.errors.map((err: any, idx: number) => (
                          <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                            <span className="font-medium">Linha {err.row}:</span> {err.field} - {err.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Avisos ({validationResult.warnings.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {validationResult.warnings.map((warn: any, idx: number) => (
                          <div key={idx} className="text-sm bg-yellow-50 p-2 rounded">
                            <span className="font-medium">Linha {warn.row}:</span> {warn.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle>4. Importar</CardTitle>
              <CardDescription>
                Confirme a importação das metas validadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                />
                <Label htmlFor="skip-duplicates" className="text-sm cursor-pointer">
                  Pular metas duplicadas (recomendado)
                </Label>
              </div>

              <Button
                onClick={handleImport}
                disabled={!validationResult.valid || importing}
                size="lg"
              >
                {importing ? 'Importando...' : 'Importar Metas'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
