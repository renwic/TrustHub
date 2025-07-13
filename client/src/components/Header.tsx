import { Bell, SlidersHorizontal, Heart } from "lucide-react";

interface HeaderProps {
  title?: string;
  onOpenFilters?: () => void;
}

export default function Header({ title, onOpenFilters }: HeaderProps) {
  return (
    <header className="relative z-20 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-sm">
          <Heart className="text-white w-5 h-5" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {title || "Heartlink"}
        </h1>
      </div>
      
      {!title && (
        <div className="flex items-center space-x-3">
          {onOpenFilters && (
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              onClick={onOpenFilters}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
          </button>
        </div>
      )}
    </header>
  );
}
