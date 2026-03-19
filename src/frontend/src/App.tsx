import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPanel from "./admin/AdminPanel";
import type { Product } from "./backend.d";
import BottomNav from "./components/BottomNav";
import AddMoneyPage from "./pages/AddMoneyPage";
import HomePage from "./pages/HomePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";

export type PageType =
  | "home"
  | "addmoney"
  | "orders"
  | "profile"
  | "product-detail";

// Full-screen admin panel for /admin route
if (window.location.pathname.startsWith("/admin")) {
  const root = document.getElementById("root");
  if (root) {
    root.style.height = "100vh";
  }
}

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin route: render full-screen admin panel
  if (isAdminRoute) {
    return (
      <>
        <AdminPanel />
        <Toaster />
      </>
    );
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("product-detail");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onNavigate={setCurrentPage}
            onProductSelect={handleProductSelect}
          />
        );
      case "addmoney":
        return <AddMoneyPage />;
      case "orders":
        return <MyOrdersPage />;
      case "profile":
        return <ProfilePage onNavigate={setCurrentPage} />;
      case "product-detail":
        return selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCurrentPage("home")}
          />
        ) : (
          <HomePage
            onNavigate={setCurrentPage}
            onProductSelect={handleProductSelect}
          />
        );
      default:
        return (
          <HomePage
            onNavigate={setCurrentPage}
            onProductSelect={handleProductSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white relative flex flex-col shadow-xl">
        <main className="flex-1 pb-20">{renderPage()}</main>
        {currentPage !== "product-detail" && (
          <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
        )}
        <Toaster />
      </div>
    </div>
  );
}
