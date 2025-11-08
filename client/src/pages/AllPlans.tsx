import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function AllPlans() {
  const [, setLocation] = useLocation();
  
  const { data, isLoading, error } = trpc.plansPublic.list.useQuery({
    search: "",
    page: 1,
    pageSize: 50,
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Planos de Estudo</h1>
          
          {isLoading && <p>Carregando planos...</p>}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">Erro: {error.message}</p>
            </div>
          )}
          
          {data && (
            <div>
              <p className="mb-4 text-gray-600">
                {data.pagination.totalItems} {data.pagination.totalItems === 1 ? "plano encontrado" : "planos encontrados"}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={plan.featuredImageUrl}
                      alt={plan.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary">{plan.price}</span>
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
