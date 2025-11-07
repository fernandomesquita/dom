import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Materiais from "./pages/Materiais";
import MaterialDetalhes from "./pages/MaterialDetalhes";
import AdminMateriais from "./pages/AdminMateriais";
import MaterialsAnalytics from "./pages/MaterialsAnalytics";
import NotFound from "./pages/NotFound";

/**
 * Sistema DOM - Roteamento Principal
 * 
 * IMPORTANTE: Sistema usa AUTENTICAÇÃO SIMPLES (email + senha)
 * NÃO usa OAuth
 */

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/cadastro"} component={Cadastro} />
      <Route path={"/materiais"} component={Materiais} />
      <Route path={"/materiais/:id"} component={MaterialDetalhes} />
      <Route path={"/admin/materiais"} component={AdminMateriais} />
      <Route path={"/admin/materiais/analytics"} component={MaterialsAnalytics} />
      <Route path={"/404"} component={NotFound} />
      {/* TODO: Adicionar rotas protegidas (dashboard, questões, etc) */}
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
