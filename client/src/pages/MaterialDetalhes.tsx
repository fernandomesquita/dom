import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ThumbsUp, 
  Star, 
  Heart, 
  CheckCircle2,
  Download,
  Eye,
  Calendar,
  Clock,
  FileText,
  Video,
  Headphones,
  Play
} from "lucide-react";

/**
 * Página de visualização individual de material
 * 
 * Funcionalidades:
 * - Exibir detalhes completos do material
 * - Tabs para múltiplos items
 * - Botões de engajamento (upvote, rating, favoritar, marcar como visto)
 * - Player de vídeo/áudio ou viewer de PDF
 * - Estatísticas e informações
 */
export default function MaterialDetalhes() {
  const [, params] = useRoute("/materiais/:id");
  const materialId = params?.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [selectedRating, setSelectedRating] = useState(0);
  const [activeTab, setActiveTab] = useState("0");

  // Query do material
  const { data: material, isLoading, refetch } = trpc.materials.getById.useQuery(
    { id: materialId },
    { enabled: materialId > 0 }
  );

  // Mutations de engajamento
  const toggleUpvote = trpc.materials.toggleUpvote.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Upvote atualizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const setRating = trpc.materials.setRating.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Avaliação registrada!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleFavorite = trpc.materials.toggleFavorite.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Favorito atualizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAsSeen = trpc.materials.markAsSeen.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Marcado como visto!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const incrementView = trpc.materials.incrementView.useMutation();

  // Registrar visualização ao carregar
  useEffect(() => {
    if (materialId > 0) {
      incrementView.mutate({ materialId });
    }
  }, [materialId]);

  // Função para obter cor da categoria
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "base":
        return "bg-[#35463D] text-white";
      case "revisao":
        return "bg-[#6E9B84] text-white";
      case "promo":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Função para obter ícone do tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "audio":
        return <Headphones className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Função para renderizar player/viewer
  const renderPlayer = (item: any) => {
    if (item.type === "video") {
      // Extrair ID do YouTube
      const youtubeId = item.url?.includes("youtube.com") 
        ? new URL(item.url).searchParams.get("v")
        : item.url?.includes("youtu.be")
        ? item.url.split("/").pop()
        : null;

      if (youtubeId) {
        return (
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    } else if (item.type === "audio") {
      return (
        <div className="w-full bg-gray-100 rounded-lg p-6">
          <audio controls className="w-full">
            <source src={item.url} type="audio/mpeg" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      );
    } else if (item.type === "pdf") {
      return (
        <div className="w-full bg-gray-100 rounded-lg p-6 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">
            Visualização de PDF disponível após download
          </p>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-600">Formato não suportado</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Material não encontrado</CardTitle>
            <CardDescription>
              O material que você está procurando não existe ou foi removido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/materiais">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar para Materiais
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/materiais">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <Link href="/materiais">
              <span className="text-sm text-muted-foreground hover:underline cursor-pointer">
                Materiais
              </span>
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{material.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail e Informações */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(material.category)}>
                        {material.category === "base" ? "Base" : material.category === "revisao" ? "Revisão" : "Promo"}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeIcon(material.type)}
                        <span className="ml-1 capitalize">{material.type}</span>
                      </Badge>
                      {material.isPaid && (
                        <Badge className="bg-orange-500 text-white">Premium</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{material.title}</CardTitle>
                    {material.description && (
                      <CardDescription className="text-base">
                        {material.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs de Items */}
            {material.items && material.items.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      {material.items.map((item: any, index: number) => (
                        <TabsTrigger key={item.id} value={index.toString()}>
                          {getTypeIcon(item.type)}
                          <span className="ml-2">{item.title || `Item ${index + 1}`}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {material.items.map((item: any, index: number) => (
                      <TabsContent key={item.id} value={index.toString()}>
                        {renderPlayer(item)}
                        
                        {/* Informações do Item */}
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          {item.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {Math.floor(item.duration / 60)} min
                            </span>
                          )}
                          {item.fileSize && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Botões de Engajamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    toggleUpvote.mutate({ materialId });
                  }}
                  disabled={toggleUpvote.isPending}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Upvote ({material.upvotes})
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    toggleFavorite.mutate({ materialId });
                  }}
                  disabled={toggleFavorite.isPending}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Favoritar ({material.favoriteCount})
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    markAsSeen.mutate({ materialId });
                  }}
                  disabled={markAsSeen.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Visto
                </Button>

                {/* Rating */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Avaliar Material</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate("/login");
                            return;
                          }
                          setSelectedRating(star);
                          setRating.mutate({ materialId, rating: star });
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= selectedRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    Visualizações
                  </span>
                  <span className="font-medium">{material.viewCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    Downloads
                  </span>
                  <span className="font-medium">{material.downloadCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    Avaliação
                  </span>
                  <span className="font-medium">
                    {material.rating && Number(material.rating) > 0 
                      ? `${Number(material.rating).toFixed(1)} (${material.ratingCount})`
                      : "Sem avaliações"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Publicado
                  </span>
                  <span className="font-medium">
                    {new Date(material.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
