import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Home, User, MessageSquare, Wrench, LogIn, Share2, LogOut, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const getNavItems = (userRole?: string | null) => {
  const baseItems = [
    { to: "/", label: "Home", icon: Home },
  ];

  if (userRole === "operator") {
    return [
      ...baseItems,
      { to: "/post", label: "Post", icon: Share2 },
      { to: "/user-data", label: "User Data", icon: Database },
      { to: "/messages", label: "Messages", icon: MessageSquare },
      { to: "/profile", label: "Profile", icon: User },
    ];
  } else if (userRole === "consumer") {
    return [
      ...baseItems,
      { to: "/workers", label: "Workers", icon: Wrench },
      { to: "/messages", label: "Messages", icon: MessageSquare },
      { to: "/profile", label: "Profile", icon: User },
    ];
  } else {
    return [
      ...baseItems,
      { to: "/workers", label: "Workers", icon: Wrench },
      { to: "/login", label: "Login", icon: LogIn },
    ];
  }
};

export function DesktopSidebar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const updateUserRole = () => {
      setUserRole(sessionStorage.getItem("userRole"));
    };
    
    // Initial set
    updateUserRole();
    
    // Listen for custom event when user logs in
    window.addEventListener("userChanged", updateUserRole);
    // Listen for storage changes
    window.addEventListener("storage", updateUserRole);
    
    return () => {
      window.removeEventListener("userChanged", updateUserRole);
      window.removeEventListener("storage", updateUserRole);
    };
  }, []);
  
  const navItems = getNavItems(userRole);

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userPhone");
    setUserRole(null);
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground min-h-screen p-6 gap-2 fixed left-0 top-0 z-40">
      <div className="mb-8 px-2">
        <h1 className="font-heading text-2xl font-bold">BRIXI</h1>
        <p className="text-sm opacity-80">Home Services</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </RouterNavLink>
        ))}
      </nav>
      {userRole && (
        <Button 
          size="sm"
          onClick={handleLogout}
          className="w-full gap-2 bg-white hover:shadow-lg hover:bg-green-600 text-green-600 hover:text-white border border-green-200 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      )}
    </aside>
  );
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const updateUserRole = () => {
      setUserRole(sessionStorage.getItem("userRole"));
    };
    
    // Initial set
    updateUserRole();
    
    // Listen for custom event when user logs in
    window.addEventListener("userChanged", updateUserRole);
    // Listen for storage changes
    window.addEventListener("storage", updateUserRole);
    
    return () => {
      window.removeEventListener("userChanged", updateUserRole);
      window.removeEventListener("storage", updateUserRole);
    };
  }, []);
  
  const navItems = getNavItems(userRole);

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userPhone");
    setUserRole(null);
    navigate("/login");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card shadow-nav border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, -1).map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </RouterNavLink>
        ))}
        {userRole && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-green-600 hover:shadow-lg hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}
