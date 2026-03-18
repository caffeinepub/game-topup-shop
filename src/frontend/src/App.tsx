import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import AddMoneyPage from "./pages/AddMoneyPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProfilePage from "./pages/ProfilePage";

export type PageType = "home" | "addmoney" | "orders" | "profile" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "addmoney":
        return <AddMoneyPage />;
      case "orders":
        return <MyOrdersPage />;
      case "profile":
        return <ProfilePage onNavigate={setCurrentPage} />;
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white relative flex flex-col shadow-xl">
        <main className="flex-1 pb-20">{renderPage()}</main>
        {currentPage !== "admin" && (
          <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
        )}
        <Toaster />
      </div>
    </div>
  );
}
