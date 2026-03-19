import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Wallet, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type PaymentMethod, RequestStatus } from "../backend.d";
import AppHeader from "../components/AppHeader";
import {
  useGetPaymentSettings,
  useRechargeRequests,
  useSubmitRechargeRequest,
  useWalletBalance,
} from "../hooks/useQueries";

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const PAYMENT_METHOD_CONFIG = [
  {
    id: "bkash" as PaymentMethod,
    label: "বিকাশ",
    initial: "ব",
    color: "#E2136E",
    bg: "#E2136E",
    key: "bkash" as const,
  },
  {
    id: "nagad" as PaymentMethod,
    label: "নগদ",
    initial: "ন",
    color: "#F26522",
    bg: "#F26522",
    key: "nagad" as const,
  },
  {
    id: "rocket" as PaymentMethod,
    label: "রকেট",
    initial: "র",
    color: "#8A1C7C",
    bg: "#8A1C7C",
    key: "rocket" as const,
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
  const { data: walletBalance } = useWalletBalance();
  const { data: requests } = useRechargeRequests();
  const { data: paymentSettings, isLoading: loadingPayment } =
    useGetPaymentSettings();
  const { mutateAsync: submitRequest, isPending } = useSubmitRechargeRequest();

  const [step, setStep] = useState<"form" | "success">("form");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [transactionId, setTransactionId] = useState("");

  const amount =
    selectedAmount ?? (customAmount ? Number.parseInt(customAmount) : 0);

  const PAYMENT_METHODS = PAYMENT_METHOD_CONFIG.map((m) => ({
    ...m,
    number: paymentSettings?.[m.key] ?? "01841956380",
  }));

  const selectedMethodInfo = PAYMENT_METHODS.find(
    (m) => m.id === selectedMethod,
  );

  const handleSubmit = async () => {
    if (!amount || amount < 10) {
      toast.error("কমপক্ষে ১০ টাকা রিচার্জ করুন");
      return;
    }
    if (!selectedMethod) {
      toast.error("পেমেন্ট পদ্ধতি বেছে নিন");
      return;
    }
    if (!transactionId.trim()) {
      toast.error("Transaction ID দিন");
      return;
    }
    try {
      await submitRequest({
        amount: BigInt(amount),
        paymentMethod: selectedMethod,
        transactionId: transactionId.trim(),
      });
      setStep("success");
    } catch {
      toast.error("রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে");
    }
  };

  const handleReset = () => {
    setStep("form");
    setSelectedAmount(null);
    setCustomAmount("");
    setSelectedMethod(null);
    setTransactionId("");
  };

  return (
    <div data-ocid="addmoney.page" className="min-h-screen bg-gray-50 pb-24">
      <AppHeader />
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Wallet Balance Card */}
        <div
          className="rounded-2xl p-5 mb-5 text-white"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="opacity-90" />
            <span className="text-sm font-semibold opacity-90">
              আপনার ব্যালেন্স
            </span>
          </div>
          <p className="text-4xl font-black tracking-tight">
            ৳ {walletBalance?.toString() ?? "0"}
          </p>
          <p className="text-sm opacity-75 mt-1">টাকা</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Main Form Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-5">
                <h2 className="font-bold text-base text-gray-800">
                  💰 টাকা যোগ করুন
                </h2>

                {/* Amount Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    পরিমাণ নির্বাচন করুন
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        data-ocid="addmoney.amount.button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedAmount === amt
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-orange-200 bg-orange-50 text-orange-600 hover:border-orange-400"
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    অথবা কাস্টম পরিমাণ লিখুন
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-base">
                      ৳
                    </span>
                    <Input
                      data-ocid="addmoney.custom_amount.input"
                      type="number"
                      placeholder="যেমন: 350"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="pl-8 text-sm"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    পেমেন্ট মেথড
                  </Label>
                  {loadingPayment ? (
                    <div
                      data-ocid="addmoney.payment.loading_state"
                      className="text-center py-4"
                    >
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-gray-400 mt-2">লোড হচ্ছে...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            data-ocid="addmoney.method.button"
                            onClick={() => setSelectedMethod(method.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-100 bg-white hover:border-orange-200"
                            }`}
                          >
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: method.bg }}
                            >
                              {method.initial}
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {method.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Transaction ID - shown after method selection */}
                <AnimatePresence>
                  {selectedMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {/* Payment instruction */}
                      <div
                        className="rounded-xl p-3 text-sm"
                        style={{
                          backgroundColor: `${selectedMethodInfo?.bg}18`,
                        }}
                      >
                        <p className="text-gray-600">
                          <span
                            style={{ color: selectedMethodInfo?.color }}
                            className="font-bold"
                          >
                            {selectedMethodInfo?.label}
                          </span>{" "}
                          নম্বর:{" "}
                          <span className="font-mono font-bold text-gray-800">
                            {selectedMethodInfo?.number}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          উপরের নম্বরে ৳{amount || "?"} পাঠিয়ে নিচে TrxID দিন।
                        </p>
                      </div>

                      <Label className="text-sm font-semibold text-gray-700">
                        ট্রানজেকশন আইডি (TrxID)
                      </Label>
                      <Input
                        data-ocid="addmoney.txid.input"
                        placeholder="Transaction ID লিখুন"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="font-mono"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  data-ocid="addmoney.submit.button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    "রিচার্জ রিকোয়েস্ট পাঠান"
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 text-center space-y-3"
            >
              <div data-ocid="addmoney.success_state">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="font-black text-lg text-gray-800">
                  রিকোয়েস্ট পাঠানো হয়েছে!
                </h3>
                <p className="text-sm text-gray-500">
                  অ্যাডমিন অনুমোদনের পর আপনার ওয়ালেটে টাকা যোগ হবে।
                </p>
                <Button
                  data-ocid="addmoney.new_request.button"
                  onClick={handleReset}
                  className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  নতুন রিচার্জ করুন
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Requests */}
        {requests && requests.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-bold text-gray-700">আগের রিকোয়েস্ট</h3>
            {requests.map((req, i) => (
              <div
                key={req.id.toString()}
                data-ocid={`addmoney.request.item.${i + 1}`}
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    ৳{req.amount.toString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {METHOD_LABEL[req.paymentMethod]} •{" "}
                    {formatDate(req.createdAt)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
