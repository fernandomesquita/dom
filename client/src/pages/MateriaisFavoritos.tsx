import { Heart, FileText, Video, Headphones } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { MaterialFavoriteButton } from "@/components/materials/MaterialFavoriteButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StudentLayout } from "@/components/StudentLayout";

export default function MateriaisFavoritos() {
  const [, setLocation] = useLocation();
  const { data: favorites, isLoading } = trpc.admin.materials_v1.listFavorites.useQuery();
  const { data: favoritesCount } = trpc.admin.materials_v1.getFavoritesCount.useQuery();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Headphones className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'base':
        return 'bg-blue-100 text-blue-800';
      case 'revisao':
        return 'bg-green-100 text-green-800';
      case 'promo':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-red-500 fill-current" />
        <div>
          <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          <p className="text-muted-foreground">
            {favoritesCount || 0} {favoritesCount === 1 ? 'material favoritado' : 'materiais favoritados'}
          </p>
        </div>
      </div>

      {/* Lista de Favoritos */}
      {!favorites || favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum material favoritado</h3>
            <p className="text-muted-foreground mb-6">
              Comece a favoritar materiais para acessá-los rapidamente aqui!
            </p>
            <Button onClick={() => setLocation('/materiais')}>
              Explorar Materiais
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(material.type)}
                      <Badge className={getCategoryColor(material.category)}>
                        {material.category}
                      </Badge>
                      {material.isPaid && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {material.title}
                    </CardTitle>
                  </div>
                  
                  <MaterialFavoriteButton
                    materialId={material.id}
                    initialIsFavorite={true}
                    variant="ghost"
                    size="icon"
                  />
                </div>
              </CardHeader>

              <CardContent>
                {material.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {material.description}
                  </p>
                )}

                {/* Estatísticas */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span>👁️ {material.viewCount} visualizações</span>
                  <span>⭐ {Number(material.rating || 0).toFixed(1)}</span>
                </div>

                {/* Data de favoritação */}
                <p className="text-xs text-muted-foreground mb-4">
                  Favoritado {formatDistanceToNow(new Date(material.favoritedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>

                <Button
                  className="w-full"
                  onClick={() => setLocation(`/materiais/${material.id}`)}
                >
                  Ver Material
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </StudentLayout>
  );
}
