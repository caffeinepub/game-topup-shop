import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, CreditCard, Hash, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RequestStatus } from "../../backend.d";
import {
  useAllRechargeRequests,
  useApproveRechargeRequest,
  useRejectRechargeRequest,
} from "../../hooks/useQueries";
import { principalToCode } from "../../utils/memberCode";

const METHOD_LABEL: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
};

function formatDate(nanoseconds: bigint) {
  return new Date(Number(nanoseconds / BigInt(1_000_000))).toLocaleDateString(
    "en-BD",
    {
      day: "2-digit",
      month: "short",
    },
  );
}

export default function RechargeTab() {
  const { data: requests } = useAllRechargeRequests();
  const { mutateAsync: approveRequest } = useApproveRechargeRequest();
  const { mutateAsync: rejectRequest } = useRejectRechargeRequest();

  const handleApprove = async (id: bigint) => {
    try {
      await approveRequest(id);
      toast.success("রিচার্জ অনুমোদন হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectRequest(id);
      toast.success("রিচার্জ বাতিল হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-300">
          {requests?.length ?? 0} রিচার্জ রিকোয়েস্ট
        </span>
      </div>

      {(!requests || requests.length === 0) && (
        <div
          data-ocid="admin.recharge.empty_state"
          className="text-center py-12 text-gray-500"
        >
          <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">কোনো রিচার্জ রিকোয়েস্ট নেই</p>
        </div>
      )}

      {requests?.map((req, i) => (
        <div
          key={req.id.toString()}
          data-ocid={`admin.recharge.item.${i + 1}`}
          className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-orange-400 text-lg">
              ৳{req.amount.toString()}
            </span>
            {req.status === RequestStatus.pending && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                <Clock size={11} /> অপেক্ষামান
              </span>
            )}
            {req.status === RequestStatus.approved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                <CheckCircle2 size={11} /> অনুমোদিত
              </span>
            )}
            {req.status === RequestStatus.rejected && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                <XCircle size={11} /> বাতিল
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <span className="text-gray-500">পেমেন্ট: </span>
              <span className="font-semibold text-gray-300">
                {METHOD_LABEL[req.paymentMethod] ?? req.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-gray-500">তারিখ: </span>
              <span className="font-semibold text-gray-300">
                {formatDate(req.createdAt)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">TrxID: </span>
              <span className="font-mono font-semibold text-gray-300">
                {req.transactionId}
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5">
              <span className="text-gray-500">মেম্বার: </span>
              <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 font-mono font-bold text-xs px-2 py-0.5 rounded-full">
                <Hash size={10} />#{principalToCode(req.user.toString())}
              </span>
            </div>
          </div>
          {req.status === RequestStatus.pending && (
            <div className="flex gap-2">
              <Button
                data-ocid={`admin.recharge.confirm_button.${i + 1}`}
                size="sm"
                onClick={() => handleApprove(req.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs h-8"
              >
                <CheckCircle2 size={13} className="mr-1" /> অনুমোদন
              </Button>
              <Button
                data-ocid={`admin.recharge.delete_button.${i + 1}`}
                size="sm"
                onClick={() => handleReject(req.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs h-8"
              >
                <XCircle size={13} className="mr-1" /> বাতিল
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
