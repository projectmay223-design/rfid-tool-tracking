import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthProvider, useAuth } from "@/lib/auth";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Tools from "@/pages/tools";
import { Issue, Return } from "@/pages/issue";
import Scan from "@/pages/scan";
import Transactions from "@/pages/transactions";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/">
        <Redirect to={isAuthenticated ? "/dashboard" : "/login"} />
      </Route>
      
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/tools" component={() => <ProtectedRoute component={Tools} />} />
      <Route path="/issue" component={() => <ProtectedRoute component={Issue} />} />
      <Route path="/return" component={() => <ProtectedRoute component={Return} />} />
      <Route path="/scan" component={() => <ProtectedRoute component={Scan} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
