/**
 * Página de Importação em Lote de Questões
 * 
 * Funcionalidades:
 * - Upload de arquivo Excel/CSV
 * - Validação de estrutura
 * - Preview dos dados
 * - Importação batch
 * - Relatório de resultado
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface ParsedQuestion {
  uniqueCode?: string;
  statementText: string;
  questionType: 'multiple_choice' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  disciplinaId?: string;
  assuntoId?: string;
  topicoId?: string;
  examBoard?: string;
  examYear?: number;
  examInstitution?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  correctOption?: 'A' | 'B' | 'C' | 'D' | 'E';
  trueFalseAnswer?: boolean;
  explanationText?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; uniqueCode: string; error: string }>;
}

export default function QuestionsImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedQuestion[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkImportMutation = trpc.questions.bulkImport.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      toast.success(`${result.success} questões importadas com sucesso!`);
      if (result.failed > 0) {
        toast.error(`${result.failed} questões falharam`);
      }
    },
    onError: (error) => {
      toast.error(`Erro na importação: ${error.message}`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Parsear dados
        const questions: ParsedQuestion[] = json.map((row: any) => ({
          uniqueCode: row['Código'] || undefined,
          statementText: row['Enunciado'] || '',
          questionType: row['Tipo'] === 'Múltipla Escolha' ? 'multiple_choice' : 'true_false',
          difficulty: row['Dificuldade']?.toLowerCase() === 'fácil' ? 'easy' 
            : row['Dificuldade']?.toLowerCase() === 'média' ? 'medium' 
            : 'hard',
          disciplinaId: row['ID Disciplina'] || undefined,
          assuntoId: row['ID Assunto'] || undefined,
          topicoId: row['ID Tópico'] || undefined,
          examBoard: row['Banca'] || undefined,
          examYear: row['Ano'] ? Number(row['Ano']) : undefined,
          examInstitution: row['Instituição'] || undefined,
          optionA: row['Alternativa A'] || undefined,
          optionB: row['Alternativa B'] || undefined,
          optionC: row['Alternativa C'] || undefined,
          optionD: row['Alternativa D'] || undefined,
          optionE: row['Alternativa E'] || undefined,
          correctOption: row['Resposta Correta'] as 'A' | 'B' | 'C' | 'D' | 'E' | undefined,
          trueFalseAnswer: row['Verdadeiro/Falso'] === 'Verdadeiro' ? true 
            : row['Verdadeiro/Falso'] === 'Falso' ? false 
            : undefined,
          explanationText: row['Explicação'] || undefined,
        }));

        setParsedData(questions);
        toast.success(`${questions.length} questões carregadas do arquivo`);
      } catch (error) {
        toast.error('Erro ao processar arquivo. Verifique o formato.');
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('Nenhuma questão para importar');
      return;
    }

    setIsProcessing(true);
    try {
      await bulkImportMutation.mutateAsync({ questions: parsedData });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Código': 'Q001',
        'Enunciado': 'Qual é a capital do Brasil?',
        'Tipo': 'Múltipla Escolha',
        'Dificuldade': 'Fácil',
        'ID Disciplina': '',
        'ID Assunto': '',
        'ID Tópico': '',
        'Banca': 'CESPE',
        'Ano': 2024,
        'Instituição': 'UnB',
        'Alternativa A': 'São Paulo',
        'Alternativa B': 'Rio de Janeiro',
        'Alternativa C': 'Brasília',
        'Alternativa D': 'Salvador',
        'Alternativa E': 'Belo Horizonte',
        'Resposta Correta': 'C',
        'Verdadeiro/Falso': '',
        'Explicação': 'Brasília é a capital federal do Brasil desde 1960.',
      },
      {
        'Código': 'Q002',
        'Enunciado': 'O Brasil é o maior país da América do Sul.',
        'Tipo': 'Verdadeiro/Falso',
        'Dificuldade': 'Fácil',
        'ID Disciplina': '',
        'ID Assunto': '',
        'ID Tópico': '',
        'Banca': 'FCC',
        'Ano': 2024,
        'Instituição': 'USP',
        'Alternativa A': '',
        'Alternativa B': '',
        'Alternativa C': '',
        'Alternativa D': '',
        'Alternativa E': '',
        'Resposta Correta': '',
        'Verdadeiro/Falso': 'Verdadeiro',
        'Explicação': 'O Brasil possui a maior área territorial da América do Sul.',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questões');
    XLSX.writeFile(workbook, 'template-questoes.xlsx');
  };

  return (
    <AdminLayout
      title="Importação de Questões"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Questões', href: '/admin/questoes/importar' },
        { label: 'Importar' },
      ]}
    >
      <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Importação em Lote de Questões</h1>
        <p className="text-muted-foreground">
          Importe múltiplas questões de uma vez usando um arquivo Excel ou CSV
        </p>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Template de Importação
          </CardTitle>
          <CardDescription>
            Baixe o arquivo modelo para preencher com suas questões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar Template Excel
          </Button>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Arquivo
          </CardTitle>
          <CardDescription>
            Selecione um arquivo Excel (.xlsx) ou CSV com as questões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            {file && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Arquivo carregado: <strong>{file.name}</strong> ({parsedData.length} questões)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {parsedData.length > 0 && !importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Preview dos Dados</CardTitle>
            <CardDescription>
              Revise as questões antes de importar ({parsedData.length} questões)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Enunciado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Banca</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((q, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{q.uniqueCode || '(auto)'}</TableCell>
                      <TableCell className="max-w-md truncate">{q.statementText}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {q.questionType === 'multiple_choice' ? 'Múltipla Escolha' : 'V/F'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            q.difficulty === 'easy' ? 'default' : q.difficulty === 'medium' ? 'secondary' : 'destructive'
                          }
                        >
                          {q.difficulty === 'easy' ? 'Fácil' : q.difficulty === 'medium' ? 'Média' : 'Difícil'}
                        </Badge>
                      </TableCell>
                      <TableCell>{q.examBoard || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-sm text-muted-foreground mt-4">
                Mostrando 10 de {parsedData.length} questões
              </p>
            )}
            <div className="mt-6">
              <Button onClick={handleImport} disabled={isProcessing} size="lg">
                {isProcessing ? 'Importando...' : `Importar ${parsedData.length} Questões`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.failed === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Sucesso</span>
                </div>
                <p className="text-3xl font-bold">{importResult.success}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Falhas</span>
                </div>
                <p className="text-3xl font-bold">{importResult.failed}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Erros Detalhados:</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {importResult.errors.map((err, idx) => (
                    <Alert key={idx} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Linha {err.row}</strong> ({err.uniqueCode}): {err.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setFile(null);
                  setParsedData([]);
                  setImportResult(null);
                }}
              >
                Importar Mais Questões
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin/questoes'}>
                Ver Todas as Questões
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </AdminLayout>
  );
}
