import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MovieProvider } from "@/lib/store"; // Import Provider

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Watch from "@/pages/watch";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMedia from "@/pages/admin/media";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/watch/:id" component={Watch} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/media" component={AdminMedia} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Placeholder routes */}
      <Route path="/series" component={Home} />
      <Route path="/movies" component={Home} />
      <Route path="/new" component={Home} />
      <Route path="/my-list" component={Home} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MovieProvider>
          <Toaster />
          <Router />
        </MovieProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
