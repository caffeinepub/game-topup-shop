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
    color: "#E2136E",
    bg: "#fce4ef",
    border: "#f48fb1",
    key: "bkash" as const,
  },
  {
    id: "nagad" as PaymentMethod,
    label: "নগদ",
    color: "#F26522",
    bg: "#fff3e0",
    border: "#ffb74d",
    key: "nagad" as const,
  },
  {
    id: "rocket" as PaymentMethod,
    label: "রকেট",
    color: "#8A1C7C",
    bg: "#f3e5f5",
    border: "#ce93d8",
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
    number: paymentSettings?.[m.key] ?? "লোড হচ্ছে...",
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
    <div data-ocid="addmoney.page" className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} />
            <span className="text-xs font-semibold opacity-80">আপনার ওয়ালেট</span>
          </div>
          <p className="text-2xl font-black">
            ৳ {walletBalance?.toString() ?? "0"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Amount Selection */}
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <Label className="text-sm font-bold text-gray-800">
                  পরিমাণ বেছে নিন
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
                      className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        selectedAmount === amt
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-100 text-gray-700 hover:border-orange-200"
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <Input
                  data-ocid="addmoney.custom_amount.input"
                  type="number"
                  placeholder="অথবা কাস্টম পরিমাণ লিখুন"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="text-sm"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <Label className="text-sm font-bold text-gray-800">
                  পেমেন্ট পদ্ধতি
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
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        data-ocid="addmoney.method.button"
                        onClick={() => setSelectedMethod(method.id)}
                        style={{
                          background:
                            selectedMethod === method.id ? method.bg : "white",
                          borderColor:
                            selectedMethod === method.id
                              ? method.color
                              : "#f3f4f6",
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all"
                      >
                        <span
                          className="font-bold text-sm"
                          style={{ color: method.color }}
                        >
                          {method.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-600">
                            {method.number}
                          </span>
                          <button
                            type="button"
                            data-ocid="addmoney.copy.button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(method.number);
                              toast.success("নম্বর কপি হয়েছে");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction ID */}
              {selectedMethod && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white rounded-2xl p-4 space-y-3"
                >
                  <Label className="text-sm font-bold text-gray-800">
                    Transaction ID লিখুন
                  </Label>
                  <p className="text-xs text-gray-500">
                    {selectedMethodInfo?.label} থেকে{" "}
                    <span
                      className="font-bold"
                      style={{ color: selectedMethodInfo?.color }}
                    >
                      {selectedMethodInfo?.number}
                    </span>{" "}
                    নম্বরে ৳{amount || "?"} পাঠান। এরপর Transaction ID দিন।
                  </p>
                  <Input
                    data-ocid="addmoney.txid.input"
                    placeholder="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    data-ocid="addmoney.submit.button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
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
                </motion.div>
              )}
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
