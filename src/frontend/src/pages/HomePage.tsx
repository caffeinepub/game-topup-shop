import { ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PageType } from "../App";
import type { Product } from "../backend.d";
import AppHeader from "../components/AppHeader";
import OrderModal from "../components/OrderModal";
import ProductCard from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAnnouncement,
  useInitializeSampleData,
  useProducts,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

export default function HomePage({ onNavigate: _onNavigate }: HomePageProps) {
  const { data: products, isLoading } = useProducts();
  const { data: announcement } = useAnnouncement();
  const { mutateAsync: initData } = useInitializeSampleData();
  const { login } = useInternetIdentity();

  const [showBanner, setShowBanner] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (products && products.length === 0 && !initialized) {
      setInitialized(true);
      initData().catch(() => {});
    }
  }, [products, initialized, initData]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const handleLoginRequired = () => {
    login();
  };

  const activeProducts = products?.filter((p) => p.isActive) ?? [];

  return (
    <div data-ocid="home.page">
      <AppHeader />

      {/* Announcement Banner */}
      <AnimatePresence>
        {showBanner && announcement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-orange-500 text-white overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2">
              <p className="text-xs font-medium flex-1 pr-2">{announcement}</p>
              <button
                type="button"
                data-ocid="announcement.close_button"
                onClick={() => setShowBanner(false)}
                className="text-white/80 hover:text-white flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <img
          src="/assets/generated/hero-banner.dim_800x300.jpg"
          alt="Game Topup Shop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-5">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-orange-300 text-xs font-semibold tracking-widest uppercase mb-1">
              দ্রুত ও নিরাপদ
            </p>
            <h1 className="text-white text-2xl font-black leading-tight">
              Game Topup
              <br />
              <span className="text-orange-400">সবচেয়ে কম দামে</span>
            </h1>
            <button
              type="button"
              data-ocid="hero.primary_button"
              className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors"
              onClick={() =>
                document
                  .getElementById("products-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              এখনই অর্ডার করুন <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products-section" className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-gray-800 tracking-wide">
            🔥 SPECIAL OFFER
          </h2>
          <span className="text-xs text-orange-500 font-semibold">
            {activeProducts.length} টি পণ্য
          </span>
        </div>

        {isLoading ? (
          <div
            data-ocid="products.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="rounded-xl bg-gray-100 animate-pulse aspect-square"
              />
            ))}
          </div>
        ) : activeProducts.length === 0 ? (
          <div
            data-ocid="products.empty_state"
            className="text-center py-12 text-gray-400"
          >
            <p className="text-4xl mb-2">🎮</p>
            <p className="text-sm">কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {activeProducts.map((product, i) => (
              <motion.div
                key={product.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard
                  product={product}
                  index={i}
                  onClick={handleProductClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          © {new Date().getFullYear()} Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-orange-400 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <OrderModal
        product={selectedProduct}
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onLoginRequired={handleLoginRequired}
      />
    </div>
  );
}
