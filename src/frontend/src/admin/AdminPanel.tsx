import {
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AdminLevel } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyAdminLevel } from "../hooks/useQueries";
import MembersTab from "./tabs/MembersTab";
import OffersTab from "./tabs/OffersTab";
import OrdersTab from "./tabs/OrdersTab";
import ProductsTab from "./tabs/ProductsTab";
import RechargeTab from "./tabs/RechargeTab";
import SettingsTab from "./tabs/SettingsTab";

type AdminTab =
  | "products"
  | "offers"
  | "orders"
  | "recharge"
  | "members"
  | "settings";

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  group: string;
  superAdminOnly?: boolean;
}

const ALL_TABS: TabConfig[] = [
  {
    id: "products",
    label: "পণ্য",
    icon: <Package size={16} />,
    group: "কন্টেন্ট ম্যানেজমেন্ট",
  },
  {
    id: "offers",
    label: "অফার",
    icon: <Tag size={16} />,
    group: "কন্টেন্ট ম্যানেজমেন্ট",
    superAdminOnly: true,
  },
  {
    id: "orders",
    label: "অর্ডার",
    icon: <ShoppingCart size={16} />,
    group: "অর্ডার ও রিচার্জ",
  },
  {
    id: "recharge",
    label: "রিচার্জ",
    icon: <CreditCard size={16} />,
    group: "অর্ডার ও রিচার্জ",
  },
  {
    id: "members",
    label: "মেম্বার",
    icon: <Users size={16} />,
    group: "ইউজার ম্যানেজমেন্ট",
    superAdminOnly: true,
  },
  {
    id: "settings",
    label: "সেটিংস",
    icon: <Settings size={16} />,
    group: "সাইট সেটিংস",
    superAdminOnly: true,
  },
];

export default function AdminPanel() {
  const { data: myAdminLevel, isLoading } = useMyAdminLevel();
  const { identity, login, loginStatus, clear, isInitializing } =
    useInternetIdentity();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Show loading while auth client initializes (prevents flicker on reload)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Not logged in -- show dedicated admin login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-orange-600/5 rounded-full blur-2xl" />
        </div>

        <div data-ocid="admin.login.state" className="relative w-full max-w-sm">
          {/* Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center">
                <Shield size={28} className="text-orange-400" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
                Admin Login
              </h1>
              <p className="text-gray-500 text-sm">
                গেম টপআপ শপ - অ্যাডমিন প্যানেল
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600 font-medium">
                প্রবেশ করুন
              </span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Login button */}
            <button
              type="button"
              data-ocid="admin.login.button"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-500/40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/25"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  লগইন হচ্ছে...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Internet Identity দিয়ে প্রবেশ করুন
                </>
              )}
            </button>

            {/* Info text */}
            <p className="text-center text-xs text-gray-600 mt-4">
              শুধুমাত্র অনুমোদিত অ্যাডমিনরা প্রবেশ করতে পারবেন
            </p>
          </div>

          {/* Back link */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors underline underline-offset-2"
            >
              হোমে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but loading admin level
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Logged in but no admin role
  if (!myAdminLevel || myAdminLevel === AdminLevel.none) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div
          data-ocid="admin.access.error_state"
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings size={28} className="text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">অ্যাক্সেস নেই</h2>
          <p className="text-gray-400 text-sm mb-6">
            আপনার অ্যাকাউন্টে এখনো অ্যাডমিন পারমিশন দেওয়া হয়নি।
            <br />
            সুপার অ্যাডমিনের কাছে পারমিশন চান।
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            হোমে যান
          </button>
        </div>
      </div>
    );
  }

  const isSuperAdmin = myAdminLevel === AdminLevel.superAdmin;
  const visibleTabs = ALL_TABS.filter((t) => !t.superAdminOnly || isSuperAdmin);
  const groups = [...new Set(visibleTabs.map((t) => t.group))];

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsTab />;
      case "offers":
        return <OffersTab />;
      case "orders":
        return <OrdersTab />;
      case "recharge":
        return <RechargeTab />;
      case "members":
        return <MembersTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <div
      data-ocid="admin.page"
      className="min-h-screen bg-gray-950 flex flex-col"
    >
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-white text-sm">Admin Panel</h1>
            <p className="text-[10px] text-orange-400 font-semibold">
              {isSuperAdmin ? "সুপার অ্যাডমিন" : "সাব-অ্যাডমিন"}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="admin.logout.button"
          onClick={() => clear()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-xs transition-colors"
        >
          <LogOut size={14} /> লগআউট
        </button>
      </header>

      {/* Mobile top strip */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 overflow-x-auto">
        <div className="flex gap-1 px-2 py-2 min-w-max" data-ocid="admin.tab">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`admin.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800 shrink-0">
          <nav className="flex-1 px-3 py-4 space-y-5">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1.5">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {visibleTabs
                    .filter((t) => t.group === group)
                    .map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        data-ocid={`admin.${tab.id}.tab`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-orange-500 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4">{renderTabContent()}</main>
      </div>
    </div>
  );
}
