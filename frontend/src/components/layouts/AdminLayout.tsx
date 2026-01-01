import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Building,
  Calendar,
  Settings,
  Shield,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Home,
  DollarSign,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Admin-specific navigation items
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Owners", path: "/admin/owners" },
    { icon: Building, label: "Stadiums", path: "/admin/stadiums" },
    { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
    { icon: DollarSign, label: "Payments", path: "/admin/payments" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
    { icon: AlertTriangle, label: "Reports & Issues", path: "/admin/reports-issues" },
    { icon: Settings, label: "System Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo with Admin Badge */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-lg">K</span>
            </div>
            <div className="flex-1">
              <span className="font-display text-xl text-foreground">
                Kora<span className="text-primary">Link</span>
              </span>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">Admin</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
              <User className="w-5 h-5 text-primary" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card animate-slide-in-right">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display text-sm">K</span>
                </div>
                <div>
                  <span className="font-display text-lg text-foreground">
                    Kora<span className="text-primary">Link</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Admin</span>
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl text-foreground hidden md:block">
                {navItems.find((item) => item.path === location.pathname)?.label || "Admin Dashboard"}
              </h1>
              <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-md">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">Admin</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats Summary */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="px-3 py-1 bg-primary/10 rounded-lg">
                <span className="text-primary font-semibold">24</span>
                <span className="text-muted-foreground ml-2">New Users</span>
              </div>
              <div className="px-3 py-1 bg-green-500/10 rounded-lg">
                <span className="text-green-500 font-semibold">₦1.2M</span>
                <span className="text-muted-foreground ml-2">Today</span>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
                5
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <div className="px-2 py-1.5">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile" className="cursor-pointer">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="cursor-pointer">Admin Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/audit-log" className="cursor-pointer">Audit Log</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                  <Home className="w-4 h-4 mr-2" />
                  Admin Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Site
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto bg-background/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;