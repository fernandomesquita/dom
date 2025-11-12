import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { StudentLayout } from "@/components/StudentLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AllPlans() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  const { data, isLoading, error } = trpc.plansPublic.list.useQuery({
    page,
    pageSize,
  });

  return (
    <StudentLayout>
      <div className="bg-gray-50 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Planos de Estudo</h1>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-gray-600">Carregando planos...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">Erro ao carregar planos</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          )}
          
          {data && (
            <div>
              <p className="mb-4 text-gray-600">
                {data.pagination.totalItems} {data.pagination.totalItems === 1 ? "plano encontrado" : "planos encontrados"}
              </p>
              
              {data.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum plano disponível no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.items.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {plan.featuredImageUrl && (
                        <img
                          src={plan.featuredImageUrl}
                          alt={plan.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sem+Imagem';
                          }}
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description || 'Sem descrição'}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-primary">
                            {plan.price || 'Gratuito'}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setLocation(`/planos/${plan.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-4 py-2">
                    Página {page} de {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
