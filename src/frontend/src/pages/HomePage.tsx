import { ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PageType } from "../App";
import type { Product } from "../backend.d";
import AppHeader from "../components/AppHeader";
import ProductCard from "../components/ProductCard";
import {
  useAnnouncement,
  useGetBanners,
  useInitializeSampleData,
  useProducts,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

interface HomePageProps {
  onNavigate: (page: PageType) => void;
  onProductSelect: (product: Product) => void;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  isActive: boolean;
}

function useLocalOffers(): Offer[] {
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const raw = localStorage.getItem("admin_offers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem("admin_offers");
        setOffers(raw ? JSON.parse(raw) : []);
      } catch {
        setOffers([]);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return offers;
}

export default function HomePage({
  onNavigate: _onNavigate,
  onProductSelect,
}: HomePageProps) {
  const { data: products, isLoading } = useProducts();
  const { data: announcement } = useAnnouncement();
  const { data: banners } = useGetBanners();
  const { mutateAsync: initData } = useInitializeSampleData();

  const [showBanner, setShowBanner] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const allOffers = useLocalOffers();
  const activeOffers = allOffers.filter((o) => o.isActive);

  useEffect(() => {
    if (products && products.length === 0 && !initialized) {
      setInitialized(true);
      initData().catch(() => {});
    }
  }, [products, initialized, initData]);

  const activeBanners = banners?.filter((b) => b.isActive) ?? [];

  // Auto-rotate banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const activeProducts = products?.filter((p) => p.isActive) ?? [];

  const currentBanner = activeBanners[activeBannerIndex];

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

      {/* Hero / Banner Section */}
      {currentBanner ? (
        <div className="relative overflow-hidden" style={{ height: 180 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {currentBanner.imageUrl ? (
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-orange-600 to-orange-400" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-5">
                <p className="text-orange-300 text-xs font-semibold tracking-widest uppercase mb-1">
                  দ্রুত ও নিরাপদ
                </p>
                <h1 className="text-white text-2xl font-black leading-tight">
                  {currentBanner.title}
                </h1>
                {currentBanner.description && (
                  <p className="text-white/80 text-xs mt-1">
                    {currentBanner.description}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Dots indicator */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-2 right-3 flex gap-1">
              {activeBanners.map((b, i) => (
                <button
                  key={b.id.toString()}
                  type="button"
                  onClick={() => setActiveBannerIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeBannerIndex ? "bg-white w-3" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
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
      )}

      {/* Offers Section */}
      {activeOffers.length > 0 && (
        <div className="px-4 pt-4">
          <h2 className="text-base font-black text-gray-800 tracking-wide mb-3">
            🏷️ অফার সমূহ
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {activeOffers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0 w-48 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-orange-500/30 p-3 relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -translate-y-4 translate-x-4" />
                {/* Discount badge */}
                <span className="inline-block bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2">
                  {offer.discount}
                </span>
                <p className="text-white text-sm font-bold leading-tight mb-1">
                  {offer.title}
                </p>
                <p className="text-gray-400 text-[11px] leading-snug line-clamp-2">
                  {offer.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
                  onClick={onProductSelect}
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
    </div>
  );
}
