import { Button } from "@/components/ui/button";
import { LogIn, Package } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus } from "../backend.d";
import AppHeader from "../components/AppHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c"];

const statusConfig = {
  [OrderStatus.pending]: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  [OrderStatus.processing]: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  [OrderStatus.completed]: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
  },
};

function formatDate(nanoseconds: bigint) {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();
  const { identity, loginStatus, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && identity;

  if (!isLoggedIn) {
    return (
      <div data-ocid="orders.page">
        <AppHeader />
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <LogIn size={48} className="text-gray-300 mb-4" />
          <h2 className="font-bold text-gray-700 text-lg mb-2">Login প্রয়োজন</h2>
          <p className="text-sm text-gray-500 mb-6">
            অর্ডার দেখতে হলে প্রথমে Login করুন
          </p>
          <Button
            data-ocid="orders.login.button"
            onClick={login}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8"
          >
            Login করুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="orders.page">
      <AppHeader />
      <div className="px-4 py-4">
        <h2 className="font-black text-gray-800 text-base mb-4">📦 আমার অর্ডার</h2>

        {isLoading ? (
          <div data-ocid="orders.loading_state" className="space-y-3">
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="h-24 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div data-ocid="orders.empty_state" className="text-center py-16">
            <Package size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">কোনো অর্ডার নেই</p>
            <p className="text-gray-400 text-xs mt-1">প্রথম অর্ডার করুন!</p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {orders.map((order, i) => {
              const sc =
                statusConfig[order.status] ?? statusConfig[OrderStatus.pending];
              return (
                <motion.div
                  key={order.id.toString()}
                  data-ocid={`orders.item.${i + 1}`}
                  variants={{
                    hidden: { opacity: 0, x: -15 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {order.product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Game ID: {order.gameId}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.text} flex-shrink-0 ml-2`}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>×{order.quantity.toString()}</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <span className="font-bold text-orange-600 text-sm">
                      ৳ {order.totalPrice.toString()} Tk
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
