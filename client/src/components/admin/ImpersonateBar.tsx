import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function ImpersonateBar() {
  const [, setLocation] = useLocation();

  // Check if we're impersonating
  const impersonatedUser = sessionStorage.getItem("impersonated_user");
  const originalToken = sessionStorage.getItem("original_token");

  if (!impersonatedUser || !originalToken) {
    return null;
  }

  const user = JSON.parse(impersonatedUser);

  const handleExit = () => {
    // Restore original token
    localStorage.setItem("auth_token", originalToken);

    // Clear session storage
    sessionStorage.removeItem("original_token");
    sessionStorage.removeItem("impersonated_user");

    // Redirect to admin
    toast.info("Visualização encerrada");
    setLocation("/admin/alunos");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse" />
          <span className="font-semibold">
            Você está visualizando como: {user.nome}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExit}
          className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
        >
          <X className="mr-2 h-4 w-4" />
          Sair da Visualização
        </Button>
      </div>
    </div>
  );
}
