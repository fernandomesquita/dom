import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Info, AlertTriangle, AlertCircle, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

/**
 * E10: Carrossel de Avisos
 * 
 * Carrossel elegante com:
 * - 4 tipos de avisos (informativo, importante, urgente, manutenção)
 * - Auto-play (5s por slide)
 * - Navegação manual (setas)
 * - Indicadores de posição
 * - Responsivo
 */

interface Notice {
  id: string;
  title: string;
  content: string;
  type: "INFORMATIVO" | "IMPORTANTE" | "URGENTE" | "MANUTENCAO";
  priority: number;
}

export function NoticesCarousel() {
  // Buscar avisos ativos (mock por enquanto)
  // TODO: Integrar com trpc.notices.getActive.useQuery()
  const notices: Notice[] = [
    {
      id: "1",
      title: "Bem-vindo ao DOM!",
      content: "Sua jornada rumo à aprovação começa aqui. Complete sua primeira meta hoje!",
      type: "INFORMATIVO",
      priority: 1,
    },
    {
      id: "2",
      title: "Nova funcionalidade: Revisões Inteligentes",
      content: "Agora você pode revisar conteúdos com base na curva de esquecimento. Confira!",
      type: "IMPORTANTE",
      priority: 5,
    },
    {
      id: "3",
      title: "⚠️ Manutenção programada",
      content: "Sistema ficará indisponível amanhã das 2h às 4h para melhorias.",
      type: "MANUTENCAO",
      priority: 8,
    },
  ];

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Ícone por tipo
  const getNoticeIcon = (type: Notice["type"]) => {
    switch (type) {
      case "INFORMATIVO":
        return <Info className="h-5 w-5" />;
      case "IMPORTANTE":
        return <AlertTriangle className="h-5 w-5" />;
      case "URGENTE":
        return <AlertCircle className="h-5 w-5" />;
      case "MANUTENCAO":
        return <Wrench className="h-5 w-5" />;
    }
  };

  // Cor por tipo
  const getNoticeColor = (type: Notice["type"]) => {
    switch (type) {
      case "INFORMATIVO":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";
      case "IMPORTANTE":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300";
      case "URGENTE":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300";
      case "MANUTENCAO":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300";
    }
  };

  // Badge variant por tipo
  const getBadgeVariant = (type: Notice["type"]) => {
    switch (type) {
      case "INFORMATIVO":
        return "default";
      case "IMPORTANTE":
        return "secondary";
      case "URGENTE":
        return "destructive";
      case "MANUTENCAO":
        return "outline";
    }
  };

  if (notices.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="container">
        <div className="relative">
          {/* Carrossel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {notices.map((notice) => (
                <div key={notice.id} className="flex-[0_0_100%] min-w-0">
                  <Card
                    className={`p-4 border-2 ${getNoticeColor(notice.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNoticeIcon(notice.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">
                            {notice.title}
                          </h3>
                          <Badge variant={getBadgeVariant(notice.type)} className="text-xs">
                            {notice.type}
                          </Badge>
                        </div>
                        <p className="text-sm">{notice.content}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navegação (apenas se houver mais de 1 aviso) */}
          {notices.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
                onClick={scrollNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Indicadores de posição */}
        {notices.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {notices.map((_, index) => (
              <button
                key={index}
                className="h-2 w-2 rounded-full bg-muted hover:bg-muted-foreground/50 transition-colors"
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
