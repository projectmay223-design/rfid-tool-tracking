import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LogOut, 
  LayoutDashboard, 
  Wrench, 
  ArrowRightLeft, 
  ArrowLeftRight, 
  ScanLine, 
  History 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/tools", label: "Tool Master", icon: Wrench },
    { href: "/issue", label: "Issue Tool", icon: ArrowRightLeft },
    { href: "/return", label: "Return Tool", icon: ArrowLeftRight },
    { href: "/scan", label: "RFID Scan", icon: ScanLine },
    { href: "/transactions", label: "Transactions", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col hidden md:flex">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sidebar-primary font-bold text-xl tracking-tight uppercase">
            <ScanLine className="w-6 h-6" />
            <span>RFID Tracker</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-border/30">
          <div className="flex items-center justify-between">
            <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="font-medium text-sidebar-foreground">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-sidebar-foreground hover:text-sidebar-primary shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-sidebar p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sidebar-primary font-bold">
            <ScanLine className="w-5 h-5" />
            <span>RFID</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-sidebar-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
