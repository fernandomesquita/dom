import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Headphones, 
  Search,
  Star,
  ThumbsUp,
  Eye,
  Download,
  TrendingUp,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

/**
 * Página de listagem de materiais para alunos
 * 
 * Funcionalidades:
 * - Filtros por categoria, tipo, disciplina
 * - Busca por título/descrição
 * - Paginação
 * - Cards visuais com badges
 * - Estatísticas de engajamento
 */
export default function Materiais() {
  const [category, setCategory] = useState<"base" | "revisao" | "promo" | "all">("all");
  const [type, setType] = useState<"video" | "pdf" | "audio" | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 12;

  // Query de materiais
  const { data: materials, isLoading } = trpc.materials.list.useQuery({
    category: category === "all" ? undefined : category,
    type: type === "all" ? undefined : type,
    search: search || undefined,
    limit,
    offset: page * limit,
  });

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
  const getTypeIcon = (materialType: string) => {
    switch (materialType) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "audio":
        return <Headphones className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">Materiais</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Materiais de Estudo</h1>
          <p className="text-muted-foreground">
            PDFs, vídeos e áudios organizados por disciplina, assunto e tópico
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar materiais..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro de Categoria */}
            <Select value={category} onValueChange={(val: any) => setCategory(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="revisao">Revisão</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Tipo */}
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="audio">Áudios</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid de Materiais */}
      <div className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : materials && materials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {materials.map((material) => (
                <Link key={material.id} href={`/materiais/${material.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={material.thumbnailUrl}
                        alt={material.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges no thumbnail */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className={getCategoryColor(material.category)}>
                          {material.category === "base" ? "Base" : material.category === "revisao" ? "Revisão" : "Promo"}
                        </Badge>
                        
                        {material.isFeatured && (
                          <Badge className="bg-yellow-500 text-white">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                      </div>

                      {/* Badge de tipo */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90">
                          {getTypeIcon(material.type)}
                          <span className="ml-1 capitalize">{material.type}</span>
                        </Badge>
                      </div>

                      {/* Badge de pago */}
                      {material.isPaid && (
                        <div className="absolute bottom-2 right-2">
                          <Badge className="bg-orange-500 text-white">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="flex-1">
                      <CardTitle className="line-clamp-2 text-base">
                        {material.title}
                      </CardTitle>
                      {material.description && (
                        <CardDescription className="line-clamp-2 text-sm">
                          {material.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardFooter className="pt-0">
                      <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {material.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {material.viewCount}
                          </span>
                          {material.rating && Number(material.rating) > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {Number(material.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        
                        {material.downloadCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {material.downloadCount}
                          </span>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                Página {page + 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!materials || materials.length < limit}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
