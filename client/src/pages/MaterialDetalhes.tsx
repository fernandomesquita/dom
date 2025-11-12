import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialVoteButtons } from "@/components/materials/MaterialVoteButtons";
import { MaterialRating } from "@/components/materials/MaterialRating";
import { MaterialStats } from "@/components/materials/MaterialStats";
import { MaterialDownloadButton } from "@/components/materials/MaterialDownloadButton";
import { MaterialFavoriteButton } from "@/components/materials/MaterialFavoriteButton";
import { 
  ChevronLeft, 
  Download,
  Eye,
  Calendar,
  Clock,
  FileText,
  Video,
  Headphones,
  Link as LinkIcon,
  BookOpen,
  FolderTree,
  Target,
  ThumbsUp,
  Star,
  Heart
} from "lucide-react";

/**
 * Página de detalhes de um material
 * Exibe informações completas e player de conteúdo
 */
export default function MaterialDetalhes() {
  const [, params] = useRoute("/materiais/:id");
  const materialId = params?.id ? parseInt(params.id) : 0;

  // Query do material
  const { data: material, isLoading } = trpc.materials.getById.useQuery(
    { id: materialId },
    { enabled: materialId > 0 }
  );

  // Mutation para incrementar view count (auto-tracking)
  const incrementViewMutation = trpc.materials.incrementView.useMutation();

  // Registrar visualização ao carregar
  useEffect(() => {
    if (materialId > 0) {
      incrementViewMutation.mutate({ materialId });
    }
  }, [materialId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!material) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Link href="/materiais">
            <Button variant="ghost" className="mb-6">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para Materiais
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Material não encontrado</h2>
              <p className="text-muted-foreground">
                O material que você está procurando não existe ou foi removido.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Helper para ícone de tipo
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Headphones className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Helper para cor de categoria
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'base':
        return 'bg-green-700 text-white hover:bg-green-800';
      case 'revisao':
        return 'bg-blue-700 text-white hover:bg-blue-800';
      case 'promo':
        return 'bg-purple-700 text-white hover:bg-purple-800';
      default:
        return 'bg-gray-700 text-white hover:bg-gray-800';
    }
  };

  // Renderizar player baseado no tipo do primeiro item
  const renderPlayer = () => {
    if (!material.items || material.items.length === 0) {
      return (
        <div className="bg-muted rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Conteúdo não disponível</p>
        </div>
      );
    }

    const firstItem = material.items[0];
    const url = firstItem.url;
    const type = firstItem.type.toLowerCase();

    if (!url) {
      return (
        <div className="bg-muted rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Conteúdo não disponível</p>
        </div>
      );
    }

    switch (type) {
      case 'video':
        // YouTube embed ou HTML5 video
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = url.includes('youtu.be') 
            ? url.split('/').pop()
            : new URL(url).searchParams.get('v');
          return (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allowFullScreen
                title={material.title}
              />
            </div>
          );
        }
        return (
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <video controls className="w-full h-full">
              <source src={url} type="video/mp4" />
              Seu navegador não suporta vídeo HTML5.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="bg-muted rounded-lg p-8">
            <audio controls className="w-full">
              <source src={url} type="audio/mpeg" />
              Seu navegador não suporta áudio HTML5.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="aspect-[3/4] rounded-lg overflow-hidden border">
            <iframe
              src={url}
              className="w-full h-full"
              title={material.title}
            />
          </div>
        );

      default:
        return (
          <div className="bg-muted rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Tipo de conteúdo não suportado</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/materiais" className="hover:text-foreground transition-colors">
              Voltar para Materiais
            </Link>
            <span>/</span>
            <span>Materiais</span>
            <span>/</span>
            <span className="text-foreground font-medium">{material.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getCategoryColor(material.category || 'base')}>
              {material.category === 'base' ? 'Base' : material.category === 'revisao' ? 'Revisão' : 'Promo'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {getTypeIcon(material.type)}
              <span className="capitalize">{material.type}</span>
            </Badge>
            {material.isPaid && (
              <Badge className="bg-orange-500 text-white hover:bg-orange-600">Premium</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{material.title}</h1>
          {material.description && (
            <p className="text-lg text-muted-foreground">{material.description}</p>
          )}
          
          {/* Componentes de Engagement */}
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t">
            <MaterialStats 
              viewCount={material.viewCount || 0}
              downloadCount={material.downloadCount || 0}
            />
            
            <MaterialVoteButtons 
              materialId={material.id}
              initialUpvotes={material.upvotes || 0}
              initialUserVote={material.userState?.hasUpvoted ? 'up' : null}
            />
            
            <MaterialRating 
              materialId={material.id}
              currentRating={material.averageRating ? Number(material.averageRating) : 0}
              ratingCount={material.ratingCount || 0}
              userRating={material.userState?.userRating || null}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 mt-4">
            <MaterialDownloadButton
              materialId={material.id}
              fileName={material.title}
              variant="default"
              size="lg"
              showText={true}
            />
            <MaterialFavoriteButton
              materialId={material.id}
              initialIsFavorite={material.userState?.isFavorite || false}
              variant="outline"
              size="lg"
              showText={true}
            />
          </div>
        </div>

        {/* Player */}
        <div>
          {renderPlayer()}
        </div>

        {/* Cards de informações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Visualizações</span>
                </div>
                <span className="font-medium">{material.viewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span>Downloads</span>
                </div>
                <span className="font-medium">{material.downloadCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Publicado em</span>
                </div>
                <span className="font-medium">
                  {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Avaliação da Comunidade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avaliação da Comunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Upvotes</span>
                </div>
                <span className="font-medium">{material.upvoteCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-red-500">
                  <Heart className="h-4 w-4 fill-current" />
                  <span>Favoritos</span>
                </div>
                <span className="font-medium">{material.favoriteCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Avaliação Média</span>
                </div>
                <span className="font-medium">
                  {material.averageRating ? Number(material.averageRating).toFixed(1) : '0.0'} / 5.0
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {material.items && material.items.length > 0 && material.items[0].duration && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duração</span>
                  </div>
                  <span className="font-medium">{Math.floor(material.items[0].duration / 60)} min</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Tipo</span>
                </div>
                <span className="font-medium capitalize">{material.type}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão de download */}
        {material.items && material.items.length > 0 && material.items[0].url && (
          <div className="flex justify-center">
            <Button asChild size="lg">
              <a href={material.items[0].url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Baixar Material
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
