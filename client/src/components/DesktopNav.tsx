import { Link, useLocation } from "wouter";
import { Shield, MessageCircle, User, Search, Users, Heart, ChevronDown, Settings, HelpCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import { logout } from "@/lib/authUtils";
import { useState, useRef, useEffect } from "react";

export default function DesktopNav() {
  const [location] = useLocation();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Primary navigation items
  const primaryNavItems = [
    { path: "/", icon: Shield, label: "Trust Hub" },
    { path: "/browse", icon: Search, label: "Browse" },
    { path: "/vouches", icon: Users, label: "Props" },
    { path: "/matches", icon: MessageCircle, label: "Matches", badge: 3 },
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { path: "/discovery", label: "Discovery" },
    { path: "/voucher-interviews", label: "Interviews" },
    { path: "/circles", label: "Circles" },
  ];

  // Account menu items
  const accountMenuItems = [
    { path: "/profile", icon: User, label: "My Profile" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/settings", icon: Settings, label: "Settings" },
    { path: "/help", icon: HelpCircle, label: "Help & Support" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="hidden lg:block bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Heartlink</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            {/* Primary Navigation */}
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="relative flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* Secondary Navigation */}
            <div className="hidden lg:flex items-center space-x-1 ml-2 pl-2 border-l border-gray-200">
              {secondaryNavItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="text-xs px-2"
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          <div className="flex items-center space-x-2">
            <NotificationBell />
            
            {/* Account Menu */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center space-x-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden xl:inline">My Account</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
              
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <Link key={item.path} to={item.path}>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      </Link>
                    );
                  })}
                  <div className="border-t border-gray-200 my-1"></div>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={logout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}