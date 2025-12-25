import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import UserDashboard from "@/pages/dashboard/UserDashboard";
import KycFlow from "@/pages/dashboard/KycFlow";
import KycStatus from "@/pages/dashboard/KycStatus";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import RequestDetail from "@/pages/admin/RequestDetail";

function PrivateRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user } = useAuth();
  
  if (!user) {
    // In a real app we'd redirect, but for this demo hook it might flicker.
    // The Landing page is public.
    return <Login />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <UserDashboard />;
  }

  return (
    <>
      <Navbar />
      <Component />
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      {/* Protected User Routes */}
      <Route path="/dashboard">
        <PrivateRoute component={UserDashboard} />
      </Route>
      <Route path="/kyc">
        <PrivateRoute component={KycFlow} />
      </Route>
      <Route path="/status">
        <PrivateRoute component={KycStatus} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin">
        <PrivateRoute component={AdminDashboard} adminOnly />
      </Route>
      <Route path="/admin/requests">
        <PrivateRoute component={AdminDashboard} adminOnly />
      </Route>
      <Route path="/admin/kyc/:id">
        <PrivateRoute component={RequestDetail} adminOnly />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
