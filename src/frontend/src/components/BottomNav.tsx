import { Home, Package, PlusCircle, User } from "lucide-react";
import type { PageType } from "../App";

interface BottomNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const items = [
    { id: "home" as PageType, icon: Home, label: "Home" },
    { id: "addmoney" as PageType, icon: PlusCircle, label: "Add Money" },
    { id: "orders" as PageType, icon: Package, label: "My Orders" },
    { id: "profile" as PageType, icon: User, label: "Profile" },
  ];

  return (
    <nav
      data-ocid="bottom_nav"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-all ${
                isActive ? "text-orange-500" : "text-gray-400"
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                fill={isActive ? "currentColor" : "none"}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
