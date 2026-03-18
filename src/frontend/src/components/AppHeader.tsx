import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Gamepad2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useWalletBalance } from "../hooks/useQueries";

export default function AppHeader() {
  const { data: balance } = useWalletBalance();
  const { identity, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && identity;

  const initials = isLoggedIn
    ? identity.getPrincipal().toString().slice(0, 2).toUpperCase()
    : "GU";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow">
          <Gamepad2 size={18} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm text-orange-500 tracking-wide">
              GAME TOPUP
            </span>
            <span className="font-bold text-sm text-gray-800">SHOP</span>
          </div>
          <p className="text-[10px] text-gray-400 -mt-0.5">
            Fast & Secure Topup
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn && (
          <div className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <span>৳</span>
            <span>{balance?.toString() ?? "0"} Tk</span>
          </div>
        )}
        <Avatar className="w-8 h-8 border-2 border-orange-200">
          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
