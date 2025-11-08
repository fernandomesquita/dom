import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Questions from "./pages/Questions";
import Exams from "./pages/Exams";
import ExamViewer from "./pages/ExamViewer";
import ExamReport from "./pages/ExamReport";
import Statistics from "./pages/Statistics";
import Notebooks from "./pages/Notebooks";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Materiais from "./pages/Materiais";
import MaterialDetalhes from "./pages/MaterialDetalhes";
import AdminMateriais from "./pages/AdminMateriais";
import MaterialsAnalytics from "./pages/MaterialsAnalytics";
import QuestionsImport from "@/pages/admin/QuestionsImport";
import AvisosAdmin from "@/pages/admin/AvisosAdmin";
import AvisosAnalytics from "@/pages/admin/AvisosAnalytics";
import AvisosFilas from "./pages/admin/AvisosFilas";
import AvisosTemplates from "./pages/admin/AvisosTemplates";
import AvisosAgendamentos from "./pages/admin/AvisosAgendamentos";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import ForumNovoThread from "./pages/ForumNovoThread";
import ForumCategoria from "./pages/ForumCategoria";
import ForumDashboard from "./pages/admin/ForumDashboard";
import ForumModeration from "./pages/admin/ForumModeration";
import MetasImport from "./pages/MetasImport";
import MetasCronograma from "./pages/MetasCronograma";
import MetasHoje from "./pages/MetasHoje";
import MetasPlanos from "./pages/MetasPlanos";
import MetaDetalhes from "@/pages/MetaDetalhes";
import MetaNova from "@/pages/MetaNova";
import MetasDashboard from "./pages/admin/MetasDashboard";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";

/**
 * Sistema DOM - Roteamento Principal
 * 
 * IMPORTANTE: Sistema usa AUTENTICAÇÃO SIMPLES (email + senha)
 * NÃO usa OAuth
 */

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path={"/"} component={Home} />
      <Route path={"/questoes"} component={Questions} />
      <Route path={"/simulados"} component={Exams} />
      <Route path={"/simulados/:attemptId"} component={ExamViewer} />
      <Route path={"/simulados/:attemptId/resultado"} component={ExamReport} />
      <Route path={"/estatisticas"} component={Statistics} />
      <Route path={"/cadernos"} component={Notebooks} />
      <Route path={"/login"} component={Login} />
      <Route path={"/cadastro"} component={Cadastro} />
      <Route path={"/materiais"} component={Materiais} />
      <Route path={"/materiais/:id"} component={MaterialDetalhes} />
      <Route path={"/admin/materiais"} component={AdminMateriais} />
      <Route path={"/admin/materiais/analytics"} component={MaterialsAnalytics} />
          <Route path="/admin/questoes/importar" component={QuestionsImport} />
          <Route path="/admin/avisos" component={AvisosAdmin} />
          <Route path="/admin/avisos/analytics" component={AvisosAnalytics} />
          <Route path="/admin/avisos/filas" component={AvisosFilas} />
          <Route path="/admin/avisos/templates" component={AvisosTemplates} />
          <Route path="/admin/avisos/agendamentos" component={AvisosAgendamentos} />
          <Route path="/forum" component={Forum} />
          <Route path="/forum/novo" component={ForumNovoThread} />
          <Route path="/forum/categoria/:id" component={ForumCategoria} />
          <Route path="/forum/thread/:id" component={ForumThread} />
          <Route path="/admin/forum/dashboard" component={ForumDashboard} />
          <Route path="/admin/forum/moderation" component={ForumModeration} />
          <Route path="/metas/planos/:planoId/importar" component={MetasImport} />
          <Route path="/metas/planos/:planoId/cronograma" component={MetasCronograma} />
          <Route path="/metas/planos/:planoId/hoje" component={MetasHoje} />
          <Route path="/metas/planos" component={MetasPlanos} />
          <Route path="/metas/:metaId" component={MetaDetalhes} />
      <Route path="/metas/planos/:planoId/nova" component={MetaNova} />
          <Route path="/admin/metas/dashboard" component={MetasDashboard} />
          <Route path={"/404"} component={NotFound} />
      {/* TODO: Adicionar rotas protegidas (dashboard, questões, etc) */}
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
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
