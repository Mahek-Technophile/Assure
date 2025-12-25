import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Users 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer">
            <ShieldCheck className="w-6 h-6" />
            <span>AegisKYC</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            {isAdmin ? (
              <>
                <NavLink href="/admin" active={location === "/admin"} icon={<LayoutDashboard className="w-4 h-4"/>}>Overview</NavLink>
                <NavLink href="/admin/requests" active={location.startsWith("/admin/requests")} icon={<Users className="w-4 h-4"/>}>Requests</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/dashboard" active={location === "/dashboard"} icon={<LayoutDashboard className="w-4 h-4"/>}>Dashboard</NavLink>
                <NavLink href="/status" active={location === "/status"} icon={<FileText className="w-4 h-4"/>}>Status</NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children, icon }: { href: string; active: boolean; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link href={href} className={`
      flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary
      ${active ? "text-primary" : "text-muted-foreground"}
    `}>
      {icon}
      {children}
    </Link>
  );
}
