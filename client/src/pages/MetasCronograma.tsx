import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, ArrowLeft, Target, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_COLORS = {
  ESTUDO: 'bg-blue-500',
  QUESTOES: 'bg-green-500',
  REVISAO: 'bg-purple-500',
  REVISAO_DIFERIDA: 'bg-orange-500',
};

const STATUS_ICONS = {
  PENDENTE: Clock,
  EM_ANDAMENTO: AlertCircle,
  CONCLUIDA: CheckCircle2,
  PRECISA_MAIS_TEMPO: XCircle,
};

export default function MetasCronograma() {
  const { planoId } = useParams<{ planoId: string }>();
  const [, setLocation] = useLocation();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const metasQuery = trpc.metasMetas.list.useQuery({
    planoId: planoId!,
    status: statusFilter as any,
    tipo: tipoFilter as any,
    dataInicio: startDate,
    dataFim: endDate,
    incluirOmitidas: false,
  }, {
    enabled: !!planoId,
  });

  const scheduleQuery = trpc.metasPlanos.getSchedule.useQuery({
    id: planoId!,
    startDate,
    endDate,
  }, {
    enabled: !!planoId,
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getMetasForDate = (date: Date) => {
    if (!metasQuery.data) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return metasQuery.data.filter((meta: any) => meta.scheduled_date === dateStr);
  };

  const getStatsForDate = (date: Date) => {
    if (!scheduleQuery.data?.schedule) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return scheduleQuery.data.schedule.find((s: any) => s.date === dateStr);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const selectedDateMetas = selectedDate ? getMetasForDate(selectedDate) : [];

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => setLocation(`/metas/planos/${planoId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Plano
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Cronograma de Metas
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize suas metas distribuídas ao longo do tempo
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="CONCLUIDA">Concluída</SelectItem>
              <SelectItem value="PRECISA_MAIS_TEMPO">Precisa Mais Tempo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="ESTUDO">Estudo</SelectItem>
              <SelectItem value="QUESTOES">Questões</SelectItem>
              <SelectItem value="REVISAO">Revisão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}

                  {days.map((day) => {
                    const metas = getMetasForDate(day);
                    const stats = getStatsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          min-h-24 p-2 rounded-lg border-2 transition-all
                          ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                          ${isToday ? 'bg-blue-50' : ''}
                        `}
                      >
                        <div className="text-sm font-semibold mb-1">
                          {format(day, 'd')}
                        </div>

                        {metas.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              {metas.length} meta{metas.length > 1 ? 's' : ''}
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {metas.slice(0, 3).map((meta: any) => (
                                <div
                                  key={meta.id}
                                  className={`w-2 h-2 rounded-full ${TIPO_COLORS[meta.tipo as keyof typeof TIPO_COLORS]}`}
                                />
                              ))}
                              {metas.length > 3 && (
                                <div className="text-xs">+{metas.length - 3}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {stats && stats.total_minutos > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.floor(stats.total_minutos / 60)}h{stats.total_minutos % 60}m
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : 'Selecione um dia'}
                </CardTitle>
                <CardDescription>
                  {selectedDateMetas.length} meta{selectedDateMetas.length !== 1 ? 's' : ''} agendada{selectedDateMetas.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateMetas.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma meta agendada para este dia
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateMetas.map((meta: any) => {
                      const StatusIcon = STATUS_ICONS[meta.status as keyof typeof STATUS_ICONS];
                      return (
                        <div
                          key={meta.id}
                          className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => setLocation(`/metas/${meta.id}`)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {meta.display_number}
                              </Badge>
                              <Badge className={TIPO_COLORS[meta.tipo as keyof typeof TIPO_COLORS]}>
                                {meta.tipo}
                              </Badge>
                            </div>
                            <StatusIcon className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="text-sm font-medium mb-1">
                            {meta.ktree_disciplina_id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meta.ktree_assunto_id}
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {meta.duracao_planejada_min} min
                          </div>

                          {meta.orientacoes_estudo && (
                            <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {meta.orientacoes_estudo}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {scheduleQuery.data?.statistics && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Estatísticas do Mês</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total de metas:</span>
                    <span className="font-semibold">{scheduleQuery.data.statistics.total_metas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo total:</span>
                    <span className="font-semibold">
                      {Math.floor(scheduleQuery.data.statistics.total_horas)}h
                      {Math.round((scheduleQuery.data.statistics.total_horas % 1) * 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Média/dia:</span>
                    <span className="font-semibold">
                      {Math.floor(scheduleQuery.data.statistics.media_horas_dia)}h
                      {Math.round((scheduleQuery.data.statistics.media_horas_dia % 1) * 60)}m
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
