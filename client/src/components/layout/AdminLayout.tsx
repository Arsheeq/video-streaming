import { Link, useLocation } from "wouter";
import { LayoutDashboard, Film, Settings, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/image_1763651111406.png";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Media Library", href: "/admin/media", icon: Film },
    { name: "AWS Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col fixed h-full">
        <div className="p-6 flex items-center justify-center border-b border-border">
           <img src={logo} alt="Nubinix Admin" className="h-8 object-contain" />
           <span className="ml-2 text-xs font-bold text-primary uppercase tracking-widest">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
           <Link 
             href="/"
             className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
           >
             <Home className="w-5 h-5" />
             Back to App
           </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
