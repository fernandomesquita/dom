import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface TaxonomiaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: any;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmImport: () => void;
  isPreviewLoading: boolean;
  isImportLoading: boolean;
}

export function TaxonomiaImportDialog({
  open,
  onOpenChange,
  previewData,
  onFileUpload,
  onConfirmImport,
  isPreviewLoading,
  isImportLoading,
}: TaxonomiaImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Taxonomia via Excel</DialogTitle>
          <DialogDescription>
            Faça upload do arquivo Excel preenchido para importar disciplinas, assuntos e tópicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload de arquivo */}
          <div>
            <Label htmlFor="file-upload" className="block mb-2">
              Selecione o arquivo Excel
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileUpload}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              {isPreviewLoading && (
                <div className="text-sm text-muted-foreground">Processando...</div>
              )}
            </div>
          </div>

          {/* Preview dos dados */}
          {previewData && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {previewData.resumo.podeSalvar ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Resumo da Importação
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Disciplinas</div>
                    <div className="font-semibold text-lg">{previewData.resumo.totalDisciplinas}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Assuntos</div>
                    <div className="font-semibold text-lg">{previewData.resumo.totalAssuntos}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tópicos</div>
                    <div className="font-semibold text-lg">{previewData.resumo.totalTopicos}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Válidos</div>
                    <div className="font-semibold text-lg text-green-600">{previewData.resumo.totalValidos}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Inválidos</div>
                    <div className="font-semibold text-lg text-red-600">{previewData.resumo.totalInvalidos}</div>
                  </div>
                </div>
              </div>

              {/* Disciplinas */}
              {previewData.disciplinas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Disciplinas ({previewData.disciplinas.length})</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Linha</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Cor</TableHead>
                          <TableHead>Erro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.disciplinas.slice(0, 10).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.linha}</TableCell>
                            <TableCell>
                              {item.valido ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.codigo || '-'}</Badge>
                            </TableCell>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell>
                              {item.corHex && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: item.corHex }}
                                  />
                                  <span className="text-xs">{item.corHex}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-red-600 text-sm">{item.erro}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewData.disciplinas.length > 10 && (
                      <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                        ... e mais {previewData.disciplinas.length - 10} disciplinas
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assuntos */}
              {previewData.assuntos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Assuntos ({previewData.assuntos.length})</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Linha</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Erro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.assuntos.slice(0, 10).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.linha}</TableCell>
                            <TableCell>
                              {item.valido ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge>{item.disciplinaNome}</Badge>
                            </TableCell>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell className="text-red-600 text-sm">{item.erro}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewData.assuntos.length > 10 && (
                      <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                        ... e mais {previewData.assuntos.length - 10} assuntos
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tópicos */}
              {previewData.topicos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tópicos ({previewData.topicos.length})</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Linha</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>Assunto</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Erro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.topicos.slice(0, 10).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.linha}</TableCell>
                            <TableCell>
                              {item.valido ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.disciplinaNome}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge>{item.assuntoNome}</Badge>
                            </TableCell>
                            <TableCell>{item.nome}</TableCell>
                            <TableCell className="text-red-600 text-sm">{item.erro}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewData.topicos.length > 10 && (
                      <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                        ... e mais {previewData.topicos.length - 10} tópicos
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirmImport}
            disabled={!previewData || !previewData.resumo.podeSalvar || isImportLoading}
          >
            {isImportLoading ? 'Importando...' : 'Confirmar Importação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
