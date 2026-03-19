import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Copy, Wallet, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type PaymentMethod, RequestStatus } from "../backend.d";
import AppHeader from "../components/AppHeader";
import {
  useRechargeRequests,
  useSubmitRechargeRequest,
  useWalletBalance,
} from "../hooks/useQueries";

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const PAYMENT_METHODS = [
  {
    id: "bkash" as PaymentMethod,
    label: "বিকাশ",
    color: "#E2136E",
    bg: "#fce4ef",
    border: "#f48fb1",
    number: "01841956380",
  },
  {
    id: "nagad" as PaymentMethod,
    label: "নগদ",
    color: "#F26522",
    bg: "#fff3e0",
    border: "#ffb74d",
    number: "01841956380",
  },
  {
    id: "rocket" as PaymentMethod,
    label: "রকেট",
    color: "#8A1C7C",
    bg: "#f3e5f5",
    border: "#ce93d8",
    number: "01841956380",
  },
];

const METHOD_LABEL: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
};

function formatDate(nanoseconds: bigint) {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === RequestStatus.pending) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        <Clock size={11} /> অপেক্ষামান
      </span>
    );
  }
  if (status === RequestStatus.approved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={11} /> অনুমোদিত
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
      <XCircle size={11} /> বাতিল
    </span>
  );
}

export default function AddMoneyPage() {
  const { data: balance } = useWalletBalance();
  const { data: history } = useRechargeRequests();
  const { mutateAsync: submitRequest, isPending: isSubmitting } =
    useSubmitRechargeRequest();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [transactionId, setTransactionId] = useState("");

  const finalAmount = customAmount
    ? Number.parseInt(customAmount)
    : selectedAmount;
  const activeMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  async function handleSubmit() {
    if (!finalAmount || finalAmount < 1) {
      toast.error("অনুগ্রহ করে পরিমাণ নির্বাচন করুন");
      return;
    }
    if (!selectedMethod) {
      toast.error("পেমেন্ট মেথড নির্বাচন করুন");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("ট্রানজেকশন আইডি দিন");
      return;
    }
    try {
      await submitRequest({
        paymentMethod: selectedMethod,
        amount: BigInt(finalAmount),
        transactionId: transactionId.trim(),
      });
      toast.success("রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!");
      setSelectedAmount(null);
      setCustomAmount("");
      setSelectedMethod(null);
      setTransactionId("");
    } catch {
      toast.error("রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  }

  function copyNumber(num: string) {
    navigator.clipboard.writeText(num.replace("-", ""));
    toast.success("নম্বর কপি হয়েছে!");
  }

  return (
    <div data-ocid="addmoney.page">
      <AppHeader />
      <div className="px-4 py-6 space-y-5 max-w-md mx-auto">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} />
            <span className="font-semibold text-sm">আপনার ব্যালেন্স</span>
          </div>
          <p className="text-4xl font-black">৳ {balance?.toString() ?? "0"}</p>
          <p className="text-orange-100 text-sm mt-1">টাকা</p>
        </motion.div>

        {/* Recharge Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5"
        >
          <h2 className="font-bold text-gray-800 text-base">💰 টাকা যোগ করুন</h2>

          {/* Preset Amount */}
          <div>
            <Label className="text-gray-700 font-semibold mb-2 block">
              পরিমাণ নির্বাচন করুন
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  data-ocid="addmoney.amount.button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                    selectedAmount === amt && !customAmount
                      ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"
                      : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label
              htmlFor="customAmount"
              className="text-gray-700 font-semibold mb-2 block"
            >
              অথবা কাস্টম পরিমাণ লিখুন
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-bold">
                ৳
              </span>
              <Input
                id="customAmount"
                data-ocid="addmoney.input"
                type="number"
                placeholder="যেমন: 350"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="pl-8 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-gray-700 font-semibold mb-2 block">
              পেমেন্ট মেথড
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-ocid={`addmoney.${m.id}.toggle`}
                  onClick={() => setSelectedMethod(m.id)}
                  style={
                    selectedMethod === m.id
                      ? { background: m.bg, borderColor: m.color }
                      : {}
                  }
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedMethod === m.id
                      ? "shadow-md scale-105"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: m.color }}
                  >
                    {m.label[0]}
                  </span>
                  <span
                    style={selectedMethod === m.id ? { color: m.color } : {}}
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Info Card */}
          <AnimatePresence>
            {activeMethod && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: activeMethod.bg,
                  borderColor: activeMethod.border,
                }}
                className="rounded-xl border-2 p-4 space-y-2"
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: activeMethod.color }}
                >
                  {activeMethod.label} নম্বরে পাঠান
                </p>
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                  <span className="font-mono font-bold text-gray-800 tracking-wider">
                    {activeMethod.number}
                  </span>
                  <button
                    type="button"
                    data-ocid="addmoney.copy.button"
                    onClick={() => copyNumber(activeMethod.number)}
                    className="ml-2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Copy size={15} />
                  </button>
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: activeMethod.color }}
                >
                  ✅ Send Money করুন (Personal/Personal)
                </p>
                {finalAmount && finalAmount > 0 && (
                  <p className="text-xs text-gray-600">
                    পাঠানোর পরিমাণ:{" "}
                    <strong
                      className="font-black"
                      style={{ color: activeMethod.color }}
                    >
                      ৳{finalAmount}
                    </strong>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction ID */}
          <div>
            <Label
              htmlFor="txnId"
              className="text-gray-700 font-semibold mb-2 block"
            >
              ট্রানজেকশন আইডি (TrxID)
            </Label>
            <Input
              id="txnId"
              data-ocid="addmoney.textarea"
              placeholder="যেমন: 8JK9X2MNPQ"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="border-orange-200 focus:border-orange-400 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              পেমেন্টের পর প্রাপ্ত ট্রানজেকশন আইডি দিন
            </p>
          </div>

          {/* Submit */}
          <Button
            data-ocid="addmoney.submit_button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm h-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="animate-bounce" /> পাঠানো
                হচ্ছে...
              </span>
            ) : (
              "রিচার্জ রিকোয়েস্ট পাঠান"
            )}
          </Button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 rounded-xl p-4 border border-orange-100"
        >
          <h3 className="font-semibold text-orange-800 text-sm mb-2">
            📌 নির্দেশাবলী
          </h3>
          <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
            <li>বিকাশ/নগদ/রকেটে পেমেন্ট করুন</li>
            <li>Transaction ID সঠিকভাবে দিন</li>
            <li>অ্যাডমিন অনুমোদনের পর ব্যালেন্স যোগ হবে</li>
            <li>সমস্যা হলে WhatsApp এ যোগাযোগ করুন</li>
          </ul>
        </motion.div>

        {/* Recharge History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-gray-800 text-base mb-4">
            📋 আমার রিচার্জ হিস্টোরি
          </h2>
          {!history || history.length === 0 ? (
            <div
              data-ocid="addmoney.history.empty_state"
              className="text-center py-6 text-gray-400"
            >
              <p className="text-sm">কোনো রিচার্জ রিকোয়েস্ট নেই</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((req, i) => (
                <div
                  key={req.id.toString()}
                  data-ocid={`addmoney.history.item.${i + 1}`}
                  className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-orange-600 text-sm">
                      ৳{req.amount.toString()}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {METHOD_LABEL[req.paymentMethod] ?? req.paymentMethod}
                    </span>
                    <span>•</span>
                    <span className="font-mono truncate max-w-[100px]">
                      {req.transactionId}
                    </span>
                    <span>•</span>
                    <span>{formatDate(req.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
