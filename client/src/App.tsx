import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAutoRefresh } from "./hooks/useAutoRefresh";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import AllPlans from "./pages/AllPlans";
import PlanDetails from "./pages/PlanDetails";
import MyPlans from "./pages/MyPlans";
import MetasCronograma from "./pages/MetasCronograma";
import MetaNova from "./pages/MetaNova";
import Questions from "./pages/Questions";
import Exams from "./pages/Exams";
import ExamViewer from "./pages/ExamViewer";
import ExamReport from "./pages/ExamReport";
import Materiais from "./pages/Materiais";
import MaterialDetalhes from "./pages/MaterialDetalhes";
import MateriaisFavoritos from "./pages/MateriaisFavoritos";
import Forum from "./pages/Forum";
import ForumNovoThread from "./pages/ForumNovoThread";
import ForumThread from "./pages/ForumThread";
import ForumCategoria from "./pages/ForumCategoria";
import Estatisticas from "./pages/Estatisticas";
import Perfil from "./pages/Perfil";
import SidebarAdmin from "./pages/admin/SidebarAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PlansPage from "./pages/admin/PlansPage";
import PlanFormPage from "./pages/admin/PlanFormPage";
import PlanGoalsPage from "./pages/admin/PlanGoalsPage";
import MetasDashboard from "./pages/admin/MetasDashboard";
import GoalFormPage from "./pages/admin/GoalFormPage";
import StudentsPage from "./pages/admin/StudentsPage";
import StudentProfilePage from "./pages/admin/StudentProfilePage";
import StudentFormPage from "./pages/admin/StudentFormPage";
import AvisosAdmin from "./pages/admin/AvisosAdmin";
import NoticesPage from "./pages/admin/NoticesPage";
import NoticeFormPage from "./pages/admin/NoticeFormPage";
import AvisosTemplates from "./pages/admin/AvisosTemplates";
import AvisosAgendamentos from "./pages/admin/AvisosAgendamentos";
import AvisosFilas from "./pages/admin/AvisosFilas";
import AvisosAnalytics from "./pages/admin/AvisosAnalytics";
import ForumDashboard from "./pages/admin/ForumDashboard";
import ForumModeration from "./pages/admin/ForumModeration";
import QuestionsImport from "./pages/admin/QuestionsImport";
import QuestionCreate from "./pages/admin/QuestionCreate";
import QuestionsListPage from "./pages/admin/QuestionsListPage";
import BatchUploadPage from "./pages/admin/BatchUploadPage";
import MetaNovaSelector from "./pages/admin/MetaNovaSelector";
import ImportarMetasSelector from "./pages/admin/ImportarMetasSelector";
import MetasImport from "./pages/MetasImport";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import AdminConfigPage from "./pages/admin/AdminConfigPage";
import AdminPersonalizacaoPage from "./pages/admin/AdminPersonalizacaoPage";
import AdminEstatsPage from "./pages/admin/AdminEstatsPage";
import ExamsAdminPage from "./pages/admin/ExamsAdminPage";
import TaxonomiaAdminPage from "./pages/admin/TaxonomiaAdminPage";
import HistoricoImportacoes from "./pages/admin/HistoricoImportacoes";
import MateriaisListPage from "./pages/admin/MateriaisListPage";
import MaterialFormPage from "./pages/admin/MaterialFormPage";
import MateriaisStatsPage from "./pages/admin/MateriaisStatsPage";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/meus-planos" component={MyPlans} />
      <Route path="/planos/:id" component={PlanDetails} />
      <Route path="/planos" component={AllPlans} />
      <Route path="/metas/cronograma" component={MetasCronograma} />
      <Route path="/metas/nova/:planoId" component={MetaNova} />
      <Route path="/metas" component={MetasCronograma} />
      <Route path="/cronograma" component={MetasCronograma} />
      {/* ═══════════════════════════════════════════════════════════
          ROTAS DE QUESTÕES E SIMULADOS
          ═══════════════════════════════════════════════════════════ */}
      {/* Banco de Questões */}
      <Route path="/questoes" component={Questions} />
      <Route path="/estatisticas" component={Estatisticas} />
      <Route path="/perfil" component={Perfil} />
      {/* ═══════════════════════════════════════════════════════════
          ROTAS ADMIN
          ═══════════════════════════════════════════════════════════ */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      {/* Planos */}
      <Route path="/admin/planos" component={PlansPage} />
      <Route path="/admin/planos/novo" component={PlanFormPage} />
      <Route path="/admin/planos/:id/editar" component={PlanFormPage} />
      <Route path="/admin/planos/:id/metas" component={PlanGoalsPage} />
      
      {/* Metas */}
      <Route path="/admin/metas" component={MetasDashboard} />
      <Route path="/admin/metas/novo" component={GoalFormPage} />
      <Route path="/admin/metas/:id/editar" component={GoalFormPage} />
      <Route path="/admin/metas/nova" component={MetaNovaSelector} />
      <Route path="/admin/metas/importar" component={ImportarMetasSelector} />
      <Route path="/admin/metas/importar/:planoId" component={MetasImport} />
      
      {/* Alunos */}
      <Route path="/admin/alunos" component={StudentsPage} />
      <Route path="/admin/alunos/novo" component={StudentFormPage} />
      <Route path="/admin/alunos/:id" component={StudentProfilePage} />
      <Route path="/admin/alunos/:id/editar" component={StudentFormPage} />
      
      {/* Avisos */}
      <Route path="/admin/avisos" component={AvisosAdmin} />
      <Route path="/admin/avisos/novo" component={NoticeFormPage} />
      <Route path="/admin/avisos/:id/editar" component={NoticeFormPage} />
      <Route path="/admin/avisos/templates" component={AvisosTemplates} />
      <Route path="/admin/avisos/agendamentos" component={AvisosAgendamentos} />
      <Route path="/admin/avisos/filas" component={AvisosFilas} />
      <Route path="/admin/avisos/analytics" component={AvisosAnalytics} />
      
      {/* Fórum */}
      <Route path="/admin/forum" component={ForumDashboard} />
      <Route path="/admin/forum/moderacao" component={ForumModeration} />
      
      {/* Questões */}
      <Route path="/admin/questoes" component={QuestionsListPage} />
      <Route path="/admin/questoes/nova" component={QuestionCreate} />
      <Route path="/admin/questoes/importar" component={QuestionsImport} />
      <Route path="/admin/questoes/upload" component={BatchUploadPage} />
      
      {/* Auditoria */}
      <Route path="/admin/auditoria" component={AuditLogsPage} />
      
      {/* Configurações */}
      <Route path="/admin/configuracoes" component={AdminConfigPage} />
      <Route path="/admin/personalizacao" component={AdminPersonalizacaoPage} />
      <Route path="/admin/sidebar" component={SidebarAdmin} />
      
      {/* Estatísticas */}
      <Route path="/admin/estatisticas" component={AdminEstatsPage} />
      
      {/* Simulados */}
      <Route path="/admin/simulados" component={ExamsAdminPage} />
      
      {/* Árvore do Conhecimento */}
      <Route path="/admin/arvore" component={TaxonomiaAdminPage} />
      <Route path="/admin/arvore/historico" component={HistoricoImportacoes} />

      {/* Materiais Admin */}
      <Route path="/admin/materiais" component={MateriaisListPage} />
      <Route path="/admin/materiais/novo" component={MaterialFormPage} />
      <Route path="/admin/materiais/:id/editar" component={MaterialFormPage} />
      <Route path="/admin/materiais/estatisticas" component={MateriaisStatsPage} />
      
      {/* Simulados */}
      <Route path="/simulados" component={Exams} />
      <Route path="/simulados/:id/relatorio" component={ExamReport} />
      <Route path="/simulados/:id" component={ExamViewer} />
      
      {/* Alias /exams para /simulados */}
      <Route path="/exams" component={Exams} />
      <Route path="/exams/:id/report" component={ExamReport} />
      <Route path="/exams/:id" component={ExamViewer} />
      <Route path="/materiais/favoritos" component={MateriaisFavoritos} />
      <Route path="/materiais/:id" component={MaterialDetalhes} />
      <Route path="/materiais" component={Materiais} />
      
      {/* ═══════════════════════════════════════════════════════════
          ROTAS DO FÓRUM
          ═══════════════════════════════════════════════════════════ */}
      <Route path="/forum/novo" component={ForumNovoThread} />
      <Route path="/forum/categoria/:slug" component={ForumCategoria} />
      <Route path="/forum/thread/:id" component={ForumThread} />
      <Route path="/forum" component={Forum} />
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // 🔧 DESABILITADO: Token JWT já dura 7 dias, não precisa renovar automaticamente
  // useAutoRefresh();
  
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
