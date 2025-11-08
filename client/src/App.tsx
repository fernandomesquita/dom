import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AllPlans from "./pages/AllPlans";
import PlanDetails from "./pages/PlanDetails";
import MyPlans from "./pages/MyPlans";
import MetasCronograma from "./pages/MetasCronograma";
import Questions from "./pages/Questions";
import Materiais from "./pages/Materiais";
import Forum from "./pages/Forum";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/meus-planos" component={MyPlans} />
      <Route path="/planos/:id" component={PlanDetails} />
      <Route path="/planos" component={AllPlans} />
      <Route path="/metas/cronograma" component={MetasCronograma} />
      <Route path="/metas" component={MetasCronograma} />
      <Route path="/cronograma" component={MetasCronograma} />
      <Route path="/questoes" component={Questions} />
      <Route path="/materiais" component={Materiais} />
      <Route path="/forum" component={Forum} />
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
