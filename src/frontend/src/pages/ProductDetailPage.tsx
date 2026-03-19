import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePlaceOrder } from "../hooks/useQueries";

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetailPage({
  product,
  onBack,
}: ProductDetailPageProps) {
  const basePrice = Number(product.price);
  const packages = [
    { id: "base", label: product.name, price: basePrice },
    { id: "premium", label: "Premium Pack", price: basePrice * 5 },
  ];

  const [selectedPackage, setSelectedPackage] = useState("base");
  const [gameId, setGameId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const { identity, loginStatus, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && identity;

  const currentPkg =
    packages.find((p) => p.id === selectedPackage) ?? packages[0];
  const totalPrice = currentPkg.price * quantity;

  const handleOrder = async () => {
    if (!isLoggedIn) {
      login();
      return;
    }
    if (!gameId.trim()) {
      toast.error("অনুগ্রহ করে আপনার ID কোড লিখুন");
      return;
    }
    try {
      await placeOrder({
        gameId: gameId.trim(),
        productId: product.id,
        quantity: BigInt(quantity),
      });
      toast.success("অর্ডার সফলভাবে প্লেস হয়েছে! ✅");
      onBack();
    } catch {
      toast.error("অর্ডার দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div
      data-ocid="product_detail.page"
      className="min-h-screen bg-gray-100 pb-24"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          type="button"
          data-ocid="product_detail.close_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-base font-bold text-gray-800 truncate flex-1">
          {product.name}
        </h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
        >
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={
                product.imageUrl ||
                "/assets/generated/hero-banner.dim_800x300.jpg"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-800 leading-tight">
              {product.name}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Game / Top up</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
        </motion.div>

        {/* Section 1: Select Recharge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <span className="font-black text-gray-800 text-sm">
                Select Recharge
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Win 0 Coins 🪙
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                data-ocid="product_detail.tab"
                onClick={() => setSelectedPackage(pkg.id)}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all text-left ${
                  selectedPackage === pkg.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-orange-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selectedPackage === pkg.id
                      ? "border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPackage === pkg.id && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-700">
                  {pkg.label}
                </span>
                <span className="text-sm font-black text-orange-500">
                  {pkg.price} TK
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section 2: Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <span className="font-black text-gray-800 text-sm">
                Account Info
              </span>
            </div>
            <button
              type="button"
              className="text-xs text-blue-500 underline font-medium"
            >
              কিভাবে অর্ডার করবেন ?
            </button>
          </div>

          {/* Game ID */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">
              এখানে আইডি কোড দিন ।
            </p>
            <Input
              data-ocid="product_detail.input"
              placeholder="এখানে আইডি কোড দিন ।"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="rounded-xl border-gray-200 focus:border-orange-400 text-sm"
            />
          </div>

          {/* Quantity */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 font-medium">Quantity</p>
            <div className="flex items-center gap-2">
              <Input
                data-ocid="product_detail.textarea"
                readOnly
                value={quantity}
                className="rounded-xl border-gray-200 text-center font-bold text-base w-16 flex-shrink-0"
              />
              <button
                type="button"
                data-ocid="product_detail.toggle"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-orange-500 text-white rounded-lg font-bold text-xl flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                −
              </button>
              <button
                type="button"
                data-ocid="product_detail.toggle"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-orange-500 text-white rounded-lg font-bold text-xl flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </motion.div>

        {/* Total */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">মোট মূল্য</span>
          <span className="text-xl font-black text-orange-500">
            ৳ {totalPrice} TK
          </span>
        </div>

        {!isLoggedIn && (
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl text-center border border-amber-200">
            অর্ডার দিতে হলে প্রথমে Login করুন
          </p>
        )}
      </div>

      {/* Sticky Order Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-gray-100 z-20">
        <Button
          data-ocid="product_detail.submit_button"
          onClick={handleOrder}
          disabled={isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl h-12 text-base shadow-md"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : null}
          Order Now
        </Button>
      </div>
    </div>
  );
}
