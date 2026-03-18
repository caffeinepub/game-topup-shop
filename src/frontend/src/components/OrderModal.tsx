import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePlaceOrder } from "../hooks/useQueries";

interface OrderModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onLoginRequired: () => void;
}

export default function OrderModal({
  product,
  open,
  onClose,
  onLoginRequired,
}: OrderModalProps) {
  const [gameId, setGameId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const { identity, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && identity;

  const totalPrice = product ? Number(product.price) * quantity : 0;

  const handleOrder = async () => {
    if (!isLoggedIn) {
      onClose();
      onLoginRequired();
      return;
    }
    if (!gameId.trim()) {
      toast.error("অনুগ্রহ করে আপনার Game ID লিখুন");
      return;
    }
    if (!product) return;
    try {
      await placeOrder({
        gameId: gameId.trim(),
        productId: product.id,
        quantity: BigInt(quantity),
      });
      toast.success("অর্ডার সফলভাবে প্লেস হয়েছে! ✅");
      setGameId("");
      setQuantity(1);
      onClose();
    } catch {
      toast.error("অর্ডার দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="order.dialog"
        className="max-w-[380px] mx-auto rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">
            {product?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-orange-50 rounded-xl p-3 flex justify-between items-center">
            <span className="text-gray-600 text-sm">মূল্য (Per Unit)</span>
            <span className="font-bold text-orange-600">
              ৳ {product?.price?.toString()} Tk
            </span>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="gameId"
              className="text-sm font-semibold text-gray-700"
            >
              আপনার Game ID লিখুন
            </Label>
            <Input
              data-ocid="order.input"
              id="gameId"
              placeholder="Game ID / UID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-700">
              পরিমাণ (Quantity)
            </Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-ocid="order.quantity.toggle"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-100 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-lg">
                {quantity}
              </span>
              <button
                type="button"
                data-ocid="order.quantity.toggle"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
            <span className="font-semibold text-gray-700">মোট মূল্য</span>
            <span className="font-bold text-xl text-orange-600">
              ৳ {totalPrice} Tk
            </span>
          </div>
          {!isLoggedIn && (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg text-center">
              অর্ডার দিতে হলে প্রথমে Login করুন
            </p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            data-ocid="order.cancel_button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            বাতিল
          </Button>
          <Button
            data-ocid="order.submit_button"
            onClick={handleOrder}
            disabled={isPending}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin mr-1" />
            ) : null}
            Order Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
