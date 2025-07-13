import { useLocation } from "wouter";
import { MessageCircle, User, Shield, Bell, Search, Users } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function BottomNav() {
  const [location] = useLocation();

  // Fetch unread notification count
  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 30000,
  });

  const notificationCount = countData?.count || 0;

  const navItems = [
    { path: "/", icon: Shield, label: "Trust Hub" },
    { path: "/browse", icon: Search, label: "Browse" },
    { path: "/vouches", icon: Users, label: "Props" },
    { path: "/matches", icon: MessageCircle, label: "Matches", badge: 3 },
    { path: "/profile", icon: User, label: "Account" },
  ];

  // Additional nav items for quick access
  const moreNavItems = [
    { path: "/discovery", label: "Discovery" },
    { path: "/voucher-interviews", label: "Interviews" },
    { path: "/circles", label: "Circles" },
    { path: "/notifications", label: "Notifications" },
    { path: "/settings", label: "Settings" },
    { path: "/help", label: "Help" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label, badge }) => {
            const isActive = location === path;
            
            return (
              <Link key={path} to={path}>
                <button className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                }`}>
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* Additional navigation strip for mobile - always visible */}
        <div className="lg:hidden bg-gray-50 border-t border-gray-200 px-2 py-2">
          <div className="flex items-center justify-between text-xs">
            {moreNavItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <button className={`px-2 py-1 rounded transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}>
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
