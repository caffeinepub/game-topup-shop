import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { OrderStatus } from "../../backend.d";
import { useAllOrders, useUpdateOrderStatus } from "../../hooks/useQueries";
import { principalToCode } from "../../utils/memberCode";

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "অপেক্ষামান",
  [OrderStatus.processing]: "প্রক্রিয়াধীন",
  [OrderStatus.completed]: "সম্পন্ন",
  [OrderStatus.cancelled]: "বাতিল",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-yellow-500/20 text-yellow-400",
  [OrderStatus.processing]: "bg-blue-500/20 text-blue-400",
  [OrderStatus.completed]: "bg-green-500/20 text-green-400",
  [OrderStatus.cancelled]: "bg-red-500/20 text-red-400",
};

function formatDate(nanoseconds: bigint) {
  return new Date(Number(nanoseconds / BigInt(1_000_000))).toLocaleDateString(
    "en-BD",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function OrdersTab() {
  const { data: orders } = useAllOrders();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();

  const handleStatusChange = async (
    orderId: bigint,
    newStatus: OrderStatus,
  ) => {
    try {
      await updateStatus({ orderId, status: newStatus });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-300">
          {orders?.length ?? 0} অর্ডার
        </span>
      </div>

      {(!orders || orders.length === 0) && (
        <div
          data-ocid="admin.orders.empty_state"
          className="text-center py-12 text-gray-500"
        >
          <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">কোনো অর্ডার নেই</p>
        </div>
      )}

      {orders?.map((order, i) => (
        <div
          key={order.id.toString()}
          data-ocid={`admin.order.item.${i + 1}`}
          className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {order.product.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                গেম ID: {order.gameId} • {formatDate(order.createdAt)}
              </p>
            </div>
            <span className="font-bold text-orange-400 text-sm ml-2 shrink-0">
              ৳{order.totalPrice.toString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">মেম্বার:</span>
            <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 font-mono font-bold text-xs px-2 py-0.5 rounded-full">
              <Hash size={10} />#{principalToCode(order.userId.toString())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
            <Select
              value={order.status}
              onValueChange={(v) =>
                handleStatusChange(order.id, v as OrderStatus)
              }
            >
              <SelectTrigger
                data-ocid={`admin.order.select.${i + 1}`}
                className="h-7 text-xs flex-1 bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(
                  ([val, label]) => (
                    <SelectItem
                      key={val}
                      value={val}
                      className="text-xs text-white"
                    >
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
